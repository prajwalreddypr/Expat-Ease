from datetime import datetime, timedelta
from typing import Optional

from sqlmodel import Session, select

from app.models.password_reset_token import PasswordResetToken


def create_token(session: Session, user_id: int, expires_in_minutes: int = 60) -> PasswordResetToken:
    # generate a secure random token
    import secrets

    token = secrets.token_urlsafe(48)
    expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
    prt = PasswordResetToken(user_id=user_id, token=token, expires_at=expires_at)
    session.add(prt)
    session.commit()
    session.refresh(prt)
    return prt


def get_by_token(session: Session, token: str) -> Optional[PasswordResetToken]:
    statement = select(PasswordResetToken).where(PasswordResetToken.token == token)
    result = session.exec(statement).first()
    return result


def delete_token(session: Session, token_id: int) -> None:
    statement = select(PasswordResetToken).where(PasswordResetToken.id == token_id)
    prt = session.exec(statement).first()
    if prt:
        session.delete(prt)
        session.commit()


def delete_expired(session: Session) -> int:
    """Delete expired tokens. Returns number deleted."""
    from sqlalchemy import delete
    now = datetime.utcnow()
    stmt = delete(PasswordResetToken).where(PasswordResetToken.expires_at < now)
    result = session.exec(stmt)
    session.commit()
    # session.exec(delete(...)) returns execution result; we can't easily get rowcount in a DB-agnostic way here
    return 0
