"""
User model and schemas for the application.
"""
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.settlement_step import SettlementStep


class User(SQLModel, table=True):
    """
    User table model.
    
    Represents a user in the database with authentication and profile information.
    """
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    hashed_password: str = Field(max_length=255)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    country: Optional[str] = Field(default=None, max_length=100)  # Country of Origin (from registration)
    settlement_country: Optional[str] = Field(default=None, max_length=100)  # Settlement Country (France/Germany)
    country_selected: bool = Field(default=False)
    
    # Profile fields
    profile_photo: Optional[str] = Field(default=None, max_length=500)  # Cloudinary URL for profile photo
    street_address: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)
    phone_number: Optional[str] = Field(default=None, max_length=20)
    
    # Relationships
    settlement_steps: list["SettlementStep"] = Relationship(back_populates="user")


class UserCreate(SQLModel):
    """
    Schema for creating a new user.
    
    Used when registering a new user account.
    """
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=100)
    full_name: Optional[str] = Field(default=None, max_length=255)
    country: Optional[str] = Field(default=None, max_length=100)


class UserRead(SQLModel):
    """
    Schema for reading user data.
    
    Used when returning user information (excludes sensitive data like password).
    """
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    country: Optional[str]  # Country of Origin
    settlement_country: Optional[str]  # Settlement Country
    country_selected: bool
    
    # Profile fields
    profile_photo: Optional[str]  # Cloudinary URL for profile photo
    street_address: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    phone_number: Optional[str]


class UserUpdate(SQLModel):
    """
    Schema for updating user data.
    
    All fields are optional for partial updates.
    Email cannot be updated after registration.
    """
    # Note: email is intentionally excluded - cannot be updated after registration
    full_name: Optional[str] = Field(default=None, max_length=255)
    password: Optional[str] = Field(default=None, min_length=8, max_length=100)
    is_active: Optional[bool] = None
    country: Optional[str] = Field(default=None, max_length=100)  # Country of Origin
    settlement_country: Optional[str] = Field(default=None, max_length=100)  # Settlement Country
    country_selected: Optional[bool] = None
    
    # Profile fields
    profile_photo: Optional[str] = Field(default=None, max_length=500)  # Cloudinary URL for profile photo
    street_address: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)
    phone_number: Optional[str] = Field(default=None, max_length=20)
