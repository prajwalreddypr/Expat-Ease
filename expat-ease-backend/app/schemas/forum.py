from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.forum import QuestionCategory


class PublicUserSummary(BaseModel):
    id: int
    full_name: str
    profile_photo: Optional[str]
    country: Optional[str]


class QuestionCreate(BaseModel):
    title: str = Field(max_length=200)
    content: str = Field(max_length=2000)
    category: QuestionCategory = QuestionCategory.GENERAL


class AnswerCreate(BaseModel):
    content: str = Field(max_length=2000)


class QuestionSummary(BaseModel):
    id: int
    title: str
    content: str
    category: QuestionCategory
    created_at: datetime
    updated_at: Optional[datetime]
    is_resolved: bool
    view_count: int
    answer_count: int
    upvotes: int
    downvotes: int
    user: PublicUserSummary


class QuestionCreated(BaseModel):
    id: int
    title: str
    content: str
    category: QuestionCategory
    created_at: datetime
    is_resolved: bool
    view_count: int
    answer_count: int
    upvotes: int
    downvotes: int
    user: PublicUserSummary


class AnswerResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    updated_at: Optional[datetime]
    is_accepted: bool
    upvotes: int
    downvotes: int
    user: PublicUserSummary


class AnswerCreated(BaseModel):
    id: int
    content: str
    created_at: datetime
    is_accepted: bool
    upvotes: int
    downvotes: int
    user: PublicUserSummary


class QuestionDetail(QuestionSummary):
    answers: List[AnswerResponse]
