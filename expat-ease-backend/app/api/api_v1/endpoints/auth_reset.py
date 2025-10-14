from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session

from app.core import password_security
from app.core.deps import get_current_active_user
from app.core.security import verify_password, hash_password
from app.models.user import User
from app.db.session import get_session
from app.crud import crud_user
from app.crud.crud_password_reset import create_token, get_by_token, delete_token
from app.core.config import settings

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(request: ForgotPasswordRequest, session: Session = Depends(get_session)) -> Any:
    """Create a password reset token for the given email and log it.

    Returns 200 regardless of whether the email exists to avoid user enumeration.
    """
    user = crud_user.get_user_by_email(session, request.email)
    if user:
        prt = create_token(session, user.id)
        # In this app's workflow we perform reset in-place (no email link)
        # So we only create the token and (in dev) return it. In production you can wire email sending separately.
    # Always return 200 to avoid revealing whether email exists.
    # In dev mode, optionally return the token in the response to allow in-page reset convenience
    if settings.DEV_RETURN_RESET_TOKEN and user:
        return {"msg": "Reset token generated (dev) — enter a new password below to reset it in this modal", "token": prt.token}
    return {"msg": "If an account with this email exists, a reset token has been issued."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(request: ResetPasswordRequest, session: Session = Depends(get_session)) -> Any:
    prt = get_by_token(session, request.token)
    if not prt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    if prt.expires_at < datetime.utcnow():
        # Token expired: delete and return error
        delete_token(session, prt.id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user = crud_user.get_user(session, prt.user_id)
    if not user:
        # unlikely; clean up token and error
        delete_token(session, prt.id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    # validate password strength if project has validators; simple length check here
    if len(request.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password too short")

    # Use project's password hashing utility
    hashed = password_security.hash_password(request.new_password)
    user.hashed_password = hashed
    session.add(user)
    session.commit()

    # delete token after use
    delete_token(session, prt.id)

    return {"msg": "Password reset successful"}


class VerifyPasswordRequest(BaseModel):
    current_password: str


class ChangePasswordRequest(BaseModel):
    new_password: str


@router.post('/verify-password', status_code=status.HTTP_200_OK)
def verify_current_password(
    request: VerifyPasswordRequest,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Verify that provided current_password matches the logged-in user's password."""
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Incorrect current password')
    return {"msg": "Password verified"}


@router.post('/change-password', status_code=status.HTTP_200_OK)
def change_password(
    request: ChangePasswordRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Change the logged-in user's password to a new password."""
    if len(request.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Password too short')

    current_user.hashed_password = hash_password(request.new_password)
    session.add(current_user)
    session.commit()
    return {"msg": "Password changed successfully"}


class ChangeByEmailRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str


@router.post('/change-password-by-email', status_code=status.HTTP_200_OK)
def change_password_by_email(request: ChangeByEmailRequest, session: Session = Depends(get_session)) -> Any:
    """Allow changing password by providing email + current password + new password.

    This endpoint is intended for users who know their current password but are not authenticated in the session.
    It verifies the current_password for the email, updates to new_password, and returns a generic error on failure.
    """
    user = crud_user.get_user_by_email(session, request.email)
    if not user:
        # don't reveal whether email exists
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password")

    if not password_security.verify_password(request.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password")

    if len(request.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password too short")

    user.hashed_password = password_security.hash_password(request.new_password)
    session.add(user)
    session.commit()

    return {"msg": "Password changed successfully"}
