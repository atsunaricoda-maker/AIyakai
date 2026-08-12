import { Hono, type Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { GenerationError, generateReplies, userFacingMessage } from './ai';
import {
  createCheckoutSession,
  createPortalSession,
  planFromPriceId,
  priceIdFor,
  priceIdFromSubscription,
  unixToIso,
  verifyWebhook,
} from './billing';
import {
  claimWebhookEvent,
  createAccount,
  createSession,
  createShop,
  deleteSession,
  deleteShop,
  getAccountByEmail,
  getAccountById,
  getAccountBySessionToken,
  getAccountByStripeCustomer,
  getFreeTrialCount,
  getMonthlyUsage,
  getShop,
  incrementFreeTrial,
  incrementMonthlyUsage,
  listReplies,
  listShops,
  randomToken,
  recordReply,
  resetLoginCode,
  sha256Hex,
  updateAccountSubscription,
  updateShop,
  verifyLoginCode,
} from './db';
import { loginCodeMail, sendMail } from './mail';
import { loginPage, messagePage, signupPage, welcomePage } from './pages';
import { INDUSTRY_LIST } from './presets';
import { PLANS, type Account, type Env, type PlanKey, type ToneKey } from './types';

type AppEnv = { Bindings: Env; Variables: { account?: Account } };
type Ctx = Context<AppEnv>;

const app = new Hono<AppEnv>();

const SESSION_COOKIE = 'kb_session';
const FINGERPRINT_COOKIE = 'kb_fp';
const MAX_REVIEW_CHARS = 2000;
/** 同一IPからの無料お試し上限（Cookie削除による回避を抑える） */
const FREE_TRIAL_IP_LIMIT = 10;

// --------------------------------------------------------------- ユーティリティ

function isSecure(url: string): boolean {
  return url.startsWith('https://');
}

function setSessionCookie(c: Ctx, token: string): void {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecure(c.req.url),
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  });
}

async function currentAccount(c: Ctx): Promise<Account | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  return getAccountBySessionToken(c.env, token);
}

function planLimits(account: Account) {
  const plan = PLANS[account.plan] ?? PLANS.trial;
  return plan;
}

/** トライアル期限切れかつ未課金かを判定する。 */
function trialExpired(account: Account): boolean {
  if (account.plan !== 'trial') return false;
  if (!account.trial_ends_at) return false;
  return new Date(account.trial_ends_at).getTime() < Date.now();
}

function jsonError(message: string, extra: Record<string, unknown> = {}) {
  return { ok: false as const, error: message, ...extra };
}

// ------------------------------------------------------------------ 静的ページ

app.get('/app', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.redirect('/login', 302);

  // アセット側は html_handling により /app.html を /app へ正規化する。
  // ここで /app.html を要求すると 307 が返り、それをそのまま返すとリダイレクトループになる。
  // 正規化後のパス（/app）を要求して本体を直接取得する。
  const res = await c.env.ASSETS.fetch(new Request(new URL('/app', c.req.url), { method: 'GET' }));
  if (res.status >= 300 && res.status < 400) {
    // 想定外の正規化が起きた場合に無限ループへ落とさないための保険
    console.error('アセット取得が予期せずリダイレクトを返しました', res.status, res.headers.get('location'));
    return c.html(messagePage('画面を表示できません', '時間をおいてもう一度お試しください。'), 500);
  }
  return new Response(res.body, {
    status: res.status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
});

// ------------------------------------------------------------------ 認証

app.get('/signup', (c) => {
  const plan = c.req.query('plan') === 'standard' ? 'standard' : 'light';
  return c.html(signupPage({ plan }));
});

app.post('/signup', async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email ?? '').trim().toLowerCase();
  const plan: PlanKey = body.plan === 'standard' ? 'standard' : 'light';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return c.html(signupPage({ plan, error: 'メールアドレスの形式をご確認ください。', email }), 400);
  }

  const existing = await getAccountByEmail(c.env, email);
  if (existing) {
    return c.html(
      loginPage({
        email,
        supportEmail: c.env.SUPPORT_EMAIL,
        notice: 'このメールアドレスはすでに登録済みです。ログインコードでログインしてください。',
      }),
    );
  }

  const { account, loginCode } = await createAccount(c.env, email);

  // 登録直後からアプリを使えるようにセッションを張る
  const token = await createSession(c.env, account.id);
  setSessionCookie(c, token);

  const mail = loginCodeMail(c.env, loginCode);
  c.executionCtx.waitUntil(sendMail(c.env, { to: email, ...mail }));

  // Stripe が未設定なら決済をスキップして即利用開始（公開前の検証用）
  if (!c.env.STRIPE_SECRET_KEY || !priceIdFor(c.env, plan)) {
    return c.html(welcomePage({ email, loginCode }));
  }

  try {
    const session = await createCheckoutSession(c.env, { plan, email, accountId: account.id });
    return c.redirect(session.url, 302);
  } catch (err) {
    console.error('Checkout セッション作成に失敗', err);
    // 決済に進めなくてもトライアルは使えるようにしておく
    return c.html(welcomePage({ email, loginCode }));
  }
});

