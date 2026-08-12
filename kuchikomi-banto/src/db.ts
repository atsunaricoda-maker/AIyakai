import type { Account, Env, PlanKey, ReplyDraft, ReplyRecord, RiskLevel, Shop, ToneKey } from './types';

/** UTC基準の 'YYYY-MM'。利用量の集計キー。 */
export function currentYearMonth(now = new Date()): string {
  return now.toISOString().slice(0, 7);
}

export function nowIso(now = new Date()): string {
  return now.toISOString().replace('T', ' ').slice(0, 19);
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** URL-safe なランダム文字列 */
export function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** 人が読んで入力できるログインコード（紛らわしい文字を除外） */
export function randomLoginCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const buf = new Uint8Array(10);
  crypto.getRandomValues(buf);
  const chars = [...buf].map((b) => alphabet[b % alphabet.length] as string);
  return `${chars.slice(0, 5).join('')}-${chars.slice(5).join('')}`;
}

// ---------------------------------------------------------------- accounts

export async function getAccountByEmail(env: Env, email: string): Promise<Account | null> {
  return env.DB.prepare('SELECT * FROM accounts WHERE email = ?')
    .bind(email.trim().toLowerCase())
    .first<Account>();
}

export async function getAccountById(env: Env, id: number): Promise<Account | null> {
  return env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(id).first<Account>();
}

export async function getAccountByStripeCustomer(env: Env, customerId: string): Promise<Account | null> {
  return env.DB.prepare('SELECT * FROM accounts WHERE stripe_customer_id = ?')
    .bind(customerId)
    .first<Account>();
}

export interface CreateAccountResult {
  account: Account;
  loginCode: string;
}

/** アカウントを作成し、平文のログインコードを一度だけ返す（保存はハッシュのみ）。 */
export async function createAccount(env: Env, email: string, trialDays = 14): Promise<CreateAccountResult> {
  const normalized = email.trim().toLowerCase();
  const loginCode = randomLoginCode();
  const hash = await sha256Hex(loginCode);
  const trialEnds = new Date(Date.now() + trialDays * 86_400_000).toISOString();

  await env.DB.prepare(
    `INSERT INTO accounts (email, login_code_hash, plan, status, trial_ends_at)
     VALUES (?, ?, 'trial', 'active', ?)`,
  )
    .bind(normalized, hash, trialEnds)
    .run();

  const account = await getAccountByEmail(env, normalized);
  if (!account) throw new Error('アカウント作成直後の読み出しに失敗しました');
  return { account, loginCode };
}

/** 既存アカウントのログインコードを再発行する。 */
export async function resetLoginCode(env: Env, accountId: number): Promise<string> {
  const loginCode = randomLoginCode();
  const hash = await sha256Hex(loginCode);
  await env.DB.prepare("UPDATE accounts SET login_code_hash = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(hash, accountId)
    .run();
  return loginCode;
}

export async function verifyLoginCode(env: Env, email: string, code: string): Promise<Account | null> {
  const account = await getAccountByEmail(env, email);
  if (!account) return null;
  const hash = await sha256Hex(code.trim().toUpperCase());
  // 定数時間比較（長さが同じ16進文字列同士なのでXOR累積で十分）
  if (hash.length !== account.login_code_hash.length) return null;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ account.login_code_hash.charCodeAt(i);
  }
  return diff === 0 ? account : null;
}

