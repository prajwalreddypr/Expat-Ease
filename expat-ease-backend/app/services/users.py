from typing import Optional

from sqlmodel import Session, select

from app.core.passwords import hash_password
from app.core.storage import (
    CloudinaryStorage,
    StorageError,
    UploadFileLike,
    cloudinary_storage,
)
from app.models.user import User

PROFILE_PHOTO_MAX_SIZE = 5 * 1024 * 1024


class UserNotFoundError(Exception):
    pass


class EmailAlreadyRegisteredError(Exception):
    pass


class UserValidationError(Exception):
    pass


class ProfilePhotoValidationError(Exception):
    pass


class ProfilePhotoStorageError(Exception):
    pass


def get_user(session: Session, user_id: int) -> Optional[User]:
    return session.get(User, user_id)


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    return session.exec(select(User).where(User.email == email)).first()


def create_user(session: Session, values: dict, password: str) -> User:
    if get_user_by_email(session, values["email"]):
        raise EmailAlreadyRegisteredError("Email already registered")
    try:
        hashed_password = hash_password(password)
    except ValueError as exc:
        raise UserValidationError(str(exc)) from exc
    user = User(**values, hashed_password=hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def update_user(session: Session, user_id: int, values: dict) -> User:
    user = get_user(session, user_id)
    if not user:
        raise UserNotFoundError
    for field, value in values.items():
        setattr(user, field, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def require_user(session: Session, user_id: int) -> User:
    user = get_user(session, user_id)
    if not user:
        raise UserNotFoundError
    return user


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

    user = require_user(session, user_id)
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
