const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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
}

export interface StudentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  grade: string;
  grade_category: string;
  subscription_status: string;
  created_at: string;
}

export interface UsersPage {
  results: StudentUser[];
  total: number;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  grade_category: string;
  is_active: boolean;
  lesson_count: number;
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  is_published: boolean;
  order: number;
  duration_minutes: number | null;
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

  // Users
  async listUsers(skip = 0, limit = 50, search?: string) {
    const q = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (search) q.set("search", search);
    return this.req<UsersPage>(`/admin/users?${q}`);
  }

  async overrideSubscription(userId: string, status: string) {
    return this.req<StudentUser>(`/admin/users/${userId}/subscription`, {
      method: "PATCH",
      body: JSON.stringify({ subscription_status: status }),
    });
  }

  // Content
  async listSubjects() {
    return this.req<Subject[]>("/admin/content/subjects");
  }

  async toggleSubject(subjectId: string, is_active: boolean) {
    return this.req<Subject>(`/admin/content/subjects/${subjectId}/active`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    });
  }

  async listLessons(slug: string) {
    return this.req<Lesson[]>(`/admin/content/subjects/${slug}/lessons`);
  }

  async toggleLesson(lessonId: string, is_published: boolean) {
    return this.req<Lesson>(`/admin/content/lessons/${lessonId}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ is_published }),
    });
  }

  // Admins
  async listAdmins() {
    return this.req<AdminUser[]>("/admin/admins");
  }

  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    return this.req<AdminUser>("/admin/admins", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAdmin(
    id: string,
    data: Partial<{ name: string; role: string; is_active: boolean }>
  ) {
    return this.req<AdminUser>(`/admin/admins/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Audit
  async auditLogs(skip = 0, limit = 50) {
    return this.req<AuditLog[]>(
      `/admin/audit?skip=${skip}&limit=${limit}`
    );
  }
}

export const adminAPI = new AdminAPI();
