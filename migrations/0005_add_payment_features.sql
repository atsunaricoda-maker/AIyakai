-- イベントテーブルに参加費フィールドを追加
ALTER TABLE events ADD COLUMN price INTEGER DEFAULT 0; -- 価格（円）
ALTER TABLE events ADD COLUMN is_free INTEGER DEFAULT 1; -- 無料イベントかどうか
ALTER TABLE events ADD COLUMN payment_required INTEGER DEFAULT 0; -- 支払い必須かどうか

-- 申込テーブルに支払い関連フィールドを追加
ALTER TABLE applications ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded'));
ALTER TABLE applications ADD COLUMN payment_amount INTEGER DEFAULT 0; -- 支払い金額
ALTER TABLE applications ADD COLUMN stripe_checkout_session_id TEXT; -- Stripe Checkout Session ID
ALTER TABLE applications ADD COLUMN stripe_payment_intent_id TEXT; -- Stripe Payment Intent ID
ALTER TABLE applications ADD COLUMN paid_at DATETIME; -- 支払い完了日時
ALTER TABLE applications ADD COLUMN ticket_code TEXT; -- チケットコード（QRコード用）

-- 支払い履歴テーブル
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('payment', 'refund')),
  amount INTEGER NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_refund_id TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed')),
  metadata TEXT, -- JSON形式でStripeの追加情報を保存
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_applications_payment_status ON applications(payment_status);
CREATE INDEX IF NOT EXISTS idx_applications_ticket_code ON applications(ticket_code);
CREATE INDEX IF NOT EXISTS idx_applications_stripe_session_id ON applications(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_application_id ON payment_transactions(application_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_session_id ON payment_transactions(stripe_session_id);

-- チケットコード生成用の関数（SQLiteではトリガーで実装）
-- 申込が承認されたときに自動的にチケットコードを生成
CREATE TRIGGER IF NOT EXISTS generate_ticket_code_after_approval
AFTER UPDATE OF status ON applications
WHEN NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.ticket_code IS NULL
BEGIN
  UPDATE applications 
  SET ticket_code = 'TKT-' || NEW.id || '-' || substr(hex(randomblob(4)), 1, 8)
  WHERE id = NEW.id;
END;
