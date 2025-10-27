-- テストデータ：イベント
INSERT OR IGNORE INTO events (id, title, description, event_type, location, address, event_date, start_time, end_time, capacity, status) VALUES 
  (1, 'AI夜会 Vol.1 浜松', '浜松でのAI夜会第一回開催。お酒を片手にAI活用について語り合いましょう。企業での実践事例を共有し、経営者同士のネットワークを構築します。', 'night', '浜松市', '浜松市中区〇〇町1-2-3 〇〇ビル3F', '2025-11-15', '18:30', '21:00', 15, 'upcoming'),
  (2, 'AI茶会 静岡', '静岡でのAI茶会。落ち着いた雰囲気でお茶を楽しみながら、AIについて深く語り合います。プロジェクター活用の事例紹介もあります。', 'tea', '静岡市', '静岡市葵区〇〇1-2-3', '2025-11-22', '14:00', '17:00', 20, 'upcoming'),
  (3, 'AI夜会 Vol.2 沼津', '沼津エリアでの開催。各企業のAI導入事例を持ち寄って情報交換。懇親も兼ねた実践的なイベントです。', 'night', '沼津市', '沼津市〇〇町5-6-7', '2025-12-05', '19:00', '21:30', 12, 'upcoming');

-- テストデータ：招待コード
INSERT OR IGNORE INTO invitation_codes (id, code, event_id, max_uses, expires_at, created_by, notes, is_active) VALUES 
  (1, 'HAMAMATSU2025', 1, 10, '2025-11-14 23:59:59', 'admin', '浜松経営者向け一般招待コード', 1),
  (2, 'SHIZUOKA2025', 2, 15, '2025-11-21 23:59:59', 'admin', '静岡茶会一般招待コード', 1),
  (3, 'VIP2025SPECIAL', NULL, 999, '2025-12-31 23:59:59', 'admin', 'VIP紹介者向け全イベント共通コード', 1),
  (4, 'NUMAZU2025', 3, 8, '2025-12-04 23:59:59', 'admin', '沼津夜会招待コード', 1);

-- テストデータ：申込（サンプル）
INSERT OR IGNORE INTO applications (event_id, invitation_code, company_name, applicant_name, position, email, phone, ai_usage_examples, consultation_topics, status, applied_at) VALUES 
  (1, 'HAMAMATSU2025', '株式会社テストカンパニー', '山田太郎', '代表取締役', 'yamada@test-company.com', '090-1234-5678', 'ChatGPTで業務効率化、社内ナレッジベース構築にAI活用', 'AIによる営業支援システムの導入について相談したい', 'approved', '2025-10-25 10:30:00'),
  (2, 'SHIZUOKA2025', '佐藤商事株式会社', '佐藤花子', '取締役', 'sato@sato-shoji.com', '080-9876-5432', 'まだ導入していないが興味あり', 'どこから始めればよいか基礎から教えてほしい', 'pending', '2025-10-26 14:15:00');

-- 管理者アカウント（パスワード: admin123 のハッシュ - 実際には適切にハッシュ化すること）
INSERT OR IGNORE INTO admins (id, username, password_hash, email, role) VALUES 
  (1, 'admin', '$2a$10$example_hash_placeholder', 'admin@ai-event.local', 'super_admin');
