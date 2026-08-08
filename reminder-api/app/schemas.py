"""Request/response schemas (Pydantic)."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import Status


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserRead(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ReminderCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    remind_at: datetime = Field(..., description="When the reminder should fire (ISO 8601, UTC).")


class ReminderRead(BaseModel):
    id: int
    message: str
    remind_at: datetime
    status: Status
    created_at: datetime
