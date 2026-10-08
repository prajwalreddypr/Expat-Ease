from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.document import Document


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


class SettlementStepCreate(SQLModel):
    step_number: int
    title: str
    description: str
    is_completed: bool = False
    is_unlocked: bool = False


class SettlementStepUpdate(SQLModel):
    is_completed: Optional[bool] = None
    is_skipped: Optional[bool] = None
    skip_reason: Optional[str] = None
    notes: Optional[str] = None


class StepDocumentInfo(SQLModel):
    id: int
    original_filename: str
    file_path: str


class SettlementStepResponse(SQLModel):
    id: int
    user_id: int
    step_number: int
    title: str
    description: str
    is_completed: bool
    is_unlocked: bool
    is_skipped: bool
    skip_reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    documents: List[StepDocumentInfo] = Field(default_factory=list)
