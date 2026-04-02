"""
One-shot migration: activate users that were registered while
AUTH_REQUIRE_EMAIL_VERIFICATION=False but were never activated
because is_active was hardcoded to False.

Run once on Railway with:
    railway run python backend/scripts/activate_unverified_users.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from datetime import datetime
from app.core.database import SessionLocal
from app.models import User

db = SessionLocal()
try:
    inactive = db.query(User).filter(User.is_active == False).all()
    print(f"Found {len(inactive)} inactive user(s).")
    for u in inactive:
        u.is_active = True
        u.email_verified = True
        u.email_verified_at = u.email_verified_at or datetime.utcnow()
        print(f"  Activated: {u.email}")
    db.commit()
    print("Done.")
finally:
    db.close()
