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
allowed_origins = []
if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL)
if settings.ALLOWED_HOSTS:
    # If ALLOWED_HOSTS includes hosts, allow them as well
    allowed_origins.extend(settings.ALLOWED_HOSTS)

# Fallback: do NOT allow wildcard origins in production; allow none if nothing is configured
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or [],
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
