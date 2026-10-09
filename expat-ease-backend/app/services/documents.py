import os
from typing import List, Optional

from sqlmodel import Session, select

from app.core.storage import (
    CloudinaryStorage,
    StorageError,
    UploadFileLike,
    cloudinary_storage,
)
from app.models.document import Document
from app.models.settlement_step import SettlementStep

DOCUMENT_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}
DOCUMENT_MAX_SIZE = 10 * 1024 * 1024


class DocumentError(Exception):
    pass


class DocumentNotFoundError(DocumentError):
    pass


class SettlementStepNotFoundError(DocumentError):
    pass


class UploadValidationError(DocumentError):
    pass


class DocumentStorageError(DocumentError):
    pass


async def create_document(
    session: Session,
    user_id: int,
    upload_file: UploadFileLike,
    custom_name: Optional[str],
    settlement_step_id: Optional[int],
    storage: Optional[CloudinaryStorage] = None,
) -> Document:
    storage = storage or cloudinary_storage
    _validate_document(upload_file)
    if settlement_step_id is not None:
        step = session.exec(
            select(SettlementStep).where(
                SettlementStep.id == settlement_step_id, SettlementStep.user_id == user_id
            )
        ).first()
        if not step:
            raise SettlementStepNotFoundError

    try:
        stored = await storage.upload(user_id, upload_file, DOCUMENT_MAX_SIZE)
    except StorageError as exc:
        raise DocumentStorageError(str(exc)) from exc

    document = Document(
        filename=stored.filename,
        original_filename=custom_name.strip()
        if custom_name and custom_name.strip()
        else upload_file.filename or stored.filename,
        file_path=stored.url,
        file_size=stored.size,
        content_type=stored.content_type,
        settlement_step_id=settlement_step_id,
        user_id=user_id,
    )
    try:
        session.add(document)
        session.commit()
        session.refresh(document)
    except Exception as exc:
        session.rollback()
        try:
            storage.delete(stored.url, stored.content_type)
        except StorageError:
            pass
        raise DocumentStorageError("Failed to save document") from exc
    return document


def list_documents(session: Session, user_id: int) -> List[Document]:
    return list(
        session.exec(
            select(Document).where(Document.user_id == user_id).order_by(Document.created_at.desc())
        ).all()
    )


def get_document(session: Session, document_id: int, user_id: int) -> Document:
    document = session.exec(
        select(Document).where(Document.id == document_id, Document.user_id == user_id)
    ).first()
    if not document:
        raise DocumentNotFoundError
    return document


def delete_document(
    session: Session,
    document_id: int,
    user_id: int,
    storage: Optional[CloudinaryStorage] = None,
) -> None:
    storage = storage or cloudinary_storage
    document = get_document(session, document_id, user_id)
    try:
        storage.delete(document.file_path, document.content_type)
    except StorageError as exc:
        raise DocumentStorageError(str(exc)) from exc
    session.delete(document)
    session.commit()


def _validate_document(upload_file: UploadFileLike) -> None:
    extension = os.path.splitext(upload_file.filename or "")[1].lower()
    if extension not in DOCUMENT_EXTENSIONS:
        allowed = ", ".join(sorted(DOCUMENT_EXTENSIONS))
        raise UploadValidationError(f"File type not allowed. Allowed types: {allowed}")
    if upload_file.size and upload_file.size > DOCUMENT_MAX_SIZE:
        raise UploadValidationError("File too large. Maximum size: 10MB")
