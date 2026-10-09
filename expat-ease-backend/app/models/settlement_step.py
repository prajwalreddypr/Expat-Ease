from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class SettlementStep(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    step_number: int
    title: str = Field(max_length=255)
    description: str
    is_completed: bool = Field(default=False)
    is_unlocked: bool = Field(default=False)
    is_skipped: bool = Field(default=False)
    skip_reason: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    user: Optional["User"] = Relationship(back_populates="settlement_steps")
    # documents relationship left as-is on Document side to avoid additional changes
