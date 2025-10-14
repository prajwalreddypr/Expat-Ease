"""
Audit logging system for security and compliance tracking.
"""
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum

from app.core.config import settings

# Configure audit logger
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

# Create file handler for audit logs
if settings.AUDIT_LOG_ENABLED:
    file_handler = logging.FileHandler("audit.log")
    file_handler.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    
    # Add handler to logger
    audit_logger.addHandler(file_handler)


class AuditEventType(str, Enum):
    """Types of audit events."""
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_REGISTRATION = "user_registration"
    USER_UPDATE = "user_update"
    USER_DELETE = "user_delete"
    PASSWORD_CHANGE = "password_change"
    DATA_EXPORT = "data_export"
    DATA_DELETE = "data_delete"
    FORUM_POST = "forum_post"
    FORUM_VOTE = "forum_vote"
    FORUM_REPORT = "forum_report"
    SECURITY_VIOLATION = "security_violation"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    ADMIN_ACTION = "admin_action"
    SYSTEM_ERROR = "system_error"


class AuditLogger:
    """Centralized audit logging system."""
    
    @staticmethod
    def log_event(
        event_type: AuditEventType,
        user_id: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> None:
        """
        Log an audit event.
        
        Args:
            event_type: Type of event being logged
            user_id: ID of user involved (if applicable)
            ip_address: IP address of request
            user_agent: User agent string
            details: Additional event details
            success: Whether the event was successful
            error_message: Error message if event failed
        """
        if not settings.AUDIT_LOG_ENABLED:
            return
        
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type.value,
            "user_id": user_id,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "success": success,
            "error_message": error_message,
            "details": details or {}
        }
        
        # Log as JSON for structured logging
        audit_logger.info(json.dumps(audit_data))
    
    @staticmethod
    def log_user_login(
        user_id: int,
        email: str,
        ip_address: str,
        user_agent: str,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> None:
        """Log user login attempt."""
        AuditLogger.log_event(
            event_type=AuditEventType.USER_LOGIN,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"email": email},
            success=success,
            error_message=error_message
        )
    
    @staticmethod
    def log_user_registration(
        user_id: int,
        email: str,
        ip_address: str,
        user_agent: str
    ) -> None:
        """Log user registration."""
        AuditLogger.log_event(
            event_type=AuditEventType.USER_REGISTRATION,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"email": email}
        )
    
    @staticmethod
    def log_data_export(
        user_id: int,
        export_id: str,
        ip_address: str,
        user_agent: str
    ) -> None:
        """Log data export request."""
        AuditLogger.log_event(
            event_type=AuditEventType.DATA_EXPORT,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"export_id": export_id}
        )
    
    @staticmethod
    def log_data_deletion(
        user_id: int,
        ip_address: str,
        user_agent: str
    ) -> None:
        """Log data deletion request."""
        AuditLogger.log_event(
            event_type=AuditEventType.DATA_DELETE,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"deletion_type": "account_deletion"}
        )
    
    @staticmethod
    def log_security_violation(
        violation_type: str,
        ip_address: str,
        user_agent: str,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log security violation."""
        AuditLogger.log_event(
            event_type=AuditEventType.SECURITY_VIOLATION,
            ip_address=ip_address,
            user_agent=user_agent,
            details={
                "violation_type": violation_type,
                **(details or {})
            },
            success=False
        )
    
    @staticmethod
    def log_rate_limit_exceeded(
        ip_address: str,
        user_agent: str,
        endpoint: str,
        limit: str
    ) -> None:
        """Log rate limit exceeded."""
        AuditLogger.log_event(
            event_type=AuditEventType.RATE_LIMIT_EXCEEDED,
            ip_address=ip_address,
            user_agent=user_agent,
            details={
                "endpoint": endpoint,
                "limit": limit
            },
            success=False
        )
    
    @staticmethod
    def log_forum_activity(
        event_type: AuditEventType,
        user_id: int,
        content_id: int,
        ip_address: str,
        user_agent: str,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log forum-related activity."""
        AuditLogger.log_event(
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={
                "content_id": content_id,
                **(details or {})
            }
        )


# Convenience functions for common audit events
def log_user_login(user_id: int, email: str, ip_address: str, user_agent: str, success: bool = True, error_message: Optional[str] = None):
    """Log user login attempt."""
    AuditLogger.log_user_login(user_id, email, ip_address, user_agent, success, error_message)


def log_user_registration(user_id: int, email: str, ip_address: str, user_agent: str):
    """Log user registration."""
    AuditLogger.log_user_registration(user_id, email, ip_address, user_agent)


def log_data_export(user_id: int, export_id: str, ip_address: str, user_agent: str):
    """Log data export request."""
    AuditLogger.log_data_export(user_id, export_id, ip_address, user_agent)


def log_data_deletion(user_id: int, ip_address: str, user_agent: str):
    """Log data deletion request."""
    AuditLogger.log_data_deletion(user_id, ip_address, user_agent)


def log_security_violation(violation_type: str, ip_address: str, user_agent: str, details: Optional[Dict[str, Any]] = None):
    """Log security violation."""
    AuditLogger.log_security_violation(violation_type, ip_address, user_agent, details)


def log_rate_limit_exceeded(ip_address: str, user_agent: str, endpoint: str, limit: str):
    """Log rate limit exceeded."""
    AuditLogger.log_rate_limit_exceeded(ip_address, user_agent, endpoint, limit)
