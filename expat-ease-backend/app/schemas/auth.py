from typing import Optional

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyPasswordRequest(BaseModel):
    current_password: str


class ChangePasswordRequest(BaseModel):
    new_password: str


class ChangeByEmailRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str


class PasswordResetRequestResponse(BaseModel):
    msg: str
    token: Optional[str] = None
