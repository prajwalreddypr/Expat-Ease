"""
Configuration settings for the application.
"""

import os
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_CORS_ORIGINS = (
    "https://expat-ease.vercel.app",
    "https://expat-ease-4s7h4um2o-prajwal-reddys-projects.vercel.app",
    "https://expat-ease.onrender.com",
    "http://localhost:5173",
)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")

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

    ENABLE_HTTPS: bool = False
    # In production set this to a list of allowed hostnames/origins. Empty means no wildcard.
    ALLOWED_HOSTS: list[str] = Field(default_factory=list)


def cors_origins(config: Settings) -> list[str]:
    """Return normalized, de-duplicated browser origins."""
    configured = [config.FRONTEND_URL]
    if config.FRONTEND_URLS:
        configured.extend(config.FRONTEND_URLS.split(","))
    origins = [origin.strip().rstrip("/") for origin in configured if origin.strip()]
    return list(dict.fromkeys([*origins, *DEFAULT_CORS_ORIGINS]))


# Tests provide configuration explicitly and must not inherit developer secrets.
settings = Settings(_env_file=None if os.getenv("ENVIRONMENT") == "test" else ".env")
