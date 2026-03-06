"""Pydantic schemas for authentication"""
from datetime import datetime
from typing import Literal, Optional
import re
from pydantic import BaseModel, EmailStr, field_validator, ValidationInfo


class LoginRequest(BaseModel):
    """User login credentials"""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """User registration"""
    email: EmailStr
    full_name: str
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str, info: ValidationInfo) -> str:
        """Enforce strong password policy (NIST 800-63B)
        
        Requirements:
        - Minimum 12 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one number
        - At least one special character
        """
        if len(v) < 12:
            raise ValueError('Password must be at least 12 characters long')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)')
        
        return v


class VerifyEmailRequest(BaseModel):
    """Email verification with OTP"""
    email: EmailStr
    code: str


class ResendOTPRequest(BaseModel):
    """Resend OTP code"""
    email: EmailStr


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    """Change password for authenticated user"""
    old_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str, info: ValidationInfo) -> str:
        """Enforce strong password policy"""
        if len(v) < 12:
            raise ValueError('Password must be at least 12 characters long')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        
        return v


class GoogleAuthRequest(BaseModel):
    """Google OAuth payload"""
    id_token: str


class EnableTwoFactorRequest(BaseModel):
    """Enable 2FA"""
    method: Literal["email", "sms", "totp"]
    phone: Optional[str] = None


class VerifyTwoFactorRequest(BaseModel):
    """Verify 2FA challenge"""
    code: str
    method: Optional[Literal["email", "sms", "totp"]] = None


class UserResponse(BaseModel):
    """User response (public info)"""
    id: str
    email: str
    full_name: str
    is_active: bool
    is_admin: bool
    email_verified: bool
    two_factor_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
