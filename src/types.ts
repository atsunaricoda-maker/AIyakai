// Cloudflare Bindings型定義
export type Bindings = {
  DB: D1Database;
}

// イベントタイプ
export type EventType = 'night' | 'tea';
export type EventStatus = 'upcoming' | 'ongoing' | 'finished' | 'cancelled';

// イベントデータ型
export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: EventType;
  location: string;
  prefecture: string;
  address?: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  capacity: number;
  current_participants: number;
  status: EventStatus;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// 招待コードデータ型
export interface InvitationCode {
  id: number;
  code: string;
  event_id?: number;
  max_uses: number;
  current_uses: number;
  expires_at?: string;
  created_by?: string;
  notes?: string;
  is_active: number;
  created_at: string;
}

// 申込ステータス
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// 申込データ型
export interface Application {
  id: number;
  event_id: number;
  invitation_code?: string;
  company_name: string;
  applicant_name: string;
  position?: string;
  email: string;
  phone?: string;
  ai_usage_examples?: string;
  consultation_topics?: string;
  referrer_name?: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}

// API レスポンス型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
