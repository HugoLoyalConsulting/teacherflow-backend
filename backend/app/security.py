"""Advanced security utilities for TeacherFlow"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets
import pyotp
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasswordManager:
    """Gerenciar hashes de senha com bcrypt"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash de password com bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verificar password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def generate_temp_password(length: int = 16) -> str:
        """Gerar senha temporária segura"""
        return secrets.token_urlsafe(length)


class JWTManager:
    """Gerenciar JWT tokens com refresh rotation"""
    
    @staticmethod
    def create_access_token(
        subject: str,
        user_id: str,
        email: str,
        expires_delta: Optional[timedelta] = None,
        additional_claims: Optional[Dict[str, Any]] = None
    ) -> tuple[str, int]:
        """
        Criar JWT access token
        Returns: (token, expires_in_seconds)
        """
        if expires_delta is None:
            expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        expire = datetime.utcnow() + expires_delta
        to_encode = {
            "sub": subject,
            "user_id": user_id,
            "email": email,
            "type": "access",
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        
        if additional_claims:
            to_encode.update(additional_claims)
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        expires_in = int(expires_delta.total_seconds())
        return encoded_jwt, expires_in
    
    @staticmethod
    def create_refresh_token(
        subject: str,
        user_id: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Criar JWT refresh token (validade maior)"""
        if expires_delta is None:
            expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        expire = datetime.utcnow() + expires_delta
        to_encode = {
            "sub": subject,
            "user_id": user_id,
            "type": "refresh",
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
        """
        Verificar e decodificar JWT token
        token_type: "access" ou "refresh"
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            
            # Verificar tipo de token
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid token type: expected {token_type}",
                )
            
            return payload
            
        except JWTError as e:
            logger.warning(f"JWT verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )


class OTPManager:
    """Gerenciar OTP (One-Time Passwords) para 2FA"""
    
    @staticmethod
    def generate_otp_code(length: int = 6) -> str:
        """Gerar código OTP de 6 dígitos"""
        return str(secrets.randbelow(10 ** length)).zfill(length)
    
    @staticmethod
    def generate_totp_secret(name: str, issuer: str = "TeacherFlow") -> str:
        """Gerar secret TOTP para apps como Google Authenticator"""
        return pyotp.random_base32()
    
    @staticmethod
    def get_totp_uri(secret: str, name: str, issuer: str = "TeacherFlow") -> str:
        """Obter URI para QR code"""
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=name, issuer_name=issuer)
    
    @staticmethod
    def verify_totp_code(secret: str, code: str, window: int = 1) -> bool:
        """Verificar código TOTP com tolerância de ±1 janela de tempo"""
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=window)
    
    @staticmethod
    def generate_backup_codes(count: int = 10) -> list[str]:
        """Gerar códigos de backup (formato: XXXX-XXXX)"""
        codes = []
        for _ in range(count):
            code = secrets.token_hex(4).upper()  # 8 caracteres hex
            formatted = f"{code[:4]}-{code[4:]}"
            codes.append(formatted)
        return codes
    
    @staticmethod
    def verify_backup_code(code: str, stored_hashes: list[str]) -> bool:
        """Verificar se código de backup é válido"""
        # Normalizar código
        normalized = code.upper().replace("-", "")
        
        for stored_hash in stored_hashes:
            if pwd_context.verify(normalized, stored_hash):
                return True
        return False


class SecurityAudit:
    """Logging de eventos de segurança"""
    
    @staticmethod
    def log_auth_event(
        user_id: Optional[str],
        action: str,
        status: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Log de evento de autenticação
        action: login, logout, password_change, 2fa_enabled, account_locked, etc
        status: success, failed, blocked, suspicious
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": action,
            "status": status,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "details": details or {}
        }
        
        # Log em nível apropriado
        if status == "suspicious" or status == "blocked":
            logger.warning(f"Security event: {log_entry}")
        elif status == "failed":
            logger.info(f"Auth failure: {log_entry}")
        else:
            logger.info(f"Auth event: {action} - {status}")
        
        # TODO: Salvar em database para auditoria


class RateLimiter:
    """Rate limiting básico em memória (usar Redis em produção)"""
    
    _attempts: Dict[str, list[datetime]] = {}
    
    @classmethod
    def check_rate_limit(
        cls,
        identifier: str,  # email ou IP
        max_attempts: int = 5,
        window_seconds: int = 900  # 15 min
    ) -> bool:
        """
        Verificar se identificador excedeu limite de tentativas
        Returns: True se OK, False se rate limited
        """
        now = datetime.utcnow()
        
        if identifier not in cls._attempts:
            cls._attempts[identifier] = []
        
        # Remover tentativas fora da janela
        cls._attempts[identifier] = [
            t for t in cls._attempts[identifier]
            if (now - t).seconds < window_seconds
        ]
        
        # Verificar limite
        if len(cls._attempts[identifier]) >= max_attempts:
            return False  # Rate limited
        
        # Adicionar tentativa atual
        cls._attempts[identifier].append(now)
        return True  # OK
    
    @classmethod
    def reset_limit(cls, identifier: str):
        """Resetar contador após autenticação bem-sucedida"""
        if identifier in cls._attempts:
            cls._attempts[identifier] = []


class EmailVerification:
    """Gerenciar verificação de email"""
    
    # Em produção, usar Redis
    _pending_verifications: Dict[str, Dict[str, Any]] = {}
    
    @classmethod
    def create_verification(
        cls,
        email: str,
        expires_in_minutes: int = 15
    ) -> str:
        """Criar código de verificação e retornar código"""
        code = OTPManager.generate_otp_code()
        
        cls._pending_verifications[email] = {
            "code": code,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=expires_in_minutes),
            "attempts": 0
        }
        
        return code
    
    @classmethod
    def verify_code(cls, email: str, code: str, max_attempts: int = 3) -> bool:
        """Verificar código com limite de tentativas"""
        if email not in cls._pending_verifications:
            return False
        
        verification = cls._pending_verifications[email]
        
        # Verificar expiração
        if datetime.utcnow() > verification["expires_at"]:
            del cls._pending_verifications[email]
            return False
        
        # Verificar limite de tentativas
        if verification["attempts"] >= max_attempts:
            return False
        
        verification["attempts"] += 1
        
        # Verificar código
        if verification["code"] == code:
            del cls._pending_verifications[email]
            return True
        
        return False
    
    @classmethod
    def delete_verification(cls, email: str):
        """Deletar verificação pendente"""
        if email in cls._pending_verifications:
            del cls._pending_verifications[email]
