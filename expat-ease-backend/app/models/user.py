"""
User model and schemas for the application.
"""

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.forum import Answer, Question
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
    country: Optional[str] = Field(
        default=None, max_length=100
    )  # Country of Origin (from registration)
    settlement_country: Optional[str] = Field(
        default=None, max_length=100
    )  # Settlement Country (France/Germany)
    country_selected: bool = Field(default=False)

    # Profile fields
    profile_photo: Optional[str] = Field(
        default=None, max_length=500
    )  # Cloudinary URL for profile photo
    street_address: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)
    phone_number: Optional[str] = Field(default=None, max_length=20)

    # Relationships
    settlement_steps: list["SettlementStep"] = Relationship(back_populates="user")
    questions: List["Question"] = Relationship(back_populates="user")
    answers: List["Answer"] = Relationship(back_populates="user")