app.get('/login', (c) => c.html(loginPage({ supportEmail: c.env.SUPPORT_EMAIL })));

app.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email ?? '').trim().toLowerCase();
  const code = String(body.code ?? '').trim().toUpperCase();

  const account = await verifyLoginCode(c.env, email, code);
  if (!account) {
    return c.html(
      loginPage({ email, supportEmail: c.env.SUPPORT_EMAIL, error: 'メールアドレスまたはログインコードが正しくありません。' }),
      401,
    );
  }

  const token = await createSession(c.env, account.id);
  setSessionCookie(c, token);
  return c.redirect('/app', 302);
});

app.get('/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await deleteSession(c.env, token);
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
  return c.redirect('/', 302);
});

app.get('/welcome', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.redirect('/login', 302);

  // この画面でしか見せないため、都度新しいコードを発行する（保存はハッシュのみ）
  const loginCode = await resetLoginCode(c.env, account.id);
  const mail = loginCodeMail(c.env, loginCode);
  c.executionCtx.waitUntil(sendMail(c.env, { to: account.email, ...mail }));

  return c.html(welcomePage({ email: account.email, loginCode }));
});

// ------------------------------------------------------------------ 返信生成

app.post('/api/generate', async (c) => {
  let payload: Record<string, unknown>;
  try {
    payload = (await c.req.json()) as Record<string, unknown>;
  } catch {
    return c.json(jsonError('リクエストの形式が正しくありません。'), 400);
  }

  const review = String(payload.review ?? '').trim();
  const rating = Number(payload.rating);
  const industry = String(payload.industry ?? 'other');
  const shopId = payload.shopId ? Number(payload.shopId) : null;

  if (review.length === 0) {
    return c.json(jsonError('クチコミの本文を入力してください。'), 400);
  }
  if (review.length > MAX_REVIEW_CHARS) {
    return c.json(jsonError(`クチコミ本文は${MAX_REVIEW_CHARS}文字以内で入力してください。`), 400);
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return c.json(jsonError('星評価は1〜5で指定してください。'), 400);
  }

  const account = await currentAccount(c);

  // ---------------- ログイン済み ----------------
  if (account) {
    if (account.status === 'canceled') {
      return c.json(jsonError('ご契約が終了しています。再開するには料金プランをご確認ください。'), 402);
    }
    if (trialExpired(account)) {
      return c.json(
        jsonError('無料トライアル期間が終了しました。引き続きご利用いただくにはプランをお選びください。', {
          needUpgrade: true,
        }),
        402,
      );
    }

    const limit = planLimits(account).monthlyLimit;
    const used = await getMonthlyUsage(c.env, account.id);
    if (used >= limit) {
      return c.json(
        jsonError(`今月のご利用上限（${limit}件）に達しました。プランの変更をご検討ください。`, {
          needUpgrade: true,
        }),
        429,
      );
    }

    const shop = shopId ? await getShop(c.env, account.id, shopId) : (await listShops(c.env, account.id))[0];

    try {
      const result = await generateReplies(c.env, {
        review,
        rating,
        industry: shop?.industry ?? industry,
        shopName: shop?.name ?? null,
        strengths: shop?.strengths ?? null,
        ngWords: shop?.ng_words ?? null,
        signature: shop?.signature ?? null,
        tone: (shop?.tone as ToneKey) ?? 'polite',
        reviewerName: typeof payload.reviewerName === 'string' ? payload.reviewerName : null,
      });

      const newUsed = await incrementMonthlyUsage(c.env, account.id);
      c.executionCtx.waitUntil(
        recordReply(c.env, {
          accountId: account.id,
          shopId: shop?.id ?? null,
          rating,
          reviewText: review,
          reviewerName: null,
          drafts: result.drafts,
          riskLevel: result.risk.level,
          riskNote: result.risk.note,
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
        }),
      );

      return c.json({
        ok: true,
        drafts: result.drafts,
        risk: result.risk,
        remaining: Math.max(0, limit - newUsed),
      });
    } catch (err) {
      if (err instanceof GenerationError) {
        console.error('生成失敗', err.code, err.message);
        return c.json(jsonError(userFacingMessage(err.code)), err.code === 'refused' ? 422 : 502);
      }
      console.error('想定外のエラー', err);
      return c.json(jsonError('一時的なエラーが発生しました。少し時間をおいてお試しください。'), 500);
    }
  }

  // ---------------- 未ログイン（無料お試し） ----------------
  const freeLimit = Number(c.env.FREE_TRIAL_LIMIT ?? '3') || 3;

  let fp = getCookie(c, FINGERPRINT_COOKIE);
  if (!fp) {
    fp = randomToken(16);
    setCookie(c, FINGERPRINT_COOKIE, fp, {
      httpOnly: true,
      secure: isSecure(c.req.url),
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const ipKey = `ip:${await sha256Hex(ip)}`;

  const [cookieCount, ipCount] = await Promise.all([
    getFreeTrialCount(c.env, `fp:${fp}`),
    getFreeTrialCount(c.env, ipKey),
  ]);

  if (cookieCount >= freeLimit || ipCount >= FREE_TRIAL_IP_LIMIT) {
    return c.json(
      jsonError(`無料でお試しいただける${freeLimit}件を使い切りました。続けてご利用いただくにはお申し込みください。`, {
        needSignup: true,
        remaining: 0,
      }),
      429,
    );
  }

  try {
    const result = await generateReplies(c.env, { review, rating, industry });

    const [newCookieCount] = await Promise.all([
      incrementFreeTrial(c.env, `fp:${fp}`),
      incrementFreeTrial(c.env, ipKey),
    ]);

    c.executionCtx.waitUntil(
      recordReply(c.env, {
        accountId: null,
        shopId: null,
        rating,
        reviewText: review,
        reviewerName: null,
        drafts: result.drafts,
        riskLevel: result.risk.level,
        riskNote: result.risk.note,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      }),
    );

    return c.json({
      ok: true,
      drafts: result.drafts,
      risk: result.risk,
      remaining: Math.max(0, freeLimit - newCookieCount),
      isFreeTrial: true,
    });
  } catch (err) {
    if (err instanceof GenerationError) {
      console.error('生成失敗(無料)', err.code, err.message);
      return c.json(jsonError(userFacingMessage(err.code)), err.code === 'refused' ? 422 : 502);
    }
    console.error('想定外のエラー(無料)', err);
    return c.json(jsonError('一時的なエラーが発生しました。少し時間をおいてお試しください。'), 500);
  }
});

// ------------------------------------------------------------------ アカウントAPI

app.get('/api/me', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.json(jsonError('ログインが必要です。'), 401);

  const [shops, used] = await Promise.all([listShops(c.env, account.id), getMonthlyUsage(c.env, account.id)]);
  const plan = planLimits(account);

  return c.json({
    ok: true,
    account: {
      email: account.email,
      plan: account.plan,
      planLabel: plan.label,
      status: account.status,
      trialEndsAt: account.trial_ends_at,
      trialExpired: trialExpired(account),
      currentPeriodEnd: account.current_period_end,
      hasBilling: Boolean(account.stripe_customer_id),
    },
    usage: { used, limit: plan.monthlyLimit, remaining: Math.max(0, plan.monthlyLimit - used) },
    shops,
    shopLimit: plan.shopLimit,
    industries: INDUSTRY_LIST.map((p) => ({ key: p.key, label: p.label })),
  });
});

app.post('/api/login-code/reset', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.json(jsonError('ログインが必要です。'), 401);

  const loginCode = await resetLoginCode(c.env, account.id);
  const mail = loginCodeMail(c.env, loginCode);
  c.executionCtx.waitUntil(sendMail(c.env, { to: account.email, ...mail }));
  return c.json({ ok: true, loginCode });
});

// ------------------------------------------------------------------ 店舗API

function parseShopBody(body: Record<string, unknown>) {
  const name = String(body.name ?? '').trim();
  const industry = String(body.industry ?? 'other');
  const tone = ['polite', 'friendly', 'formal'].includes(String(body.tone))
    ? (String(body.tone) as ToneKey)
    : 'polite';
  return {
    name,
    industry,
    tone,
    strengths: body.strengths ? String(body.strengths).slice(0, 1000) : null,
    ngWords: body.ngWords ? String(body.ngWords).slice(0, 300) : null,
    signature: body.signature ? String(body.signature).slice(0, 200) : null,
  };
}

app.post('/api/shops', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.json(jsonError('ログインが必要です。'), 401);

  const shops = await listShops(c.env, account.id);
  if (shops.length >= planLimits(account).shopLimit) {
    return c.json(
      jsonError(`現在のプランで登録できる店舗数の上限（${planLimits(account).shopLimit}店舗）に達しています。`, {
        needUpgrade: true,
      }),
      402,
    );
  }

  const input = parseShopBody((await c.req.json()) as Record<string, unknown>);
  if (!input.name) return c.json(jsonError('店舗名を入力してください。'), 400);

  const id = await createShop(c.env, account.id, input);
  return c.json({ ok: true, id });
});

