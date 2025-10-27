-- サイト設定テンプレートテーブル
CREATE TABLE IF NOT EXISTS settings_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK(category IN ('official', 'tone', 'industry', 'custom')),
  icon TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- テンプレート設定値テーブル
CREATE TABLE IF NOT EXISTS template_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  FOREIGN KEY (template_id) REFERENCES settings_templates(id) ON DELETE CASCADE,
  UNIQUE(template_id, setting_key)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_template_settings_template_id ON template_settings(template_id);
CREATE INDEX IF NOT EXISTS idx_settings_templates_category ON settings_templates(category);

-- デフォルトテンプレート
INSERT INTO settings_templates (template_name, display_name, description, category, icon) VALUES
  ('default', '標準スタイル', '現在使用中のバランスの取れたスタイル', 'official', '⚡'),
  ('formal', 'フォーマルスタイル', 'ビジネス・企業向けのフォーマルな文体', 'tone', '💼'),
  ('casual', 'カジュアルスタイル', 'フレンドリーで親しみやすい文体', 'tone', '😊'),
  ('academic', 'アカデミックスタイル', '学術的・専門的な文体', 'tone', '🎓'),
  ('startup', 'スタートアップ向け', '起業家・スタートアップに特化', 'industry', '🚀'),
  ('education', '教育機関向け', '大学・専門学校・教育機関向け', 'industry', '📚');

-- 標準スタイル設定値（ヘッダー）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES 
  (1, 'site_title', 'AI夜会・AI茶会'),
  (1, 'site_subtitle', 'みんなでAIを語り合う交流の場'),
  (1, 'site_tagline_1', '静岡県内各地で開催'),
  (1, 'site_tagline_2', '経営者・起業家・講師・学生歓迎'),
  (1, 'site_tagline_3', '招待制・紹介制');

-- 標準スタイル設定値（コンセプト）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (1, 'night_title', 'AI夜会'),
  (1, 'night_description', 'お酒を片手に、リラックスした雰囲気でAI活用について語り合います。実践事例の共有やプチコンサルティングも。'),
  (1, 'tea_title', 'AI茶会'),
  (1, 'tea_description', '落ち着いた雰囲気でお茶を楽しみながら、じっくりとAIについて深く語り合います。和やかな対話の時間。');

-- 標準スタイル設定値（講師・お問い合わせ・フッター）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (1, 'instructor_section_title', 'AI講師について'),
  (1, 'instructor_section_subtitle', '実践的なAI活用をサポート'),
  (1, 'instructor_description_1', '私たちは企業向けAIコンサルティングや講座を提供している専門家チームです。実践的なAI活用支援を通じて、多くの企業の業務改善やDX推進をサポートしています。'),
  (1, 'instructor_description_2', 'AI夜会・AI茶会では、参加者の皆様とフランクに対話しながら、それぞれの企業に合ったAI活用方法をご提案します。'),
  (1, 'contact_email', 'info@ai-event.local'),
  (1, 'contact_description', 'イベントに関するご質問や、企業コンサル・講座のご相談はお気軽にお問い合わせください。'),
  (1, 'footer_copyright', '© 2025 AI夜会・AI茶会. All rights reserved.'),
  (1, 'footer_tagline', '静岡県内でAI活用の輪を広げます');

-- フォーマルスタイル（ヘッダー）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (2, 'site_title', 'AI経営者交流会・AI研究会'),
  (2, 'site_subtitle', 'ビジネスにおけるAI活用の実践的研究と情報交換の場'),
  (2, 'site_tagline_1', '静岡県下で定期開催'),
  (2, 'site_tagline_2', '経営者・管理職・専門家を対象'),
  (2, 'site_tagline_3', '完全招待制');

-- フォーマルスタイル（コンセプト）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (2, 'night_title', 'AI経営者交流会'),
  (2, 'night_description', '経営者間での率直な意見交換を通じ、AI導入における実践的知見を共有いたします。企業事例の発表やビジネスコンサルティングの機会もご用意しております。'),
  (2, 'tea_title', 'AI研究会'),
  (2, 'tea_description', '落ち着いた環境で、AI技術の最新動向や導入戦略について深く議論いたします。専門的な知識の共有と実務への応用を目的としております。');

