"""
Administrative endpoints for demo data management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_obj
from app.models import User
from app.seeds.seed_realistic import seed_realistic_data

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/reset-demo-data")
async def reset_demo_data(
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    🔄 Reset demo data with realistic distribution
    
    **Admin only endpoint** - Requires admin privileges
    **QA/Staging only** - Blocked in production environment
    
    This will:
    - Clear all existing data (students, payments, groups, etc.)
    - Populate with realistic demo data:
      - 20 students in 4 groups
      - 70% paid, 20% pending, 8% overdue, 2% paused
      - Realistic pricing (R$50-80/hour)
    
    **WARNING**: This is DESTRUCTIVE - all data will be deleted!
    
    Use this to:
    - Reset demo environment
    - Clear old unrealistic data
    - Refresh for demos/presentations
    """
    import os
    
    # Block in production environment
    environment = os.getenv("ENVIRONMENT", "development")
    if environment == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo data reset is disabled in production environment for safety"
        )
    
    # Verify admin privileges
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can reset demo data"
        )
    
    try:
        print("\n" + "="*60)
        print("🔄 ADMIN: Manually resetting demo data...")
        print(f"   Initiated by: {current_user.email}")
        print("="*60 + "\n")
        
        # Run the realistic seed
        seed_realistic_data(db)
        
        print("\n" + "="*60)
        print("✅ DEMO DATA RESET COMPLETED!")
        print("="*60 + "\n")
        
        return {
            "success": True,
            "message": "Demo data reset successfully with realistic distribution",
            "details": {
                "students": 20,
                "groups": 4,
                "distribution": {
                    "paid": "70% (14 students)",
                    "pending": "20% (4 students)",
                    "overdue": "8% (1-2 students)",
                    "paused": "2% (1 student)"
                },
                "pricing": {
                    "iniciantes": "R$ 50/hour",
                    "intermediario": "R$ 60/hour",
                    "avancado": "R$ 70/hour",
                    "especializado": "R$ 80/hour"
                }
            }
        }
        
    except Exception as e:
        print(f"\n❌ Failed to reset demo data: {e}\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset demo data: {str(e)}"
        )


@router.get("/demo-status")
async def check_demo_status(
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    Check current demo data status
    
    Returns statistics about current data in the database
    """
    from app.models import Student, Payment, Group
    from datetime import datetime, timedelta
    
    try:
        # Count students
        total_students = db.query(Student).count()
        paused_students = db.query(Student).filter(Student.is_paused == True).count()
        
        # Count groups
        total_groups = db.query(Group).count()
        
        # Count payments by status
        paid_payments = db.query(Payment).filter(Payment.status == "paid").count()
        pending_payments = db.query(Payment).filter(Payment.status == "pending").count()
        
        # Count overdue payments
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        overdue_payments = db.query(Payment).filter(
            Payment.status == "pending",
            Payment.due_date < thirty_days_ago
        ).count()
        
        return {
            "students": {
                "total": total_students,
                "active": total_students - paused_students,
                "paused": paused_students
            },
            "groups": {
                "total": total_groups
            },
            "payments": {
                "paid": paid_payments,
                "pending": pending_payments,
                "overdue_30_days": overdue_payments
            },
            "needs_reset": overdue_payments > 10,
            "message": f"Database has {'UNREALISTIC' if overdue_payments > 10 else 'REALISTIC'} data"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check demo status: {str(e)}"
        )
