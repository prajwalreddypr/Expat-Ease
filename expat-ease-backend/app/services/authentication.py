from datetime import datetime
from typing import Optional

from sqlmodel import Session

from app.core.passwords import hash_password, password_validation_error, verify_password
from app.core.tokens import create_access_token
from app.crud.crud_password_reset import create_token, get_by_token
from app.crud.crud_user import get_user, get_user_by_email
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User


class AuthenticationError(Exception):
    """Base error for authentication workflows."""


class UserNotFoundError(AuthenticationError):
    pass


class IncorrectPasswordError(AuthenticationError):
    pass


class InactiveUserError(AuthenticationError):
    pass


class InvalidCredentialsError(AuthenticationError):
    pass


class InvalidResetTokenError(AuthenticationError):
    pass


class InvalidPasswordError(AuthenticationError):
    pass


def login(session: Session, email: str, password: str) -> str:
    user = get_user_by_email(session, email)
    if not user:
        raise UserNotFoundError
    if not verify_password(password, user.hashed_password):
        raise IncorrectPasswordError
    if not user.is_active:
        raise InactiveUserError
    return create_access_token(data={"sub": str(user.id), "email": user.email})


def request_password_reset(session: Session, email: str) -> Optional[PasswordResetToken]:
    user = get_user_by_email(session, email)
    if not user:
        return None
    return create_token(session, user.id)


def reset_password(session: Session, token: str, new_password: str) -> None:
    reset_token = get_by_token(session, token)
    if not reset_token:
        raise InvalidResetTokenError
    if reset_token.expires_at < datetime.utcnow():
        session.delete(reset_token)
        session.commit()
        raise InvalidResetTokenError

    user = get_user(session, reset_token.user_id)
    if not user:
        session.delete(reset_token)
        session.commit()
        raise InvalidResetTokenError

    _set_password(user, new_password)
    session.add(user)
    session.delete(reset_token)
    session.commit()


def verify_current_password(user: User, current_password: str) -> None:
    if not verify_password(current_password, user.hashed_password):
        raise IncorrectPasswordError


def change_password(session: Session, user: User, new_password: str) -> None:
    _set_password(user, new_password)
    session.add(user)
    session.commit()


def change_password_by_email(
    session: Session, email: str, current_password: str, new_password: str
) -> None:
    user = get_user_by_email(session, email)
    if not user or not verify_password(current_password, user.hashed_password):
        raise InvalidCredentialsError
    change_password(session, user, new_password)


def _set_password(user: User, new_password: str) -> None:
    validation_error = password_validation_error(new_password)
    if validation_error:
        raise InvalidPasswordError(validation_error)
    user.hashed_password = hash_password(new_password)
