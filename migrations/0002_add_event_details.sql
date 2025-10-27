-- イベントにテーマ・プログラム情報を追加
ALTER TABLE events ADD COLUMN theme TEXT;
ALTER TABLE events ADD COLUMN mini_lecture_topic TEXT;
ALTER TABLE events ADD COLUMN mini_lecture_duration INTEGER DEFAULT 30;
ALTER TABLE events ADD COLUMN program_details TEXT;
ALTER TABLE events ADD COLUMN target_audience TEXT;

-- 講師・スタッフ情報テーブル
CREATE TABLE IF NOT EXISTS event_staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('lecturer', 'staff', 'presenter', 'facilitator')),
  bio TEXT,
  profile_image_url TEXT,
  presentation_topic TEXT,
  presentation_duration INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- プレゼンター応募テーブル
CREATE TABLE IF NOT EXISTS presenter_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  applicant_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  presentation_title TEXT NOT NULL,
  presentation_summary TEXT NOT NULL,
  desired_duration INTEGER DEFAULT 15,
  presentation_type TEXT CHECK(presentation_type IN ('case_study', 'tool_intro', 'knowledge_share', 'other')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 参加申込テーブルに参加者タイプを追加
ALTER TABLE applications ADD COLUMN participant_type TEXT DEFAULT 'business_owner' 
  CHECK(participant_type IN ('business_owner', 'aspiring_entrepreneur', 'student', 'teacher', 'other'));

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_event_staff_event ON event_staff(event_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_role ON event_staff(role);
CREATE INDEX IF NOT EXISTS idx_presenter_applications_event ON presenter_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_presenter_applications_status ON presenter_applications(status);
