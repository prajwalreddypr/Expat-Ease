"""
Main FastAPI application.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from fastapi.staticfiles import StaticFiles

from app.api.api_v1.api import api_router
from app.db.init_db import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    create_db_and_tables()
    yield
    # Shutdown (if needed)
    pass


# Create FastAPI application instance
app = FastAPI(
    title="Expat Ease API",
    description="Backend API for Expat Ease - helping immigrants and expats settle in new cities",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS using configured FRONTEND_URL or ALLOWED_HOSTS
# Prepare logger early for startup messages
logger = logging.getLogger("uvicorn")
allowed_origins = []
# Prefer FRONTEND_URL (single) but allow FRONTEND_URLS (comma-separated) for multiple origins
if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL)
if settings.FRONTEND_URLS:
    # Split comma-separated list and strip whitespace
    urls = [u.strip() for u in settings.FRONTEND_URLS.split(',') if u.strip()]
    allowed_origins.extend(urls)
if settings.ALLOWED_HOSTS:
    allowed_origins.extend(settings.ALLOWED_HOSTS)

# If no allowed origins were configured, fall back to wildcard with a warning.
# This is a deliberate, temporary convenience for deployments where the env
# variable was not set. For production, set FRONTEND_URLS to a comma-separated
# list of allowed origins and remove this fallback.
if not allowed_origins:
    logger.warning(
        "No FRONTEND_URL(S) or ALLOWED_HOSTS configured; falling back to allow all origins."
    )
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Startup checks
logger = logging.getLogger("uvicorn")
if not settings.SECRET_KEY:
    logger.warning(
        "SECRET_KEY is empty. Set a secure SECRET_KEY in environment for production deployments."
    )
# Log resolved allowed origins for troubleshooting (safe to log)
logger.info(f"CORS allowed_origins: {allowed_origins}")

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Static files are now served from Cloudinary - no local mounting needed


@app.get("/health")
@app.head("/health")
def health_check() -> dict:
    """
    Health check endpoint.
    
    Returns:
        dict: Health status
    """
    return {"status": "healthy", "message": "Expat Ease API is running"}


@app.get("/test-cors")
def test_cors() -> dict:
    """
    Test CORS endpoint.
    
    Returns:
        dict: CORS test response
    """
    return {"message": "CORS is working", "origin": "test"}


# TODO: Add more endpoints and functionality
# - Authentication endpoints
# - User management
# - City information
# - Task tracking
# - Document management
