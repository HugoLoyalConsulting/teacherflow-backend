"""Application configuration"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "TeacherFlow"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/teacherflow"
    SQLALCHEMY_ECHO: bool = False
    
    # JWT (NO DEFAULT - REQUIRED IN ENV)
    SECRET_KEY: str  # Must be set in environment, no default for security
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5176",
        "http://localhost:5173",
        "http://localhost:3000",
        "https://frontend-production-a7c5.up.railway.app",
    ]
    
    # Monitoring & Telemetry
    SENTRY_ENABLED: bool = False
    SENTRY_DSN: str = ""
    
    POSTHOG_ENABLED: bool = False
    POSTHOG_API_KEY: str = ""
    POSTHOG_HOST: str = "https://app.posthog.com"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
