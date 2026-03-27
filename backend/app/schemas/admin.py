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
    expiring_trials_soon: int = 0   # trials ending within 3 days
    failed_payments_today: int = 0  # failed M-Pesa transactions today


# ── Admin Sessions ────────────────────────────────────────────────────────────

class AdminSessionResponse(BaseModel):
    id: uuid.UUID
    admin_id: uuid.UUID
    admin_name: str
    admin_email: str
    admin_role: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_active_at: datetime
    expires_at: datetime

    model_config = {"from_attributes": True}


# ── Analytics ────────────────────────────────────────────────────────────────

class DailyMetric(BaseModel):
    date: str  # YYYY-MM-DD
    value: float


class GradeBreakdown(BaseModel):
    primary: int
    junior: int
    senior: int


class AnalyticsOverview(BaseModel):
    registrations_by_day: List[DailyMetric]
    revenue_by_day: List[DailyMetric]
    trial_conversion_rate: float   # percentage of expired+active who converted
    churn_rate: float              # percentage of users who lapsed this month
    grade_breakdown: GradeBreakdown
    total_revenue_ksh: int
    avg_revenue_per_user_ksh: float


# ── User profile (detailed) ──────────────────────────────────────────────────

class UserActivityItem(BaseModel):
    activity_type: str
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPaymentItem(BaseModel):
    plan: str
    amount_ksh: int
    status: str
    mpesa_receipt_number: Optional[str] = None
    phone_number: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    grade: str
    grade_category: str
    grade_tier: str
    subscription_status: str
    trial_start_date: Optional[datetime] = None
    trial_end_date: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    is_active: bool
    email_verified: bool
    recent_activities: List[UserActivityItem]
    payment_history: List[UserPaymentItem]

    model_config = {"from_attributes": True}


# ── Payment transaction log ──────────────────────────────────────────────────

class PaymentTransactionAdminResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    plan: Optional[str] = None
    amount_ksh: int
    status: str
    mpesa_receipt_number: Optional[str] = None
    phone_number: str
    created_at: datetime

    model_config = {"from_attributes": True}


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


# ── Bulk user actions ────────────────────────────────────────────────────────

class BulkUserActionRequest(BaseModel):
    user_ids: List[str]
    action: str   # set_status | deactivate | reactivate
    value: Optional[str] = None  # required for set_status

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        allowed = {"set_status", "deactivate", "reactivate"}
        if v not in allowed:
            raise ValueError(f"action must be one of {allowed}")
        return v


class BulkUserActionResponse(BaseModel):
    affected: int
    action: str


# ── Content gap report ───────────────────────────────────────────────────────

class SubjectGapItem(BaseModel):
    id: str
    name: str
    grade_category: str
    is_active: bool
    total_lessons: int
    published_lessons: int
    draft_lessons: int
    unique_completions: int
    completion_rate: float
    is_under_served: bool


class GradeTotals(BaseModel):
    subjects: int
    total_lessons: int
    published_lessons: int
    unique_completions: int


class ContentGapReport(BaseModel):
    subjects_by_grade: dict[str, List[SubjectGapItem]]
    grade_totals: dict[str, GradeTotals]
    under_served_count: int
    total_subjects: int


# ── Suspicious activity ──────────────────────────────────────────────────────

class SuspiciousEvent(BaseModel):
    event_type: str
    severity: str   # high | medium | low
    user_id: str
    user_name: str
    user_email: str
    description: str
    count: int
    occurred_at: str


# ── Content management ──────────────────────────────────────────────────────

class LessonPublishRequest(BaseModel):
    is_published: bool


class SubjectActiveRequest(BaseModel):
    is_active: bool


class LessonAdminResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    title: str
    slug: str
    description: Optional[str] = None
    content: Optional[str] = None
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
    icon: Optional[str] = None
    color: Optional[str] = None
    order: int
    is_active: bool
    lesson_count: int = 0

    model_config = {"from_attributes": True}


