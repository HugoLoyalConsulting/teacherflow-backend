"""
Email verification service
Handles 6-digit verification codes with expiration and rate limiting
"""
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models import User, VerificationCode
from app.core.email import send_verification_email


def generate_verification_code() -> str:
    """
    Generate a 4-digit verification code
    
    Returns:
        4-digit string (e.g., '1234')
    """
    return ''.join(secrets.choice(string.digits) for _ in range(4))


def create_verification_code(user_id: str, db: Session) -> str:
    """
    Create and store a new verification code for user
    Invalidates any existing codes
    
    Args:
        user_id: User UUID
        db: Database session
    
    Returns:
        4-digit verification code
    """
    # Invalidate existing codes for this user
    db.query(VerificationCode).filter(
        VerificationCode.user_id == user_id,
        VerificationCode.is_valid == True
    ).update({'is_valid': False})
    
    # Generate new code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Store in database
    verification = VerificationCode(
        user_id=user_id,
        code=code,
        expires_at=expires_at,
        attempts=0,
        is_valid=True,
        created_at=datetime.utcnow()
    )
    db.add(verification)
    db.commit()
    
    return code


def send_verification_code(user_id: str, email: str, db: Session) -> dict:
    """
    Generate and send verification code via email
    
    Args:
        user_id: User UUID
        email: User email address
        db: Database session
    
    Returns:
        {
            'success': bool,
            'message': str,
            'expires_in_minutes': int
        }
    """
    # Generate code
    code = create_verification_code(user_id, db)
    
    # Send email
    try:
        send_verification_email(email, code)
        return {
            'success': True,
            'message': 'Código de verificação enviado com sucesso',
            'expires_in_minutes': 10
        }
    except Exception as e:
        print(f"❌ Erro ao enviar email: {e}")
        return {
            'success': False,
            'message': 'Erro ao enviar email. Tente novamente.',
            'error': str(e)
        }


def verify_code(user_id: str, code: str, db: Session) -> dict:
    """
    Verify a 4-digit code
    
    Validation rules:
    - Code must exist and be valid
    - Not expired (< 10 minutes)
    - Max 3 attempts
    
    Args:
        user_id: User UUID
        code: 4-digit code to verify
        db: Database session
    
    Returns:
        {
            'valid': bool,
            'message': str,
            'attempts_remaining': int | None
        }
    """
    # Find active verification code
    verification = db.query(VerificationCode).filter(
        VerificationCode.user_id == user_id,
        VerificationCode.is_valid == True
    ).order_by(VerificationCode.created_at.desc()).first()
    
    if not verification:
        return {
            'valid': False,
            'message': 'Código não encontrado. Solicite um novo código.',
            'attempts_remaining': None
        }
    
    # Check if expired
    if datetime.utcnow() > verification.expires_at:
        verification.is_valid = False
        db.commit()
        return {
            'valid': False,
            'message': 'Código expirado. Solicite um novo código.',
            'attempts_remaining': None
        }
    
    # Check attempts limit
    if verification.attempts >= 3:
        verification.is_valid = False
        db.commit()
        return {
            'valid': False,
            'message': 'Máximo de tentativas excedido. Solicite um novo código.',
            'attempts_remaining': 0
        }
    
    # Increment attempts
    verification.attempts += 1
    db.commit()
    
    # Verify code
    if verification.code == code:
        # Success!
        verification.is_valid = False
        verification.verified_at = datetime.utcnow()
        
        # Mark user as verified
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.email_verified = True
            user.email_verified_at = datetime.utcnow()
        
        db.commit()
        
        return {
            'valid': True,
            'message': 'Email verificado com sucesso!',
            'attempts_remaining': None
        }
    else:
        # Wrong code
        attempts_remaining = 3 - verification.attempts
        return {
            'valid': False,
            'message': f'Código incorreto. {attempts_remaining} tentativa(s) restante(s).',
            'attempts_remaining': attempts_remaining
        }


def resend_verification_code(user_id: str, email: str, db: Session) -> dict:
    """
    Resend verification code (generates new code)
    Rate limiting: Max 5 codes per hour
    
    Args:
        user_id: User UUID
        email: User email
        db: Database session
    
    Returns:
        {
            'success': bool,
            'message': str,
            'rate_limited': bool
        }
    """
    # Check rate limiting (max 5 codes in last hour)
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_codes = db.query(VerificationCode).filter(
        VerificationCode.user_id == user_id,
        VerificationCode.created_at >= one_hour_ago
    ).count()
    
    if recent_codes >= 5:
        return {
            'success': False,
            'message': 'Limite de códigos atingido. Aguarde 1 hora.',
            'rate_limited': True
        }
    
    # Send new code
    result = send_verification_code(user_id, email, db)
    result['rate_limited'] = False
    return result


def check_verification_status(user_id: str, db: Session) -> dict:
    """
    Check if user has verified their email
    
    Returns:
        {
            'verified': bool,
            'verified_at': datetime | None,
            'pending_verification': bool,
            'last_code_sent': datetime | None
        }
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return {
            'verified': False,
            'verified_at': None,
            'pending_verification': False,
            'last_code_sent': None
        }
    
    # Check for pending verification code
    latest_code = db.query(VerificationCode).filter(
        VerificationCode.user_id == user_id,
        VerificationCode.is_valid == True
    ).order_by(VerificationCode.created_at.desc()).first()
    
    return {
        'verified': user.email_verified,
        'verified_at': user.email_verified_at,
        'pending_verification': latest_code is not None,
        'last_code_sent': latest_code.created_at if latest_code else None
    }
