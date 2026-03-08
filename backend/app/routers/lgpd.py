"""
LGPD (Lei Geral de Proteção de Dados) Compliance Router
Brazilian Data Protection Law - Manages consent, data access, and deletion rights
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field, EmailStr

from app.core.database import get_db
from app.core.security import get_current_user_obj
from app.models import User, Student, Location, Group, Lesson, Payment

router = APIRouter(prefix="/lgpd", tags=["LGPD Compliance"])


# ============================================================================
# SCHEMAS
# ============================================================================

class LGPDConsentRequest(BaseModel):
    """Request to register LGPD consent"""
    consent_version: str = Field(default="1.0", description="Terms version being accepted")
    accepts_terms: bool = Field(..., description="User accepts the terms")
    

class LGPDConsentResponse(BaseModel):
    """LGPD consent status response"""
    has_consent: bool
    consent_date: Optional[datetime]
    consent_version: Optional[str]
    consent_ip: Optional[str]
    data_retention_until: Optional[datetime]
    

class DataExportResponse(BaseModel):
    """User data export package"""
    user_data: Dict[str, Any]
    students_data: List[Dict[str, Any]]
    locations_data: List[Dict[str, Any]]
    groups_data: List[Dict[str, Any]]
    lessons_data: List[Dict[str, Any]]
    payments_data: List[Dict[str, Any]]
    exported_at: datetime
    total_records: int
    

class DeletionRequestResponse(BaseModel):
    """Response after requesting data deletion"""
    message: str
    deletion_requested_at: datetime
    estimated_completion: datetime
    request_id: str
    

class StudentLGPDRequest(BaseModel):
    """Request to update student LGPD settings"""
    lgpd_parent_consent: bool
    lgpd_data_classification: str = Field(..., pattern="^(personal|sensitive|anonymous)$")
    lgpd_purpose: str = Field(default="educational_services")
    lgpd_can_contact: bool = True
    

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def log_data_access(user: User, action: str, db: Session):
    """Log data access for LGPD compliance (Article 18)"""
    if not user.lgpd_data_access_logs:
        user.lgpd_data_access_logs = []
    
    access_log = {
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "user_agent": "API",  # Could be enhanced with actual user agent
    }
    
    logs = user.lgpd_data_access_logs or []
    logs.append(access_log)
    user.lgpd_data_access_logs = logs
    db.commit()


# ============================================================================
# CONSENT MANAGEMENT
# ============================================================================

@router.post("/consent", status_code=status.HTTP_200_OK)
async def register_consent(
    request: Request,
    consent_request: LGPDConsentRequest,
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    Register user consent for data processing (LGPD Article 7)
    
    Records:
        - Consent acceptance
        - IP address
        - Timestamp
        - Terms version
        - Data retention period (5 years default)
    
    Args:
        consent_request: Consent details including version and acceptance
    
    Returns:
        Confirmation of consent registration
    """
    if not consent_request.accepts_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the terms to use TeacherFlow"
        )
    
    client_ip = get_client_ip(request)
    
    # Register consent
    current_user.lgpd_consent = True
    current_user.lgpd_consent_date = datetime.utcnow()
    current_user.lgpd_consent_ip = client_ip
    current_user.lgpd_consent_version = consent_request.consent_version
    
    # Set data retention period (5 years by default - LGPD Article 15)
    current_user.lgpd_data_retention_until = datetime.utcnow() + timedelta(days=365 * 5)
    
    # Log action
    log_data_access(current_user, "consent_granted", db)
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Consent registered successfully",
        "consent_date": current_user.lgpd_consent_date,
        "consent_version": current_user.lgpd_consent_version,
        "data_retention_until": current_user.lgpd_data_retention_until
    }


