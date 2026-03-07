"""Password Recovery Service"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
import secrets
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


class PasswordRecoveryService:
    """Handle password reset workflows"""
    
    @staticmethod
    def generate_reset_token() -> str:
        """Generate a secure 64-character URL-safe token"""
        return secrets.token_urlsafe(48)
    
    @staticmethod
    def generate_reset_code() -> str:
        """Generate a 6-digit code for email verification"""
        return f"{secrets.randbelow(1000000):06d}"
    
    @staticmethod
    def create_reset_request(
        user_id: str,
        ip_address: str,
        db: Session,
        expiry_minutes: int = 60
    ) -> Tuple[str, str]:
        """
        Create a password reset token and code
        Returns: (token, code)
        """
        from app.models import PasswordResetToken
        
        token = PasswordRecoveryService.generate_reset_token()
        code = PasswordRecoveryService.generate_reset_code()
        expires_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)
        
        reset_request = PasswordResetToken(
            user_id=user_id,
            token=token,
            code=code,
            expires_at=expires_at,
            ip_address=ip_address
        )
        
        db.add(reset_request)
        db.commit()
        db.refresh(reset_request)
        
        logger.info(f"Password reset request created for user {user_id}")
        return token, code
    
    @staticmethod
    def verify_reset_token(token: str, db: Session):
        """Verify a reset token by checking if it exists, is not expired, and not used"""
        from app.models import PasswordResetToken
        
        reset_token = db.query(PasswordResetToken).filter(
            and_(
                PasswordResetToken.token == token,
                PasswordResetToken.used == False
            )
        ).first()
        
        if reset_token and reset_token.is_valid():
            return reset_token
        
        return None
    
    @staticmethod
    def verify_reset_code(email: str, code: str, db: Session):
        """Verify a reset code for a user email"""
        from app.models import PasswordResetToken, User
        
        user = db.query(User).filter(User.email == email.lower()).first()
        
        if not user:
            return None
        
        reset_token = db.query(PasswordResetToken).filter(
            and_(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.code == code,
                PasswordResetToken.used == False
            )
        ).first()
        
        if reset_token and reset_token.is_valid():
            return reset_token
        
        return None
    
    @staticmethod
    def mark_token_used(token_id: str, db: Session) -> None:
        """Mark a reset token as used"""
        from app.models import PasswordResetToken
        
        reset_token = db.query(PasswordResetToken).filter(
            PasswordResetToken.id == token_id
        ).first()
        
        if reset_token:
            reset_token.used = True
            reset_token.used_at = datetime.utcnow()
            db.commit()
            logger.info(f"Password reset token {token_id} marked as used")
