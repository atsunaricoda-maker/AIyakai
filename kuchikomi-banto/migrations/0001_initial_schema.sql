-- クチコミ番頭 初期スキーマ

-- アカウント（契約単位）
CREATE TABLE IF NOT EXISTS accounts (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  email                  TEXT NOT NULL UNIQUE,
  login_code_hash        TEXT NOT NULL,
  plan                   TEXT NOT NULL DEFAULT 'trial'
                           CHECK (plan IN ('trial', 'light', 'standard')),
  status                 TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'past_due', 'canceled')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at          TEXT,
  current_period_end     TEXT,
  created_at             TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer
  ON accounts(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_subscription
  ON accounts(stripe_subscription_id);

-- 店舗プロフィール（返信文に自動反映される）
CREATE TABLE IF NOT EXISTS shops (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id  INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  industry    TEXT NOT NULL DEFAULT 'other',
  strengths   TEXT,                       -- こだわり・強み（自由記述）
  ng_words    TEXT,                       -- 使ってほしくない言葉（カンマ区切り）
  signature   TEXT,                       -- 返信末尾の署名
  tone        TEXT NOT NULL DEFAULT 'polite'
                CHECK (tone IN ('polite', 'friendly', 'formal')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_shops_account ON shops(account_id);

-- 生成履歴
CREATE TABLE IF NOT EXISTS replies (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id    INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  shop_id       INTEGER REFERENCES shops(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text   TEXT NOT NULL,
  reviewer_name TEXT,
  drafts_json   TEXT NOT NULL,            -- [{style,label,text}] の JSON
  risk_level    TEXT NOT NULL DEFAULT 'none'
                  CHECK (risk_level IN ('none', 'caution', 'report_recommended')),
  risk_note     TEXT,
  input_tokens  INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_replies_account_created
  ON replies(account_id, created_at DESC);

-- 月次利用量（プラン上限の判定に使う）
CREATE TABLE IF NOT EXISTS usage_monthly (
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,               -- 'YYYY-MM'（UTC基準）
  count      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (account_id, year_month)
);

-- ログインセッション
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_account ON sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- 登録不要の無料お試し枠（端末に発行した匿名IDごと）
CREATE TABLE IF NOT EXISTS free_trials (
  fingerprint TEXT PRIMARY KEY,
  count       INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stripe Webhook の冪等性確保
CREATE TABLE IF NOT EXISTS webhook_events (
  id         TEXT PRIMARY KEY,            -- Stripe の event id
  type       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
