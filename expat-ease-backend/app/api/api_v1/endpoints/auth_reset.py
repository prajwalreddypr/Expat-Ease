from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session

from app.core import password_security
from app.core.deps import get_current_active_user
from app.db.session import get_session
from app.crud import crud_user
from app.crud.crud_password_reset import create_token, get_by_token, delete_token

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
        # Log the token for dev use. In production replace with email sending.
        # Use application logger if available; print as fallback.
        try:
            import logging

            logging.getLogger("app").info(f"Password reset token for user_id={user.id}: {prt.token}")
        except Exception:
            print(f"Password reset token for user_id={user.id}: {prt.token}")
    # Always return 200 to avoid revealing whether email exists.
    return {"msg": "If an account with this email exists, a reset link has been issued."}


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
