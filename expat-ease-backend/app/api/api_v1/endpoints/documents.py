"""
Document upload and management endpoints.
"""
import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlmodel import Session, select
from aiofiles import open as aio_open

from app.core.deps import get_current_active_user
from app.db.session import get_session
from app.models.document import Document, DocumentCreate, DocumentResponse
from app.models.user import User
from app.core.storage import save_upload_file

router = APIRouter()

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_file(file: UploadFile) -> None:
    """Validate uploaded file."""
    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size (if available)
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    custom_name: Optional[str] = Form(None),
    settlement_step_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> Document:
    """
    Upload a document file.
    
    Args:
        file: The uploaded file
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        DocumentResponse: Information about the uploaded document
        
    Raises:
        HTTPException: 400 if file validation fails, 500 if upload fails
    """
    try:
        # Validate file
        validate_file(file)
        
        # Upload file to Cloudinary
        cloudinary_url, unique_filename, file_size, content_type = await save_upload_file(
            user_id=current_user.id, 
            upload_file=file
        )
        
        # Use custom name if provided, otherwise use original filename
        display_name = custom_name.strip() if custom_name and custom_name.strip() else file.filename
        
        # Create document record in database
        document = Document(
            filename=unique_filename,
            original_filename=display_name,  # Store custom name as original_filename
            file_path=cloudinary_url,  # Now stores Cloudinary URL
            file_size=file_size,
            content_type=content_type,
            settlement_step_id=settlement_step_id,
            user_id=current_user.id
        )
        
        session.add(document)
        session.commit()
        session.refresh(document)
        
        # Create response with Cloudinary URL
        response = DocumentResponse(
            id=document.id,
            filename=document.filename,
            original_filename=document.original_filename,
            file_path=document.file_path,
            file_size=document.file_size,
            content_type=document.content_type,
            settlement_step_id=document.settlement_step_id,
            user_id=document.user_id,
            created_at=document.created_at,
            download_url=document.file_path  # Now it's already a Cloudinary URL
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file if database save fails
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.get("/", response_model=List[DocumentResponse])
def get_user_documents(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> List[DocumentResponse]:
    """
    Get all documents uploaded by the current user.
    
    Args:
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        List[DocumentResponse]: List of user's documents
    """
    documents = session.exec(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
    ).all()
    
    # Add download URLs
    response_documents = []
    for doc in documents:
        download_url = doc.file_path  # Now it's already a Cloudinary URL
        response_doc = DocumentResponse(
            id=doc.id,
            filename=doc.filename,
            original_filename=doc.original_filename,
            file_path=doc.file_path,
            file_size=doc.file_size,
            content_type=doc.content_type,
            settlement_step_id=doc.settlement_step_id,
            user_id=doc.user_id,
            created_at=doc.created_at,
            download_url=download_url
        )
        response_documents.append(response_doc)
    
    return response_documents


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> DocumentResponse:
    """
    Get a specific document by ID.
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        DocumentResponse: Document information
        
    Raises:
        HTTPException: 404 if document not found or not owned by user
    """
    document = session.exec(
        select(Document)
        .where(Document.id == document_id, Document.user_id == current_user.id)
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    download_url = document.file_path  # Now it's already a Cloudinary URL
    response = DocumentResponse(
        id=document.id,
        filename=document.filename,
        original_filename=document.original_filename,
        file_path=document.file_path,
        file_size=document.file_size,
        content_type=document.content_type,
        settlement_step_id=document.settlement_step_id,
        user_id=document.user_id,
        created_at=document.created_at,
        download_url=download_url
    )
    
    return response


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> dict:
    """
    Delete a document.
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        session: Database session
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: 404 if document not found or not owned by user
    """
    document = session.exec(
        select(Document)
        .where(Document.id == document_id, Document.user_id == current_user.id)
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file from disk
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # Delete from database
    session.delete(document)
    session.commit()
    
    return {"message": "Document deleted successfully"}
