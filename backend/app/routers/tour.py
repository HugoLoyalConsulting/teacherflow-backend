"""
Interactive Onboarding Tour Router
Manages step-by-step tour progress for new users
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User

router = APIRouter(prefix="/tour", tags=["Interactive Tour"])


# ============================================================================
# SCHEMAS
# ============================================================================

class TourStatusResponse(BaseModel):
    """Tour progress status"""
    tour_completed: bool = Field(..., description="Whether the user completed the tour")
    current_step: int = Field(..., description="Current tour step (0-10)")
    total_steps: int = Field(default=11, description="Total number of tour steps")
    completion_percentage: float = Field(..., description="Tour completion percentage")
    

class UpdateTourStepRequest(BaseModel):
    """Request to update current tour step"""
    step: int = Field(..., ge=0, le=10, description="Tour step number (0-10)")


class CompleteTourRequest(BaseModel):
    """Request to mark tour as completed"""
    completed_at: Optional[datetime] = None


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/status", response_model=TourStatusResponse)
async def get_tour_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current tour progress for the logged-in user
    
    Returns:
        - tour_completed: Boolean indicating tour completion
        - current_step: Current step number (0-10)
        - total_steps: Total steps in tour (11)
        - completion_percentage: Progress as percentage
    """
    tour_completed = current_user.interactive_tour_completed or False
    current_step = current_user.interactive_tour_step or 0
    total_steps = 11
    
    completion_percentage = (current_step / total_steps) * 100 if not tour_completed else 100.0
    
    return TourStatusResponse(
        tour_completed=tour_completed,
        current_step=current_step,
        total_steps=total_steps,
        completion_percentage=round(completion_percentage, 2)
    )


@router.post("/step", status_code=status.HTTP_200_OK)
async def update_tour_step(
    request: UpdateTourStepRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current tour step for the user
    
    Args:
        step: Step number to set (0-10)
    
    Returns:
        Success message with updated step
    """
    if current_user.interactive_tour_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tour already completed. Use POST /tour/reset to restart."
        )
    
    current_user.interactive_tour_step = request.step
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": f"Tour step updated to {request.step}",
        "current_step": current_user.interactive_tour_step,
        "tour_completed": current_user.interactive_tour_completed
    }


@router.post("/complete", status_code=status.HTTP_200_OK)
async def complete_tour(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark the tour as completed for the user
    
    Sets:
        - interactive_tour_completed = True
        - interactive_tour_step = 10 (final step)
    
    Returns:
        Success message with completion status
    """
    if current_user.interactive_tour_completed:
        return {
            "message": "Tour was already completed",
            "tour_completed": True,
            "current_step": current_user.interactive_tour_step
        }
    
    current_user.interactive_tour_completed = True
    current_user.interactive_tour_step = 10  # Final step
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Congratulations! Tour completed successfully! 🎉",
        "tour_completed": True,
        "current_step": current_user.interactive_tour_step
    }


@router.post("/skip", status_code=status.HTTP_200_OK)
async def skip_tour(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Skip the tour (mark as completed without going through all steps)
    
    Useful when:
        - User clicks "Skip Tour" button
        - User already knows the platform
        - User wants to explore on their own
    
    Returns:
        Success message confirming tour was skipped
    """
    current_user.interactive_tour_completed = True
    current_user.interactive_tour_step = 0  # Reset to 0 to indicate skipped
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Tour skipped. You can restart it anytime from Settings.",
        "tour_completed": True,
        "skipped": True
    }


@router.post("/reset", status_code=status.HTTP_200_OK)
async def reset_tour(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reset the tour to start from beginning
    
    Useful when:
        - User wants to see the tour again
        - Tour was skipped and user changed their mind
        - Testing purposes
    
    Returns:
        Success message confirming tour was reset
    """
    current_user.interactive_tour_completed = False
    current_user.interactive_tour_step = 0
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Tour reset successfully. Refresh the page to start again.",
        "tour_completed": False,
        "current_step": 0
    }


# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@router.post("/admin/reset-user/{user_id}", status_code=status.HTTP_200_OK)
async def admin_reset_user_tour(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Reset tour for a specific user
    
    Requires:
        - is_admin = True
    
    Args:
        user_id: Target user's ID
    
    Returns:
        Success message with target user info
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    target_user.interactive_tour_completed = False
    target_user.interactive_tour_step = 0
    db.commit()
    
    return {
        "message": f"Tour reset for user {target_user.email}",
        "user_id": target_user.id,
        "email": target_user.email,
        "tour_completed": False
    }
