"""Database configuration and session management"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Use SSL only for public proxy URLs; private Railway hostnames don't need it
_is_internal = ".railway.internal" in settings.DATABASE_URL
_sslmode = "prefer" if _is_internal else "require"

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.SQLALCHEMY_ECHO,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_timeout=30,
    connect_args={
        "connect_timeout": 10,
        "options": "-c timezone=America/Sao_Paulo",
        "sslmode": _sslmode,
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