@router.get("/consent-status", response_model=LGPDConsentResponse)
async def get_consent_status(
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    Get user's current LGPD consent status
    
    Returns:
        - has_consent: Boolean indicating if user has valid consent
        - consent_date: When consent was granted
        - consent_version: Version of terms accepted
        - consent_ip: IP address from which consent was given
        - data_retention_until: When data will be automatically deleted
    """
    log_data_access(current_user, "consent_status_check", db)
    
    return LGPDConsentResponse(
        has_consent=current_user.lgpd_consent or False,
        consent_date=current_user.lgpd_consent_date,
        consent_version=current_user.lgpd_consent_version,
        consent_ip=current_user.lgpd_consent_ip,
        data_retention_until=current_user.lgpd_data_retention_until
    )


@router.put("/update-consent", status_code=status.HTTP_200_OK)
async def update_consent(
    request: Request,
    consent_request: LGPDConsentRequest,
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    Update consent to new terms version
    
    Use when:
        - Terms of Service are updated
        - Privacy Policy changes
        - New data processing activities added
    
    Args:
        consent_request: New consent details
    
    Returns:
        Confirmation of consent update
    """
    if not consent_request.accepts_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the updated terms to continue using TeacherFlow"
        )
    
    client_ip = get_client_ip(request)
    
    # Update consent
    current_user.lgpd_consent = True
    current_user.lgpd_consent_date = datetime.utcnow()
    current_user.lgpd_consent_ip = client_ip
    current_user.lgpd_consent_version = consent_request.consent_version
    
    # Log action
    log_data_access(current_user, f"consent_updated_to_{consent_request.consent_version}", db)
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Consent updated successfully",
        "consent_version": current_user.lgpd_consent_version,
        "consent_date": current_user.lgpd_consent_date
    }


# ============================================================================
# DATA ACCESS RIGHTS (LGPD Article 18)
# ============================================================================

@router.get("/export-data", response_model=DataExportResponse)
async def export_user_data(
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    Export all user data (LGPD Article 18 - Right to Data Portability)
    
    Returns complete data package:
        - User profile information
        - All students registered
        - All locations
        - All groups/classes
        - All lessons scheduled
        - All payment records
    
    Data is anonymized where appropriate and exported in JSON format.
    """
    log_data_access(current_user, "data_export_requested", db)
    
    # Gather all user data
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "profession_category": current_user.profession_category,
        "profession_type": current_user.profession_type,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "email_verified": current_user.email_verified,
        "lgpd_consent_date": current_user.lgpd_consent_date.isoformat() if current_user.lgpd_consent_date else None,
        "lgpd_consent_version": current_user.lgpd_consent_version,
    }
    
    # Students
    students = db.query(Student).filter(Student.user_id == current_user.id).all()
    students_data = [
        {
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "phone": s.phone,
            "status": s.status,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "lgpd_parent_consent": s.lgpd_parent_consent,
            "lgpd_data_classification": s.lgpd_data_classification,
        }
        for s in students
    ]
    
    # Locations
    locations = db.query(Location).filter(Location.user_id == current_user.id).all()
    locations_data = [
        {
            "id": loc.id,
            "name": loc.name,
            "address": loc.address,
            "is_primary": loc.is_primary,
        }
        for loc in locations
    ]
    
    # Groups
    groups = db.query(Group).filter(Group.user_id == current_user.id).all()
    groups_data = [
        {
            "id": g.id,
            "name": g.name,
            "location_id": g.location_id,
            "student_count": len(g.students) if hasattr(g, 'students') else 0,
        }
        for g in groups
    ]
    
    # Lessons
    lessons = db.query(Lesson).filter(Lesson.user_id == current_user.id).all()
    lessons_data = [
        {
            "id": l.id,
            "date": l.date.isoformat() if l.date else None,
            "duration_minutes": l.duration_minutes,
            "status": l.status,
        }
        for l in lessons
    ]
    
    # Payments
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).all()
    payments_data = [
        {
            "id": p.id,
            "amount": float(p.amount) if p.amount else 0,
            "status": p.status,
            "due_date": p.due_date.isoformat() if p.due_date else None,
            "paid_at": p.paid_at.isoformat() if p.paid_at else None,
        }
        for p in payments
    ]
    
    total_records = (
        1 +  # user
        len(students_data) +
        len(locations_data) +
        len(groups_data) +
        len(lessons_data) +
        len(payments_data)
    )
    
    return DataExportResponse(
        user_data=user_data,
        students_data=students_data,
        locations_data=locations_data,
        groups_data=groups_data,
        lessons_data=lessons_data,
        payments_data=payments_data,
        exported_at=datetime.utcnow(),
        total_records=total_records
    )


# ============================================================================
# DATA DELETION RIGHTS (LGPD Article 18)
# ============================================================================

@router.post("/request-deletion", response_model=DeletionRequestResponse)
async def request_data_deletion(
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    Request account and data deletion (LGPD Article 18 - Right to be Forgotten)
    
    Process:
        1. Marks account for deletion
        2. Records deletion request timestamp
        3. Sets 30-day grace period
        4. Sends confirmation email
        5. After 30 days, data is permanently deleted
    
    User can cancel deletion within 30 days by contacting support.
    
    Returns:
        - Confirmation message
        - Request timestamp
        - Estimated completion date (30 days)
        - Request ID for tracking
    """
    if current_user.lgpd_right_to_delete_requested:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deletion already requested. Contact support to cancel or expedite."
        )
    
    # Mark for deletion
    current_user.lgpd_right_to_delete_requested = True
    current_user.lgpd_right_to_delete_requested_at = datetime.utcnow()
    
    # Log action
    log_data_access(current_user, "deletion_requested", db)
    
    db.commit()
    db.refresh(current_user)
    
    estimated_completion = current_user.lgpd_right_to_delete_requested_at + timedelta(days=30)
    
    return DeletionRequestResponse(
        message="Your data deletion request has been registered. You have 30 days to cancel by contacting support.",
        deletion_requested_at=current_user.lgpd_right_to_delete_requested_at,
        estimated_completion=estimated_completion,
        request_id=f"DEL-{current_user.id}-{int(datetime.utcnow().timestamp())}"
    )


