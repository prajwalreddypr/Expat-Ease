from io import BytesIO

import pytest
from fastapi import UploadFile
from starlette.datastructures import Headers

from app.core.storage import StoredFile
from app.services import users


class FakeStorage:
    def __init__(self) -> None:
        self.uploads = []
        self.deletions = []

    async def upload(self, user_id, upload_file, max_size):
        self.uploads.append((user_id, upload_file.filename, max_size))
        return StoredFile(
            url="https://files.example/profile.jpg",
            filename="profile.jpg",
            size=5,
            content_type="image/jpeg",
        )

    def delete(self, file_url, content_type):
        self.deletions.append((file_url, content_type))


def upload(content_type="image/jpeg"):
    return UploadFile(
        file=BytesIO(b"image"),
        filename="profile.jpg",
        size=5,
        headers=Headers({"content-type": content_type}),
    )


@pytest.mark.asyncio
async def test_update_profile_photo_rejects_non_image(session, user_factory):
    user = user_factory()
    storage = FakeStorage()

    with pytest.raises(users.ProfilePhotoValidationError):
        await users.update_profile_photo(session, user.id, upload("text/plain"), storage)

    assert storage.uploads == []


@pytest.mark.asyncio
async def test_update_profile_photo_replaces_previous_file(session, user_factory):
    user = user_factory()
    user.profile_photo = "https://files.example/old.jpg"
    session.add(user)
    session.commit()
    storage = FakeStorage()

    updated = await users.update_profile_photo(session, user.id, upload(), storage)

    assert updated.profile_photo == "https://files.example/profile.jpg"
    assert storage.deletions == [("https://files.example/old.jpg", "image/unknown")]


@pytest.mark.asyncio
async def test_update_profile_photo_removes_upload_when_commit_fails(
    session, user_factory, monkeypatch
):
    user = user_factory()
    storage = FakeStorage()

    def fail_commit():
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(session, "commit", fail_commit)
    with pytest.raises(users.ProfilePhotoStorageError):
        await users.update_profile_photo(session, user.id, upload(), storage)

    assert storage.deletions == [("https://files.example/profile.jpg", "image/jpeg")]
