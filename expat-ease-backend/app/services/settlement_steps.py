import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Optional

from sqlmodel import Session, select

from app.core.storage import CloudinaryStorage, StorageError, cloudinary_storage
from app.models.document import Document
from app.models.settlement_step import SettlementStep

logger = logging.getLogger(__name__)


class SettlementStepNotFoundError(Exception):
    pass


class SettlementResetError(Exception):
    pass


@dataclass(frozen=True)
class StepBundle:
    step: SettlementStep
    documents: List[Document]


def initialize_steps(session: Session, user_id: int, templates: List[dict]) -> List[StepBundle]:
    existing = _user_steps(session, user_id)
    if existing:
        return _bundle_steps(session, existing)
    return _bundle_steps(session, _create_steps(session, user_id, templates))


def list_or_initialize_steps(
    session: Session, user_id: int, templates: List[dict]
) -> List[StepBundle]:
    steps = _user_steps(session, user_id)
    if not steps:
        steps = _create_steps(session, user_id, templates)
    return _bundle_steps(session, steps)


def update_step(
    session: Session,
    user_id: int,
    step_id: int,
    *,
    is_completed: Optional[bool],
    is_skipped: Optional[bool],
    skip_reason: Optional[str],
    notes: Optional[str],
) -> StepBundle:
    step = session.exec(
        select(SettlementStep).where(
            SettlementStep.id == step_id, SettlementStep.user_id == user_id
        )
    ).first()
    if not step:
        raise SettlementStepNotFoundError

    status_changed = False
    advances_workflow = False
    if is_skipped is not None:
        step.is_skipped = is_skipped
        step.skip_reason = skip_reason if is_skipped else None
        if is_skipped:
            step.is_completed = False
            advances_workflow = True
        status_changed = True
    elif is_completed is not None:
        step.is_completed = is_completed
        if is_completed:
            step.is_skipped = False
            step.skip_reason = None
            advances_workflow = True
        status_changed = True

    if advances_workflow:
        next_step = session.exec(
            select(SettlementStep).where(
                SettlementStep.user_id == user_id,
                SettlementStep.step_number == step.step_number + 1,
            )
        ).first()
        if next_step:
            next_step.is_unlocked = True
            next_step.updated_at = datetime.now(timezone.utc)
            session.add(next_step)

    if notes is not None:
        step.notes = notes
    if status_changed:
        step.updated_at = datetime.now(timezone.utc)

    session.add(step)
    session.commit()
    session.refresh(step)
    documents = list(
        session.exec(select(Document).where(Document.settlement_step_id == step.id)).all()
    )
    return StepBundle(step=step, documents=documents)


def reset_steps(
    session: Session,
    user_id: int,
    templates: List[dict],
    storage: Optional[CloudinaryStorage] = None,
) -> List[StepBundle]:
    storage = storage or cloudinary_storage
    existing = _user_steps(session, user_id)
    step_ids = [step.id for step in existing]
    documents = (
        list(session.exec(select(Document).where(Document.settlement_step_id.in_(step_ids))).all())
        if step_ids
        else []
    )
    try:
        for document in documents:
            session.delete(document)
        for step in existing:
            session.delete(step)
        new_steps = _build_steps(user_id, templates)
        session.add_all(new_steps)
        session.commit()
        for step in new_steps:
            session.refresh(step)
    except Exception as exc:
        session.rollback()
        raise SettlementResetError("Failed to reset settlement steps") from exc

    for document in documents:
        try:
            storage.delete(document.file_path, document.content_type)
        except StorageError as exc:
            logger.warning("Failed to delete settlement document %s: %s", document.id, exc)
    return _bundle_steps(session, new_steps)


def _user_steps(session: Session, user_id: int) -> List[SettlementStep]:
    return list(
        session.exec(
            select(SettlementStep)
            .where(SettlementStep.user_id == user_id)
            .order_by(SettlementStep.step_number)
        ).all()
    )


def _create_steps(session: Session, user_id: int, templates: List[dict]) -> List[SettlementStep]:
    steps = _build_steps(user_id, templates)
    session.add_all(steps)
    session.commit()
    for step in steps:
        session.refresh(step)
    return steps


def _build_steps(user_id: int, templates: List[dict]) -> List[SettlementStep]:
    return [
        SettlementStep(
            user_id=user_id,
            step_number=template["step_number"],
            title=template["title"],
            description=template["description"],
            is_completed=False,
            is_unlocked=template["is_unlocked"],
        )
        for template in templates
    ]


def _bundle_steps(session: Session, steps: List[SettlementStep]) -> List[StepBundle]:
    if not steps:
        return []
    step_ids = [step.id for step in steps]
    documents = session.exec(
        select(Document).where(Document.settlement_step_id.in_(step_ids))
    ).all()
    by_step: Dict[int, List[Document]] = {}
    for document in documents:
        by_step.setdefault(document.settlement_step_id, []).append(document)
    return [StepBundle(step=step, documents=by_step.get(step.id, [])) for step in steps]
