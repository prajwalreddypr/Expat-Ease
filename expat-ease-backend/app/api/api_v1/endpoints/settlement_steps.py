"""
Settlement steps management endpoints.
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.deps import get_current_active_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.settlement_step import (
    SettlementStepResponse,
    SettlementStepUpdate,
    StepDocumentInfo,
)
from app.services import settlement_steps as settlement_service

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


def _to_response(bundle: settlement_service.StepBundle) -> SettlementStepResponse:
    step = bundle.step
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
            for d in bundle.documents
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
    templates = STEPS_BY_COUNTRY.get(current_user.settlement_country, FRANCE_DEFAULT_STEPS)
    bundles = settlement_service.initialize_steps(session, current_user.id, templates)
    logger.info(
        "Initialized or loaded %d settlement steps for user %d (country=%s)",
        len(bundles),
        current_user.id,
        current_user.settlement_country,
    )
    return [_to_response(bundle) for bundle in bundles]


@router.get("/", response_model=List[SettlementStepResponse])
def get_user_settlement_steps(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> List[SettlementStepResponse]:
    """
    Get all settlement steps for the current user.
    Auto-initializes default steps if none exist yet.
    """
    templates = STEPS_BY_COUNTRY.get(current_user.settlement_country, FRANCE_DEFAULT_STEPS)
    bundles = settlement_service.list_or_initialize_steps(session, current_user.id, templates)
    return [_to_response(bundle) for bundle in bundles]


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
    try:
        bundle = settlement_service.update_step(
            session,
            current_user.id,
            step_id,
            is_completed=step_update.is_completed,
            is_skipped=step_update.is_skipped,
            skip_reason=step_update.skip_reason,
            notes=step_update.notes,
        )
    except settlement_service.SettlementStepNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settlement step not found",
        ) from exc
    return _to_response(bundle)


@router.post("/reset", response_model=List[SettlementStepResponse], status_code=status.HTTP_200_OK)
def reset_settlement_steps(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> List[SettlementStepResponse]:
    """
    Reset all settlement steps for the current user.
    Deletes existing steps and their Cloudinary documents, then re-initializes.
    """
    templates = STEPS_BY_COUNTRY.get(current_user.settlement_country, FRANCE_DEFAULT_STEPS)
    try:
        bundles = settlement_service.reset_steps(session, current_user.id, templates)
        logger.info(
            "Reset settlement steps for user %d (country=%s)",
            current_user.id,
            current_user.settlement_country,
        )
        return [_to_response(bundle) for bundle in bundles]
    except settlement_service.SettlementResetError as exc:
        logger.error("Failed to reset settlement steps for user %d: %s", current_user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset settlement steps",
        ) from exc
