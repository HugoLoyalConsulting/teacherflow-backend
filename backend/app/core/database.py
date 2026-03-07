"""Database configuration and session management"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Engine configuration with robust connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.SQLALCHEMY_ECHO,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,  # Number of connections to maintain in the pool
    max_overflow=20,  # Additional connections that can be created on demand
    pool_recycle=3600,  # Recycle connections after 1 hour (Neon default timeout)
    pool_timeout=30,  # Timeout waiting for a connection
    connect_args={
        "connect_timeout": 10,  # Connection timeout in seconds
        "options": "-c timezone=America/Sao_Paulo"  # Set timezone for all connections
    }
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

# Base class for models
Base = declarative_base()


def get_db() -> Session:
    """Dependency to get database session with automatic cleanup"""
    db = SessionLocal()
    try:
        yield db
        db.commit()  # Commit by default if no exception
    except Exception:
        db.rollback()  # Rollback on error
        raise
    finally:
        db.close()
