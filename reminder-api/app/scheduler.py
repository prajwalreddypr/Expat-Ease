"""Background loop that fires due reminders."""

from __future__ import annotations

import asyncio

from sqlmodel import Session, select

from app.database import engine
from app.models import Reminder, Status, utcnow


async def scheduler_loop() -> None:
    while True:
        now = utcnow()
        with Session(engine) as session:
            due = session.exec(
                select(Reminder).where(
                    Reminder.status == Status.pending,
                    Reminder.remind_at <= now,
                )
            ).all()
            for r in due:
                r.status = Status.fired
                session.add(r)
                # In a real app, send an email/push notification here.
                print(f"[FIRED] reminder #{r.id} (user {r.user_id}): {r.message}")
            if due:
                session.commit()
        await asyncio.sleep(1)
