"""Pydantic schemas for payments"""
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class PaymentCreate(BaseModel):
    """Create payment"""
    student_id: str
    amount: float
    due_date: date
    currency: str = "BRL"
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None  # cash, card, bank_transfer, pix
    description: Optional[str] = None
    status: str = "PENDING"  # PENDING, PAID, OVERDUE
    reference: Optional[str] = None
    notes: Optional[str] = None
    recurrence: Optional[str] = None  # WEEKLY, BIWEEKLY, MONTHLY, ONCE
    recurrence_end_date: Optional[date] = None  # Até quando repetir


class PaymentUpdate(BaseModel):
    """Update payment"""
    amount: Optional[float] = None
    due_date: Optional[date] = None
    payment_date: Optional[date] = None
    currency: Optional[str] = None
    payment_method: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    reference: Optional[str] = None
    notes: Optional[str] = None
    recurrence: Optional[str] = None
    recurrence_end_date: Optional[date] = None


class PaymentResponse(BaseModel):
    """Payment response"""
    id: str
    teacher_id: str
    student_id: str
    amount: float
    due_date: date
    payment_date: Optional[date]
    currency: str
    payment_method: Optional[str]
    description: Optional[str]
    status: str
    reference: Optional[str]
    notes: Optional[str]
    recurrence: Optional[str]
    recurrence_end_date: Optional[date]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
