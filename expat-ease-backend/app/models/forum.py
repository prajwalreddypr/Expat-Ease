from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


class QuestionCategory(str, Enum):
    HOUSING = "housing"
    BANKING = "banking"
    LEGAL = "legal"
    WORK = "work"
    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    TRANSPORTATION = "transportation"
    SOCIAL = "social"
    GENERAL = "general"


class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    content: str = Field(max_length=2000)
    category: QuestionCategory = Field(default=QuestionCategory.GENERAL)
    user_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    is_resolved: bool = Field(default=False)
    view_count: int = Field(default=0)
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="questions")
    answers: List["Answer"] = Relationship(back_populates="question", cascade_delete=True)
    votes: List["QuestionVote"] = Relationship(back_populates="question", cascade_delete=True)


class Answer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str = Field(max_length=2000)
    question_id: int = Field(foreign_key="question.id")
    user_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    is_accepted: bool = Field(default=False)
    
    # Relationships
    question: Optional["Question"] = Relationship(back_populates="answers")
    user: Optional["User"] = Relationship(back_populates="answers")
    votes: List["AnswerVote"] = Relationship(back_populates="answer", cascade_delete=True)


class QuestionVote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    question_id: int = Field(foreign_key="question.id")
    user_id: int = Field(foreign_key="users.id")
    is_upvote: bool = Field(default=True)  # True for upvote, False for downvote
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    question: Optional["Question"] = Relationship(back_populates="votes")
    user: Optional["User"] = Relationship()


class AnswerVote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    answer_id: int = Field(foreign_key="answer.id")
    user_id: int = Field(foreign_key="users.id")
    is_upvote: bool = Field(default=True)  # True for upvote, False for downvote
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    answer: Optional["Answer"] = Relationship(back_populates="votes")
    user: Optional["User"] = Relationship()