class SubjectCreate(BaseModel):
    name: str
    grade_category: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    order: int = 0

    @field_validator("grade_category")
    @classmethod
    def validate_grade(cls, v: str) -> str:
        allowed = {"primary", "junior", "senior"}
        if v not in allowed:
            raise ValueError(f"grade_category must be one of {allowed}")
        return v


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    grade_category: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("grade_category")
    @classmethod
    def validate_grade(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"primary", "junior", "senior"}
            if v not in allowed:
                raise ValueError(f"grade_category must be one of {allowed}")
        return v


class LessonCreate(BaseModel):
    subject_id: uuid.UUID
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    order: int = 0
    duration_minutes: int = 0
    is_free_preview: bool = False
    is_published: bool = False


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None
    duration_minutes: Optional[int] = None
    is_free_preview: Optional[bool] = None
    is_published: Optional[bool] = None


# ── Quiz admin ────────────────────────────────────────────────────────────────

class ChoiceAdminOut(BaseModel):
    id: uuid.UUID
    choice_text: str
    is_correct: bool
    order: int

    model_config = {"from_attributes": True}


class QuestionAdminOut(BaseModel):
    id: uuid.UUID
    question_text: str
    question_type: str
    explanation: Optional[str] = None
    points: int
    order: int
    choices: List[ChoiceAdminOut]

    model_config = {"from_attributes": True}


class QuizAdminResponse(BaseModel):
    id: uuid.UUID
    lesson_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    pass_score: int
    xp_reward: int
    time_limit_seconds: Optional[int] = None
    grade_category: Optional[str] = None
    is_published: bool
    question_count: int = 0
    randomise_order: bool = True
    max_attempts_per_day: Optional[int] = None
    show_correct_answers: bool = True
    created_at: datetime

    model_config = {"from_attributes": True}


class QuizAdminDetailResponse(BaseModel):
    id: uuid.UUID
    lesson_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    pass_score: int
    xp_reward: int
    time_limit_seconds: Optional[int] = None
    grade_category: Optional[str] = None
    is_published: bool
    randomise_order: bool = True
    max_attempts_per_day: Optional[int] = None
    show_correct_answers: bool = True
    questions: List[QuestionAdminOut]
    created_at: datetime

    model_config = {"from_attributes": True}


class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    lesson_id: Optional[uuid.UUID] = None
    pass_score: int = 60
    xp_reward: int = 20
    time_limit_seconds: Optional[int] = None
    grade_category: Optional[str] = None
    is_published: bool = False
    randomise_order: bool = True
    max_attempts_per_day: Optional[int] = None
    show_correct_answers: bool = True


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    lesson_id: Optional[uuid.UUID] = None
    pass_score: Optional[int] = None
    xp_reward: Optional[int] = None
    time_limit_seconds: Optional[int] = None
    grade_category: Optional[str] = None
    is_published: Optional[bool] = None
    randomise_order: Optional[bool] = None
    max_attempts_per_day: Optional[int] = None
    show_correct_answers: Optional[bool] = None


class QuestionCreate(BaseModel):
    question_text: str
    question_type: str = "mcq"
    explanation: Optional[str] = None
    points: int = 1
    order: int = 0

    @field_validator("question_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in {"mcq", "true_false"}:
            raise ValueError("question_type must be mcq or true_false")
        return v


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    explanation: Optional[str] = None
    points: Optional[int] = None
    order: Optional[int] = None

    @field_validator("question_type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in {"mcq", "true_false"}:
            raise ValueError("question_type must be mcq or true_false")
        return v


class ChoiceCreate(BaseModel):
    choice_text: str
    is_correct: bool = False
    order: int = 0


class ChoiceUpdate(BaseModel):
    choice_text: Optional[str] = None
    is_correct: Optional[bool] = None
    order: Optional[int] = None