-- フォーマルスタイル（講師・お問い合わせ・フッター）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (2, 'instructor_section_title', '講師陣のご紹介'),
  (2, 'instructor_section_subtitle', '企業のAI戦略をプロフェッショナルに支援'),
  (2, 'instructor_description_1', '当団体は、大手企業から中小企業まで幅広くAI導入コンサルティングを提供する専門家集団です。豊富な実績に基づく実践的なアプローチで、お客様の業務効率化とDX推進を強力にサポートいたします。'),
  (2, 'instructor_description_2', '本交流会では、参加企業様それぞれの課題に応じた最適なAI活用戦略をご提案させていただきます。'),
  (2, 'contact_description', 'イベントに関するお問い合わせ、または企業向けコンサルティング・研修のご相談は、下記よりご連絡ください。'),
  (2, 'footer_copyright', '© 2025 AI経営者交流会. All rights reserved.'),
  (2, 'footer_tagline', '静岡県内の企業DXを推進します');

-- カジュアルスタイル（ヘッダー）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (3, 'site_title', 'AI飲み会・AIお茶会'),
  (3, 'site_subtitle', 'ゆる〜くAIについて語り合おう！'),
  (3, 'site_tagline_1', '静岡のあちこちで開催中'),
  (3, 'site_tagline_2', 'どなたでもウェルカム！'),
  (3, 'site_tagline_3', 'お友達の紹介でOK');

-- カジュアルスタイル（コンセプト）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (3, 'night_title', 'AI飲み会'),
  (3, 'night_description', 'お酒飲みながらワイワイAIの話をする会です！実際に使ってる人の話を聞いたり、困ってることを相談したり、とにかく楽しくやりましょう🍺'),
  (3, 'tea_title', 'AIお茶会'),
  (3, 'tea_description', 'まったり和やかに、お茶しながらAIのこと深掘りする会です。質問したり情報交換したり、リラックスしながら学べます☕');

-- カジュアルスタイル（講師・お問い合わせ・フッター）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (3, 'instructor_section_title', 'こんな人たちがやってます'),
  (3, 'instructor_section_subtitle', 'AIのこと、なんでも聞いてください！'),
  (3, 'instructor_description_1', 'ふだんは企業さん相手にAIのお手伝いをしている僕たちですが、もっとたくさんの人にAIの楽しさを知ってもらいたくて、こういう交流会を始めました！'),
  (3, 'instructor_description_2', '気軽に話しかけてください。あなたの会社や仕事に合ったAIの使い方、一緒に考えましょう〜！'),
  (3, 'contact_description', 'なにか聞きたいことがあったら、気軽にメールくださいね。お返事お待ちしてます！'),
  (3, 'footer_copyright', '© 2025 AI飲み会・AIお茶会'),
  (3, 'footer_tagline', '静岡でAI好きの輪を広げよう');

-- アカデミックスタイル（ヘッダー）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (4, 'site_title', 'AI研究交流会・AI学術セミナー'),
  (4, 'site_subtitle', '人工知能技術の学術的探究と実践的応用に関する研究交流の場'),
  (4, 'site_tagline_1', '静岡県内にて定期的に開催'),
  (4, 'site_tagline_2', '研究者・実務家・学生を対象'),
  (4, 'site_tagline_3', '紹介制による参加');

-- アカデミックスタイル（コンセプト）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (4, 'night_title', 'AI研究交流会'),
  (4, 'night_description', 'リラックスした雰囲気の中、AI技術の最新研究動向や実装事例について、研究者と実務家が分野横断的に議論を交わします。理論と実践を架橋する貴重な機会を提供します。'),
  (4, 'tea_title', 'AI学術セミナー'),
  (4, 'tea_description', '落ち着いた環境で、人工知能技術の学術的側面について深く考察します。最新の研究論文や技術動向をもとに、専門的な議論を展開します。');

-- アカデミックスタイル（講師・お問い合わせ・フッター）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (4, 'instructor_section_title', '研究者・専門家について'),
  (4, 'instructor_section_subtitle', '理論と実践を統合したAI研究支援'),
  (4, 'instructor_description_1', '本研究会では、AI技術の学術的基盤と産業応用の両面に精通した専門家が、理論的枠組みと実装技術の両面から参加者の研究活動を支援します。機械学習、深層学習、自然言語処理など、幅広い分野をカバーします。'),
  (4, 'instructor_description_2', '研究会では、参加者各位の研究テーマや実務上の課題に応じて、学術的根拠に基づいた技術選択と実装方法をご提案いたします。'),
  (4, 'contact_description', '研究会へのご参加、または研究協力・技術指導に関するお問い合わせは、以下の連絡先までお願いいたします。'),
  (4, 'footer_copyright', '© 2025 AI研究交流会. All rights reserved.'),
  (4, 'footer_tagline', '静岡県におけるAI研究ネットワークの形成');

