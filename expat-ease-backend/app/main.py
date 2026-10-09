"""
Main FastAPI application.
"""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.api_v1.api import api_router
from app.core.config import cors_origins, settings
from app.core.security_middleware import SecurityHeadersMiddleware

# Create FastAPI application instance
app = FastAPI(
    title="Expat Ease API",
    description="Backend API for Expat Ease - helping immigrants and expats settle in new cities",
    version="1.0.0",
)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Simple middleware that logs incoming request method and selected headers.
    This runs before other middleware (when added before them) so we can
    observe OPTIONS (preflight) requests and their headers in deployed logs.
    """

    async def dispatch(self, request: Request, call_next):
        try:
            log = logging.getLogger(__name__)
            # Only log a few key headers to avoid overly verbose logs
            hdrs = {
                k: v
                for k, v in request.headers.items()
                if k.lower()
                in (
                    "origin",
                    "access-control-request-method",
                    "access-control-request-headers",
                    "content-type",
                    "host",
                )
            }
            log.info("Incoming request %s %s headers=%s", request.method, request.url.path, hdrs)
        except Exception:
            logging.getLogger("uvicorn.error").exception("Failed to log request headers")
        response = await call_next(request)
        return response


logger = logging.getLogger("uvicorn")
allowed_origins = cors_origins(settings)

# Add request logging middleware first so we capture preflight requests in logs
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
if settings.ALLOWED_HOSTS:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# Then add CORS middleware
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
logger.info("CORS allowed_origins: %s", allowed_origins)

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
