"""
Settlement steps management endpoints.
"""
import logging
import os
import re
from datetime import datetime, timezone
from typing import List
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.deps import get_current_active_user
from app.db.session import get_session
from app.models.settlement_step import (
    SettlementStep,
    SettlementStepUpdate,
    SettlementStepResponse,
    StepDocumentInfo,
)
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

# Default settlement steps per country (7 steps each)
FRANCE_DEFAULT_STEPS = [
    {
        "step_number": 1,
        "title": "Validate Your Visa",
        "description": "Validate your long-stay visa through the official ANEF portal within 3 months of arrival. This activates your right to stay and triggers your OFII integration contract.",
        "is_unlocked": True,
    },
    {
        "step_number": 2,
        "title": "Get a Local SIM Card",
        "description": "Get a French number as soon as possible — you'll need it for bank accounts, administrative registrations, and everyday life.",
        "is_unlocked": False,
    },
    {
        "step_number": 3,
        "title": "Find Accommodation",
        "description": "Secure a permanent address before tackling other steps. French banks and authorities require proof of address (quittance de loyer or utility bill) for most registrations.",
        "is_unlocked": False,
    },
    {
        "step_number": 4,
        "title": "Register with Local Authorities",
        "description": "Register with the CPAM to get your French Social Security number (numéro de sécu). You'll also need to complete any required prefecture formalities for your residence status.",
        "is_unlocked": False,
    },
    {
        "step_number": 5,
        "title": "Open a Bank Account",
        "description": "Open a French bank account to receive salary, set up direct debits, and pay rent. Most banks require proof of address and your Social Security number.",
        "is_unlocked": False,
    },
    {
        "step_number": 6,
        "title": "Set Up Healthcare",
        "description": "Complete your Assurance Maladie registration on Ameli.fr to activate your health coverage and request your Carte Vitale (health insurance card).",
        "is_unlocked": False,
    },
    {
        "step_number": 7,
        "title": "Apply for CAF Housing Allowance",
        "description": "Apply for APL or ALS housing benefit through the CAF (Caisse d'Allocations Familiales). Many expats miss this — it can reduce your rent by €100–300/month depending on your income and location.",
        "is_unlocked": False,
    },
]

GERMANY_DEFAULT_STEPS = [
    {
        "step_number": 1,
        "title": "Find Permanent Accommodation",
        "description": "Secure a permanent address first — this is the foundation for everything else in Germany. You need a registered address to complete Anmeldung, open a bank account, and enroll in health insurance.",
        "is_unlocked": True,
    },
    {
        "step_number": 2,
        "title": "Register Your Address (Anmeldung)",
        "description": "Register at your local Bürgeramt within 14 days of moving in. You'll receive a Meldebescheinigung (registration certificate) — required for opening a bank account, enrolling in health insurance, and obtaining a work or residence permit.",
        "is_unlocked": False,
    },
    {
        "step_number": 3,
        "title": "Get a Local SIM Card",
        "description": "Get a German number as soon as possible — you'll need it for account registrations, two-factor authentication, and day-to-day life in Germany.",
        "is_unlocked": False,
    },
    {
        "step_number": 4,
        "title": "Open a Bank Account",
        "description": "Open a German bank account to receive your salary, set up direct debits, and pay rent. Most banks require your passport and Meldebescheinigung from your Anmeldung.",
        "is_unlocked": False,
    },
    {
        "step_number": 5,
        "title": "Enroll in Health Insurance (Krankenkasse)",
        "description": "Health insurance is mandatory in Germany. Choose a public Krankenkasse (TK, AOK, Barmer, etc.) and register promptly — it is required for employment contracts and residence permit applications.",
        "is_unlocked": False,
    },
    {
        "step_number": 6,
        "title": "Get Your Tax ID (Steuer-ID)",
        "description": "Your Steueridentifikationsnummer is automatically mailed to your registered address after Anmeldung. Register on ELSTER for online tax filing and obtain your Steuernummer from your local Finanzamt.",
        "is_unlocked": False,
    },
    {
        "step_number": 7,
        "title": "Apply for Residence Permit (Aufenthaltstitel)",
        "description": "Non-EU nationals must apply for a residence or work permit at the local Ausländerbehörde within 90 days of arrival. Bring your passport, Meldebescheinigung, health insurance certificate, and proof of financial means.",
        "is_unlocked": False,
    },
]

