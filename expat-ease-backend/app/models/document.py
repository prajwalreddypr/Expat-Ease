from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.models.settlement_step import SettlementStep


class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str = Field(max_length=255)
    original_filename: str = Field(max_length=255)
    file_path: str = Field(max_length=500)
    file_size: int
    content_type: str = Field(max_length=100)
    settlement_step_id: Optional[int] = Field(default=None, foreign_key="settlementstep.id")
    user_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    settlement_step: Optional["SettlementStep"] = Relationship()


class DocumentCreate(SQLModel):
    filename: str = Field(max_length=255)
    original_filename: str = Field(max_length=255)
    file_path: str = Field(max_length=500)
    file_size: int
    content_type: str = Field(max_length=100)
    settlement_step_id: Optional[int] = None


class DocumentResponse(SQLModel):
    id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    content_type: str
    settlement_step_id: Optional[int]
    user_id: int
    created_at: datetime
    download_url: str
