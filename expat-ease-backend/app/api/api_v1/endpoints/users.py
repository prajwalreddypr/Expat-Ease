"""
User endpoints.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.deps import get_current_active_user
from app.crud.crud_user import create_user, get_user, get_user_by_email, update_user
from app.db.session import get_session
from app.models.user import User, UserCreate, UserRead, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
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


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user_in: UserCreate,
    session: Session = Depends(get_session)
) -> User:
    """
    Create a new user.
    
    Args:
        user_in: User creation data
        session: Database session
        
    Returns:
        UserRead: Created user information
        
    Raises:
        HTTPException: 400 if email already exists
    """
    try:
        user = create_user(session=session, user_in=user_in)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.patch("/me", response_model=UserRead)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> User:
    """
    Update current user's information.

    Args:
        user_update: User update data
        current_user: Current authenticated user
        session: Database session

    Returns:
        UserRead: Updated user information

    Raises:
        HTTPException: 404 if user not found
    """
    updated_user = update_user(
        session=session,
        user_id=current_user.id,
        user_in=user_update
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user


@router.get("/{user_id}", response_model=UserRead)
def get_user_by_id(
    user_id: int,
    session: Session = Depends(get_session)
) -> User:
    """
    Get a user by ID.

    Args:
        user_id: User ID to retrieve
        session: Database session

    Returns:
        UserRead: User information

    Raises:
        HTTPException: 404 if user not found
    """
    user = get_user(session=session, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
