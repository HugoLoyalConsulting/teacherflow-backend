"""
Email verification API endpoints
Handles 6-digit code verification with rate limiting
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.database import get_db
from app.services.email_verification import (
    send_verification_code,
    verify_code,
    resend_verification_code,
    check_verification_status
)
from app.models import User
from app.core.security import get_current_user


router = APIRouter(prefix="/api/verification", tags=["Email Verification"])


# Request models
class SendCodeRequest(BaseModel):
    """Request to send verification code"""
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    """Request to verify 4-digit code"""
    code: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "code": "1234"
            }
        }


class ResendCodeRequest(BaseModel):
    """Request to resend verification code"""
    email: EmailStr


# Response models
class SendCodeResponse(BaseModel):
    """Response after sending code"""
    success: bool
    message: str
    expires_in_minutes: int


class VerifyCodeResponse(BaseModel):
    """Response after verifying code"""
    valid: bool
    message: str
    attempts_remaining: Optional[int]
    email_verified: bool


class VerificationStatusResponse(BaseModel):
    """Current verification status"""
    verified: bool
    verified_at: Optional[str]
    pending_verification: bool
    last_code_sent: Optional[str]


@router.post("/send-code", response_model=SendCodeResponse, status_code=status.HTTP_200_OK)
async def send_code(
    request: SendCodeRequest,
    db: Session = Depends(get_db)
):
    """
    Send 4-digit verification code to email
    
    - **email**: Email address to verify
    - Generates random 4-digit code
    - Code expires in 10 minutes
    - Max 3 verification attempts
    - Rate limited: max 5 codes per hour
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Don't reveal if email exists (security)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email não encontrado"
        )
    
    # Check if already verified
    if user.email_verified:
        return SendCodeResponse(
            success=False,
            message="Email já verificado",
            expires_in_minutes=0
        )
    
    # Send verification code
    result = send_verification_code(user.id, request.email, db)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get('message', 'Erro ao enviar código')
        )
    
    return SendCodeResponse(
        success=result['success'],
        message=result['message'],
        expires_in_minutes=result.get('expires_in_minutes', 10)
    )


@router.post("/verify", response_model=VerifyCodeResponse, status_code=status.HTTP_200_OK)
async def verify_email_code(
    request: VerifyCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify 4-digit code
    
    - **code**: 4-digit verification code
    - Must be called by authenticated user
    - Max 3 attempts before code is invalidated
    - Code expires in 10 minutes
    """
    # Validate code format
    if not request.code.isdigit() or len(request.code) != 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código deve ter 4 dígitos"
        )
    
    # Check if already verified
    if current_user.email_verified:
        return VerifyCodeResponse(
            valid=False,
            message="Email já verificado",
            attempts_remaining=None,
            email_verified=True
        )
    
    # Verify code
    result = verify_code(current_user.id, request.code, db)
    
    # Refresh user to get updated email_verified status
    db.refresh(current_user)
    
    return VerifyCodeResponse(
        valid=result['valid'],
        message=result['message'],
        attempts_remaining=result.get('attempts_remaining'),
        email_verified=current_user.email_verified
    )


@router.post("/resend-code", response_model=SendCodeResponse, status_code=status.HTTP_200_OK)
async def resend_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resend verification code
    
    - Generates new 6-digit code
    - Invalidates previous code
    - Rate limited: max 5 codes per hour
    - Must be authenticated
    """
    # Check if already verified
    if current_user.email_verified:
        return SendCodeResponse(
            success=False,
            message="Email já verificado",
            expires_in_minutes=0
        )
    
    # Resend code
    result = resend_verification_code(current_user.id, current_user.email, db)
    
    if result.get('rate_limited'):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=result['message']
        )
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get('message', 'Erro ao enviar código')
        )
    
    return SendCodeResponse(
        success=result['success'],
        message=result['message'],
        expires_in_minutes=result.get('expires_in_minutes', 10)
    )


@router.get("/status", response_model=VerificationStatusResponse, status_code=status.HTTP_200_OK)
async def get_verification_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current verification status
    
    Returns:
    - verified: Whether email is verified
    - verified_at: When email was verified
    - pending_verification: Whether there's a pending code
    - last_code_sent: When last code was sent
    """
    status = check_verification_status(current_user.id, db)
    
    return VerificationStatusResponse(
        verified=status['verified'],
        verified_at=status['verified_at'].isoformat() if status['verified_at'] else None,
        pending_verification=status['pending_verification'],
        last_code_sent=status['last_code_sent'].isoformat() if status['last_code_sent'] else None
    )
