const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "content_editor" | "support_agent";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_subscribers: number;
  trial_users: number;
  expired_users: number;
  total_lessons: number;
  total_subjects: number;
  revenue_this_month_ksh: number;
  new_users_this_week: number;
  expiring_trials_soon: number;
  failed_payments_today: number;
}

export interface SubjectGapItem {
  id: string;
  name: string;
  grade_category: string;
  is_active: boolean;
  total_lessons: number;
  published_lessons: number;
  draft_lessons: number;
  unique_completions: number;
  completion_rate: number;
  is_under_served: boolean;
}

export interface GradeTotals {
  subjects: number;
  total_lessons: number;
  published_lessons: number;
  unique_completions: number;
}

export interface ContentGapReport {
  subjects_by_grade: Record<string, SubjectGapItem[]>;
  grade_totals: Record<string, GradeTotals>;
  under_served_count: number;
  total_subjects: number;
}

export interface SuspiciousEvent {
  event_type: string;
  severity: "high" | "medium" | "low";
  user_id: string;
  user_name: string;
  user_email: string;
  description: string;
  count: number;
  occurred_at: string;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  admin_role: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  created_at: string;
  last_active_at: string;
  expires_at: string;
}

export interface DailyMetric {
  date: string;
  value: number;
}

export interface GradeBreakdown {
  primary: number;
  junior: number;
  senior: number;
}

export interface AnalyticsOverview {
  registrations_by_day: DailyMetric[];
  revenue_by_day: DailyMetric[];
  trial_conversion_rate: number;
  churn_rate: number;
  grade_breakdown: GradeBreakdown;
  total_revenue_ksh: number;
  avg_revenue_per_user_ksh: number;
}

export interface UserActivityItem {
  activity_type: string;
  ip_address: string | null;
  created_at: string;
}

export interface UserPaymentItem {
  plan: string;
  amount_ksh: number;
  status: string;
  mpesa_receipt_number: string | null;
  phone_number: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  grade: string;
  grade_category: string;
  grade_tier: string;
  subscription_status: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  last_login_at: string | null;
  created_at: string;
  is_active: boolean;
  email_verified: boolean;
  recent_activities: UserActivityItem[];
  payment_history: UserPaymentItem[];
}

export interface StudentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  grade: string;
  grade_category: string;
  subscription_status: string;
  trial_end_date: string | null;
  created_at: string;
  last_login_at: string | null;
  // Progress fields (populated in list response)
  total_xp?: number;
  level?: number;
  level_name?: string;
  current_streak?: number;
  lessons_completed?: number;
}

export interface UserProgressBadge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  criteria_type: string;
  criteria_value: number;
  xp_bonus: number;
}

export interface UserProgressStats {
  total_xp: number;
  level: number;
  level_name: string;
  next_level_xp: number | null;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  subjects_mastered: number;
  last_activity_date: string | null;
  badges: { badge: UserProgressBadge; earned_at: string }[];
}

export interface UsersPage {
  results: StudentUser[];
  total: number;
}

export interface PaymentTransaction {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  plan: string | null;
  amount_ksh: number;
  status: string;
  mpesa_receipt_number: string | null;
  phone_number: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  grade_category: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  lesson_count: number;
  order: number;
}

export interface Lesson {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  is_published: boolean;
  is_free_preview: boolean;
  order: number;
  duration_minutes: number;
}

export interface QuizChoice {
  id: string;
  choice_text: string;
  is_correct: boolean;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: "mcq" | "true_false";
  explanation: string | null;
  points: number;
  order: number;
  choices: QuizChoice[];
}

export interface Quiz {
  id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  pass_score: number;
  xp_reward: number;
  time_limit_seconds: number | null;
  grade_category: string | null;
  is_published: boolean;
  question_count: number;
  randomise_order: boolean;
  max_attempts_per_day: number | null;
  show_correct_answers: boolean;
  created_at: string;
}

