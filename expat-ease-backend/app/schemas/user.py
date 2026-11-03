from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer

from app.core.time import as_utc


class UserCreate(BaseModel):
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=72)
    full_name: Optional[str] = Field(default=None, max_length=255)
    country: Optional[str] = Field(default=None, max_length=100)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    is_demo: bool
    demo_expires_at: Optional[datetime]
    created_at: datetime
    country: Optional[str]
    settlement_country: Optional[str]
    country_selected: bool
    profile_photo: Optional[str]
    street_address: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    phone_number: Optional[str]

    @field_serializer("demo_expires_at")
    def serialize_demo_expiry(self, value: Optional[datetime]) -> Optional[str]:
        """Always identify demo expiry timestamps as UTC for browser clients."""
        if value is None:
            return None
        return as_utc(value).isoformat().replace("+00:00", "Z")


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    full_name: Optional[str] = Field(default=None, max_length=255)
    is_active: Optional[bool] = None
    country: Optional[str] = Field(default=None, max_length=100)
    settlement_country: Optional[str] = Field(default=None, max_length=100)
    country_selected: Optional[bool] = None
    profile_photo: Optional[str] = Field(default=None, max_length=500)
    street_address: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)
    phone_number: Optional[str] = Field(default=None, max_length=20)