STEPS_BY_COUNTRY: dict = {
    "France": FRANCE_DEFAULT_STEPS,
    "Germany": GERMANY_DEFAULT_STEPS,
}
# Keep backward-compatible alias used nowhere externally but kept for clarity
DEFAULT_STEPS = FRANCE_DEFAULT_STEPS


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_default_steps(user_id: int, session: Session, country: str = "France") -> List[SettlementStep]:
    """Create and persist the country-specific settlement steps for a user."""
    steps_data = STEPS_BY_COUNTRY.get(country, FRANCE_DEFAULT_STEPS)
    steps = []
    for step_data in steps_data:
        step = SettlementStep(
            user_id=user_id,
            step_number=step_data["step_number"],
            title=step_data["title"],
            description=step_data["description"],
            is_completed=False,
            is_unlocked=step_data["is_unlocked"],
        )
        session.add(step)
        steps.append(step)
    session.commit()
    for step in steps:
        session.refresh(step)
    return steps


def _delete_cloudinary_file(file_path: str, content_type: str) -> None:
    """Delete a file from Cloudinary given its URL and content type."""
    import cloudinary.uploader

    try:
        parsed = urlparse(file_path)
        path = parsed.path  # e.g. /mycloud/image/upload/v123/expat-ease/user_1/uuid.jpg

        upload_idx = path.find("/upload/")
        if upload_idx == -1:
            logger.warning("Cannot extract Cloudinary public_id from URL: %s", file_path)
            return

        public_id_raw = path[upload_idx + len("/upload/"):]
        # Strip optional version prefix (v1234567890/)
        public_id = re.sub(r"^v\d+/", "", public_id_raw)

        if content_type.startswith("image/"):
            resource_type = "image"
            public_id = os.path.splitext(public_id)[0]
        elif content_type.startswith("video/"):
            resource_type = "video"
            public_id = os.path.splitext(public_id)[0]
        else:
            # raw resources (PDF, DOC, etc.) keep their extension in the public_id
            resource_type = "raw"

        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        logger.info("Deleted Cloudinary file: %s (type=%s)", public_id, resource_type)

    except Exception as exc:
        logger.warning("Failed to delete Cloudinary file %s: %s", file_path, exc)


def _get_steps_with_documents(
    steps: List[SettlementStep], session: Session
) -> List[SettlementStepResponse]:
    """Convert settlement steps to response format. Uses a single query for all documents."""
    from app.models.document import Document

    if not steps:
        return []

    step_ids = [s.id for s in steps]
    all_docs = session.exec(
        select(Document).where(Document.settlement_step_id.in_(step_ids))
    ).all()

    docs_by_step: dict[int, list] = {}
    for doc in all_docs:
        if doc.settlement_step_id not in docs_by_step:
            docs_by_step[doc.settlement_step_id] = []
        docs_by_step[doc.settlement_step_id].append(
            StepDocumentInfo(id=doc.id, original_filename=doc.original_filename, file_path=doc.file_path)
        )

    return [
        SettlementStepResponse(
            id=step.id,
            user_id=step.user_id,
            step_number=step.step_number,
            title=step.title,
            description=step.description,
            is_completed=step.is_completed,
            is_unlocked=step.is_unlocked,
            is_skipped=step.is_skipped,
            skip_reason=step.skip_reason,
            notes=step.notes,
            created_at=step.created_at,
            updated_at=step.updated_at,
            documents=docs_by_step.get(step.id, []),
        )
        for step in steps
    ]


