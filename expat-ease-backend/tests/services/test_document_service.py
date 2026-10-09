from io import BytesIO

import pytest
from fastapi import UploadFile
from sqlmodel import select
from starlette.datastructures import Headers

from app.core.storage import StorageError, StoredFile
from app.models.document import Document
from app.models.settlement_step import SettlementStep
from app.services import documents


class FakeStorage:
    def __init__(self, *, fail_upload: bool = False) -> None:
        self.fail_upload = fail_upload
        self.uploads = []
        self.deletions = []

    async def upload(self, user_id, upload_file, max_size):
        self.uploads.append((user_id, upload_file.filename, max_size))
        if self.fail_upload:
            raise StorageError("unavailable")
        return StoredFile(
            url="https://files.example/document.pdf",
            filename="generated.pdf",
            size=7,
            content_type="application/pdf",
        )

    def delete(self, file_url, content_type):
        self.deletions.append((file_url, content_type))


def upload(filename="passport.pdf", content_type="application/pdf"):
    return UploadFile(
        file=BytesIO(b"content"),
        filename=filename,
        size=7,
        headers=Headers({"content-type": content_type}),
    )


@pytest.mark.asyncio
async def test_create_document_persists_storage_metadata(session, user_factory):
    user = user_factory()
    storage = FakeStorage()

    document = await documents.create_document(
        session, user.id, upload(), " Passport ", None, storage
    )

    assert document.original_filename == "Passport"
    assert document.file_path == "https://files.example/document.pdf"
    assert storage.uploads == [(user.id, "passport.pdf", documents.DOCUMENT_MAX_SIZE)]
    assert session.exec(select(Document)).one().id == document.id


@pytest.mark.asyncio
async def test_create_document_rejects_another_users_step(session, user_factory):
    owner = user_factory()
    other = user_factory(email="other@example.com")
    step = SettlementStep(user_id=other.id, step_number=1, title="Step", description="Test")
    session.add(step)
    session.commit()
    session.refresh(step)
    storage = FakeStorage()

    with pytest.raises(documents.SettlementStepNotFoundError):
        await documents.create_document(session, owner.id, upload(), None, step.id, storage)

    assert storage.uploads == []


@pytest.mark.asyncio
async def test_create_document_removes_upload_when_commit_fails(session, user_factory, monkeypatch):
    user = user_factory()
    storage = FakeStorage()

    def fail_commit():
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(session, "commit", fail_commit)
    with pytest.raises(documents.DocumentStorageError):
        await documents.create_document(session, user.id, upload(), None, None, storage)

    assert storage.deletions == [("https://files.example/document.pdf", "application/pdf")]


@pytest.mark.asyncio
async def test_create_document_wraps_storage_failure(session, user_factory):
    user = user_factory()
    with pytest.raises(documents.DocumentStorageError):
        await documents.create_document(
            session, user.id, upload(), None, None, FakeStorage(fail_upload=True)
        )
