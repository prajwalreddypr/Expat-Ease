"""
Main FastAPI application.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
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


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Simple middleware that logs incoming request method and selected headers.
    This runs before other middleware (when added before them) so we can
    observe OPTIONS (preflight) requests and their headers in deployed logs.
    """

    async def dispatch(self, request: Request, call_next):
        try:
            # Use the root logger so test runs and simple deployments surface these logs
            log = logging.getLogger()
            # Only log a few key headers to avoid overly verbose logs
            hdrs = {k: v for k, v in request.headers.items() if k.lower() in (
                "origin",
                "access-control-request-method",
                "access-control-request-headers",
                "content-type",
                "host",
            )}
            log.info(f"Incoming request {request.method} {request.url.path} headers: {hdrs}")
        except Exception:
            logging.getLogger("uvicorn.error").exception("Failed to log request headers")
        response = await call_next(request)
        return response

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
# Preferred: honor FRONTEND_URL / FRONTEND_URLS from environment (set on Render)
resolved = []
if settings.FRONTEND_URL:
    resolved.append(settings.FRONTEND_URL)
if settings.FRONTEND_URLS:
    resolved.extend([u.strip() for u in settings.FRONTEND_URLS.split(',') if u.strip()])
if settings.ALLOWED_HOSTS:
    resolved.extend(settings.ALLOWED_HOSTS)

# If the environment didn't provide any origins, fall back to a safe allow-list
# containing only the production Vercel origins and localhost for development.
if not resolved:
    resolved = [
        "https://expat-ease.vercel.app",
        "https://expat-ease-4s7h4um2o-prajwal-reddys-projects.vercel.app",
        "http://localhost:5173",
    ]
    logger.info(f"No FRONTEND_URL(S) provided; defaulting allowed_origins to {resolved}")

# Use the resolved list as allowed_origins (no wildcard)
allowed_origins = resolved
# When explicit origins are used we can allow credentials
cors_allow_credentials = True

# Ensure the production frontend origins are included in the allow-list so
# deployed requests from those domains are accepted even if env vars are missing.
production_origins = [
    "https://expat-ease.vercel.app",
    "https://expat-ease-4s7h4um2o-prajwal-reddys-projects.vercel.app",
    "https://expat-ease.onrender.com",
]
for o in production_origins:
    if o not in allowed_origins:
        allowed_origins.append(o)

# Ensure localhost dev origin is allowed for local testing
if "http://localhost:5173" not in allowed_origins:
    allowed_origins.append("http://localhost:5173")

# Add request logging middleware first so we capture preflight requests in logs
app.add_middleware(RequestLoggingMiddleware)

# Then add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=cors_allow_credentials,
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


@app.options("/debug-echo")
def debug_echo_options(request: Request):
    """
    Minimal debug endpoint that echoes a few request headers back.
    Designed for quick preflight inspection from deployed environment.
    """
    # Note: FastAPI normally handles OPTIONS via CORSMiddleware, but
    # having an explicit route can help in situations where proxies
    # alter the preflight and cause a 400 before middleware runs.
    headers = {k: v for k, v in request.headers.items() if k.lower() in (
        "origin",
        "access-control-request-method",
        "access-control-request-headers",
    )}
    return {"method": "OPTIONS", "headers": headers}


@app.get("/debug-cors")
def debug_cors() -> dict:
    """
    Recompute and return the resolved allowed_origins based on current settings.
    Useful for debugging what the application thinks should be allowed.
    """
    return {"allowed_origins": allowed_origins}


# TODO: Add more endpoints and functionality
# - Authentication endpoints
# - User management
# - City information
# - Task tracking
# - Document management
