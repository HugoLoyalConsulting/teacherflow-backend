"""Application configuration"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "TeacherFlow"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/teacherflow"
    SQLALCHEMY_ECHO: bool = False
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5176",
        "http://localhost:3000",
        "https://teacherflow-app.vercel.app",
        "https://teacherflow.vercel.app",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
