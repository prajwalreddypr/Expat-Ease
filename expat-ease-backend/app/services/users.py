from typing import Optional

from sqlmodel import Session

from app.core.storage import (
    CloudinaryStorage,
    StorageError,
    UploadFileLike,
    cloudinary_storage,
)
from app.crud.crud_user import get_user
from app.models.user import User

PROFILE_PHOTO_MAX_SIZE = 5 * 1024 * 1024


class UserNotFoundError(Exception):
    pass


class ProfilePhotoValidationError(Exception):
    pass


class ProfilePhotoStorageError(Exception):
    pass


async def update_profile_photo(
    session: Session,
    user_id: int,
    upload_file: UploadFileLike,
    storage: Optional[CloudinaryStorage] = None,
) -> User:
    storage = storage or cloudinary_storage
    if not upload_file.content_type or not upload_file.content_type.startswith("image/"):
        raise ProfilePhotoValidationError("Only image files are allowed for profile photos")
    if upload_file.size and upload_file.size > PROFILE_PHOTO_MAX_SIZE:
        raise ProfilePhotoValidationError("File too large. Maximum size: 5MB")

    user = get_user(session, user_id)
    if not user:
        raise UserNotFoundError
    try:
        stored = await storage.upload(user_id, upload_file, PROFILE_PHOTO_MAX_SIZE)
    except StorageError as exc:
        raise ProfilePhotoStorageError(str(exc)) from exc

    previous_photo = user.profile_photo
    user.profile_photo = stored.url
    try:
        session.add(user)
        session.commit()
        session.refresh(user)
    except Exception as exc:
        session.rollback()
        try:
            storage.delete(stored.url, stored.content_type)
        except StorageError:
            pass
        raise ProfilePhotoStorageError("Failed to save profile photo") from exc

    if previous_photo:
        try:
            storage.delete(previous_photo, "image/unknown")
        except StorageError:
            pass
    return user
