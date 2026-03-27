import uuid
from datetime import datetime, timezone, date
from sqlalchemy import (
    String, Boolean, DateTime, Date, ForeignKey, Integer, Float,
    Text, UniqueConstraint, Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


# ── XP / level constants (single source of truth) ─────────────────────────────

LEVELS: list[tuple[int, str, int]] = [
    (1,  "Mwanzo",       0),
    (2,  "Mwanafunzi",  50),
    (3,  "Mchunguzi",  150),
    (4,  "Mjuzi",       300),
    (5,  "Bingwa",      550),
    (6,  "Mwalimu",     850),
    (7,  "Msomi",      1200),
    (8,  "Daktari",    1700),
    (9,  "Profesa",    2300),
    (10, "Tusome Champ", 3000),
]

SUBJECT_TIERS: list[tuple[int, str]] = [
    (81, "Master"),
    (61, "Proficient"),
    (41, "Learner"),
    (21, "Explorer"),
    (0,  "Beginner"),
]

XP_FIRST_COMPLETE   = 10
XP_REREAD           = 2
XP_SUBJECT_MASTERED = 50
XP_STREAK_CAP       = 20   # max streak bonus per lesson


def calc_level(total_xp: int) -> tuple[int, str]:
    """Return (level_number, level_name) for given XP."""
    lvl, name = 1, "Mwanzo"
    for num, n, xp in LEVELS:
        if total_xp >= xp:
            lvl, name = num, n
    return lvl, name


def next_level_xp(total_xp: int) -> int | None:
    """XP threshold for the next level, or None if already max."""
    for _, _, xp in LEVELS:
        if total_xp < xp:
            return xp
    return None


def subject_tier(pct: float) -> str:
    """Return mastery tier label for a given completion percentage."""
    for threshold, label in SUBJECT_TIERS:
        if pct >= threshold:
            return label
    return "Beginner"


# ── Models ────────────────────────────────────────────────────────────────────

class UserProgress(Base):
    """One row per user × lesson.  UNIQUE enforced at DB level to prevent double-counting."""
    __tablename__ = "user_progress"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False
    )
    # Denormalised for fast subject-level aggregation without a JOIN through lessons
    subject_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(20), default="in_progress")  # in_progress | completed
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(back_populates="progress")         # type: ignore[name-defined]
    lesson: Mapped["Lesson"] = relationship(back_populates="progress")     # type: ignore[name-defined]

    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_progress_user_lesson"),
        # Fast calendar queries: all completions for a user in a date range
        Index("ix_user_progress_user_completed_at", "user_id", "completed_at"),
        # Fast subject-level aggregation
        Index("ix_user_progress_user_subject", "user_id", "subject_id"),
    )


class UserStats(Base):
    """Pre-aggregated stats per user — one row, updated atomically on every lesson completion.
    This is the hot read path: dashboard cards, leaderboard, level display.
    At 1M users, the (total_xp DESC, grade_category) index makes the leaderboard a pure index scan.
    """
    __tablename__ = "user_stats"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    level_name: Mapped[str] = mapped_column(String(30), default="Mwanzo", nullable=False)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    subjects_mastered: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # Stored as EAT (Africa/Nairobi UTC+3) calendar date — used for streak logic
    last_activity_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # Denormalised from user.grade_category — enables leaderboard filter without JOIN
    grade_category: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="stats")  # type: ignore[name-defined]

    __table_args__ = (
        # Leaderboard: ORDER BY total_xp DESC within grade_category
        Index("ix_user_stats_grade_xp", "grade_category", "total_xp"),
        # Global leaderboard (all grades)
        Index("ix_user_stats_total_xp", "total_xp"),
    )


class Badge(Base):
    """Badge definition — created once, referenced by UserBadge.
    icon_url is nullable until the designer delivers assets.
    """
    __tablename__ = "badges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    # What triggers this badge:
    # "lessons_completed" | "streak_days" | "subjects_mastered" | "level_reached"
    criteria_type: Mapped[str] = mapped_column(String(50), nullable=False)
    criteria_value: Mapped[int] = mapped_column(Integer, nullable=False)
    xp_bonus: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    earners: Mapped[list["UserBadge"]] = relationship(back_populates="badge", cascade="all, delete-orphan")


class UserBadge(Base):
    """Junction: which badges a user has earned and when."""
    __tablename__ = "user_badges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    badge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("badges.id", ondelete="CASCADE"), nullable=False
    )
    earned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    badge: Mapped["Badge"] = relationship(back_populates="earners")

    __table_args__ = (
        UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),
        Index("ix_user_badges_user_id", "user_id"),
    )
