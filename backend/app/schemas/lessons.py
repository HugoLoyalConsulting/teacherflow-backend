"""Pydantic schemas for lessons"""
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, Dict


class LessonCreate(BaseModel):
    """Create lesson"""
    schedule_id: str
    description: Optional[str] = None
    lesson_date: date
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    notes: Optional[str] = None


class LessonUpdate(BaseModel):
    """Update lesson"""
    description: Optional[str] = None
    lesson_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    status: Optional[str] = None  # scheduled, completed, cancelled
    notes: Optional[str] = None


class LessonAttendanceUpdate(BaseModel):
    """Update lesson attendance"""
    attendance_data: Dict[str, bool]  # {student_id: attended}
    status: Optional[str] = None


class LessonResponse(BaseModel):
    """Lesson response"""
    id: str
    teacher_id: str
    schedule_id: str
    description: Optional[str]
    lesson_date: date
    start_time: str
    end_time: str
    status: str
    attendance_data: Dict
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
