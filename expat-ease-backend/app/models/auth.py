"""
Authentication schemas for login and token management.
"""
from typing import Optional

from pydantic import BaseModel, EmailStr
from sqlmodel import SQLModel


class LoginRequest(BaseModel):
    """
    Schema for user login request.
    
    Used when a user wants to authenticate with email and password.
    """
    email: EmailStr
    password: str


class Token(BaseModel):
    """
    Schema for JWT token response.
    
    Returned after successful login.
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Schema for token payload data.
    
    Used internally for JWT token validation.
    """
    user_id: Optional[int] = None
    email: Optional[str] = None
