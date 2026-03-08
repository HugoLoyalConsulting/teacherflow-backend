"""
Onboarding API endpoints
Provides profession categories and personalized setup suggestions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models import User
from app.services.onboarding import (
    get_all_categories,
    get_category_details,
    get_suggestions_for_category,
    update_user_profession
)
from app.core.security import get_current_user_obj


router = APIRouter(prefix="/api/onboarding", tags=["Onboarding"])


# Request/Response Models
class CategoryResponse(BaseModel):
    """Profession category"""
    key: str
    name: str
    icon: str
    sub_categories: List[str]


class SuggestionItem(BaseModel):
    """Suggestion item (group or location)"""
    name: str
    hourly_rate: Optional[int] = None
    max_students: Optional[int] = None
    type: Optional[str] = None


class PricingSuggestion(BaseModel):
    """Pricing suggestion"""
    min: int
    max: int
    suggested: int
    unit: str


class CategorySuggestions(BaseModel):
    """Suggestions for a category"""
    groups: List[Dict]
    locations: List[Dict]
    pricing: PricingSuggestion


class CategoryDetailsResponse(BaseModel):
    """Detailed category information"""
    category: str
    icon: str
    suggestions: CategorySuggestions


class UpdateProfessionRequest(BaseModel):
    """Request to update user's profession"""
    category_key: str
    sub_category: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "category_key": "music",
                "sub_category": "Piano"
            }
        }


class UpdateProfessionResponse(BaseModel):
    """Response after updating profession"""
    success: bool
    message: str
    suggestions: Optional[CategoryDetailsResponse] = None


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    """
    Get all available profession categories
    
    Returns list of categories with sub-categories for the onboarding wizard.
    """
    categories = get_all_categories()
    return categories


@router.get("/categories/{category_key}", response_model=CategoryDetailsResponse)
async def get_category(category_key: str):
    """
    Get detailed information and suggestions for a specific category
    
    - **category_key**: Category identifier (music, language, academic, sports, arts, technology, business, wellness)
    
    Returns personalized suggestions including:
    - Suggested group names and pricing
    - Location types
    - Pricing ranges
    """
    suggestions = get_suggestions_for_category(category_key)
    
    if not suggestions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{category_key}' not found"
        )
    
    return suggestions


@router.post("/complete", response_model=UpdateProfessionResponse)
async def complete_onboarding(
    request: UpdateProfessionRequest,
    current_user: User = Depends(get_current_user_obj),
    db: Session = Depends(get_db)
):
    """
    Complete onboarding wizard
    
    Save user's profession and return personalized suggestions.
    
    - **category_key**: Selected category (e.g., 'music', 'language')
    - **sub_category**: Specific profession (e.g., 'Piano', 'Inglês')
    """
    # Validate category exists
    category_details = get_category_details(request.category_key)
    if not category_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category: {request.category_key}"
        )
    
    # Validate sub-category
    if request.sub_category not in category_details["sub_categories"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sub-category: {request.sub_category}"
        )
    
    # Update user's profession
    success = update_user_profession(
        current_user.id,
        request.category_key,
        request.sub_category,
        db
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profession"
        )
    
    # Get suggestions
    suggestions = get_suggestions_for_category(request.category_key)
    
    return UpdateProfessionResponse(
        success=True,
        message=f"Bem-vindo! Configuração inicial para {request.sub_category} salva com sucesso.",
        suggestions=suggestions
    )


@router.get("/status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user_obj)
):
    """
    Check if user has completed onboarding
    
    Returns:
    - completed: Whether onboarding is done
    - profession: User's profession (if completed)
    """
    if current_user.onboarding_completed:
        category = get_category_details(current_user.profession_category) if current_user.profession_category else None
        
        return {
            "completed": True,
            "profession": {
                "category": current_user.profession_category,
                "category_name": category.get("name") if category else None,
                "sub_category": current_user.profession_sub_category,
                "completed_at": current_user.onboarding_completed_at.isoformat() if current_user.onboarding_completed_at else None
            }
        }
    
    return {
        "completed": False,
        "profession": None,
        "next_steps": [
            "Select your profession category",
            "Choose your specialty",
            "Get personalized setup suggestions"
        ]
    }
