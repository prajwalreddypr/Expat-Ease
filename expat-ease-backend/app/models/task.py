from sqlmodel import SQLModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    country: str = Field(max_length=100)
    user_id: int = Field(foreign_key="users.id")
    order_index: int = Field(default=0)
    is_required: bool = Field(default=True)
    estimated_days: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskCreate(SQLModel):
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    country: str = Field(max_length=100)
    order_index: int = Field(default=0)
    is_required: bool = Field(default=True)
    estimated_days: Optional[int] = Field(default=None)


class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[TaskStatus] = Field(default=None)
    priority: Optional[TaskPriority] = Field(default=None)
    order_index: Optional[int] = Field(default=None)
    is_required: Optional[bool] = Field(default=None)
    estimated_days: Optional[int] = Field(default=None)


class TaskResponse(SQLModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    country: str
    user_id: int
    order_index: int
    is_required: bool
    estimated_days: Optional[int]
    created_at: datetime
    updated_at: datetime
    unlocked: bool = Field(default=True)
    documents: List[Any] = Field(default_factory=list)
