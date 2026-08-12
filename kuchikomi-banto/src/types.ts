export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;

  // vars (wrangler.jsonc)
  APP_BASE_URL: string;
  ANTHROPIC_MODEL: string;
  /** low | medium | high | xhigh | max。未設定なら medium。 */
  ANTHROPIC_EFFORT?: string;
  FREE_TRIAL_LIMIT: string;
  SUPPORT_EMAIL: string;

  // secrets (wrangler secret put)
  ANTHROPIC_API_KEY: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_LIGHT?: string;
  STRIPE_PRICE_STANDARD?: string;
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  ADMIN_TOKEN?: string;
}

export type PlanKey = 'trial' | 'light' | 'standard';
export type AccountStatus = 'active' | 'past_due' | 'canceled';
export type ToneKey = 'polite' | 'friendly' | 'formal';
export type RiskLevel = 'none' | 'caution' | 'report_recommended';

export interface Plan {
  key: PlanKey;
  label: string;
  /** 税込月額（円）。trial は 0。 */
  priceYen: number;
  /** 月あたりの生成上限 */
  monthlyLimit: number;
  /** 登録できる店舗数 */
  shopLimit: number;
}

export const PLANS: Record<PlanKey, Plan> = {
  trial: { key: 'trial', label: '無料トライアル', priceYen: 0, monthlyLimit: 30, shopLimit: 1 },
  light: { key: 'light', label: 'ライト', priceYen: 2980, monthlyLimit: 100, shopLimit: 1 },
  standard: { key: 'standard', label: 'スタンダード', priceYen: 5980, monthlyLimit: 500, shopLimit: 5 },
};

export interface Account {
  id: number;
  email: string;
  login_code_hash: string;
  plan: PlanKey;
  status: AccountStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: number;
  account_id: number;
  name: string;
  industry: string;
  strengths: string | null;
  ng_words: string | null;
  signature: string | null;
  tone: ToneKey;
  created_at: string;
  updated_at: string;
}

export type DraftStyle = 'polite' | 'friendly' | 'concise';

export interface ReplyDraft {
  style: DraftStyle;
  label: string;
  text: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  note: string;
}

/** Claude から受け取る構造化レスポンス */
export interface GenerationResult {
  drafts: ReplyDraft[];
  risk: RiskAssessment;
  usage: { inputTokens: number; outputTokens: number };
}

export interface ReplyRecord {
  id: number;
  rating: number;
  review_text: string;
  reviewer_name: string | null;
  drafts_json: string;
  risk_level: RiskLevel;
  risk_note: string | null;
  created_at: string;
}
