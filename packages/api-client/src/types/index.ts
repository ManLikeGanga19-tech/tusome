// ── Shared domain types used by both web and admin apps ──

export type GradeCategory = "primary" | "junior" | "senior";
export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";
export type AdminRole = "super_admin" | "content_editor" | "support_agent";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  grade: string;
  grade_category: GradeCategory;
  grade_tier: "Primary CBC" | "Junior Secondary" | "Senior Secondary";
  profile_image?: string;
  is_active: boolean;
  email_verified: boolean;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  grade_category: GradeCategory;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  lesson_count?: number;
}

export interface Lesson {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  duration_minutes: number;
  is_free_preview: boolean;
  is_published: boolean;
  resources: LessonResource[];
}

export interface LessonDetail extends Lesson {
  content?: string;
}

export interface LessonResource {
  id: string;
  resource_type: "video" | "pdf" | "audio" | "image";
  title: string;
  url: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}
