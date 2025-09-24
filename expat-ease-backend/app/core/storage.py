import os
import uuid
from typing import Tuple
from fastapi import UploadFile
import aiofiles


async def save_upload_file(user_id: int, upload_file: UploadFile) -> Tuple[str, str, int, str]:
    """
    Save uploaded file to user's directory and return file info.
    
    Args:
        user_id: ID of the user uploading the file
        upload_file: FastAPI UploadFile object
        
    Returns:
        Tuple of (relative_path, filename, size, content_type)
    """
    # Create user directory if it doesn't exist
    user_dir = f"uploads/{user_id}"
    os.makedirs(user_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(upload_file.filename)[1] if upload_file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Full path for saving
    file_path = os.path.join(user_dir, unique_filename)
    
    # Read file content
    content = await upload_file.read()
    file_size = len(content)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    # Return relative path, filename, size, and content type
    relative_path = f"uploads/{user_id}/{unique_filename}"
    return relative_path, unique_filename, file_size, upload_file.content_type or "application/octet-stream"


def get_file_extension(content_type: str) -> str:
    """Get file extension from content type."""
    extension_map = {
        "application/pdf": ".pdf",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
    }
    return extension_map.get(content_type, "")


def is_valid_file_type(content_type: str) -> bool:
    """Check if file type is allowed."""
    allowed_types = [
        "application/pdf",
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "image/gif",
        "image/webp",
    ]
    return content_type in allowed_types


def get_max_file_size() -> int:
    """Get maximum file size in bytes (5MB)."""
    return 5 * 1024 * 1024  # 5MB
