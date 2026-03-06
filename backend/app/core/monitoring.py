"""
Sentry Error Monitoring Integration
Captures and reports errors from the backend
"""
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Sentry configuration
SENTRY_ENABLED = os.getenv("SENTRY_ENABLED", "false").lower() == "true"
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

sentry_sdk = None


def filter_sensitive_data(event: Dict[str, Any], hint: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Filter sensitive data before sending to Sentry
    
    Removes:
    - Passwords
    - API keys
    - JWT tokens
    - Credit card numbers
    """
    if not event:
        return event
    
    sensitive_keys = [
        "password",
        "hashed_password",
        "secret",
        "token",
        "jwt",
        "api_key",
        "credit_card",
        "ssn",
        "authorization",
    ]
    
    # Remove from request data
    if "request" in event and "data" in event["request"]:
        data = event["request"]["data"]
        if isinstance(data, dict):
            for key in sensitive_keys:
                if key in data:
                    data[key] = "[FILTERED]"
    
    # Remove from extra context
    if "extra" in event:
        for key in sensitive_keys:
            if key in event["extra"]:
                event["extra"][key] = "[FILTERED]"
    
    return event


if SENTRY_ENABLED and SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
        from sentry_sdk.integrations.logging import LoggingIntegration
        
        # Initialize Sentry
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            environment=ENVIRONMENT,
            traces_sample_rate=1.0 if ENVIRONMENT == "development" else 0.1,
            profiles_sample_rate=1.0 if ENVIRONMENT == "development" else 0.1,
            integrations=[
                FastApiIntegration(transaction_style="endpoint"),
                SqlalchemyIntegration(),
                LoggingIntegration(
                    level=logging.INFO,
                    event_level=logging.ERROR
                ),
            ],
            # Filter out sensitive data
            before_send=filter_sensitive_data,
        )
        
        logger.info(f"Sentry error monitoring initialized (env: {ENVIRONMENT})")
    
    except ImportError:
        logger.warning("sentry-sdk not installed. Run: pip install sentry-sdk")
        SENTRY_ENABLED = False
    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {e}")
        SENTRY_ENABLED = False
    """
    Filter sensitive data before sending to Sentry
    
    Removes:
    - Passwords
    - API keys
    - JWT tokens
    - Credit card numbers
    """
    if not event:
        return event
    
    sensitive_keys = [
        "password",
        "hashed_password",
        "secret",
        "token",
        "jwt",
        "api_key",
        "credit_card",
        "ssn",
        "authorization",
    ]
    
    # Remove from request data
    if "request" in event and "data" in event["request"]:
        data = event["request"]["data"]
        if isinstance(data, dict):
            for key in sensitive_keys:
                if key in data:
                    data[key] = "[FILTERED]"
    
    # Remove from extra context
    if "extra" in event:
        for key in sensitive_keys:
            if key in event["extra"]:
                event["extra"][key] = "[FILTERED]"
    
    return event


def capture_exception(
    exception: Exception,
    user_id: Optional[str] = None,
    organization_id: Optional[str] = None,
    extra_context: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Manually capture an exception to Sentry with context
    
    Args:
        exception: The exception to capture
        user_id: User ID for context
        organization_id: Organization ID for context
        extra_context: Additional context data
    
    Example:
        try:
            risky_operation()
        except Exception as e:
            capture_exception(
                e,
                user_id=current_user.id,
                organization_id=current_user.organization_id,
                extra_context={"action": "payment_processing"}
            )
            raise
    """
    if not SENTRY_ENABLED or not sentry_sdk:
        logger.error(f"Exception occurred: {exception}", exc_info=True)
        return
    
    try:
        # Set user context
        if user_id or organization_id:
            with sentry_sdk.configure_scope() as scope:
                if user_id:
                    scope.set_user({"id": user_id})
                if organization_id:
                    scope.set_tag("organization_id", organization_id)
                if extra_context:
                    for key, value in extra_context.items():
                        scope.set_extra(key, value)
        
        sentry_sdk.capture_exception(exception)
        logger.debug(f"Exception captured by Sentry: {type(exception).__name__}")
    
    except Exception as e:
        logger.error(f"Failed to capture exception in Sentry: {e}")


def capture_message(
    message: str,
    level: str = "info",
    user_id: Optional[str] = None,
    organization_id: Optional[str] = None,
    extra_context: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Capture a message to Sentry
    
    Args:
        message: Message to capture
        level: Severity level (debug, info, warning, error, fatal)
        user_id: User ID for context
        organization_id: Organization ID for context
        extra_context: Additional context data
    
    Example:
        capture_message(
            "Suspicious login attempt detected",
            level="warning",
            user_id=user_id,
            extra_context={"ip_address": request.client.host}
        )
    """
    if not SENTRY_ENABLED or not sentry_sdk:
        return
    
    try:
        with sentry_sdk.configure_scope() as scope:
            if user_id:
                scope.set_user({"id": user_id})
            if organization_id:
                scope.set_tag("organization_id", organization_id)
            if extra_context:
                for key, value in extra_context.items():
                    scope.set_extra(key, value)
        
        sentry_sdk.capture_message(message, level=level)
    
    except Exception as e:
        logger.error(f"Failed to capture message in Sentry: {e}")


def set_user_context(user_id: str, email: Optional[str] = None, **kwargs):
    """
    Set user context for subsequent error reports
    
    Args:
        user_id: User ID
        email: User email
        **kwargs: Additional user properties
    
    Example:
        set_user_context(
            user_id=current_user.id,
            email=current_user.email,
            organization_id=current_user.organization_id
        )
    """
    if not SENTRY_ENABLED or not sentry_sdk:
        return
    
    try:
        user_data = {"id": user_id}
        if email:
            user_data["email"] = email
        user_data.update(kwargs)
        
        with sentry_sdk.configure_scope() as scope:
            scope.set_user(user_data)
    
    except Exception as e:
        logger.error(f"Failed to set user context in Sentry: {e}")


def clear_user_context():
    """Clear user context (call on logout)"""
    if not SENTRY_ENABLED or not sentry_sdk:
        return
    
    try:
        with sentry_sdk.configure_scope() as scope:
            scope.set_user(None)
    except Exception as e:
        logger.error(f"Failed to clear user context in Sentry: {e}")


def add_breadcrumb(
    message: str,
    category: str = "default",
    level: str = "info",
    data: Optional[Dict[str, Any]] = None,
):
    """
    Add a breadcrumb for better error context
    
    Args:
        message: Breadcrumb message
        category: Category (e.g., "auth", "payment", "database")
        level: Severity level
        data: Additional data
    
    Example:
        add_breadcrumb(
            message="User attempted payment",
            category="payment",
            level="info",
            data={"payment_id": payment.id, "amount": payment.amount}
        )
    """
    if not SENTRY_ENABLED or not sentry_sdk:
        return
    
    try:
        sentry_sdk.add_breadcrumb(
            message=message,
            category=category,
            level=level,
            data=data or {}
        )
    except Exception as e:
        logger.error(f"Failed to add breadcrumb in Sentry: {e}")


# Context manager for tracking operations
class SentryOperation:
    """
    Context manager for tracking operations in Sentry
    
    Example:
        with SentryOperation("process_payment") as op:
            op.set_data("payment_id", payment_id)
            process_payment(payment_id)
    """
    
    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.transaction = None
    
    def __enter__(self):
        if SENTRY_ENABLED and sentry_sdk:
            self.transaction = sentry_sdk.start_transaction(
                name=self.operation_name,
                op="task"
            )
            self.transaction.__enter__()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.transaction:
            self.transaction.__exit__(exc_type, exc_val, exc_tb)
    
    def set_data(self, key: str, value: Any):
        """Set additional data for the operation"""
        if self.transaction:
            self.transaction.set_data(key, value)
    
    def set_tag(self, key: str, value: str):
        """Set a tag for the operation"""
        if self.transaction:
            self.transaction.set_tag(key, value)
