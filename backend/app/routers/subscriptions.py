"""Subscription router"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.services.subscription_service import SubscriptionService
from app.schemas.subscription import (
    SubscriptionTier,
    Subscription,
    SubscriptionCreate,
    SubscriptionPayment,
    SubscriptionPaymentCreate,
    UsageStats,
    SubscriptionWithUsage,
    TierComparison
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/tiers", response_model=List[SubscriptionTier])
def get_subscription_tiers(db: Session = Depends(get_db)):
    """Get all available subscription tiers"""
    service = SubscriptionService(db)
    tiers = service.get_all_tiers()
    return tiers


@router.get("/tiers/compare", response_model=TierComparison)
def compare_tiers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare all tiers with user's current tier"""
    service = SubscriptionService(db)
    tiers = service.get_all_tiers()
    
    current_subscription = service.get_user_subscription(current_user.id)
    current_tier = current_subscription.tier if current_subscription else None
    
    # Recommend upgrade if needed
    usage = service.get_usage_stats(current_user.id)
    recommended_tier = None
    
    if usage.students_limit and usage.students_count >= usage.students_limit * 0.8:
        # User is at 80% capacity, recommend upgrade
        for tier in tiers:
            if tier.tier_key != (current_tier.tier_key if current_tier else "free"):
                if tier.max_students is None or tier.max_students > usage.students_count:
                    recommended_tier = tier
                    break
    
    return TierComparison(
        tiers=tiers,
        current_tier=current_tier,
        recommended_tier=recommended_tier
    )


@router.get("/current", response_model=SubscriptionWithUsage)
def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current subscription with usage stats"""
    service = SubscriptionService(db)
    
    subscription = service.get_user_subscription(current_user.id)
    if not subscription:
        # Return free tier default
        free_tier = service.get_tier_by_key("free")
        if not free_tier:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Free tier not configured"
            )
        
        # Create temporary subscription object
        from app.models import Subscription as SubscriptionModel
        subscription = SubscriptionModel(
            id="temp",
            user_id=current_user.id,
            tier_id=free_tier.id,
            status="active",
            tier=free_tier,
            cancel_at_period_end=False
        )
    
    usage = service.get_usage_stats(current_user.id)
    
    return SubscriptionWithUsage(
        subscription=subscription,
        usage=usage,
        can_create_student=service.check_can_create_student(current_user.id),
        can_add_user=True,
        can_create_location=service.check_can_create_location(current_user.id),
        can_create_group=service.check_can_create_group(current_user.id)
    )


@router.get("/usage", response_model=UsageStats)
def get_usage_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current usage statistics"""
    service = SubscriptionService(db)
    return service.get_usage_stats(current_user.id)


@router.post("/create", response_model=Subscription, status_code=status.HTTP_201_CREATED)
def create_subscription(
    data: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or upgrade subscription"""
    service = SubscriptionService(db)
    
    # Check if upgrading
    existing = service.get_user_subscription(current_user.id)
    if existing and existing.status == "active":
        # This is an upgrade
        subscription = service.upgrade_subscription(current_user, data.tier_key)
    else:
        # This is a new subscription
        subscription = service.create_subscription(current_user, data)
    
    return subscription


@router.post("/cancel", response_model=Subscription)
def cancel_subscription(
    immediate: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel subscription (immediate or at period end)"""
    service = SubscriptionService(db)
    return service.cancel_subscription(current_user, immediate=immediate)


@router.post("/reactivate", response_model=Subscription)
def reactivate_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reactivate cancelled subscription"""
    service = SubscriptionService(db)
    return service.reactivate_subscription(current_user)


@router.get("/payments", response_model=List[SubscriptionPayment])
def get_payment_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment history"""
    service = SubscriptionService(db)
    return service.get_payment_history(current_user.id, limit=limit)


@router.post("/payments", response_model=SubscriptionPayment, status_code=status.HTTP_201_CREATED)
def create_payment(
    data: SubscriptionPaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create payment for subscription"""
    service = SubscriptionService(db)
    
    subscription = service.get_user_subscription(current_user.id)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    return service.create_payment(subscription.id, data)
