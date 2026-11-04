import secrets
from collections import defaultdict, deque
from datetime import timedelta
from threading import Lock
from uuid import uuid4

from sqlmodel import Session, select

from app.core.passwords import hash_password
from app.core.time import as_utc, utc_now
from app.core.tokens import create_access_token
from app.models.document import Document
from app.models.password_reset_token import PasswordResetToken
from app.models.settlement_step import SettlementStep
from app.models.task import Task
from app.models.user import User
from app.services import settlement_steps as settlement_service


class DemoRateLimitError(Exception):
    pass


_attempts: dict[str, deque] = defaultdict(deque)
_attempts_lock = Lock()


def enforce_rate_limit(client_key: str, max_sessions_per_hour: int) -> None:
    now = utc_now()
    cutoff = now - timedelta(hours=1)
    with _attempts_lock:
        attempts = _attempts[client_key]
        while attempts and attempts[0] <= cutoff:
            attempts.popleft()
        if len(attempts) >= max_sessions_per_hour:
            raise DemoRateLimitError
        attempts.append(now)


def create_demo_session(
    session: Session,
    templates: list[dict],
    *,
    session_minutes: int,
) -> str:
    _delete_expired_demo_users(session)

    expires_at = utc_now() + timedelta(minutes=session_minutes)
    user = User(
        email=f"guest-{uuid4().hex}@demo.expat-ease.invalid",
        full_name="Demo Guest",
        hashed_password=hash_password(secrets.token_urlsafe(32)),
        is_active=True,
        is_demo=True,
        demo_expires_at=expires_at,
        country="India",
        settlement_country="France",
        country_selected=True,
        city="Paris",
        postal_code="75001",
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    bundles = settlement_service.initialize_steps(session, user.id, templates)
    for index, bundle in enumerate(bundles):
        step = bundle.step
        step.is_unlocked = index <= 2
        step.is_completed = index < 2
        if index == 2:
            step.notes = "Compare neighborhoods, required documents, and monthly costs."
        session.add(step)
    session.commit()

    return create_access_token(
        data={"sub": str(user.id), "email": user.email, "is_demo": True},
        expires_delta=timedelta(minutes=session_minutes),
    )


def _delete_expired_demo_users(session: Session) -> None:
    expired_users = session.exec(select(User).where(User.is_demo.is_(True))).all()
    expired_users = [
        user
        for user in expired_users
        if user.demo_expires_at is None or as_utc(user.demo_expires_at) <= utc_now()
    ]

    for user in expired_users:
        for model in (Document, PasswordResetToken, SettlementStep, Task):
            records = session.exec(select(model).where(model.user_id == user.id)).all()
            for record in records:
                session.delete(record)
        session.delete(user)

    if expired_users:
        session.commit()
