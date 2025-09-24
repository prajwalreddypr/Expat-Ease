from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime

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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="settlement_steps")
    documents: list["Document"] = Relationship(back_populates="settlement_step")


class SettlementStepCreate(SQLModel):
    step_number: int
    title: str
    description: str
    is_completed: bool = False
    is_unlocked: bool = False


class SettlementStepUpdate(SQLModel):
    is_completed: Optional[bool] = None
    is_unlocked: Optional[bool] = None


class SettlementStepResponse(SQLModel):
    id: int
    user_id: int
    step_number: int
    title: str
    description: str
    is_completed: bool
    is_unlocked: bool
    created_at: datetime
    updated_at: datetime
    has_document: bool
    document_url: Optional[str] = None