def _get_step_with_documents(
    step: SettlementStep, session: Session
) -> SettlementStepResponse:
    """Convert a single settlement step to response format."""
    from app.models.document import Document

    docs = session.exec(
        select(Document).where(Document.settlement_step_id == step.id)
    ).all()

    return SettlementStepResponse(
        id=step.id,
        user_id=step.user_id,
        step_number=step.step_number,
        title=step.title,
        description=step.description,
        is_completed=step.is_completed,
        is_unlocked=step.is_unlocked,
        is_skipped=step.is_skipped,
        skip_reason=step.skip_reason,
        notes=step.notes,
        created_at=step.created_at,
        updated_at=step.updated_at,
        documents=[
            StepDocumentInfo(id=d.id, original_filename=d.original_filename, file_path=d.file_path)
            for d in docs
        ],
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/initialize", response_model=List[SettlementStepResponse])
def initialize_settlement_steps(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> List[SettlementStepResponse]:
    """
    Initialize settlement steps for a new user.
    If steps already exist, returns them without creating duplicates.
    """
    existing = session.exec(
        select(SettlementStep).where(SettlementStep.user_id == current_user.id)
    ).all()

    if existing:
        logger.info(
            "User %d already has %d settlement steps — returning existing",
            current_user.id, len(existing),
        )
        return _get_steps_with_documents(existing, session)

    steps = _create_default_steps(current_user.id, session, country=current_user.settlement_country or "France")
    logger.info("Initialized %d settlement steps for user %d (country=%s)", len(steps), current_user.id, current_user.settlement_country)
    return _get_steps_with_documents(steps, session)


@router.get("/", response_model=List[SettlementStepResponse])
def get_user_settlement_steps(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> List[SettlementStepResponse]:
    """
    Get all settlement steps for the current user.
    Auto-initializes default steps if none exist yet.
    """
    steps = session.exec(
        select(SettlementStep)
        .where(SettlementStep.user_id == current_user.id)
        .order_by(SettlementStep.step_number)
    ).all()

    if not steps:
        logger.info("No steps found for user %d — auto-initializing (country=%s)", current_user.id, current_user.settlement_country)
        steps = _create_default_steps(current_user.id, session, country=current_user.settlement_country or "France")

    return _get_steps_with_documents(steps, session)


@router.patch("/{step_id}", response_model=SettlementStepResponse)
def update_settlement_step(
    step_id: int,
    step_update: SettlementStepUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> SettlementStepResponse:
    """
    Update a settlement step's completion status.
    Completing a step automatically unlocks the next one.
    """
    step = session.exec(
        select(SettlementStep).where(
            SettlementStep.id == step_id,
            SettlementStep.user_id == current_user.id,
        )
    ).first()

    if not step:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settlement step not found",
        )

    status_changed = False

    if step_update.is_skipped is not None:
        step.is_skipped = step_update.is_skipped
        step.skip_reason = step_update.skip_reason if step_update.is_skipped else None
        # Skipping clears completion; un-skipping is neutral
        if step_update.is_skipped:
            step.is_completed = False
        status_changed = True

        # Unlock next step when skipping (same as completing)
        if step_update.is_skipped:
            next_step = session.exec(
                select(SettlementStep).where(
                    SettlementStep.user_id == current_user.id,
                    SettlementStep.step_number == step.step_number + 1,
                )
            ).first()
            if next_step:
                next_step.is_unlocked = True
                next_step.updated_at = datetime.now(timezone.utc)
                session.add(next_step)

    elif step_update.is_completed is not None:
        step.is_completed = step_update.is_completed
        # Completing clears any skip
        if step_update.is_completed:
            step.is_skipped = False
            step.skip_reason = None
        status_changed = True

        # Auto-unlock the next step when this one is completed
        if step_update.is_completed:
            next_step = session.exec(
                select(SettlementStep).where(
                    SettlementStep.user_id == current_user.id,
                    SettlementStep.step_number == step.step_number + 1,
                )
            ).first()
            if next_step:
                next_step.is_unlocked = True
                next_step.updated_at = datetime.now(timezone.utc)
                session.add(next_step)

    if step_update.notes is not None:
        step.notes = step_update.notes

    # Only update updated_at when status changes, so timestamps stay accurate.
    if status_changed:
        step.updated_at = datetime.now(timezone.utc)

    session.add(step)
    session.commit()
    session.refresh(step)

    return _get_step_with_documents(step, session)


@router.post("/reset", response_model=List[SettlementStepResponse], status_code=status.HTTP_200_OK)
def reset_settlement_steps(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> List[SettlementStepResponse]:
    """
    Reset all settlement steps for the current user.
    Deletes existing steps and their Cloudinary documents, then re-initializes.
    """
    try:
        existing_steps = session.exec(
            select(SettlementStep).where(SettlementStep.user_id == current_user.id)
        ).all()

        for step in existing_steps:
            from app.models.document import Document

            documents = session.exec(
                select(Document).where(Document.settlement_step_id == step.id)
            ).all()

            for doc in documents:
                _delete_cloudinary_file(doc.file_path, doc.content_type)
                session.delete(doc)

            session.delete(step)

        session.commit()

        steps = _create_default_steps(current_user.id, session, country=current_user.settlement_country or "France")
        logger.info("Reset settlement steps for user %d (country=%s)", current_user.id, current_user.settlement_country)
        return _get_steps_with_documents(steps, session)

    except Exception as exc:
        session.rollback()
        logger.error("Failed to reset settlement steps for user %d: %s", current_user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset settlement steps: {str(exc)}",
        )
