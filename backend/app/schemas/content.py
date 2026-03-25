import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List


class SubjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    grade_category: str
    description: Optional[str]
    icon: Optional[str]
    color: Optional[str]
    order: int
    lesson_count: int = 0

    model_config = {"from_attributes": True}


class LessonResourceResponse(BaseModel):
    id: uuid.UUID
    resource_type: str
    title: str
    url: str

    model_config = {"from_attributes": True}


class LessonResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    title: str
    slug: str
    description: Optional[str]
    order: int
    duration_minutes: int
    is_free_preview: bool
    resources: List[LessonResourceResponse] = []

    model_config = {"from_attributes": True}


class LessonDetailResponse(LessonResponse):
    content: Optional[str]
