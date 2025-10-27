-- テストデータ：イベント
INSERT OR IGNORE INTO events (id, title, description, event_type, location, address, event_date, start_time, end_time, capacity, status, theme, mini_lecture_topic, mini_lecture_duration, program_details, target_audience) VALUES 
  (1, 'AI夜会 Vol.1 浜松', '浜松でのAI夜会第一回開催。お酒を片手にAI活用について語り合いましょう。企業での実践事例を共有し、参加者同士のネットワークを構築します。', 'night', '浜松市', '浜松市中区〇〇町1-2-3 〇〇ビル3F', '2025-11-15', '18:30', '21:00', 15, 'upcoming', 
    'ChatGPTで変わる業務効率化', 
    'ChatGPTを活用した実務改善の具体例', 
    30,
    '18:30 受付開始\n19:00 ミニ講座「ChatGPTで変わる業務効率化」(30分)\n19:30 参加者事例共有・交流タイム\n20:30 質疑応答・個別相談\n21:00 終了',
    '経営者、起業準備中の方、AIに興味がある方、どなたでも歓迎'),
  (2, 'AI茶会 静岡', '静岡でのAI茶会。落ち着いた雰囲気でお茶を楽しみながら、AIについて深く語り合います。プロジェクター活用の事例紹介もあります。', 'tea', '静岡市', '静岡市葵区〇〇1-2-3', '2025-11-22', '14:00', '17:00', 20, 'upcoming',
    '画像生成AIの実践活用',
    '画像生成AIを使った資料作成・SNS運用',
    30,
    '14:00 受付・お茶タイム\n14:30 ミニ講座「画像生成AIの実践活用」(30分)\n15:00 参加者プレゼンタイム（希望者）\n15:30 交流・質疑応答\n16:30 個別相談タイム\n17:00 終了',
    '起業家、AIツール活用に興味がある方、講師・教室運営者、学生も歓迎'),
  (3, 'AI夜会 Vol.2 沼津', '沼津エリアでの開催。各企業のAI導入事例を持ち寄って情報交換。懇親も兼ねた実践的なイベントです。', 'night', '沼津市', '沼津市〇〇町5-6-7', '2025-12-05', '19:00', '21:30', 12, 'upcoming',
    'AI導入の始め方と選び方',
    'これから始めるAI活用 - ツール選定のポイント',
    30,
    '19:00 受付・乾杯\n19:30 ミニ講座「AI導入の始め方と選び方」(30分)\n20:00 参加者事例共有（5分×3名程度）\n20:30 フリートーク・個別相談\n21:30 終了',
    '起業したい方、AI講師志望の方、すでに活用中の経営者など、どなたでも');

-- テストデータ：招待コード
INSERT OR IGNORE INTO invitation_codes (id, code, event_id, max_uses, expires_at, created_by, notes, is_active) VALUES 
  (1, 'HAMAMATSU2025', 1, 10, '2025-11-14 23:59:59', 'admin', '浜松経営者向け一般招待コード', 1),
  (2, 'SHIZUOKA2025', 2, 15, '2025-11-21 23:59:59', 'admin', '静岡茶会一般招待コード', 1),
  (3, 'VIP2025SPECIAL', NULL, 999, '2025-12-31 23:59:59', 'admin', 'VIP紹介者向け全イベント共通コード', 1),
  (4, 'NUMAZU2025', 3, 8, '2025-12-04 23:59:59', 'admin', '沼津夜会招待コード', 1);

-- テストデータ：講師・スタッフ情報
INSERT OR IGNORE INTO event_staff (id, event_id, name, role, bio, display_order) VALUES
  (1, 1, '鈴木一郎', 'lecturer', 'AI活用コンサルタント。企業向けAI導入支援を10年以上行っている。ChatGPT活用の実践的なノウハウを持つ。', 1),
  (2, 1, '田中美咲', 'staff', 'イベント運営スタッフ。参加者の皆様をサポートします。', 2),
  (3, 2, '佐々木健太', 'lecturer', '画像生成AI専門家。デザイン業界でのAI活用推進者。MidjourneyやDALL-Eを使った実務改善事例多数。', 1),
  (4, 2, '山本優子', 'facilitator', 'イベントファシリテーター。対話を促進し、活発な交流をサポートします。', 2),
  (5, 3, '伊藤雄太', 'lecturer', 'スタートアップ向けAIコンサル。起業家のAI活用を支援。ツール選定から導入まで幅広くサポート。', 1);

-- テストデータ：申込（サンプル）
INSERT OR IGNORE INTO applications (event_id, invitation_code, company_name, applicant_name, position, email, phone, ai_usage_examples, consultation_topics, participant_type, status, applied_at) VALUES 
  (1, 'HAMAMATSU2025', '株式会社テストカンパニー', '山田太郎', '代表取締役', 'yamada@test-company.com', '090-1234-5678', 'ChatGPTで業務効率化、社内ナレッジベース構築にAI活用', 'AIによる営業支援システムの導入について相談したい', 'business_owner', 'approved', '2025-10-25 10:30:00'),
  (2, 'SHIZUOKA2025', '個人', '佐藤花子', '起業準備中', 'sato@example.com', '080-9876-5432', 'まだ導入していないが興味あり', 'どこから始めればよいか基礎から教えてほしい', 'aspiring_entrepreneur', 'pending', '2025-10-26 14:15:00'),
  (3, 'SHIZUOKA2025', 'AI教室ラボ', '中村誠', '講師', 'nakamura@ai-lab.com', '090-1111-2222', 'AI教室で基礎から教えている', '教室運営のノウハウや最新情報を知りたい', 'teacher', 'pending', '2025-10-26 16:00:00');

-- 管理者アカウント（パスワード: admin123 のハッシュ - 実際には適切にハッシュ化すること）
INSERT OR IGNORE INTO admins (id, username, password_hash, email, role) VALUES 
  (1, 'admin', '$2a$10$example_hash_placeholder', 'admin@ai-event.local', 'super_admin');
