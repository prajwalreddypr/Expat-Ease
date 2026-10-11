from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from app.core.time import utc_now


class PasswordResetToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=utc_now)
