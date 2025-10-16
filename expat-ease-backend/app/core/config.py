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
    # Frontend URL for CORS (single). For multiple origins use FRONTEND_URLS comma-separated.
    FRONTEND_URL: str = "http://localhost:5173"
    # Comma-separated list of allowed frontend origins (e.g. https://app.example.com,https://staging.example.com)
    FRONTEND_URLS: Optional[str] = None
    
    # Secret key for JWT tokens
    # IMPORTANT: do not commit a real secret to the repo. Provide via environment in production.
    SECRET_KEY: str = ""
    
    # Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Optional SMTP/email settings for password reset (production)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[str] = None
    # Development helper: when true, forgot-password will return the token in the response
    # WARNING: set to False in production
    DEV_RETURN_RESET_TOKEN: bool = False

    # Security/Audit defaults to avoid AttributeError in optional modules
    LOG_LEVEL: str = "INFO"
    RATE_LIMIT_PER_MINUTE: int = 60
    ENABLE_HTTPS: bool = False
    AUDIT_LOG_ENABLED: bool = False
    # In production set this to a list of allowed hostnames/origins. Empty means no wildcard.
    ALLOWED_HOSTS: list[str] = []
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


# Global settings instance
settings = Settings()
