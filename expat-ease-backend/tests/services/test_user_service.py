from io import BytesIO

import pytest
from fastapi import UploadFile
from starlette.datastructures import Headers

from app.core.passwords import verify_password
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


def test_create_user_hashes_password_and_rejects_duplicate_email(session):
    values = {"email": "new@example.com", "full_name": "New User", "country": "India"}

    created = users.create_user(session, values, "ValidPass123!")

    assert verify_password("ValidPass123!", created.hashed_password)
    with pytest.raises(users.EmailAlreadyRegisteredError):
        users.create_user(session, values, "AnotherPass123!")


def test_update_user_applies_only_supplied_values(session, user_factory):
    user = user_factory(full_name="Original Name")

    updated = users.update_user(session, user.id, {"city": "Paris"})

    assert updated.city == "Paris"
    assert updated.full_name == "Original Name"


def test_require_user_raises_domain_error(session):
    with pytest.raises(users.UserNotFoundError):
        users.require_user(session, 999)
