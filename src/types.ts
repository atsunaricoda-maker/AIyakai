// Cloudflare Bindings型定義
export type Bindings = {
  DB: D1Database;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
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
  price: number;
  is_free: number;
  payment_required: number;
  image_url?: string;
  theme?: string;
  mini_lecture_topic?: string;
  mini_lecture_duration?: number;
  program_details?: string;
  target_audience?: string;
  created_at: string;
  updated_at: string;
}

// 講師・スタッフ情報型
export type StaffRole = 'lecturer' | 'staff' | 'presenter' | 'facilitator';

export interface EventStaff {
  id: number;
  event_id: number;
  name: string;
  role: StaffRole;
  bio?: string;
  profile_image_url?: string;
  presentation_topic?: string;
  presentation_duration?: number;
  display_order: number;
  created_at: string;
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

// 支払いステータス
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// 参加者タイプ
export type ParticipantType = 'business_owner' | 'aspiring_entrepreneur' | 'student' | 'teacher' | 'other';

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
  participant_type: ParticipantType;
  status: ApplicationStatus;
  payment_status: PaymentStatus;
  payment_amount: number;
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  ticket_code?: string;
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
