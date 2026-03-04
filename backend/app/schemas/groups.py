"""Pydantic schemas for groups"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class GroupCreate(BaseModel):
    """Create group"""
    name: str
    location_id: str
    description: Optional[str] = None
    hourly_rate: Optional[float] = 50.0
    max_students: Optional[int] = None


class GroupUpdate(BaseModel):
    """Update group"""
    name: Optional[str] = None
    location_id: Optional[str] = None
    description: Optional[str] = None
    hourly_rate: Optional[float] = None
    max_students: Optional[int] = None
    active: Optional[bool] = None


class GroupResponse(BaseModel):
    """Group response"""
    id: str
    teacher_id: str
    location_id: str
    name: str
    description: Optional[str]
    hourly_rate: Optional[float]
    max_students: Optional[int]
    active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
