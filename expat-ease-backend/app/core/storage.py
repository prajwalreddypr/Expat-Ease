import os
import re
import uuid
from dataclasses import dataclass
from typing import Optional, Protocol
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader

from app.core.config import settings


class UploadFileLike(Protocol):
    filename: Optional[str]
    content_type: Optional[str]
    size: Optional[int]

    async def read(self, size: int = -1) -> bytes: ...


class StorageError(Exception):
    pass


@dataclass(frozen=True)
class StoredFile:
    url: str
    filename: str
    size: int
    content_type: str


class CloudinaryStorage:
    def __init__(self) -> None:
        self._configured = False

    def _configure(self) -> None:
        if self._configured:
            return
        if not all(
            (
                settings.CLOUDINARY_CLOUD_NAME,
                settings.CLOUDINARY_API_KEY,
                settings.CLOUDINARY_API_SECRET,
            )
        ):
            raise StorageError("Cloudinary is not configured")
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )
        self._configured = True

    async def upload(self, user_id: int, upload_file: UploadFileLike, max_size: int) -> StoredFile:
        self._configure()
        extension = os.path.splitext(upload_file.filename or "")[1].lower()
        filename = f"{uuid.uuid4()}{extension}"
        content = await upload_file.read()
        if len(content) > max_size:
            raise StorageError(f"File too large. Maximum size: {max_size // (1024 * 1024)}MB")

        resource_type = self._resource_type(extension)
        try:
            result = cloudinary.uploader.upload(
                content,
                public_id=f"expat-ease/user_{user_id}/{filename}",
                folder="expat-ease",
                resource_type=resource_type,
                use_filename=True,
                unique_filename=True,
                overwrite=True,
                access_mode="public",
                type="upload",
                invalidate=True,
                tags=["expat-ease", "public"],
            )
            return StoredFile(
                url=result["secure_url"],
                filename=filename,
                size=len(content),
                content_type=upload_file.content_type or "application/octet-stream",
            )
        except Exception as exc:
            raise StorageError("Failed to upload file") from exc

    def delete(self, file_url: str, content_type: str) -> None:
        self._configure()
        public_id = self._public_id(file_url, content_type)
        resource_type = self._resource_type_for_content_type(content_type)
        try:
            result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        except Exception as exc:
            raise StorageError("Failed to delete file") from exc
        if result.get("result") not in {"ok", "not found"}:
            raise StorageError("Failed to delete file")

    @staticmethod
    def _resource_type(extension: str) -> str:
        if extension in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
            return "image"
        if extension in {".mp4", ".avi", ".mov", ".wmv", ".mp3", ".wav", ".ogg"}:
            return "video"
        return "raw"

    @staticmethod
    def _resource_type_for_content_type(content_type: str) -> str:
        if content_type.startswith("image/"):
            return "image"
        if content_type.startswith(("video/", "audio/")):
            return "video"
        return "raw"

    @classmethod
    def _public_id(cls, file_url: str, content_type: str) -> str:
        path = urlparse(file_url).path
        upload_index = path.find("/upload/")
        if upload_index == -1:
            raise StorageError("Invalid Cloudinary file URL")
        public_id = re.sub(r"^v\d+/", "", path[upload_index + len("/upload/") :])
        if cls._resource_type_for_content_type(content_type) != "raw":
            public_id = os.path.splitext(public_id)[0]
        return public_id


cloudinary_storage = CloudinaryStorage()
