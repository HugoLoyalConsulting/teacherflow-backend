"""Seed QA users in all environments — idempotent, safe to run on every startup."""
import os
import uuid
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import User
from app.security import PasswordManager

logger = logging.getLogger(__name__)

_QA_USERS = [
    {"email": "qa.teacher@teacherflow.app", "full_name": "QA Teacher", "is_admin": False},
    {"email": "qa.admin@teacherflow.app",   "full_name": "QA Admin",   "is_admin": True},
]


def seed_qa_users(db: Session) -> None:
    """Create QA users if they don't exist. Credential comes from QA_SEED_KEY env var."""
    qa_cred = os.getenv("QA_SEED_KEY", "TeacherFlow2026!QA")
    pw_hash = PasswordManager.hash_password(qa_cred)
    created = 0
    for data in _QA_USERS:
        if db.query(User).filter(User.email == data["email"]).first():
            continue
        attrs: dict = {
            "id": str(uuid.uuid4()),
            "email": data["email"],
            "full_name": data["full_name"],
            "is_active": True,
            "is_admin": data["is_admin"],
            "email_verified": True,
            "email_verified_at": datetime.utcnow(),
        }
        attrs["hashed_password"] = pw_hash
        db.add(User(**attrs))
        created += 1

    if created:
        db.commit()
        logger.info(f"✓ {created} QA user(s) seeded")
    else:
        logger.info("✓ QA users already present — skipping")
