"""Locations routes"""
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models import Location
from app.schemas.locations import LocationCreate, LocationUpdate, LocationResponse

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/", response_model=list[LocationResponse])
async def list_locations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """List all locations for current user"""
    locations = (
        db.query(Location)
        .filter(Location.teacher_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return locations


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get location by ID"""
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.teacher_id == user_id
    ).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    return location


@router.post("/", response_model=LocationResponse)
async def create_location(
    request: LocationCreate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Create new location"""
    location = Location(
        id=str(uuid.uuid4()),
        teacher_id=user_id,
        **request.model_dump()
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.put("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: str,
    request: LocationUpdate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update location"""
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.teacher_id == user_id
    ).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(location, key, value)
    
    db.commit()
    db.refresh(location)
    return location


@router.delete("/{location_id}")
async def delete_location(
    location_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Delete location"""
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.teacher_id == user_id
    ).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    db.delete(location)
    db.commit()
    return {"message": "Location deleted successfully"}
