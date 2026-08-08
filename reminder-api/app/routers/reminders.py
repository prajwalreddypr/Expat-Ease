"""Reminder CRUD routes (per authenticated user)."""

from __future__ import annotations

from datetime import timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.deps import get_current_user
from app.models import Reminder, Status, User, utcnow
from app.schemas import ReminderCreate, ReminderRead

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.post("", response_model=ReminderRead, status_code=201)
def create_reminder(
    data: ReminderCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Reminder:
    remind_at = data.remind_at
    if remind_at.tzinfo is None:
        remind_at = remind_at.replace(tzinfo=timezone.utc)
    if remind_at <= utcnow():
        raise HTTPException(400, "remind_at must be in the future.")

    reminder = Reminder(user_id=current_user.id, message=data.message, remind_at=remind_at)
    session.add(reminder)
    session.commit()
    session.refresh(reminder)
    return reminder


@router.get("", response_model=List[ReminderRead])
def list_reminders(
    status: Optional[Status] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[Reminder]:
    query = select(Reminder).where(Reminder.user_id == current_user.id)
    if status is not None:
        query = query.where(Reminder.status == status)
    return session.exec(query.order_by(Reminder.remind_at)).all()


def _owned_reminder(reminder_id: int, user: User, session: Session) -> Reminder:
    reminder = session.get(Reminder, reminder_id)
    if reminder is None or reminder.user_id != user.id:
        raise HTTPException(404, "Reminder not found.")
    return reminder


@router.get("/{reminder_id}", response_model=ReminderRead)
def get_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Reminder:
    return _owned_reminder(reminder_id, current_user, session)


@router.delete("/{reminder_id}", response_model=ReminderRead)
def cancel_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Reminder:
    reminder = _owned_reminder(reminder_id, current_user, session)
    if reminder.status is Status.pending:
        reminder.status = Status.cancelled
        session.add(reminder)
        session.commit()
        session.refresh(reminder)
    return reminder
