from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


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
    created_at: datetime
    country: Optional[str]
    settlement_country: Optional[str]
    country_selected: bool
    profile_photo: Optional[str]
    street_address: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    phone_number: Optional[str]


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    password: Optional[str] = Field(default=None, min_length=8, max_length=72)
    is_active: Optional[bool] = None
    country: Optional[str] = Field(default=None, max_length=100)
    settlement_country: Optional[str] = Field(default=None, max_length=100)
    country_selected: Optional[bool] = None
    profile_photo: Optional[str] = Field(default=None, max_length=500)
    street_address: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)
    phone_number: Optional[str] = Field(default=None, max_length=20)
