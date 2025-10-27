-- サイト設定テーブル
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT NOT NULL CHECK(setting_type IN ('text', 'textarea', 'number', 'boolean')),
  category TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- デフォルト設定値を挿入
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, display_name, description, display_order) VALUES
  -- ヘッダー設定
  ('site_title', 'AI夜会・AI茶会', 'text', 'header', 'サイトタイトル', 'メインタイトル', 1),
  ('site_subtitle', 'みんなでAIを語り合う交流の場', 'text', 'header', 'サブタイトル', 'メインページのサブタイトル', 2),
  ('site_tagline_1', '静岡県内各地で開催', 'text', 'header', 'タグライン1', 'ヘッダーのタグライン（開催地）', 3),
  ('site_tagline_2', '経営者・起業家・講師・学生歓迎', 'text', 'header', 'タグライン2', 'ヘッダーのタグライン（対象者）', 4),
  ('site_tagline_3', '招待制・紹介制', 'text', 'header', 'タグライン3', 'ヘッダーのタグライン（参加形式）', 5),
  
  -- AI夜会の説明
  ('night_title', 'AI夜会', 'text', 'concept', 'AI夜会タイトル', 'AI夜会のタイトル', 11),
  ('night_description', 'お酒を片手に、リラックスした雰囲気でAI活用について語り合います。実践事例の共有やプチコンサルティングも。', 'textarea', 'concept', 'AI夜会説明', 'AI夜会の説明文', 12),
  
  -- AI茶会の説明
  ('tea_title', 'AI茶会', 'text', 'concept', 'AI茶会タイトル', 'AI茶会のタイトル', 13),
  ('tea_description', '落ち着いた雰囲気でお茶を楽しみながら、じっくりとAIについて深く語り合います。和やかな対話の時間。', 'textarea', 'concept', 'AI茶会説明', 'AI茶会の説明文', 14),
  
  -- 講師紹介
  ('instructor_section_title', 'AI講師について', 'text', 'instructor', '講師セクションタイトル', '講師紹介セクションのタイトル', 21),
  ('instructor_section_subtitle', '実践的なAI活用をサポート', 'text', 'instructor', '講師セクションサブタイトル', '講師紹介のサブタイトル', 22),
  ('instructor_description_1', '私たちは企業向けAIコンサルティングや講座を提供している専門家チームです。実践的なAI活用支援を通じて、多くの企業の業務改善やDX推進をサポートしています。', 'textarea', 'instructor', '講師説明1', '講師紹介の第一段落', 23),
  ('instructor_description_2', 'AI夜会・AI茶会では、参加者の皆様とフランクに対話しながら、それぞれの企業に合ったAI活用方法をご提案します。', 'textarea', 'instructor', '講師説明2', '講師紹介の第二段落', 24),
  
  -- お問い合わせ
  ('contact_email', 'info@ai-event.local', 'text', 'contact', 'お問い合わせメール', 'お問い合わせ先メールアドレス', 31),
  ('contact_description', 'イベントに関するご質問や、企業コンサル・講座のご相談はお気軽にお問い合わせください。', 'textarea', 'contact', 'お問い合わせ説明', 'お問い合わせセクションの説明', 32),
  
  -- フッター
  ('footer_copyright', '© 2025 AI夜会・AI茶会. All rights reserved.', 'text', 'footer', 'コピーライト', 'フッターのコピーライト表示', 41),
  ('footer_tagline', '静岡県内でAI活用の輪を広げます', 'text', 'footer', 'フッタータグライン', 'フッターのタグライン', 42);