app.put('/api/shops/:id', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.json(jsonError('ログインが必要です。'), 401);

  const shopId = Number(c.req.param('id'));
  const existing = await getShop(c.env, account.id, shopId);
  if (!existing) return c.json(jsonError('店舗が見つかりません。'), 404);

  const input = parseShopBody((await c.req.json()) as Record<string, unknown>);
  if (!input.name) return c.json(jsonError('店舗名を入力してください。'), 400);

  await updateShop(c.env, account.id, shopId, input);
  return c.json({ ok: true });
});

app.delete('/api/shops/:id', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.json(jsonError('ログインが必要です。'), 401);
  await deleteShop(c.env, account.id, Number(c.req.param('id')));
  return c.json({ ok: true });
});

// ------------------------------------------------------------------ 履歴API

app.get('/api/replies', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.json(jsonError('ログインが必要です。'), 401);

  const rows = await listReplies(c.env, account.id, 50);
  return c.json({
    ok: true,
    replies: rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      reviewText: r.review_text,
      drafts: JSON.parse(r.drafts_json) as unknown,
      risk: { level: r.risk_level, note: r.risk_note },
      createdAt: r.created_at,
    })),
  });
});

// ------------------------------------------------------------------ 課金

app.post('/billing/checkout', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.json(jsonError('ログインが必要です。'), 401);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const plan: PlanKey = body.plan === 'standard' ? 'standard' : 'light';

  try {
    const session = await createCheckoutSession(c.env, { plan, email: account.email, accountId: account.id });
    return c.json({ ok: true, url: session.url });
  } catch (err) {
    console.error('Checkout 作成失敗', err);
    return c.json(jsonError('決済ページを開けませんでした。時間をおいてお試しください。'), 502);
  }
});

