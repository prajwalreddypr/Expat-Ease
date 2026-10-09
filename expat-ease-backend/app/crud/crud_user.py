"""Compatibility wrappers for legacy scripts; new code uses app.services.users."""

from typing import Optional

from sqlmodel import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services import users


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    return users.get_user_by_email(session, email)


def get_user(session: Session, user_id: int) -> Optional[User]:
    return users.get_user(session, user_id)


def create_user(session: Session, user_in: UserCreate) -> User:
    values = user_in.model_dump(exclude={"password"})
    try:
        return users.create_user(session, values, user_in.password)
    except (users.EmailAlreadyRegisteredError, users.UserValidationError) as exc:
        raise ValueError(str(exc)) from exc


def update_user(session: Session, user_id: int, user_in: UserUpdate) -> Optional[User]:
    try:
        return users.update_user(session, user_id, user_in.model_dump(exclude_unset=True))
    except users.UserNotFoundError:
        return None
