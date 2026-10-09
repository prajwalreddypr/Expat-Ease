"""
Authentication endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserRead
from app.services import authentication

router = APIRouter()


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, session: Session = Depends(get_session)) -> Token:
    """
    Authenticate user and return JWT token.

    Args:
        login_data: User login credentials (email and password)
        session: Database session

    Returns:
        Token: JWT access token and token type

    Raises:
        HTTPException: 401 if credentials are invalid
    """
    try:
        access_token = authentication.login(session, login_data.email, login_data.password)
    except authentication.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User does not exist. Please register first.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except authentication.IncorrectPasswordError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except authentication.InactiveUserError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        ) from None

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current authenticated user information.

    This endpoint requires a valid JWT token in the Authorization header.

    Args:
        current_user: Current authenticated user (from JWT token)

    Returns:
        UserRead: Current user information
    """
    return current_user
