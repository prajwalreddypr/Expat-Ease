"""
Main FastAPI application.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Configure CORS - Allow all origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production deployment
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Static files are now served from Cloudinary - no local mounting needed


@app.get("/health")
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
