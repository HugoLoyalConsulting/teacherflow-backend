"""Pydantic schemas for authentication"""
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """User login credentials"""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """User registration"""
    email: EmailStr
    full_name: str
    password: str


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
