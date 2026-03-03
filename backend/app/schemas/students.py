"""Pydantic schemas for students"""
from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional


class StudentCreate(BaseModel):
    """Create student"""
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    notes: Optional[str] = None


class StudentUpdate(BaseModel):
    """Update student"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    profile_type: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None


class StudentResponse(BaseModel):
    """Student response"""
    id: str
    teacher_id: str
    name: str
    email: Optional[str]
    phone: Optional[str]
    date_of_birth: Optional[date]
    profile_type: str
    payment_status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
