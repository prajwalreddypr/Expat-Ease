from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.auth import (
    ChangeByEmailRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    PasswordResetRequestResponse,
    ResetPasswordRequest,
    VerifyPasswordRequest,
)
from app.schemas.common import StatusMessageResponse
from app.services import authentication

router = APIRouter()


@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
    response_model=PasswordResetRequestResponse,
    response_model_exclude_none=True,
)
def forgot_password(request: ForgotPasswordRequest, session: Session = Depends(get_session)) -> Any:
    """Issue a reset token without revealing whether the email exists."""
    reset_token = authentication.request_password_reset(session, request.email)
    if settings.DEV_RETURN_RESET_TOKEN and reset_token:
        return {
            "msg": "Reset token generated (dev) â€” enter a new password below to reset it in this modal",
            "token": reset_token.token,
        }
    return {"msg": "If an account with this email exists, a reset token has been issued."}


@router.post(
    "/reset-password", status_code=status.HTTP_200_OK, response_model=StatusMessageResponse
)
def reset_password(request: ResetPasswordRequest, session: Session = Depends(get_session)) -> Any:
    try:
        authentication.reset_password(session, request.token, request.new_password)
    except authentication.InvalidResetTokenError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
        ) from None
    except authentication.InvalidPasswordError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    return {"msg": "Password reset successful"}


@router.post(
    "/verify-password", status_code=status.HTTP_200_OK, response_model=StatusMessageResponse
)
def verify_current_password(
    request: VerifyPasswordRequest,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    try:
        authentication.verify_current_password(current_user, request.current_password)
    except authentication.IncorrectPasswordError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password"
        ) from None
    return {"msg": "Password verified"}


@router.post(
    "/change-password", status_code=status.HTTP_200_OK, response_model=StatusMessageResponse
)
def change_password(
    request: ChangePasswordRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    try:
        authentication.change_password(session, current_user, request.new_password)
    except authentication.InvalidPasswordError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    return {"msg": "Password changed successfully"}


@router.post(
    "/change-password-by-email",
    status_code=status.HTTP_200_OK,
    response_model=StatusMessageResponse,
)
def change_password_by_email(
    request: ChangeByEmailRequest, session: Session = Depends(get_session)
) -> Any:
    try:
        authentication.change_password_by_email(
            session, request.email, request.current_password, request.new_password
        )
    except authentication.InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password"
        ) from None
    except authentication.InvalidPasswordError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    return {"msg": "Password changed successfully"}
