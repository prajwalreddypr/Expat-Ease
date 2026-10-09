"""Document upload and management endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlmodel import Session

from app.core.deps import get_current_active_user
from app.db.session import get_session
from app.models.document import Document
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.document import DocumentResponse
from app.services import documents as document_service

router = APIRouter()


def _to_response(document: Document) -> DocumentResponse:
    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        original_filename=document.original_filename,
        file_path=document.file_path,
        file_size=document.file_size,
        content_type=document.content_type,
        settlement_step_id=document.settlement_step_id,
        user_id=document.user_id,
        created_at=document.created_at,
        download_url=document.file_path,
    )


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    custom_name: Optional[str] = Form(None),
    settlement_step_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> DocumentResponse:
    try:
        document = await document_service.create_document(
            session, current_user.id, file, custom_name, settlement_step_id
        )
    except document_service.UploadValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except document_service.SettlementStepNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Settlement step not found"
        ) from exc
    except document_service.DocumentStorageError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document",
        ) from exc
    return _to_response(document)


@router.get("/", response_model=List[DocumentResponse])
def get_user_documents(
    current_user: User = Depends(get_current_active_user), session: Session = Depends(get_session)
) -> List[DocumentResponse]:
    return [_to_response(doc) for doc in document_service.list_documents(session, current_user.id)]


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> DocumentResponse:
    try:
        return _to_response(document_service.get_document(session, document_id, current_user.id))
    except document_service.DocumentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        ) from exc


@router.delete("/{document_id}", response_model=MessageResponse)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> dict:
    try:
        document_service.delete_document(session, document_id, current_user.id)
    except document_service.DocumentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        ) from exc
    except document_service.DocumentStorageError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document",
        ) from exc
    return {"message": "Document deleted successfully"}