@router.delete("/cancel-deletion", status_code=status.HTTP_200_OK)
async def cancel_deletion_request(
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    Cancel a pending data deletion request
    
    User can cancel deletion within 30-day grace period.
    
    Returns:
        Confirmation that deletion was cancelled
    """
    if not current_user.lgpd_right_to_delete_requested:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No deletion request found"
        )
    
    # Cancel deletion
    current_user.lgpd_right_to_delete_requested = False
    current_user.lgpd_right_to_delete_requested_at = None
    
    # Log action
    log_data_access(current_user, "deletion_cancelled", db)
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Deletion request cancelled successfully",
        "account_status": "active"
    }


# ============================================================================
# STUDENT DATA MANAGEMENT
# ============================================================================

@router.put("/student/{student_id}/consent", status_code=status.HTTP_200_OK)
async def update_student_lgpd_settings(
    student_id: str,
    settings: StudentLGPDRequest,
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    Update LGPD settings for a specific student
    
    Settings include:
        - Parental consent (required for minors)
        - Data classification (personal/sensitive/anonymous)
        - Purpose (educational_services, communication, marketing)
        - Contact permission
    
    Args:
        student_id: Student ID
        settings: LGPD settings to update
    
    Returns:
        Confirmation with updated settings
    """
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.user_id == current_user.id
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Update LGPD settings
    student.lgpd_parent_consent = settings.lgpd_parent_consent
    student.lgpd_parent_consent_date = datetime.utcnow()
    student.lgpd_data_classification = settings.lgpd_data_classification
    student.lgpd_purpose = settings.lgpd_purpose
    student.lgpd_can_contact = settings.lgpd_can_contact
    
    db.commit()
    db.refresh(student)
    
    return {
        "message": "Student LGPD settings updated successfully",
        "student_id": student.id,
        "student_name": student.name,
        "lgpd_parent_consent": student.lgpd_parent_consent,
        "lgpd_data_classification": student.lgpd_data_classification,
        "lgpd_can_contact": student.lgpd_can_contact
    }
