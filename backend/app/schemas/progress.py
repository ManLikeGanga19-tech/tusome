import uuid
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional


# ── Requests ──────────────────────────────────────────────────────────────────

class MarkCompleteRequest(BaseModel):
    lesson_id: uuid.UUID
    time_spent_seconds: int = 0


class UpdateProgressRequest(BaseModel):
    """For saving in-progress state (without awarding XP)."""
    lesson_id: uuid.UUID
    time_spent_seconds: int = 0


# ── Responses ─────────────────────────────────────────────────────────────────

class BadgeResponse(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    description: str
    icon_url: Optional[str]
    criteria_type: str
    criteria_value: int
    xp_bonus: int

    model_config = {"from_attributes": True}


class UserBadgeResponse(BaseModel):
    badge: BadgeResponse
    earned_at: datetime

    model_config = {"from_attributes": True}


class MarkCompleteResponse(BaseModel):
    """Returned when a lesson is marked complete — drives the XP celebration UI."""
    lesson_id: uuid.UUID
    xp_earned: int           # XP awarded for this specific completion
    total_xp: int
    level: int
    level_name: str
    next_level_xp: Optional[int]  # XP threshold for next level, None if max
    current_streak: int
    newly_earned_badges: list[BadgeResponse]  # badges unlocked in this action


class UserStatsResponse(BaseModel):
    total_xp: int
    level: int
    level_name: str
    next_level_xp: Optional[int]
    lessons_completed: int
    subjects_mastered: int
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[date]

    model_config = {"from_attributes": True}


class SubjectProgressResponse(BaseModel):
    subject_id: uuid.UUID
    subject_name: str
    total_lessons: int
    completed_lessons: int
    percent_complete: float
    tier: str  # Beginner | Explorer | Learner | Proficient | Master


class CalendarDay(BaseModel):
    date: date
    completed: bool  # True if the user completed at least one lesson that day


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: uuid.UUID
    display_name: str        # "{first_name} {last_name[0]}." for privacy
    total_xp: int
    level: int
    level_name: str
    grade_category: str


# Keep backwards-compat alias used by older test fixtures
class ProgressUpdateRequest(BaseModel):
    lesson_id: uuid.UUID
    status: str
    time_spent_seconds: int = 0
    score: Optional[float] = None


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_study_date: Optional[datetime]