app.post('/billing/portal', async (c) => {
  const account = await currentAccount(c);
  if (!account) return c.json(jsonError('ログインが必要です。'), 401);
  if (!account.stripe_customer_id) {
    return c.json(jsonError('お支払い情報がまだ登録されていません。'), 400);
  }

  try {
    const session = await createPortalSession(c.env, account.stripe_customer_id);
    return c.json({ ok: true, url: session.url });
  } catch (err) {
    console.error('ポータル作成失敗', err);
    return c.json(jsonError('お手続き画面を開けませんでした。時間をおいてお試しください。'), 502);
  }
});

// ------------------------------------------------------------------ Webhook

app.post('/api/stripe/webhook', async (c) => {
  const raw = await c.req.text();

  let event;
  try {
    event = await verifyWebhook(c.env, raw, c.req.header('stripe-signature') ?? null);
  } catch (err) {
    console.error('Webhook 検証失敗', err);
    return c.text('invalid signature', 400);
  }

  // 同じイベントが再送されても二重処理しない
  const fresh = await claimWebhookEvent(c.env, event.id, event.type);
  if (!fresh) return c.json({ received: true, duplicate: true });

  const obj = event.data.object;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const accountId = Number(
          (obj.client_reference_id as string | undefined) ??
            ((obj.metadata as Record<string, string> | undefined)?.account_id ?? ''),
        );
        if (!Number.isInteger(accountId) || accountId <= 0) break;

        const metaPlan = (obj.metadata as Record<string, string> | undefined)?.plan;
        const plan: PlanKey = metaPlan === 'standard' ? 'standard' : 'light';

        await updateAccountSubscription(c.env, accountId, {
          plan,
          status: 'active',
          stripeCustomerId: (obj.customer as string | null) ?? null,
          stripeSubscriptionId: (obj.subscription as string | null) ?? null,
        });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const customerId = obj.customer as string | undefined;
        if (!customerId) break;
        const account = await getAccountByStripeCustomer(c.env, customerId);
        if (!account) break;

        const plan = planFromPriceId(c.env, priceIdFromSubscription(obj));
        const stripeStatus = String(obj.status ?? '');
        const status =
          stripeStatus === 'past_due' || stripeStatus === 'unpaid'
            ? 'past_due'
            : stripeStatus === 'canceled' || stripeStatus === 'incomplete_expired'
              ? 'canceled'
              : 'active';

        await updateAccountSubscription(c.env, account.id, {
          ...(plan ? { plan } : {}),
          status,
          stripeSubscriptionId: (obj.id as string | null) ?? null,
          currentPeriodEnd: unixToIso(obj.current_period_end),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const customerId = obj.customer as string | undefined;
        if (!customerId) break;
        const account = await getAccountByStripeCustomer(c.env, customerId);
        if (!account) break;
        await updateAccountSubscription(c.env, account.id, {
          status: 'canceled',
          stripeSubscriptionId: null,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const customerId = obj.customer as string | undefined;
        if (!customerId) break;
        const account = await getAccountByStripeCustomer(c.env, customerId);
        if (!account) break;
        await updateAccountSubscription(c.env, account.id, { status: 'past_due' });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // 500 を返すと Stripe が再送するが、既に claim 済みなので二重処理はされない。
    // 調査できるようログだけ残して 200 を返す。
    console.error('Webhook 処理エラー', event.type, err);
  }

  return c.json({ received: true });
});

// ------------------------------------------------------------------ 管理

app.get('/api/admin/stats', async (c) => {
  const token = c.req.header('x-admin-token');
  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.json(jsonError('unauthorized'), 401);
  }

  const [accounts, paying, replies, tokens] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM accounts').first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM accounts WHERE plan IN ('light','standard') AND status = 'active'").first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM replies').first<{ n: number }>(),
    c.env.DB.prepare('SELECT COALESCE(SUM(input_tokens),0) AS i, COALESCE(SUM(output_tokens),0) AS o FROM replies').first<{ i: number; o: number }>(),
  ]);

  const mrr =
    (
      await c.env.DB.prepare(
        `SELECT plan, COUNT(*) AS n FROM accounts
         WHERE status = 'active' AND plan IN ('light','standard') GROUP BY plan`,
      ).all<{ plan: PlanKey; n: number }>()
    ).results?.reduce((sum, row) => sum + PLANS[row.plan].priceYen * row.n, 0) ?? 0;

  return c.json({
    ok: true,
    accounts: accounts?.n ?? 0,
    payingAccounts: paying?.n ?? 0,
    mrrYen: mrr,
    totalReplies: replies?.n ?? 0,
    tokens: { input: tokens?.i ?? 0, output: tokens?.o ?? 0 },
  });
});

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    model: c.env.ANTHROPIC_MODEL || 'claude-opus-5',
    hasAnthropicKey: Boolean(c.env.ANTHROPIC_API_KEY),
    hasStripe: Boolean(c.env.STRIPE_SECRET_KEY),
    hasMail: Boolean(c.env.RESEND_API_KEY),
  }),
);

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) return c.json(jsonError('見つかりません。'), 404);
  return c.html(messagePage('ページが見つかりません', 'お探しのページは存在しないか、移動しました。'), 404);
});

app.onError((err, c) => {
  console.error('未処理エラー', err);
  if (c.req.path.startsWith('/api/')) {
    return c.json(jsonError('サーバーエラーが発生しました。'), 500);
  }
  return c.html(
    messagePage('エラーが発生しました', '一時的な問題が発生しました。時間をおいてお試しください。'),
    500,
  );
});

export default app;
