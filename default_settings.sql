-- サイト設定のデフォルト値
INSERT OR REPLACE INTO site_settings (setting_key, setting_value, category, display_order, description) VALUES
  -- ヘッダー設定
  ('site_title', 'AI夜会・AI茶会', 'header', 1, 'サイトタイトル'),
  ('site_subtitle', '静岡県で開催されるAI活用交流イベント', 'header', 2, 'サイトサブタイトル'),
  ('night_title', 'AI夜会', 'header', 3, '夜会のタイトル'),
  ('night_description', 'お酒を片手に、AIについて語り合う交流会です。経営者、起業家、AI関心者が集まり、情報交換や相談ができます。', 'header', 4, '夜会の説明'),
  ('tea_title', 'AI茶会', 'header', 5, '茶会のタイトル'),
  ('tea_description', 'お茶を飲みながら、気軽にAIを学ぶ勉強会です。初心者から経験者まで、どなたでも参加できます。', 'header', 6, '茶会の説明'),
  
  -- コンセプト
  ('concept_title', 'AI夜会・AI茶会とは', 'concept', 1, 'コンセプトタイトル'),
  ('concept_text', '静岡県内でAIに関心を持つ人々が集まり、知識を共有し、ビジネスや生活にAIを活用するための交流イベントです。経営者、起業家、教育者、学生など、様々な立場の方が参加できます。', 'concept', 2, 'コンセプト本文'),
  
  -- 講師紹介
  ('instructor_title', '講師紹介', 'instructor', 1, '講師セクションタイトル'),
  ('instructor_name', '山田太郎', 'instructor', 2, '講師名'),
  ('instructor_bio', 'AI・機械学習エンジニア。大手IT企業で10年以上の経験を持ち、現在はAIコンサルタントとして活動。静岡県内の企業にAI導入支援を行っています。', 'instructor', 3, '講師プロフィール'),
  
  -- 連絡先
  ('contact_email', 'info@aiyakai.example.com', 'contact', 1, '連絡先メールアドレス'),
  ('contact_title', 'お問い合わせ', 'contact', 2, '連絡先タイトル'),
  ('contact_text', 'イベントに関するご質問やご相談は、お気軽にお問い合わせください。', 'contact', 3, '連絡先説明文'),
  
  -- フッター
  ('footer_text', '© 2024 AI夜会・AI茶会 静岡. All rights reserved.', 'footer', 1, 'フッターテキスト');
