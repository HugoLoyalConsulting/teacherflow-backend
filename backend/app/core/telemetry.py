"""
PostHog Product Analytics Integration
Tracks user behavior and product usage events
"""
from typing import Optional, Dict, Any
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# PostHog configuration
POSTHOG_ENABLED = os.getenv("POSTHOG_ENABLED", "false").lower() == "true"
POSTHOG_API_KEY = os.getenv("POSTHOG_API_KEY", "")
POSTHOG_HOST = os.getenv("POSTHOG_HOST", "https://app.posthog.com")

# Initialize PostHog client
posthog_client = None

if POSTHOG_ENABLED and POSTHOG_API_KEY:
    try:
        from posthog import Posthog
        posthog_client = Posthog(
            project_api_key=POSTHOG_API_KEY,
            host=POSTHOG_HOST
        )
        logger.info("PostHog telemetry initialized")
    except ImportError:
        logger.warning("posthog library not installed. Run: pip install posthog")
        POSTHOG_ENABLED = False
    except Exception as e:
        logger.error(f"Failed to initialize PostHog: {e}")
        POSTHOG_ENABLED = False


def track_event(
    event_name: str,
    user_id: Optional[str] = None,
    organization_id: Optional[str] = None,
    properties: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Track a product event to PostHog
    
    Args:
        event_name: Name of the event (e.g., 'user_signed_up', 'student_created')
        user_id: User ID performing the action
        organization_id: Organization ID (for multi-tenant filtering)
        properties: Additional event properties
    
    Example:
        track_event(
            event_name="payment_created",
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            properties={
                "amount": 100.0,
                "currency": "BRL",
                "status": "pending"
            }
        )
    """
    if not POSTHOG_ENABLED or not posthog_client:
        return
    
    try:
        # Build properties
        event_properties = properties or {}
        event_properties.update({
            "timestamp": datetime.utcnow().isoformat(),
            "$groups": {"organization": organization_id} if organization_id else {}
        })
        
        if organization_id:
            event_properties["organization_id"] = organization_id
        
        # Track event
        if user_id:
            posthog_client.capture(
                distinct_id=user_id,
                event=event_name,
                properties=event_properties
            )
        else:
            # Anonymous event (for pre-auth events)
            posthog_client.capture(
                distinct_id="anonymous",
                event=event_name,
                properties=event_properties
            )
        
        logger.debug(f"Tracked event: {event_name} for user: {user_id or 'anonymous'}")
    
    except Exception as e:
        # Never let telemetry crash the app
        logger.error(f"Failed to track event {event_name}: {e}")


def identify_user(
    user_id: str,
    email: Optional[str] = None,
    name: Optional[str] = None,
    organization_id: Optional[str] = None,
    properties: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Identify a user in PostHog with their properties
    
    Args:
        user_id: Unique user identifier
        email: User email
        name: User full name
        organization_id: Organization ID
        properties: Additional user properties
    
    Example:
        identify_user(
            user_id=user.id,
            email=user.email,
            name=user.full_name,
            organization_id=user.organization_id,
            properties={"plan": "premium"}
        )
    """
    if not POSTHOG_ENABLED or not posthog_client:
        return
    
    try:
        user_properties = properties or {}
        
        if email:
            user_properties["email"] = email
        if name:
            user_properties["name"] = name
        if organization_id:
            user_properties["organization_id"] = organization_id
        
        posthog_client.identify(
            distinct_id=user_id,
            properties=user_properties
        )
        
        # Also associate with organization group
        if organization_id:
            posthog_client.group_identify(
                group_type="organization",
                group_key=organization_id,
                properties={}
            )
        
        logger.debug(f"Identified user: {user_id}")
    
    except Exception as e:
        logger.error(f"Failed to identify user {user_id}: {e}")


def set_organization_properties(
    organization_id: str,
    properties: Dict[str, Any]
) -> None:
    """
    Set properties for an organization group
    
    Args:
        organization_id: Organization ID
        properties: Organization properties (e.g., plan, student_count)
    
    Example:
        set_organization_properties(
            organization_id=org.id,
            properties={
                "name": org.name,
                "plan": "free",
                "student_count": 25
            }
        )
    """
    if not POSTHOG_ENABLED or not posthog_client:
        return
    
    try:
        posthog_client.group_identify(
            group_type="organization",
            group_key=organization_id,
            properties=properties
        )
        logger.debug(f"Set properties for organization: {organization_id}")
    
    except Exception as e:
        logger.error(f"Failed to set organization properties: {e}")


# Standard Events
class Events:
    """Standard event names for consistency"""
    
    # Authentication
    USER_SIGNED_UP = "user_signed_up"
    USER_LOGGED_IN = "user_logged_in"
    USER_LOGGED_OUT = "user_logged_out"
    PASSWORD_RESET_REQUESTED = "password_reset_requested"
    PASSWORD_CHANGED = "password_changed"
    
    # Students
    STUDENT_CREATED = "student_created"
    STUDENT_UPDATED = "student_updated"
    STUDENT_DELETED = "student_deleted"
    
    # Classes/Groups
    CLASS_CREATED = "class_created"
    CLASS_UPDATED = "class_updated"
    CLASS_DELETED = "class_deleted"
    
    # Lessons
    LESSON_CREATED = "lesson_created"
    LESSON_STARTED = "lesson_started"
    LESSON_COMPLETED = "lesson_completed"
    LESSON_CANCELLED = "lesson_cancelled"
    
    # Attendance
    ATTENDANCE_MARKED = "attendance_marked"
    ATTENDANCE_UPDATED = "attendance_updated"
    
    # Payments
    PAYMENT_CREATED = "payment_created"
    PAYMENT_PAID = "payment_paid"
    PAYMENT_OVERDUE = "payment_overdue"
    PAYMENT_CANCELLED = "payment_cancelled"
    
    # Communication
    WHATSAPP_CHARGE_SENT = "whatsapp_charge_sent"
    EMAIL_SENT = "email_sent"
    
    # Organization
    ORGANIZATION_CREATED = "organization_created"
    ORGANIZATION_SETTINGS_UPDATED = "organization_settings_updated"


# Helper functions for common tracking patterns

def track_auth_event(event_name: str, user_id: str, method: str = "email"):
    """Track authentication events"""
    track_event(
        event_name=event_name,
        user_id=user_id,
        properties={
            "method": method,  # email, google, etc.
        }
    )


def track_student_event(
    event_name: str,
    user_id: str,
    organization_id: str,
    student_id: str,
):
    """Track student-related events"""
    track_event(
        event_name=event_name,
        user_id=user_id,
        organization_id=organization_id,
        properties={
            "student_id": student_id,
        }
    )


def track_payment_event(
    event_name: str,
    user_id: str,
    organization_id: str,
    payment_id: str,
    amount: float,
    currency: str = "BRL",
    status: str = "pending",
):
    """Track payment events"""
    track_event(
        event_name=event_name,
        user_id=user_id,
        organization_id=organization_id,
        properties={
            "payment_id": payment_id,
            "amount": amount,
            "currency": currency,
            "status": status,
        }
    )


def shutdown_posthog():
    """Gracefully shutdown PostHog client"""
    if posthog_client:
        try:
            posthog_client.shutdown()
            logger.info("PostHog client shut down")
        except Exception as e:
            logger.error(f"Error shutting down PostHog: {e}")
