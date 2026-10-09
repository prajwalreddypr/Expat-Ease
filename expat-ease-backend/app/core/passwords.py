from typing import Optional

from passlib.context import CryptContext

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 72

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def password_validation_error(password: str) -> Optional[str]:
    if len(password) < MIN_PASSWORD_LENGTH:
        return "Password too short"
    if len(password) > MAX_PASSWORD_LENGTH:
        return "Password too long"
    if len(password.encode("utf-8")) > MAX_PASSWORD_LENGTH:
        return "Password too long"
    return None


def hash_password(plain_password: str) -> str:
    validation_error = password_validation_error(plain_password)
    if validation_error:
        raise ValueError(validation_error)
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if len(plain_password.encode("utf-8")) > MAX_PASSWORD_LENGTH:
        return False
    return pwd_context.verify(plain_password, hashed_password)
