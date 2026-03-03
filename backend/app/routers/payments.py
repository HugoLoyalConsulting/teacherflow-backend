"""Payments routes"""
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.core.security import verify_token
from app.models import Payment, Student
from app.schemas.payments import PaymentCreate, PaymentUpdate, PaymentResponse
from app.services.payment_recurrence import generate_recurring_payments

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/", response_model=list[PaymentResponse])
async def list_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    student_id: str = None,
    date_from: date = None,
    date_to: date = None,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """List payments for current user"""
    query = db.query(Payment).filter(Payment.teacher_id == user_id)
    
    if student_id:
        query = query.filter(Payment.student_id == student_id)
    if date_from:
        query = query.filter(Payment.due_date >= date_from)
    if date_to:
        query = query.filter(Payment.due_date <= date_to)
    
    payments = query.offset(skip).limit(limit).all()
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get payment by ID"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.teacher_id == user_id
    ).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    return payment


@router.post("/", response_model=PaymentResponse)
async def create_payment(
    request: PaymentCreate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Create new payment (or payment series if recurrence is set)"""
    # Verify student belongs to user
    student = db.query(Student).filter(
        Student.id == request.student_id,
        Student.teacher_id == user_id
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check if reference already exists
    if request.reference:
        existing = db.query(Payment).filter(
            Payment.reference == request.reference
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment reference already exists"
            )
    
    # Generate recurring payments if needed
    payments_to_create = generate_recurring_payments(
        base_payment=None,
        teacher_id=user_id,
        student_id=request.student_id,
        amount=request.amount,
        recurrence=request.recurrence or 'ONCE',
        due_date=request.due_date,
        recurrence_end_date=request.recurrence_end_date,
        currency=request.currency,
        payment_date=request.payment_date,
        payment_method=request.payment_method,
        description=request.description,
        status=request.status,
        reference=request.reference,
        notes=request.notes,
    )
    
    # Add all payments to database
    for payment in payments_to_create:
        db.add(payment)
    
    db.commit()
    
    # Return the first payment created
    if payments_to_create:
        db.refresh(payments_to_create[0])
        return payments_to_create[0]
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create payment"
    )


@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: str,
    request: PaymentUpdate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update payment"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.teacher_id == user_id
    ).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(payment, key, value)
    
    db.commit()
    db.refresh(payment)
    return payment


@router.delete("/{payment_id}")
async def delete_payment(
    payment_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Delete payment"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.teacher_id == user_id
    ).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    db.delete(payment)
    db.commit()
    return {"message": "Payment deleted successfully"}
