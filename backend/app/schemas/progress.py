import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class ProgressUpdateRequest(BaseModel):
    lesson_id: uuid.UUID
    status: str                       # in_progress | completed
    time_spent_seconds: int = 0
    score: Optional[float] = None


class ProgressResponse(BaseModel):
    lesson_id: uuid.UUID
    status: str
    score: Optional[float]
    time_spent_seconds: int
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class SubjectProgressResponse(BaseModel):
    subject_id: uuid.UUID
    subject_name: str
    total_lessons: int
    completed_lessons: int
    percent_complete: float


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_study_date: Optional[datetime]
