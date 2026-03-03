"""
Auto-seed for production environment
Populates database with realistic data if it's empty
"""
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base, User
from app.seeds.seed_realistic import seed_realistic_data


def auto_seed_if_empty():
    """
    Automatically run realistic seed if database is empty
    This runs ONCE on first deployment to Render
    """
    db = SessionLocal()
    try:
        # Check if database has any users (sign it was seeded)
        user_count = db.query(User).count()
        
        if user_count == 0:
            # Database is empty - seed it
            print("\n" + "="*60)
            print("🌱 DATABASE IS EMPTY - RUNNING AUTOMATIC SEED")
            print("="*60)
            print("\nThis happens ONLY once on first deployment!")
            print("Creating realistic data: 20 students, 4 groups, etc...\n")
            
            seed_realistic_data(db)
            
            print("\n" + "="*60)
            print("✅ AUTO-SEED COMPLETED!")
            print("="*60)
            print("\nYour database now has:")
            print("  • 20 students distributed in 4 groups")
            print("  • Groups: Iniciantes (R$70), Intermediário (R$80),")
            print("            Avançado (R$90), Especializado (R$100)")
            print("  • 3 students marked as PAUSED (60+ days without payment)")
            print("  • Total pending: R$ 2.400")
            print("\nYou can see this in:")
            print("  GET https://teacherflow-backend.onrender.com/api/v1/dashboard/paused-students")
            print("="*60 + "\n")
        else:
            # Database already has data
            user_count_msg = f"{user_count} user" if user_count == 1 else f"{user_count} users"
            print(f"\n✓ Database already seeded ({user_count_msg} found)")
    
    except Exception as e:
        print(f"\n⚠️  Auto-seed check failed: {e}")
        # Don't crash the app if seed fails - just continue
    
    finally:
        db.close()


def setup_database():
    """
    Setup database (DEPRECATED - use Alembic instead)
    Kept for backwards compatibility
    """
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"⚠️  Database setup failed: {e}")
