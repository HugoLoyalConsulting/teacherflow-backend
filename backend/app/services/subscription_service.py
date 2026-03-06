"""Subscription service"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, timedelta
import uuid
from decimal import Decimal

from app.models import (
    User,
    Subscription,
    SubscriptionTier,
    SubscriptionPayment,
    Student,
    Group,
    Location
)
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionPaymentCreate,
    UsageStats
)
from fastapi import HTTPException, status


class SubscriptionService:
    def __init__(self, db: Session):
        self.db = db

    # Tier Management
    def get_tier_by_key(self, tier_key: str) -> Optional[SubscriptionTier]:
        """Get tier by key (free, pro, premium)"""
        return self.db.query(SubscriptionTier).filter(
            SubscriptionTier.tier_key == tier_key,
            SubscriptionTier.is_active == True
        ).first()

    def get_all_tiers(self) -> List[SubscriptionTier]:
        """Get all active tiers ordered by sort_order"""
        return self.db.query(SubscriptionTier).filter(
            SubscriptionTier.is_active == True
        ).order_by(SubscriptionTier.sort_order).all()

    def seed_subscription_tiers(self):
        """Seed default subscription tiers"""
        tiers_data = [
            {
                "id": str(uuid.uuid4()),
                "name": "Gratuito",
                "tier_key": "free",
                "description": "Plano gratuito com recursos básicos",
                "price_monthly_brl": Decimal("0.00"),
                "price_yearly_brl": Decimal("0.00"),
                "max_students": 30,
                "max_users": 1,
                "max_locations": 2,
                "max_groups": 5,
                "storage_gb": 1,
                "features": {
                    "student_management": True,
                    "class_scheduling": True,
                    "payment_tracking": True,
                    "whatsapp_charges": False,
                    "automated_reports": False,
                    "custom_branding": False,
                    "api_access": False,
                    "multi_location": False,
                    "advanced_analytics": False,
                    "priority_support": False
                },
                "is_active": True,
                "sort_order": 1
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Profissional",
                "tier_key": "pro",
                "description": "Para professores estabelecidos com mais alunos",
                "price_monthly_brl": Decimal("49.00"),
                "price_yearly_brl": Decimal("470.00"),  # 2 months free
                "max_students": 100,
                "max_users": 3,
                "max_locations": 5,
                "max_groups": 20,
                "storage_gb": 10,
                "features": {
                    "student_management": True,
                    "class_scheduling": True,
                    "payment_tracking": True,
                    "whatsapp_charges": True,
                    "automated_reports": True,
                    "custom_branding": False,
                    "api_access": False,
                    "multi_location": True,
                    "advanced_analytics": True,
                    "priority_support": False
                },
                "is_active": True,
                "sort_order": 2
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Premium",
                "tier_key": "premium",
                "description": "Para escolas e grandes operações",
                "price_monthly_brl": Decimal("99.00"),
                "price_yearly_brl": Decimal("950.00"),  # 2 months free
                "max_students": None,  # Unlimited
                "max_users": 10,
                "max_locations": None,  # Unlimited
                "max_groups": None,  # Unlimited
                "storage_gb": 100,
                "features": {
                    "student_management": True,
                    "class_scheduling": True,
                    "payment_tracking": True,
                    "whatsapp_charges": True,
                    "automated_reports": True,
                    "custom_branding": True,
                    "api_access": True,
                    "multi_location": True,
                    "advanced_analytics": True,
                    "priority_support": True,
                    "white_label": True,
                    "dedicated_account_manager": True
                },
                "is_active": True,
                "sort_order": 3
            }
        ]

        for tier_data in tiers_data:
            existing = self.db.query(SubscriptionTier).filter(
                SubscriptionTier.tier_key == tier_data["tier_key"]
            ).first()
            
            if not existing:
                tier = SubscriptionTier(**tier_data)
                self.db.add(tier)
        
        self.db.commit()

    # Subscription Management
    def get_user_subscription(self, user_id: str) -> Optional[Subscription]:
        """Get user's active subscription"""
        return self.db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).order_by(Subscription.created_at.desc()).first()

    def create_subscription(
        self,
        user: User,
        data: SubscriptionCreate
    ) -> Subscription:
        """Create new subscription for user"""
        # Get tier
        tier = self.get_tier_by_key(data.tier_key)
        if not tier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subscription tier '{data.tier_key}' not found"
            )

        # Check if user already has active subscription
        existing = self.get_user_subscription(user.id)
        if existing and existing.status == "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription"
            )

        # Calculate trial period
        trial_start = None
        trial_end = None
        if data.trial_days and data.trial_days > 0:
            trial_start = datetime.utcnow()
            trial_end = trial_start + timedelta(days=data.trial_days)

        # Create subscription
        subscription = Subscription(
            id=str(uuid.uuid4()),
            user_id=user.id,
            tier_id=tier.id,
            status="trialing" if trial_start else "active",
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30),
            trial_start=trial_start,
            trial_end=trial_end,
            metadata={"payment_method": data.payment_method}
        )
        
        self.db.add(subscription)
        
        # Update user
        user.subscription_id = subscription.id
        
        self.db.commit()
        self.db.refresh(subscription)
        
        return subscription

    def upgrade_subscription(
        self,
        user: User,
        new_tier_key: str
    ) -> Subscription:
        """Upgrade user's subscription"""
        current_sub = self.get_user_subscription(user.id)
        if not current_sub:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found"
            )

        new_tier = self.get_tier_by_key(new_tier_key)
        if not new_tier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tier '{new_tier_key}' not found"
            )

        # Check if it's actually an upgrade
        if new_tier.price_monthly_brl <= current_sub.tier.price_monthly_brl:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New tier must be higher than current tier"
            )

        # Update subscription
        current_sub.tier_id = new_tier.id
        current_sub.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(current_sub)
        
        return current_sub

    def cancel_subscription(
        self,
        user: User,
        immediate: bool = False
    ) -> Subscription:
        """Cancel user's subscription"""
        subscription = self.get_user_subscription(user.id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found"
            )

        if immediate:
            subscription.status = "cancelled"
            subscription.cancelled_at = datetime.utcnow()
        else:
            subscription.cancel_at_period_end = True
        
        self.db.commit()
        self.db.refresh(subscription)
        
        return subscription

    def reactivate_subscription(self, user: User) -> Subscription:
        """Reactivate cancelled subscription"""
        subscription = self.get_user_subscription(user.id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No subscription found"
            )

        if subscription.status != "cancelled" and not subscription.cancel_at_period_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subscription is not cancelled"
            )

        subscription.cancel_at_period_end = False
        subscription.cancelled_at = None
        subscription.status = "active"
        
        self.db.commit()
        self.db.refresh(subscription)
        
        return subscription

    # Usage Tracking
    def get_usage_stats(self, user_id: str) -> UsageStats:
        """Calculate current usage vs limits"""
        subscription = self.get_user_subscription(user_id)
        if not subscription:
            # Return free tier limits
            free_tier = self.get_tier_by_key("free")
            return UsageStats(
                students_count=0,
                students_limit=free_tier.max_students if free_tier else 30,
                users_count=1,
                users_limit=1,
                locations_count=0,
                locations_limit=2,
                groups_count=0,
                groups_limit=5,
                storage_used_mb=0.0,
                storage_limit_gb=1
            )

        tier = subscription.tier

        # Count resources
        students_count = self.db.query(func.count(Student.id)).filter(
            Student.teacher_id == user_id
        ).scalar()

        locations_count = self.db.query(func.count(Location.id)).filter(
            Location.teacher_id == user_id
        ).scalar()

        groups_count = self.db.query(func.count(Group.id)).filter(
            Group.teacher_id == user_id
        ).scalar()

        # TODO: Calculate actual storage usage
        storage_used_mb = 0.0

        return UsageStats(
            students_count=students_count or 0,
            students_limit=tier.max_students,
            users_count=1,  # TODO: Count actual users when multi-user implemented
            users_limit=tier.max_users,
            locations_count=locations_count or 0,
            locations_limit=tier.max_locations,
            groups_count=groups_count or 0,
            groups_limit=tier.max_groups,
            storage_used_mb=storage_used_mb,
            storage_limit_gb=tier.storage_gb
        )

    def check_can_create_student(self, user_id: str) -> bool:
        """Check if user can create more students"""
        usage = self.get_usage_stats(user_id)
        if usage.students_limit is None:
            return True  # Unlimited
        return usage.students_count < usage.students_limit

    def check_can_create_location(self, user_id: str) -> bool:
        """Check if user can create more locations"""
        usage = self.get_usage_stats(user_id)
        if usage.locations_limit is None:
            return True  # Unlimited
        return usage.locations_count < usage.locations_limit

    def check_can_create_group(self, user_id: str) -> bool:
        """Check if user can create more groups"""
        usage = self.get_usage_stats(user_id)
        if usage.groups_limit is None:
            return True  # Unlimited
        return usage.groups_count < usage.groups_limit

    # Payment Management
    def create_payment(
        self,
        subscription_id: str,
        data: SubscriptionPaymentCreate
    ) -> SubscriptionPayment:
        """Create payment record"""
        payment = SubscriptionPayment(
            id=str(uuid.uuid4()),
            subscription_id=subscription_id,
            amount=data.amount,
            currency="BRL",
            status="pending",
            payment_method=data.payment_method
        )
        
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        
        return payment

    def mark_payment_paid(self, payment_id: str) -> SubscriptionPayment:
        """Mark payment as paid"""
        payment = self.db.query(SubscriptionPayment).filter(
            SubscriptionPayment.id == payment_id
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )

        payment.status = "paid"
        payment.paid_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(payment)
        
        return payment

    def get_payment_history(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[SubscriptionPayment]:
        """Get user's payment history"""
        subscription = self.get_user_subscription(user_id)
        if not subscription:
            return []

        return self.db.query(SubscriptionPayment).filter(
            SubscriptionPayment.subscription_id == subscription.id
        ).order_by(SubscriptionPayment.created_at.desc()).limit(limit).all()
