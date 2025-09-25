import os
import uuid
from typing import Tuple
from fastapi import UploadFile
import aiofiles
import cloudinary
import cloudinary.uploader
from app.core.config import settings

# Global flag to track if Cloudinary has been configured
_cloudinary_configured = False

def _ensure_cloudinary_configured():
    """Configure Cloudinary only when needed (lazy initialization)."""
    global _cloudinary_configured
    if not _cloudinary_configured:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )
        _cloudinary_configured = True


async def save_upload_file(user_id: int, upload_file: UploadFile) -> Tuple[str, str, int, str]:
    """
    Save uploaded file to Cloudinary and return file info.
    
    Args:
        user_id: ID of the user uploading the file
        upload_file: FastAPI UploadFile object
        
    Returns:
        Tuple of (cloudinary_url, filename, size, content_type)
    """
    # Configure Cloudinary only when upload is actually needed
    _ensure_cloudinary_configured()
    
    # Generate unique filename
    file_extension = os.path.splitext(upload_file.filename)[1] if upload_file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Read file content
    content = await upload_file.read()
    file_size = len(content)
    
    # Upload to Cloudinary
    try:
        # Determine resource type based on file extension
        file_extension = file_extension.lower()
        if file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            resource_type = "image"
        elif file_extension in ['.mp4', '.avi', '.mov', '.wmv', '.mp3', '.wav', '.ogg']:
            resource_type = "video"
        else:
            # For PDFs, DOCs, and other documents, use 'raw' but ensure public access
            resource_type = "raw"
        
        result = cloudinary.uploader.upload(
            content,
            public_id=f"expat-ease/user_{user_id}/{unique_filename}",
            folder="expat-ease",
            resource_type=resource_type,
            use_filename=True,
            unique_filename=True,
            overwrite=True,
            access_mode="public",
            type="upload",
            invalidate=True,  # Force cache refresh
            tags=["expat-ease", "public"]  # Add tags for easier management
        )
        
        # Return Cloudinary URL, filename, size, and content type
        cloudinary_url = result['secure_url']
        return cloudinary_url, unique_filename, file_size, upload_file.content_type or "application/octet-stream"
        
    except Exception as e:
        raise Exception(f"Failed to upload file to Cloudinary: {str(e)}")


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
