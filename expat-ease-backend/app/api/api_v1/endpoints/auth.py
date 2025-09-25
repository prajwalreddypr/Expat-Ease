"""
Authentication endpoints.
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.deps import get_current_user
from app.core.security import create_access_token, verify_password
from app.crud.crud_user import get_user_by_email
from app.db.session import get_session
from app.models.auth import LoginRequest, Token
from app.models.user import User, UserRead

router = APIRouter()

# Token expiration time (24 hours)
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


@router.post("/login", response_model=Token)
def login(
    login_data: LoginRequest,
    session: Session = Depends(get_session)
) -> Token:
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
    # Get user by email
    user = get_user_by_email(session=session, email=login_data.email)
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User does not exist. Please register first.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password is correct
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserRead)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current authenticated user information.
    
    This endpoint requires a valid JWT token in the Authorization header.
    
    Args:
        current_user: Current authenticated user (from JWT token)
        
    Returns:
        UserRead: Current user information
    """
    return current_user
