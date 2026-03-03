"""Schedules routes"""
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models import Schedule, Group, Location
from app.schemas.schedules import ScheduleCreate, ScheduleUpdate, ScheduleResponse

router = APIRouter(prefix="/schedules", tags=["schedules"])


@router.get("/", response_model=list[ScheduleResponse])
async def list_schedules(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """List all schedules for current user"""
    schedules = (
        db.query(Schedule)
        .filter(Schedule.teacher_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return schedules


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(
    schedule_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get schedule by ID"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.teacher_id == user_id
    ).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    return schedule


@router.post("/", response_model=ScheduleResponse)
async def create_schedule(
    request: ScheduleCreate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Create new schedule"""
    # Verify group and location belong to user
    group = db.query(Group).filter(
        Group.id == request.group_id,
        Group.teacher_id == user_id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    location = db.query(Location).filter(
        Location.id == request.location_id,
        Location.teacher_id == user_id
    ).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    schedule = Schedule(
        id=str(uuid.uuid4()),
        teacher_id=user_id,
        **request.model_dump()
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: str,
    request: ScheduleUpdate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update schedule"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.teacher_id == user_id
    ).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(schedule, key, value)
    
    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/{schedule_id}")
async def delete_schedule(
    schedule_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Delete schedule"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.teacher_id == user_id
    ).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    db.delete(schedule)
    db.commit()
    return {"message": "Schedule deleted successfully"}
