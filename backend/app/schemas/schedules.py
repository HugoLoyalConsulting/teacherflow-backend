"""Pydantic schemas for schedules"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ScheduleCreate(BaseModel):
    """Create schedule"""
    group_id: str
    location_id: str
    day_of_week: int  # 0 = Monday, 6 = Sunday
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    notes: Optional[str] = None


class ScheduleUpdate(BaseModel):
    """Update schedule"""
    group_id: Optional[str] = None
    location_id: Optional[str] = None
    day_of_week: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    notes: Optional[str] = None
    active: Optional[bool] = None


class ScheduleResponse(BaseModel):
    """Schedule response"""
    id: str
    teacher_id: str
    group_id: str
    location_id: str
    day_of_week: int
    start_time: str
    end_time: str
    notes: Optional[str]
    active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
