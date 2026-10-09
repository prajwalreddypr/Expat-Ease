from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class SettlementStepCreate(BaseModel):
    step_number: int
    title: str
    description: str
    is_completed: bool = False
    is_unlocked: bool = False


class SettlementStepUpdate(BaseModel):
    is_completed: Optional[bool] = None
    is_skipped: Optional[bool] = None
    skip_reason: Optional[str] = None
    notes: Optional[str] = None


class StepDocumentInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    file_path: str


class SettlementStepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