export interface QuizDetail extends Omit<Quiz, "question_count"> {
  questions: QuizQuestion[];
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  extra: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  author_name: string;
  category: string;
  tags: string[] | null;
  cover_image_url: string | null;
  read_time_minutes: number;
  view_count: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuccessStory {
  id: string;
  student_name: string;
  role: string;
  grade_level: string | null;
  location: string | null;
  story_text: string;
  achievement: string | null;
  impact: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  announcement_type: string;
  target_audience: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ── API Client ────────────────────────────────────────────────────────────────

class AdminAPI {
  private token: string | null = null;

  setToken(t: string | null) {
    this.token = t;
  }

  private async req<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;

    const res = await fetch(`${BASE}${path}`, { ...init, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Request failed");
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.req<{ access_token: string; admin: AdminUser }>(
      "/admin/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
  }

  async me() {
    return this.req<AdminUser>("/admin/auth/me");
  }

  // Dashboard
  async stats() {
    return this.req<DashboardStats>("/admin/dashboard/stats");
  }

  // Analytics
  async analyticsOverview(days = 30) {
    return this.req<AnalyticsOverview>(`/admin/analytics/overview?days=${days}`);
  }

  // Users
  async listUsers(skip = 0, limit = 50, search?: string) {
    const q = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (search) q.set("search", search);
    return this.req<UsersPage>(`/admin/users?${q}`);
  }

  async userProfile(userId: string) {
    return this.req<UserProfile>(`/admin/users/${userId}/profile`);
  }

  async userProgress(userId: string) {
    return this.req<UserProgressStats>(`/admin/users/${userId}/progress`);
  }

  async expiringTrials() {
    return this.req<StudentUser[]>("/admin/users/expiring-trials");
  }

  async overrideSubscription(userId: string, status: string) {
    return this.req<StudentUser>(`/admin/users/${userId}/subscription`, {
      method: "PATCH",
      body: JSON.stringify({ subscription_status: status }),
    });
  }

  // Payments
  async listPayments(skip = 0, limit = 50, status?: string) {
    const q = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (status) q.set("status", status);
    return this.req<{ total: number; results: PaymentTransaction[] }>(
      `/admin/payments?${q}`
    );
  }

  // Analytics — Phase 3
  async contentGaps() {
    return this.req<ContentGapReport>("/admin/analytics/content-gaps");
  }

  async suspiciousActivity() {
    return this.req<SuspiciousEvent[]>("/admin/analytics/suspicious");
  }

  // Bulk user actions
  async bulkUserAction(user_ids: string[], action: string, value?: string) {
    return this.req<{ affected: number; action: string }>("/admin/users/bulk", {
      method: "POST",
      body: JSON.stringify({ user_ids, action, value }),
    });
  }

  // Sessions
  async listSessions(activeOnly = true) {
    return this.req<AdminSession[]>(`/admin/sessions?active_only=${activeOnly}`);
  }

  async forceLogout(sessionId: string) {
    return this.req<void>(`/admin/sessions/${sessionId}`, { method: "DELETE" });
  }

  // Users — CSV export (returns raw Response for download)
  async exportUsersCSV(): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${BASE}/admin/users/export`, { headers });
    if (!res.ok) throw new Error("Export failed");
    return res.blob();
  }

  // Content — subjects
  async listSubjects() {
    return this.req<Subject[]>("/admin/content/subjects");
  }

  async createSubject(data: Partial<Subject>) {
    return this.req<Subject>("/admin/content/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSubject(id: string, data: Partial<Subject>) {
    return this.req<Subject>(`/admin/content/subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteSubject(id: string) {
    return this.req<void>(`/admin/content/subjects/${id}`, { method: "DELETE" });
  }

  async toggleSubject(subjectId: string, is_active: boolean) {
    return this.req<Subject>(`/admin/content/subjects/${subjectId}/active`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    });
  }

  // Content — lessons
  async listLessons(slug: string) {
    return this.req<Lesson[]>(`/admin/content/subjects/${slug}/lessons`);
  }

  async createLesson(data: Partial<Lesson>) {
    return this.req<Lesson>("/admin/content/lessons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLesson(id: string, data: Partial<Lesson>) {
    return this.req<Lesson>(`/admin/content/lessons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteLesson(id: string) {
    return this.req<void>(`/admin/content/lessons/${id}`, { method: "DELETE" });
  }

  async toggleLesson(lessonId: string, is_published: boolean) {
    return this.req<Lesson>(`/admin/content/lessons/${lessonId}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ is_published }),
    });
  }

  // Quizzes
  async listQuizzes() {
    return this.req<Quiz[]>("/admin/quizzes");
  }

  async getQuiz(id: string) {
    return this.req<QuizDetail>(`/admin/quizzes/${id}`);
  }

  async createQuiz(data: Partial<Quiz>) {
    return this.req<Quiz>("/admin/quizzes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateQuiz(id: string, data: Partial<Quiz>) {
    return this.req<Quiz>(`/admin/quizzes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteQuiz(id: string) {
    return this.req<void>(`/admin/quizzes/${id}`, { method: "DELETE" });
  }

  async createQuestion(quizId: string, data: Partial<QuizQuestion>) {
    return this.req<QuizQuestion>(`/admin/quizzes/${quizId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateQuestion(quizId: string, questionId: string, data: Partial<QuizQuestion>) {
    return this.req<QuizQuestion>(`/admin/quizzes/${quizId}/questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteQuestion(quizId: string, questionId: string) {
    return this.req<void>(`/admin/quizzes/${quizId}/questions/${questionId}`, { method: "DELETE" });
  }

  async createChoice(quizId: string, questionId: string, data: Partial<QuizChoice>) {
    return this.req<QuizChoice>(`/admin/quizzes/${quizId}/questions/${questionId}/choices`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateChoice(quizId: string, questionId: string, choiceId: string, data: Partial<QuizChoice>) {
    return this.req<QuizChoice>(`/admin/quizzes/${quizId}/questions/${questionId}/choices/${choiceId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteChoice(quizId: string, questionId: string, choiceId: string) {
    return this.req<void>(`/admin/quizzes/${quizId}/questions/${questionId}/choices/${choiceId}`, { method: "DELETE" });
  }

  // Admins
  async listAdmins() {
    return this.req<AdminUser[]>("/admin/admins");
  }

  async createAdmin(data: { name: string; email: string; password: string; role: string }) {
    return this.req<AdminUser>("/admin/admins", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAdmin(id: string, data: Partial<{ name: string; role: string; is_active: boolean }>) {
    return this.req<AdminUser>(`/admin/admins/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Audit
  async auditLogs(skip = 0, limit = 50) {
    return this.req<AuditLog[]>(`/admin/audit?skip=${skip}&limit=${limit}`);
  }

  // CMS — Blog
  async listBlogPosts(skip = 0, limit = 50) {
    return this.req<{ total: number; results: BlogPost[] }>(
      `/admin/cms/blog?skip=${skip}&limit=${limit}`
    );
  }

  async createBlogPost(data: Partial<BlogPost>) {
    return this.req<BlogPost>("/admin/cms/blog", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBlogPost(id: string, data: Partial<BlogPost>) {
    return this.req<BlogPost>(`/admin/cms/blog/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteBlogPost(id: string) {
    return this.req<void>(`/admin/cms/blog/${id}`, { method: "DELETE" });
  }

  // CMS — Stories
  async listStories(skip = 0, limit = 50) {
    return this.req<{ total: number; results: SuccessStory[] }>(
      `/admin/cms/stories?skip=${skip}&limit=${limit}`
    );
  }

  async createStory(data: Partial<SuccessStory>) {
    return this.req<SuccessStory>("/admin/cms/stories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateStory(id: string, data: Partial<SuccessStory>) {
    return this.req<SuccessStory>(`/admin/cms/stories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteStory(id: string) {
    return this.req<void>(`/admin/cms/stories/${id}`, { method: "DELETE" });
  }

  // CMS — Announcements
  async listAnnouncements() {
    return this.req<Announcement[]>("/admin/cms/announcements");
  }

  async createAnnouncement(data: Partial<Announcement>) {
    return this.req<Announcement>("/admin/cms/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAnnouncement(id: string, data: Partial<Announcement>) {
    return this.req<Announcement>(`/admin/cms/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: string) {
    return this.req<void>(`/admin/cms/announcements/${id}`, { method: "DELETE" });
  }

  // CMS — FAQs
  async listFaqs() {
    return this.req<Faq[]>("/admin/cms/faqs");
  }

  async createFaq(data: Partial<Faq>) {
    return this.req<Faq>("/admin/cms/faqs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFaq(id: string, data: Partial<Faq>) {
    return this.req<Faq>(`/admin/cms/faqs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteFaq(id: string) {
    return this.req<void>(`/admin/cms/faqs/${id}`, { method: "DELETE" });
  }
}

export const adminAPI = new AdminAPI();
