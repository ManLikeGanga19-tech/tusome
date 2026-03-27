import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator


# ── Blog Posts ───────────────────────────────────────────────────────────────

BLOG_CATEGORIES = {"general", "study-tips", "cbc-guide", "career-advice", "student-life", "exam-prep"}


class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author_name: str = "Tusome Team"
    category: str = "general"
    tags: Optional[List[str]] = None
    cover_image_url: Optional[str] = None
    read_time_minutes: int = 5
    is_published: bool = False
    is_featured: bool = False

    @field_validator("slug")
    @classmethod
    def slug_format(cls, v: str) -> str:
        v = v.strip().lower().replace(" ", "-")
        if not v:
            raise ValueError("Slug cannot be empty")
        return v


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author_name: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    cover_image_url: Optional[str] = None
    read_time_minutes: Optional[int] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None


class BlogPostResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author_name: str
    category: str
    tags: Optional[List[str]] = None
    cover_image_url: Optional[str] = None
    read_time_minutes: int
    view_count: int
    is_published: bool
    is_featured: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Success Stories ──────────────────────────────────────────────────────────

class SuccessStoryCreate(BaseModel):
    student_name: str
    role: str = "student"
    grade_level: Optional[str] = None
    location: Optional[str] = None
    story_text: str
    achievement: Optional[str] = None
    impact: Optional[str] = None
    is_published: bool = False
    is_featured: bool = False

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in {"student", "teacher", "parent"}:
            raise ValueError("role must be student, teacher, or parent")
        return v


class SuccessStoryUpdate(BaseModel):
    student_name: Optional[str] = None
    role: Optional[str] = None
    grade_level: Optional[str] = None
    location: Optional[str] = None
    story_text: Optional[str] = None
    achievement: Optional[str] = None
    impact: Optional[str] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None


class SuccessStoryResponse(BaseModel):
    id: uuid.UUID
    student_name: str
    role: str
    grade_level: Optional[str] = None
    location: Optional[str] = None
    story_text: str
    achievement: Optional[str] = None
    impact: Optional[str] = None
    is_published: bool
    is_featured: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Announcements ────────────────────────────────────────────────────────────

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    announcement_type: str = "info"
    target_audience: str = "all"
    is_active: bool = True
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

    @field_validator("announcement_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in {"info", "warning", "success"}:
            raise ValueError("announcement_type must be info, warning, or success")
        return v

    @field_validator("target_audience")
    @classmethod
    def validate_audience(cls, v: str) -> str:
        if v not in {"all", "trial", "active", "expired"}:
            raise ValueError("target_audience must be all, trial, active, or expired")
        return v


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    announcement_type: Optional[str] = None
    target_audience: Optional[str] = None
    is_active: Optional[bool] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class AnnouncementResponse(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    announcement_type: str
    target_audience: str
    is_active: bool
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── FAQs ─────────────────────────────────────────────────────────────────────

class FaqCreate(BaseModel):
    question: str
    answer: str
    category: str = "general"
    display_order: int = 0
    is_published: bool = True


class FaqUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[bool] = None


class FaqResponse(BaseModel):
    id: uuid.UUID
    question: str
    answer: str
    category: str
    display_order: int
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
