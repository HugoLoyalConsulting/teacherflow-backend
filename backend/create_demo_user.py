"""Create demo user manuallywithout bcrypt issues"""
import uuid
from datetime import datetime
import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

try:
    # Check if user exists
    existing = db.query(User).filter(User.email == "professor@teacherflow.com").first()
    if existing:
        print(f"✓ User already exists: {existing.email}")
    else:
        # Create user
        hashed_password = pwd_context.hash("password123")
        user = User(
            id=str(uuid.uuid4()),
            email="professor@teacherflow.com",
            full_name="Prof. João Silva",
            hashed_password=hashed_password,
            is_active=True,
            email_verified=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        print("✓ Demo user created successfully!")
        print(f"  Email: {user.email}")
        print(f"  Password: password123")
        print(f"  ID: {user.id}")
except Exception as e:
    print(f"✗ Error: {e}")
    db.rollback()
finally:
    db.close()
