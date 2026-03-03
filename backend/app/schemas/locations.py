"""Pydantic schemas for locations"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LocationCreate(BaseModel):
    """Create location"""
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    capacity: Optional[int] = None
    notes: Optional[str] = None


class LocationUpdate(BaseModel):
    """Update location"""
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    capacity: Optional[int] = None
    notes: Optional[str] = None


class LocationResponse(BaseModel):
    """Location response"""
    id: str
    teacher_id: str
    name: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    postal_code: Optional[str]
    capacity: Optional[int]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
