import type { Env, PlanKey } from './types';

/**
 * Stripe 連携。Workers 上で動かすため公式SDKではなく fetch + Web Crypto で実装する。
 * 扱うのは Checkout / Customer Portal / Webhook 検証の3つだけ。
 */

const STRIPE_API = 'https://api.stripe.com/v1';
const SIGNATURE_TOLERANCE_SEC = 300;

export class StripeNotConfiguredError extends Error {
  constructor() {
    super('Stripe が設定されていません');
    this.name = 'StripeNotConfiguredError';
  }
}

function form(params: Record<string, string | number | boolean | undefined>): string {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    body.set(k, String(v));
  }
  return body.toString();
}

async function stripeRequest<T>(env: Env, path: string, body: string): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) throw new StripeNotConfiguredError();

  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const json = (await res.json()) as T & { error?: { message?: string; type?: string } };
  if (!res.ok) {
    throw new Error(`Stripe API エラー (${res.status}): ${json.error?.message ?? '詳細不明'}`);
  }
  return json;
}

export function priceIdFor(env: Env, plan: PlanKey): string | undefined {
  if (plan === 'light') return env.STRIPE_PRICE_LIGHT;
  if (plan === 'standard') return env.STRIPE_PRICE_STANDARD;
  return undefined;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

/** サブスクリプション用の Checkout セッションを作る。 */
export async function createCheckoutSession(
  env: Env,
  opts: { plan: PlanKey; email: string; accountId: number; trialDays?: number },
): Promise<CheckoutSession> {
  const price = priceIdFor(env, opts.plan);
  if (!price) throw new Error(`プラン ${opts.plan} の価格IDが設定されていません`);

  const base = env.APP_BASE_URL.replace(/\/$/, '');
  return stripeRequest<CheckoutSession>(
    env,
    '/checkout/sessions',
    form({
      mode: 'subscription',
      'line_items[0][price]': price,
      'line_items[0][quantity]': 1,
      success_url: `${base}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/#pricing`,
      customer_email: opts.email,
      client_reference_id: String(opts.accountId),
      'metadata[account_id]': String(opts.accountId),
      'metadata[plan]': opts.plan,
      'subscription_data[trial_period_days]': opts.trialDays ?? 14,
      'subscription_data[metadata][account_id]': String(opts.accountId),
      'subscription_data[metadata][plan]': opts.plan,
      allow_promotion_codes: true,
      locale: 'ja',
    }),
  );
}

/** 解約・支払方法変更のためのカスタマーポータル。 */
export async function createPortalSession(env: Env, customerId: string): Promise<{ url: string }> {
  const base = env.APP_BASE_URL.replace(/\/$/, '');
  return stripeRequest<{ url: string }>(
    env,
    '/billing_portal/sessions',
    form({ customer: customerId, return_url: `${base}/app` }),
  );
}

// ------------------------------------------------------------- Webhook検証

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

/**
 * Stripe-Signature ヘッダを検証し、イベントを返す。
 * 検証に失敗した場合は例外を投げる（呼び出し側は 400 を返すこと）。
 */
export async function verifyWebhook(env: Env, rawBody: string, signatureHeader: string | null): Promise<StripeEvent> {
  if (!env.STRIPE_WEBHOOK_SECRET) throw new StripeNotConfiguredError();
  if (!signatureHeader) throw new Error('署名ヘッダがありません');

  let timestamp = '';
  const signatures: string[] = [];
  for (const part of signatureHeader.split(',')) {
    const [key, value] = part.split('=', 2);
    if (!key || !value) continue;
    if (key.trim() === 't') timestamp = value.trim();
    if (key.trim() === 'v1') signatures.push(value.trim());
  }

  if (!timestamp || signatures.length === 0) throw new Error('署名ヘッダの形式が不正です');

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SEC) {
    throw new Error('署名のタイムスタンプが許容範囲外です');
  }

  const expected = await hmacSha256Hex(env.STRIPE_WEBHOOK_SECRET, `${timestamp}.${rawBody}`);
  if (!signatures.some((sig) => timingSafeEqualHex(sig, expected))) {
    throw new Error('署名が一致しません');
  }

  return JSON.parse(rawBody) as StripeEvent;
}

/** Stripe の price ID から自プランへ逆引きする。 */
export function planFromPriceId(env: Env, priceId: string | undefined): PlanKey | null {
  if (!priceId) return null;
  if (priceId === env.STRIPE_PRICE_LIGHT) return 'light';
  if (priceId === env.STRIPE_PRICE_STANDARD) return 'standard';
  return null;
}

/** subscription オブジェクトから price ID を取り出す。 */
export function priceIdFromSubscription(sub: Record<string, unknown>): string | undefined {
  const items = sub.items as { data?: Array<{ price?: { id?: string } }> } | undefined;
  return items?.data?.[0]?.price?.id;
}

/** Unix秒 → ISO文字列。未定義なら null。 */
export function unixToIso(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toISOString();
}