export async function updateAccountSubscription(
  env: Env,
  accountId: number,
  fields: {
    plan?: PlanKey;
    status?: Account['status'];
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    currentPeriodEnd?: string | null;
  },
): Promise<void> {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  if (fields.plan !== undefined) {
    sets.push('plan = ?');
    values.push(fields.plan);
  }
  if (fields.status !== undefined) {
    sets.push('status = ?');
    values.push(fields.status);
  }
  if (fields.stripeCustomerId !== undefined) {
    sets.push('stripe_customer_id = ?');
    values.push(fields.stripeCustomerId);
  }
  if (fields.stripeSubscriptionId !== undefined) {
    sets.push('stripe_subscription_id = ?');
    values.push(fields.stripeSubscriptionId);
  }
  if (fields.currentPeriodEnd !== undefined) {
    sets.push('current_period_end = ?');
    values.push(fields.currentPeriodEnd);
  }
  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  values.push(accountId);

  await env.DB.prepare(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
}

// ------------------------------------------------------------------- shops

export async function listShops(env: Env, accountId: number): Promise<Shop[]> {
  const res = await env.DB.prepare('SELECT * FROM shops WHERE account_id = ? ORDER BY id')
    .bind(accountId)
    .all<Shop>();
  return res.results ?? [];
}

export async function getShop(env: Env, accountId: number, shopId: number): Promise<Shop | null> {
  return env.DB.prepare('SELECT * FROM shops WHERE id = ? AND account_id = ?')
    .bind(shopId, accountId)
    .first<Shop>();
}

export interface ShopInput {
  name: string;
  industry: string;
  strengths?: string | null;
  ngWords?: string | null;
  signature?: string | null;
  tone?: ToneKey;
}

export async function createShop(env: Env, accountId: number, input: ShopInput): Promise<number> {
  const res = await env.DB.prepare(
    `INSERT INTO shops (account_id, name, industry, strengths, ng_words, signature, tone)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      accountId,
      input.name,
      input.industry,
      input.strengths ?? null,
      input.ngWords ?? null,
      input.signature ?? null,
      input.tone ?? 'polite',
    )
    .run();
  return Number(res.meta.last_row_id);
}

export async function updateShop(env: Env, accountId: number, shopId: number, input: ShopInput): Promise<void> {
  await env.DB.prepare(
    `UPDATE shops
     SET name = ?, industry = ?, strengths = ?, ng_words = ?, signature = ?, tone = ?,
         updated_at = datetime('now')
     WHERE id = ? AND account_id = ?`,
  )
    .bind(
      input.name,
      input.industry,
      input.strengths ?? null,
      input.ngWords ?? null,
      input.signature ?? null,
      input.tone ?? 'polite',
      shopId,
      accountId,
    )
    .run();
}

export async function deleteShop(env: Env, accountId: number, shopId: number): Promise<void> {
  await env.DB.prepare('DELETE FROM shops WHERE id = ? AND account_id = ?').bind(shopId, accountId).run();
}

// ----------------------------------------------------------------- replies

export async function recordReply(
  env: Env,
  params: {
    accountId: number | null;
    shopId: number | null;
    rating: number;
    reviewText: string;
    reviewerName: string | null;
    drafts: ReplyDraft[];
    riskLevel: RiskLevel;
    riskNote: string;
    inputTokens: number;
    outputTokens: number;
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO replies
       (account_id, shop_id, rating, review_text, reviewer_name, drafts_json,
        risk_level, risk_note, input_tokens, output_tokens)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      params.accountId,
      params.shopId,
      params.rating,
      params.reviewText,
      params.reviewerName,
      JSON.stringify(params.drafts),
      params.riskLevel,
      params.riskNote,
      params.inputTokens,
      params.outputTokens,
    )
    .run();
}

export async function listReplies(env: Env, accountId: number, limit = 50): Promise<ReplyRecord[]> {
  const res = await env.DB.prepare(
    `SELECT id, rating, review_text, reviewer_name, drafts_json, risk_level, risk_note, created_at
     FROM replies WHERE account_id = ? ORDER BY id DESC LIMIT ?`,
  )
    .bind(accountId, limit)
    .all<ReplyRecord>();
  return res.results ?? [];
}

// ------------------------------------------------------------------- usage

export async function getMonthlyUsage(env: Env, accountId: number): Promise<number> {
  const row = await env.DB.prepare('SELECT count FROM usage_monthly WHERE account_id = ? AND year_month = ?')
    .bind(accountId, currentYearMonth())
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function incrementMonthlyUsage(env: Env, accountId: number): Promise<number> {
  const ym = currentYearMonth();
  await env.DB.prepare(
    `INSERT INTO usage_monthly (account_id, year_month, count) VALUES (?, ?, 1)
     ON CONFLICT(account_id, year_month) DO UPDATE SET count = count + 1`,
  )
    .bind(accountId, ym)
    .run();
  return getMonthlyUsage(env, accountId);
}

// ------------------------------------------------------- free trial (匿名)

export async function getFreeTrialCount(env: Env, fingerprint: string): Promise<number> {
  const row = await env.DB.prepare('SELECT count FROM free_trials WHERE fingerprint = ?')
    .bind(fingerprint)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function incrementFreeTrial(env: Env, fingerprint: string): Promise<number> {
  await env.DB.prepare(
    `INSERT INTO free_trials (fingerprint, count) VALUES (?, 1)
     ON CONFLICT(fingerprint) DO UPDATE SET count = count + 1, updated_at = datetime('now')`,
  )
    .bind(fingerprint)
    .run();
  return getFreeTrialCount(env, fingerprint);
}

// ---------------------------------------------------------------- sessions

const SESSION_DAYS = 60;

export async function createSession(env: Env, accountId: number): Promise<string> {
  const token = randomToken();
  const hash = await sha256Hex(token);
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)')
    .bind(hash, accountId, expires)
    .run();
  return token;
}

export async function getAccountBySessionToken(env: Env, token: string): Promise<Account | null> {
  const hash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT a.* FROM sessions s
     JOIN accounts a ON a.id = s.account_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
  )
    .bind(hash, new Date().toISOString())
    .first<Account>();
  return row ?? null;
}

export async function deleteSession(env: Env, token: string): Promise<void> {
  const hash = await sha256Hex(token);
  await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hash).run();
}

/** 期限切れセッションの掃除（cron などから呼ぶ想定） */
export async function purgeExpiredSessions(env: Env): Promise<void> {
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(new Date().toISOString()).run();
}

/**
 * 日付つきのIPカウンタ（`ip:YYYY-MM-DD:...`）は日々増えるので、古い行を掃除する。
 * Cookie単位の `fp:` は通算カウントなので消さない。
 */
export async function purgeOldIpCounters(env: Env, keepDays = 7): Promise<void> {
  const cutoff = new Date(Date.now() - keepDays * 86_400_000).toISOString().slice(0, 10);
  await env.DB.prepare(
    `DELETE FROM free_trials
     WHERE fingerprint LIKE 'ip:%'
       AND substr(fingerprint, 4, 10) < ?`,
  )
    .bind(cutoff)
    .run();
}

// ------------------------------------------------------- webhook 冪等性

/** 未処理なら true を返して記録する。処理済みなら false。 */
export async function claimWebhookEvent(env: Env, eventId: string, type: string): Promise<boolean> {
  try {
    await env.DB.prepare('INSERT INTO webhook_events (id, type) VALUES (?, ?)').bind(eventId, type).run();
    return true;
  } catch {
    // PRIMARY KEY 制約違反 = 既に処理済み
    return false;
  }
}
