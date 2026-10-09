"""
User endpoints.
"""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlmodel import Session

from app.core.deps import get_current_active_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import users as user_service

router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_active_user)) -> User:
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
def create_new_user(user_in: UserCreate, session: Session = Depends(get_session)) -> User:
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
        values = user_in.model_dump(exclude={"password"})
        return user_service.create_user(session, values, user_in.password)
    except user_service.EmailAlreadyRegisteredError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except user_service.UserValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/me", response_model=UserRead)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> User:
    """
    Update current user's information.

    Args:
        user_update: User update data (email cannot be updated)
        current_user: Current authenticated user
        session: Database session

    Returns:
        UserRead: Updated user information

    Raises:
        HTTPException: 404 if user not found
    """
    try:
        return user_service.update_user(
            session, current_user.id, user_update.model_dump(exclude_unset=True)
        )
    except user_service.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc


@router.post("/me/profile-photo", response_model=UserRead)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> User:
    """
    Upload a profile photo for the current user.

    Args:
        file: Image file to upload
        current_user: Current authenticated user
        session: Database session

    Returns:
        UserRead: Updated user information with profile photo URL

    Raises:
        HTTPException: 400 if file type is not supported or upload fails
    """
    try:
        return await user_service.update_profile_photo(session, current_user.id, file)
    except user_service.ProfilePhotoValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except user_service.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc
    except user_service.ProfilePhotoStorageError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload profile photo",
        ) from exc


@router.get("/{user_id}", response_model=UserRead)
def get_user_by_id(user_id: int, session: Session = Depends(get_session)) -> User:
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
    try:
        return user_service.require_user(session, user_id)
    except user_service.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc
