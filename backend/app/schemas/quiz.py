import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ── Read models (sent to frontend) ───────────────────────────────────────────

class ChoiceOut(BaseModel):
    id: uuid.UUID
    choice_text: str
    order: int
    # is_correct is NOT included — we reveal it only in the attempt result

    model_config = {"from_attributes": True}


class QuestionOut(BaseModel):
    id: uuid.UUID
    question_text: str
    question_type: str   # mcq | true_false
    points: int
    order: int
    choices: List[ChoiceOut]

    model_config = {"from_attributes": True}


class QuizOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    pass_score: int
    xp_reward: int
    time_limit_seconds: Optional[int] = None
    grade_category: Optional[str] = None
    question_count: int
    questions: List[QuestionOut]
    # Anti-cheat settings exposed to student
    show_correct_answers: bool = True
    max_attempts_per_day: Optional[int] = None

    model_config = {"from_attributes": True}


# ── Quiz list item (includes user's attempt summary) ─────────────────────────

class QuizListItem(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    pass_score: int
    xp_reward: int
    time_limit_seconds: Optional[int] = None
    grade_category: Optional[str] = None
    question_count: int
    # Lesson / subject context
    lesson_id: Optional[uuid.UUID] = None
    lesson_title: Optional[str] = None
    subject_name: Optional[str] = None
    # Lesson completion gate: False means student must finish the lesson first
    lesson_completed: bool = True
    # User's attempt info
    best_score_pct: Optional[float] = None   # None = never attempted
    attempts_count: int = 0
    passed: bool = False
    attempts_today: int = 0
    max_attempts_per_day: Optional[int] = None


# ── Attempt submission ────────────────────────────────────────────────────────

class AnswerIn(BaseModel):
    question_id: uuid.UUID
    selected_choice_id: Optional[uuid.UUID] = None   # None means skipped


class SubmitAttemptRequest(BaseModel):
    answers: List[AnswerIn]
    time_taken_seconds: Optional[int] = None


# ── Attempt result (returned after submission) ────────────────────────────────

class AnswerResult(BaseModel):
    question_id: uuid.UUID
    question_text: str
    selected_choice_id: Optional[uuid.UUID] = None
    correct_choice_id: Optional[uuid.UUID] = None
    is_correct: bool
    explanation: Optional[str] = None


class AttemptResult(BaseModel):
    attempt_id: uuid.UUID
    score_pct: float
    passed: bool
    xp_earned: int
    total_questions: int
    correct_answers: int
    pass_score: int
    # Per-question breakdown — empty list when show_correct_answers=False
    answers: List[AnswerResult]
    previous_best_pct: Optional[float] = None
    # Lets the frontend know whether the breakdown was withheld
    answers_hidden: bool = False


# ── Attempt history item ──────────────────────────────────────────────────────

class AttemptSummary(BaseModel):
    attempt_id: uuid.UUID
    score_pct: float
    passed: bool
    xp_earned: int
    correct_answers: int
    total_questions: int
    completed_at: datetime

    model_config = {"from_attributes": True}