-- スタートアップ向けスタイル（ヘッダー）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (5, 'site_title', 'AI Startup Meetup・AI起業家サロン'),
  (5, 'site_subtitle', 'AIで未来を創る起業家たちの交流の場'),
  (5, 'site_tagline_1', '静岡から世界へ'),
  (5, 'site_tagline_2', '起業家・起業準備中の方大歓迎'),
  (5, 'site_tagline_3', '完全紹介制');

-- スタートアップ向けスタイル（コンセプト）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (5, 'night_title', 'AI Startup Meetup'),
  (5, 'night_description', 'ピッチ、ネットワーキング、メンタリング。AI×スタートアップの最前線で戦う仲間たちと熱く語り合います。投資家や先輩起業家との出会いも。'),
  (5, 'tea_title', 'AI起業家サロン'),
  (5, 'tea_description', '落ち着いた雰囲気でビジネスモデルや技術戦略について深く議論。AI活用の成功事例と失敗談を共有し、次のステップを一緒に考えます。');

-- スタートアップ向けスタイル（講師・お問い合わせ・フッター）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (5, 'instructor_section_title', 'メンター紹介'),
  (5, 'instructor_section_subtitle', 'AI×ビジネスの立ち上げを全力サポート'),
  (5, 'instructor_description_1', '私たちはAI技術を活用したスタートアップの立ち上げから成長まで、数多くの起業家をサポートしてきました。技術選定、チーム作り、資金調達、Go-to-Market戦略まで、実践的なアドバイスを提供します。'),
  (5, 'instructor_description_2', 'あなたのアイデアを実現するための技術パートナーとして、一緒に走ります。0→1のフェーズでも、1→10のスケールアップでも、お任せください。'),
  (5, 'contact_description', '起業の相談、AI技術の導入支援、メンタリング希望など、まずは気軽に話しましょう。あなたの挑戦を全力で応援します。'),
  (5, 'footer_copyright', '© 2025 AI Startup Meetup. All rights reserved.'),
  (5, 'footer_tagline', '静岡から革新的なAIスタートアップを');

-- 教育機関向けスタイル（ヘッダー）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (6, 'site_title', 'AI教育研究会・AI学習コミュニティ'),
  (6, 'site_subtitle', '教育現場におけるAI活用と指導法の研究・実践の場'),
  (6, 'site_tagline_1', '静岡県内の教育機関が対象'),
  (6, 'site_tagline_2', '教職員・学生・教育関係者歓迎'),
  (6, 'site_tagline_3', '紹介制で参加');

-- 教育機関向けスタイル（コンセプト）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (6, 'night_title', 'AI教育研究会'),
  (6, 'night_description', '教育現場でのAI活用事例を共有し、効果的な指導法について議論します。授業設計からカリキュラム開発まで、実践的な知見を交換できます。'),
  (6, 'tea_title', 'AI学習コミュニティ'),
  (6, 'tea_description', '教育者と学習者が共に学ぶ場。AI技術の基礎から応用まで、段階的に理解を深めていきます。質問歓迎、みんなで成長しましょう。');

-- 教育機関向けスタイル（講師・お問い合わせ・フッター）
INSERT INTO template_settings (template_id, setting_key, setting_value) VALUES
  (6, 'instructor_section_title', '指導者・専門家について'),
  (6, 'instructor_section_subtitle', '教育現場に寄り添ったAI活用支援'),
  (6, 'instructor_description_1', '大学、専門学校、高等学校など、様々な教育現場でAI教育の導入支援を行ってきました。学生の理解度に合わせた教材開発や、教職員向けの研修プログラムを提供しています。'),
  (6, 'instructor_description_2', '教育研究会では、各機関の教育目標やカリキュラムに合わせて、最適なAI活用方法と指導アプローチをご提案します。'),
  (6, 'contact_description', 'AI教育の導入相談、教材開発支援、教職員研修など、お気軽にお問い合わせください。教育現場の課題解決をサポートします。'),
  (6, 'footer_copyright', '© 2025 AI教育研究会. All rights reserved.'),
  (6, 'footer_tagline', '静岡県の教育現場にAIリテラシーを');
