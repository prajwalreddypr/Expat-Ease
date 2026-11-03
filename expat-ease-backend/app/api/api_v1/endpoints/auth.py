"""
Authentication endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session

from app.api.api_v1.endpoints.settlement_steps import FRANCE_DEFAULT_STEPS
from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserRead
from app.services import authentication, demo_access

router = APIRouter()


@router.post("/demo", response_model=Token, status_code=status.HTTP_201_CREATED)
def create_demo_session(
    request: Request,
    session: Session = Depends(get_session),
) -> Token:
    """Create an isolated, short-lived authenticated product demo session."""
    if not settings.DEMO_ACCESS_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Demo access is currently unavailable.",
        )

    client_key = request.client.host if request.client else "unknown"
    try:
        demo_access.enforce_rate_limit(client_key, settings.DEMO_MAX_SESSIONS_PER_HOUR)
        access_token = demo_access.create_demo_session(
            session,
            FRANCE_DEFAULT_STEPS,
            session_minutes=settings.DEMO_SESSION_MINUTES,
        )
    except demo_access.DemoRateLimitError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many demo sessions. Please try again later.",
        ) from None

    return Token(access_token=access_token, token_type="bearer")


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
