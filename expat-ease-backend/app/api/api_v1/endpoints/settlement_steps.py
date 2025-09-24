"""
Settlement steps management endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.deps import get_current_active_user
from app.db.session import get_session
from app.models.settlement_step import SettlementStep, SettlementStepCreate, SettlementStepUpdate, SettlementStepResponse
from app.models.user import User

router = APIRouter()

# Default settlement steps for new users
DEFAULT_STEPS = [
    {
        "step_number": 1,
        "title": "Validate Your Visa",
        "description": "Ensure your visa is valid and all entry requirements are met",
        "is_unlocked": True
    },
    {
        "step_number": 2,
        "title": "Get a Local SIM Card",
        "description": "Purchase a local SIM card for communication and internet access",
        "is_unlocked": False
    },
    {
        "step_number": 3,
        "title": "Open a Bank Account",
        "description": "Set up a local bank account for financial transactions",
        "is_unlocked": False
    },
    {
        "step_number": 4,
        "title": "Register with Local Authorities",
        "description": "Complete your registration with local government offices",
        "is_unlocked": False
    },
    {
        "step_number": 5,
        "title": "Find Accommodation",
        "description": "Secure long-term housing or rental agreement",
        "is_unlocked": False
    },
    {
        "step_number": 6,
        "title": "Set Up Healthcare",
        "description": "Register with local healthcare system and get insurance",
        "is_unlocked": False
    }
]


@router.post("/initialize", response_model=List[SettlementStepResponse])
def initialize_settlement_steps(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> List[SettlementStep]:
    """
    Initialize settlement steps for a new user.
    
    Args:
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        List[SettlementStepResponse]: List of initialized settlement steps
    """
    # Check if user already has settlement steps
    existing_steps = session.exec(
        select(SettlementStep).where(SettlementStep.user_id == current_user.id)
    ).all()
    
    if existing_steps:
        # Return existing steps with document info
        return _get_steps_with_documents(existing_steps, session)
    
    # Create default settlement steps
    created_steps = []
    for step_data in DEFAULT_STEPS:
        step = SettlementStep(
            user_id=current_user.id,
            step_number=step_data["step_number"],
            title=step_data["title"],
            description=step_data["description"],
            is_completed=False,
            is_unlocked=step_data["is_unlocked"]
        )
        session.add(step)
        created_steps.append(step)
    
    session.commit()
    
    # Refresh all steps to get IDs
    for step in created_steps:
        session.refresh(step)
    
    return _get_steps_with_documents(created_steps, session)


@router.get("/", response_model=List[SettlementStepResponse])
def get_user_settlement_steps(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> List[SettlementStep]:
    """
    Get all settlement steps for the current user.
    
    Args:
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        List[SettlementStepResponse]: List of user's settlement steps
    """
    steps = session.exec(
        select(SettlementStep)
        .where(SettlementStep.user_id == current_user.id)
        .order_by(SettlementStep.step_number)
    ).all()
    
    return _get_steps_with_documents(steps, session)


@router.patch("/{step_id}", response_model=SettlementStepResponse)
def update_settlement_step(
    step_id: int,
    step_update: SettlementStepUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> SettlementStep:
    """
    Update a settlement step.
    
    Args:
        step_id: Settlement step ID
        step_update: Update data
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        SettlementStepResponse: Updated settlement step
        
    Raises:
        HTTPException: 404 if step not found or not owned by user
    """
    step = session.exec(
        select(SettlementStep).where(
            SettlementStep.id == step_id,
            SettlementStep.user_id == current_user.id
        )
    ).first()
    
    if not step:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settlement step not found"
        )
    
    # Update step
    if step_update.is_completed is not None:
        step.is_completed = step_update.is_completed
        
        # If step is completed, unlock the next step
        if step_update.is_completed and step.step_number < 6:
            next_step = session.exec(
                select(SettlementStep).where(
                    SettlementStep.user_id == current_user.id,
                    SettlementStep.step_number == step.step_number + 1
                )
            ).first()
            if next_step:
                next_step.is_unlocked = True
    
    if step_update.is_unlocked is not None:
        step.is_unlocked = step_update.is_unlocked
    
    session.add(step)
    session.commit()
    session.refresh(step)
    
    return _get_step_with_documents(step, session)


def _get_steps_with_documents(steps: List[SettlementStep], session: Session) -> List[SettlementStepResponse]:
    """Convert settlement steps to response format with document info."""
    from app.models.document import Document
    
    responses = []
    for step in steps:
        # Check if step has documents
        documents = session.exec(
            select(Document).where(Document.settlement_step_id == step.id)
        ).all()
        
        has_document = len(documents) > 0
        document_url = None
        if has_document and documents[0]:
            document_url = f"/uploads/{documents[0].filename}"
        
        response = SettlementStepResponse(
            id=step.id,
            user_id=step.user_id,
            step_number=step.step_number,
            title=step.title,
            description=step.description,
            is_completed=step.is_completed,
            is_unlocked=step.is_unlocked,
            created_at=step.created_at,
            updated_at=step.updated_at,
            has_document=has_document,
            document_url=document_url
        )
        responses.append(response)
    
    return responses


def _get_step_with_documents(step: SettlementStep, session: Session) -> SettlementStepResponse:
    """Convert single settlement step to response format with document info."""
    from app.models.document import Document
    
    # Check if step has documents
    documents = session.exec(
        select(Document).where(Document.settlement_step_id == step.id)
    ).all()
    
    has_document = len(documents) > 0
    document_url = None
    if has_document and documents[0]:
        document_url = f"/uploads/{documents[0].filename}"
    
    return SettlementStepResponse(
        id=step.id,
        user_id=step.user_id,
        step_number=step.step_number,
        title=step.title,
        description=step.description,
        is_completed=step.is_completed,
        is_unlocked=step.is_unlocked,
        created_at=step.created_at,
        updated_at=step.updated_at,
        has_document=has_document,
        document_url=document_url
    )


@router.post("/reset", response_model=List[SettlementStepResponse], status_code=status.HTTP_200_OK)
def reset_settlement_steps(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> List[SettlementStepResponse]:
    """
    Reset all settlement steps for the current user.
    This will:
    1. Delete all existing settlement steps
    2. Delete associated documents
    3. Re-initialize with default steps (only first step unlocked)
    
    Args:
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        List[SettlementStepResponse]: Reset settlement steps
        
    Raises:
        HTTPException: 500 if reset fails
    """
    try:
        # Delete all existing settlement steps and associated documents
        existing_steps = session.exec(
            select(SettlementStep).where(SettlementStep.user_id == current_user.id)
        ).all()
        
        for step in existing_steps:
            # Delete associated documents first
            from app.models.document import Document
            documents = session.exec(
                select(Document).where(Document.settlement_step_id == step.id)
            ).all()
            
            for doc in documents:
                # Delete file from disk if it exists
                import os
                if os.path.exists(doc.file_path):
                    os.remove(doc.file_path)
                session.delete(doc)
            
            # Delete the step
            session.delete(step)
        
        session.commit()
        
        # Re-initialize with default steps
        created_steps = []
        for step_data in DEFAULT_STEPS:
            db_step = SettlementStep(
                user_id=current_user.id,
                step_number=step_data["step_number"],
                title=step_data["title"],
                description=step_data["description"],
                is_completed=False,
                is_unlocked=step_data["is_unlocked"]
            )
            session.add(db_step)
            created_steps.append(db_step)

        session.commit()
        for step in created_steps:
            session.refresh(step)
        
        # Return steps with document info
        return _get_steps_with_documents(created_steps, session)
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset settlement steps: {str(e)}"
        )
