"""
Security middleware for comprehensive protection.
"""
import time
import logging
from typing import Dict, Any
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import secrets

from app.core.config import settings

# Configure logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"]
)

# Security headers
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" if settings.ENABLE_HTTPS else "",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    ),
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin"
}

# Request tracking for audit logging
request_tracker: Dict[str, Any] = {}


class SecurityMiddleware:
    """Comprehensive security middleware."""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        response = await self._process_request(request)
        
        if response:
            await response(scope, receive, send)
        else:
            await self.app(scope, receive, send)
    
    async def _process_request(self, request: Request) -> Response:
        """Process incoming request for security checks."""
        start_time = time.time()
        request_id = secrets.token_urlsafe(16)
        
        # Track request for audit logging
        request_tracker[request_id] = {
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", ""),
            "start_time": start_time
        }
        
        # Security checks
        try:
            # 1. Host header validation
            if not self._validate_host_header(request):
                return self._create_error_response(
                    "Invalid host header", 
                    status.HTTP_400_BAD_REQUEST
                )
            
            # 2. Request size validation
            if not self._validate_request_size(request):
                return self._create_error_response(
                    "Request too large", 
                    status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                )
            
            # 3. Rate limiting (handled by SlowAPI)
            # 4. SQL injection prevention (handled by SQLModel)
            # 5. XSS prevention (handled by input validation)
            
            # Log security event
            if settings.AUDIT_LOG_ENABLED:
                self._log_security_event("request_processed", request_id, request)
            
            return None
            
        except Exception as e:
            logger.error(f"Security middleware error: {str(e)}")
            if settings.AUDIT_LOG_ENABLED:
                self._log_security_event("security_error", request_id, request, str(e))
            return self._create_error_response(
                "Security validation failed", 
                status.HTTP_400_BAD_REQUEST
            )
    
    def _validate_host_header(self, request: Request) -> bool:
        """Validate host header against allowed hosts."""
        host = request.headers.get("host", "").split(":")[0]
        return any(
            allowed_host == host or 
            (allowed_host.startswith("*") and host.endswith(allowed_host[1:]))
            for allowed_host in settings.ALLOWED_HOSTS
        )
    
    def _validate_request_size(self, request: Request) -> bool:
        """Validate request size to prevent DoS attacks."""
        content_length = request.headers.get("content-length")
        if content_length:
            size = int(content_length)
            # Limit to 10MB
            return size <= 10 * 1024 * 1024
        return True
    
    def _create_error_response(self, message: str, status_code: int) -> JSONResponse:
        """Create standardized error response."""
        return JSONResponse(
            status_code=status_code,
            content={
                "error": message,
                "status_code": status_code,
                "timestamp": time.time()
            },
            headers=self._get_security_headers()
        )
    
    def _get_security_headers(self) -> Dict[str, str]:
        """Get security headers for response."""
        return {k: v for k, v in SECURITY_HEADERS.items() if v}


def add_security_headers(response: Response) -> Response:
    """Add security headers to response."""
    for header, value in SECURITY_HEADERS.items():
        if value:  # Only add non-empty headers
            response.headers[header] = value
    return response


def _log_security_event(self, event_type: str, request_id: str, request: Request, error: str = None):
    """Log security events for audit trail."""
    if request_id in request_tracker:
        event_data = request_tracker[request_id].copy()
        event_data.update({
            "event_type": event_type,
            "error": error,
            "timestamp": time.time()
        })
        
        logger.info(f"Security Event: {event_data}")
        
        # Remove from tracker after logging
        del request_tracker[request_id]


# Rate limit exceeded handler
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceeded events."""
    if settings.AUDIT_LOG_ENABLED:
        logger.warning(f"Rate limit exceeded for {request.client.host}: {request.url}")
    
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": "Rate limit exceeded",
            "retry_after": exc.retry_after,
            "timestamp": time.time()
        },
        headers=add_security_headers(Response()).headers
    )
