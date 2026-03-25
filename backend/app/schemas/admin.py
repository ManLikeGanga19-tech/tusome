import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any


# ── Auth ────────────────────────────────────────────────────────────────────

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    admin: "AdminResponse"


# ── Admin User ───────────────────────────────────────────────────────────────

class AdminResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AdminCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {"super_admin", "content_editor", "support_agent"}
        if v not in allowed:
            raise ValueError(f"role must be one of {allowed}")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class AdminUpdateRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"super_admin", "content_editor", "support_agent"}
            if v not in allowed:
                raise ValueError(f"role must be one of {allowed}")
        return v


# ── Audit Log ────────────────────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: uuid.UUID
    admin_id: uuid.UUID
    admin_name: str
    action: str
    target_type: str
    target_id: Optional[str] = None
    extra: Optional[Any] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_users: int
    active_subscribers: int
    trial_users: int
    expired_users: int
    total_lessons: int
    total_subjects: int
    revenue_this_month_ksh: int
    new_users_this_week: int


# ── User management (admin view) ────────────────────────────────────────────

class AdminUserView(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    grade: str
    grade_category: str
    subscription_status: str
    trial_end_date: Optional[datetime] = None
    email_verified: bool
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SubscriptionOverrideRequest(BaseModel):
    subscription_status: str

    @field_validator("subscription_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"trial", "active", "expired", "cancelled"}
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v


# ── Content management ──────────────────────────────────────────────────────

class LessonPublishRequest(BaseModel):
    is_published: bool


class SubjectActiveRequest(BaseModel):
    is_active: bool


class LessonAdminResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    description: Optional[str] = None
    order: int
    duration_minutes: int
    is_free_preview: bool
    is_published: bool

    model_config = {"from_attributes": True}


class SubjectAdminResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    grade_category: str
    description: Optional[str] = None
    order: int
    is_active: bool
    lesson_count: int = 0

    model_config = {"from_attributes": True}
