"""
Configuration settings for the application.
"""
import os
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database configuration
    DATABASE_URL: str = "sqlite:///./dev.db"
    
    # Frontend URL for CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Secret key for JWT tokens (to be implemented later)
    SECRET_KEY: str = "changeme123"
    
    # Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Security/Audit defaults to avoid AttributeError in optional modules
    LOG_LEVEL: str = "INFO"
    RATE_LIMIT_PER_MINUTE: int = 60
    ENABLE_HTTPS: bool = False
    AUDIT_LOG_ENABLED: bool = False
    ALLOWED_HOSTS: list[str] = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


# Global settings instance
settings = Settings()
