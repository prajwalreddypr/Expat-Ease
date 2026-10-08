from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskPriority, TaskStatus


class TaskCreate(BaseModel):
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: TaskPriority = TaskPriority.MEDIUM
    country: str = Field(max_length=100)
    order_index: int = 0
    is_required: bool = True
    estimated_days: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    order_index: Optional[int] = None
    is_required: Optional[bool] = None
    estimated_days: Optional[int] = None


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class TaskResponse(TaskRead):
    unlocked: bool = True
    documents: List[Any] = Field(default_factory=list)
