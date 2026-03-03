"""Groups routes"""
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models import Group, Location
from app.schemas.groups import GroupCreate, GroupUpdate, GroupResponse

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("/", response_model=list[GroupResponse])
async def list_groups(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """List all groups for current user"""
    groups = (
        db.query(Group)
        .filter(Group.teacher_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return groups


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(
    group_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get group by ID"""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.teacher_id == user_id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    return group


@router.post("/", response_model=GroupResponse)
async def create_group(
    request: GroupCreate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Create new group"""
    # Verify location belongs to user
    location = db.query(Location).filter(
        Location.id == request.location_id,
        Location.teacher_id == user_id
    ).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    group = Group(
        id=str(uuid.uuid4()),
        teacher_id=user_id,
        **request.model_dump()
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.put("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: str,
    request: GroupUpdate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update group"""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.teacher_id == user_id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # If location_id is being updated, verify it belongs to user
    if request.location_id:
        location = db.query(Location).filter(
            Location.id == request.location_id,
            Location.teacher_id == user_id
        ).first()
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )
    
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(group, key, value)
    
    db.commit()
    db.refresh(group)
    return group


@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Delete group"""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.teacher_id == user_id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    db.delete(group)
    db.commit()
    return {"message": "Group deleted successfully"}
