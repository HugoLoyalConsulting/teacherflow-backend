"""Startup preflight checks for production deploys."""
from sqlalchemy import create_engine, text

from app.core.config import settings


def _require_env() -> None:
    missing = []
    if not settings.DATABASE_URL:
        missing.append("DATABASE_URL")
    if not settings.SECRET_KEY:
        missing.append("SECRET_KEY")

    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")


def _check_database_connection() -> None:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))


def run_preflight() -> None:
    print("[preflight] checking required environment variables...")
    _require_env()
    print("[preflight] testing database connectivity...")
    _check_database_connection()
    print("[preflight] ok")


if __name__ == "__main__":
    run_preflight()