"""Advanced Authentication Routes - Enterprise Security"""
import uuid
import logging
from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import EmailStr
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models import User
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest,
    UserResponse, VerifyEmailRequest, ResendOTPRequest,
    ChangePasswordRequest, EnableTwoFactorRequest, VerifyTwoFactorRequest,
    GoogleAuthRequest
)
from app.security import (
    PasswordManager, JWTManager, OTPManager, SecurityAudit,
    RateLimiter, EmailVerification
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


# ============================================================================
# REGISTRO & EMAIL VERIFICATION
# ============================================================================

@router.post("/register", response_model=dict)
async def register(
    request: RegisterRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Registro de novo usuário com verificação de email
    
    Flow:
    1. Validar dados
    2. Criar usuário com email_verified=False
    3. Enviar OTP via email
    4. Cliente chama /auth/verify-email com OTP
    """
    
    email = request.email.lower()
    ip_address = req.client.host if req.client else None
    
    # Rate limiting: max 5 registros por IP em 15 min
    if not RateLimiter.check_rate_limit(ip_address, max_attempts=5):
        SecurityAudit.log_auth_event(
            user_id=None,
            action="register",
            status="blocked",
            ip_address=ip_address,
            details={"reason": "rate_limit_exceeded"}
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas tentativas. Tente novamente em 15 minutos.",
        )
    
    # Verificar se email já existe
    existing_user = db.query(User).filter(
        User.email == email
    ).first()
    
    if existing_user:
        SecurityAudit.log_auth_event(
            user_id=None,
            action="register",
            status="failed",
            ip_address=ip_address,
            details={"reason": "email_already_exists"}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já está registrado.",
        )
    
    # Criar novo usuário (não ativo até verificar email)
    user = User(
        id=str(uuid.uuid4()),
        email=email,
        full_name=request.full_name,
        hashed_password=PasswordManager.hash_password(request.password),
        is_active=False,  # Ativar após verificação de email
        email_verified=False,
        created_ip=ip_address,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Gerar OTP e enviar por email
    otp_code = EmailVerification.create_verification(email)
    
    # TODO: Implementar envio de email real via SMTP
    logger.info(f"OTP para {email}: {otp_code}")  # Apenas para dev
    
    SecurityAudit.log_auth_event(
        user_id=user.id,
        action="register",
        status="success",
        ip_address=ip_address,
    )
    
    return {
        "message": "Usuário criado!  Confira seu email para confirmar.",
        "email": email,
        "otp_code": otp_code if settings.DEBUG else None,  # Apenas em dev
    }


@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(
    request: VerifyEmailRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Verificar email com código OTP
    
    Após validado:
    - Ativar usuário
    - Retornar tokens JWT
    """
    
    email = request.email.lower()
    ip_address = req.client.host if req.client else None
    
    # Rate limiting: max 10 tentativas por email em 15 min
    if not RateLimiter.check_rate_limit(f"verify_email:{email}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas tentativas. Tente novamente em 15 minutos.",
        )
    
    # Buscar usuário
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )
    
    # Verificar código OTP
    if not EmailVerification.verify_code(email, request.code):
        SecurityAudit.log_auth_event(
            user_id=user.id,
            action="verify_email",
            status="failed",
            ip_address=ip_address,
            details={"reason": "invalid_otp"}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido ou expirado.",
        )
    
    # Ativar usuário
    user.email_verified = True
    user.is_active = True
    db.commit()
    
    # Resetar rate limiter
    RateLimiter.reset_limit(f"verify_email:{email}")
    
    # Gerar tokens
    access_token, expires_in = JWTManager.create_access_token(
        subject=email,
        user_id=user.id,
        email=email
    )
    refresh_token = JWTManager.create_refresh_token(
        subject=email,
        user_id=user.id
    )
    
    SecurityAudit.log_auth_event(
        user_id=user.id,
        action="verify_email",
        status="success",
        ip_address=ip_address,
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=UserResponse.from_orm(user)
    )


@router.post("/resend-otp")
async def resend_otp(
    request: ResendOTPRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Reenviar código OTP para email"""
    
    email = request.email.lower()
    ip_address = req.client.host if req.client else None
    
    # Rate limiting: max 3 pedidos por email em 15 min
    if not RateLimiter.check_rate_limit(f"resend_otp:{email}", max_attempts=3):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitos pedidos. Espere 15 minutos.",
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )
    
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já verificado.",
        )
    
    # Gerar novo OTP
    otp_code = EmailVerification.create_verification(email)
    
    logger.info(f"OTP reenviado para {email}: {otp_code}")
    
    return {
        "message": "Novo código enviado para seu email.",
        "otp_code": otp_code if settings.DEBUG else None,
    }


# ============================================================================
# LOGIN & TOKENS
# ============================================================================

@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Login com email e senha
    
    Segurança:
    - Rate limiting por email
    - Auditoria de tentativas falhadas
    - Verificação de email obrigatória
    - Verificar 2FA se habilitado
    """
    
    email = request.email.lower()
    ip_address = req.client.host if req.client else None
    user_agent = req.headers.get("user-agent")
    
    # Rate limiting: max 5 tentativas por email em 15 min
    if not RateLimiter.check_rate_limit(f"login:{email}"):
        SecurityAudit.log_auth_event(
            user_id=None,
            action="login",
            status="blocked",
            ip_address=ip_address,
            details={"reason": "rate_limit_exceeded", "email": email}
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas tentativas de login. Tente novamente em 15 minutos.",
        )
    
    # Buscar usuário
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Log falha mas não revela se email existe
        SecurityAudit.log_auth_event(
            user_id=None,
            action="login",
            status="failed",
            ip_address=ip_address,
            details={"reason": "user_not_found"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos.",
        )
    
    # Verificar se email foi validado
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email não verificado. Verifique seu email.",
        )
    
    # Verificar senha
    if not PasswordManager.verify_password(request.password, user.hashed_password):
        SecurityAudit.log_auth_event(
            user_id=user.id,
            action="login",
            status="failed",
            ip_address=ip_address,
            details={"reason": "invalid_password", "email": email}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos.",
        )
    
    # Verificar se usuário ativo
    if not user.is_active:
        SecurityAudit.log_auth_event(
            user_id=user.id,
            action="login",
            status="blocked",
            ip_address=ip_address,
            details={"reason": "user_inactive"}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo.",
        )
    
    # TODO: Implementar verificação de 2FA aqui
    # if user.two_factor_enabled:
    #     return {"message": "2FA required", "requires_2fa": True}
    
    # Resetar rate limiter
    RateLimiter.reset_limit(f"login:{email}")
    
    # Gerar tokens
    access_token, expires_in = JWTManager.create_access_token(
        subject=email,
        user_id=user.id,
        email=email
    )
    refresh_token = JWTManager.create_refresh_token(
        subject=email,
        user_id=user.id
    )
    
    SecurityAudit.log_auth_event(
        user_id=user.id,
        action="login",
        status="success",
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=UserResponse.from_orm(user)
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Refresh access token usando refresh token
    
    Implementa refresh token rotation (segurança aprimorada)
    """
    
    ip_address = req.client.host if req.client else None
    
    try:
        payload = JWTManager.verify_token(request.refresh_token, token_type="refresh")
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
        )
    
    user_id = payload.get("user_id")
    email = payload.get("sub")
    
    # Buscar usuário
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.email != email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado.",
        )
    
    # Gerar novos tokens (refresh token rotation)
    access_token, expires_in = JWTManager.create_access_token(
        subject=email,
        user_id=user_id,
        email=email
    )
    new_refresh_token = JWTManager.create_refresh_token(
        subject=email,
        user_id=user_id
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=expires_in,
        user=UserResponse.from_orm(user)
    )


# ============================================================================
# MUDANÇA & RESET DE SENHA
# ============================================================================

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user_id: str = Depends(lambda: None),  # TODO: Adicionar dependency de auth
    db: Session = Depends(get_db)
):
    """Mudar senha (usuário logado)"""
    
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado.",
        )
    
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )
    
    # Verificar senha antiga
    if not PasswordManager.verify_password(request.old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha atual incorreta.",
        )
    
    # Atualizar senha
    user.hashed_password = PasswordManager.hash_password(request.new_password)
    db.commit()
    
    SecurityAudit.log_auth_event(
        user_id=user.id,
        action="password_change",
        status="success",
    )
    
    return {"message": "Senha alterada com sucesso."}


@router.post("/forgot-password")
async def forgot_password(
    request: Request,
    email: EmailStr,
    db: Session = Depends(get_db)
):
    """
    Request password reset
    Sends email with reset code and link
    """
    from app.services.password_recovery import PasswordRecoveryService
    from app.models.password_reset import PasswordResetToken
    
    email_lower = email.lower()
    ip_address = request.client.host if request.client else None
    
    # Find user
    user = db.query(User).filter(User.email == email_lower).first()
    
    # Always return success (don't reveal if email exists - security)
    if not user:
        return {
            "success": True,
            "message": "Se o email está registrado, você receberá instruções para resetar a senha."
        }
    
    # Create reset token and code
    token, code = PasswordRecoveryService.create_reset_request(
        user_id=user.id,
        ip_address=ip_address,
        db=db
    )
    
    # TODO: Send email with reset link and code
    # Reset link: https://app.teacherflow.app/reset-password?token={token}
    # Reset code: {code} (6 digits)
    
    logger.info(f"Password reset requested for {email_lower}")
    logger.debug(f"Reset token: {token}, code: {code}")  # Remove in production
    
    return {
        "success": True,
        "message": "Se o email está registrado, você receberá instruções para resetar a senha.",
        "debug_code": code if settings.DEBUG else None  # Only in debug mode
    }


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """
    Reset password using token from email link
    """
    from app.services.password_recovery import PasswordRecoveryService
    from app.security import PasswordManager
    
    # Verify token
    reset_token = PasswordRecoveryService.verify_reset_token(token, db)
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    # Get user
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Update password
    user.hashed_password = PasswordManager.hash_password(new_password)
    user.password_changed_at = datetime.utcnow()
    
    # Mark token as used
    PasswordRecoveryService.mark_token_used(reset_token.id, db)
    
    # Log security event
    SecurityAudit.log_auth_event(
        user_id=user.id,
        action="password_reset",
        status="success",
        ip_address=reset_token.ip_address
    )
    
    db.commit()
    
    return {
        "success": True,
        "message": "Senha alterada com sucesso"
    }


@router.post("/verify-reset-code")
async def verify_reset_code(
    email: EmailStr,
    code: str,
    db: Session = Depends(get_db)
):
    """
    Verify reset code and return token for password reset
    Alternative to email link - user enters 6-digit code
    """
    from app.services.password_recovery import PasswordRecoveryService
    
    email_lower = email.lower()
    
    # Verify code
    reset_token = PasswordRecoveryService.verify_reset_code(email_lower, code, db)
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido ou expirado"
        )
    
    # Return token for subsequent reset-password call
    return {
        "success": True,
        "token": reset_token.token,
        "message": "Código verificado com sucesso"
    }


# ============================================================================
# GOOGLE OAUTH2
# ============================================================================

@router.post("/google", response_model=TokenResponse)
async def google_auth(
    request: GoogleAuthRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Autenticação com Google OAuth2
    
    Cliente envia id_token do Google
    Backend verifica assinatura e cria/atualiza usuário
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    
    ip_address = req.client.host if req.client else None
    
    try:
        # Verify Google ID token
        # This validates the token signature against Google's public keys
        idinfo = id_token.verify_oauth2_token(
            request.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        # Extract user info from token
        google_id = idinfo['sub']
        email = idinfo.get('email', '').lower()
        name = idinfo.get('name', '')
        email_verified = idinfo.get('email_verified', False)
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email não encontrado no token do Google"
            )
        
        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user with Google auth
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                full_name=name or email.split('@')[0],
                hashed_password=PasswordManager.hash_password(secrets.token_urlsafe(32)),  # Random password
                google_id=google_id,
                google_email=email,
                email_verified=True,  # Google already verified
                is_active=True,
                created_ip=ip_address,
                lgpd_consent=True,  # Assume consent via Google
                lgpd_consent_date=datetime.utcnow(),
                lgpd_consent_ip=ip_address
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            SecurityAudit.log_auth_event(
                user_id=user.id,
                action="google_register",
                status="success",
                ip_address=ip_address
            )
        else:
            # Update existing user with Google ID if not set
            if not user.google_id:
                user.google_id = google_id
                user.google_email = email
                user.email_verified = True
                user.is_active = True
            
            user.last_login_at = datetime.utcnow()
            user.last_login_ip = ip_address
            user.failed_login_attempts = 0
            
            db.commit()
            db.refresh(user)
            
            SecurityAudit.log_auth_event(
                user_id=user.id,
                action="google_login",
                status="success",
                ip_address=ip_address
            )
        
        # Generate JWT tokens
        access_token, expires_in = JWTManager.create_access_token(
            subject=email,
            user_id=user.id,
            email=email
        )
        refresh_token = JWTManager.create_refresh_token(
            subject=email,
            user_id=user.id
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            user=UserResponse.from_orm(user)
        )
    
    except ValueError as e:
        # Token validation failed
        logger.error(f"Google token validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token do Google inválido"
        )
    except Exception as e:
        logger.error(f"Google auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao autenticar com Google"
        )


# ============================================================================
# 2FA (Two-Factor Authentication)
# ============================================================================

@router.post("/2fa/enable")
async def enable_2fa(
    request: EnableTwoFactorRequest,
    current_user_id: str = Depends(lambda: None),
    db: Session = Depends(get_db)
):
    """Habilitar 2FA (TOTP, Email ou SMS)"""
    
    if not current_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    # TODO: Implementar 2FA
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="2FA ainda não implementado.",
    )


@router.post("/2fa/verify")
async def verify_2fa(request: VerifyTwoFactorRequest):
    """Verificar código 2FA durante login"""
    # TODO: Implementar
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="2FA ainda não implementado.",
    )


# ============================================================================
# HEALTH & UTILITIES
# ============================================================================

@router.get("/health")
async def auth_health():
    """Health check do serviço de auth"""
    return {"status": "online", "service": "auth"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter informações do usuário autenticado"""
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )
    return UserResponse.from_orm(user)
