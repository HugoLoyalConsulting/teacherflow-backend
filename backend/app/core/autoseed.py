"""
Auto-seed for production environment
Populates database with realistic data if it's empty or has unrealistic data
"""
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base, User, Payment
from app.seeds.seed_realistic import seed_realistic_data


def check_if_needs_reseed(db: Session) -> bool:
    """
    Check if database needs to be reseeded because data is unrealistic
    
    Returns True if:
    - Database is empty (no users), OR
    - There are too many overdue payments (> 10 payments > 30 days old)
    """
    from datetime import datetime, timedelta
    
    # Check 1: Empty database
    user_count = db.query(User).count()
    if user_count == 0:
        return True
    
    # Check 2: Too many overdue payments (unrealistic)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    overdue_payments = db.query(Payment).filter(
        Payment.status == "pending",
        Payment.due_date < thirty_days_ago
    ).count()
    
    if overdue_payments > 10:
        print(f"\n⚠️  Found {overdue_payments} overdue payments (> 30 days old)")
        print("   This is unrealistic demo data - will reseed with fresh data")
        return True
    
    return False


def auto_seed_if_empty():
    """
    Automatically run realistic seed if database is empty or has unrealistic data
    This runs on deployment if needed
    
    Controlled by ENABLE_AUTOSEED environment variable:
    - production: ENABLE_AUTOSEED=false (database starts empty)
    - staging/qa: ENABLE_AUTOSEED=true (auto-populate with demo data)
    """
    # Check if auto-seeding is enabled
    if not os.getenv("ENABLE_AUTOSEED", "true").lower() == "true":
        print("\n✓ Auto-seed disabled (ENABLE_AUTOSEED=false) - production mode")
        return
    
    db = SessionLocal()
    try:
        needs_reseed = check_if_needs_reseed(db)
        
        if needs_reseed:
            # Database needs seeding
            print("\n" + "="*60)
            print("🌱 RUNNING AUTOMATIC SEED WITH REALISTIC DATA")
            print("="*60)
            print("\nCreating realistic data: 20 students, 4 groups, etc...\n")
            
            seed_realistic_data(db)
            
            print("\n" + "="*60)
            print("✅ AUTO-SEED COMPLETED!")
            print("="*60)
            print("\nYour database now has:")
            print("  • 20 students distributed in 4 groups")
            print("  • Groups: Iniciantes (R$50/h), Intermediário (R$60/h),")
            print("            Avançado (R$70/h), Especializado (R$80/h)")
            print("  • Monthly payments: R$200, R$240, R$280, R$320 (4 classes/month)")
            print("\n📊 Realistic Distribution:")
            print("  • 70% with paid status (14 students)")
            print("  • 20% with pending recent payments (4 students)")
            print("  • 8% overdue < 30 days (1-2 students)")
            print("  • 2% paused > 60 days (1 student)")
            print("\nYou can verify this in:")
            print("  GET https://backend-production-c4f8f.up.railway.app/api/v1/dashboard/statistics")
            print("="*60 + "\n")
        else:
            # Database already has realistic data
            user_count = db.query(User).count()
            user_count_msg = f"{user_count} user" if user_count == 1 else f"{user_count} users"
            print(f"\n✓ Database has realistic data ({user_count_msg} found)")
    
    except Exception as e:
        print(f"\n⚠️  Auto-seed check failed: {e}")
        import traceback
        traceback.print_exc()
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
