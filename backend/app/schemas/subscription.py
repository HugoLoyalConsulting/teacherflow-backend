"""Subscription schemas"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from decimal import Decimal

# Subscription Tier Schemas
class SubscriptionTierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    tier_key: str = Field(..., min_length=1, max_length=20)
    description: Optional[str] = None
    price_monthly_brl: Decimal = Field(..., ge=0)
    price_yearly_brl: Optional[Decimal] = Field(None, ge=0)
    max_students: Optional[int] = Field(None, ge=0)
    max_users: int = Field(1, ge=1)
    max_locations: Optional[int] = Field(None, ge=0)
    max_groups: Optional[int] = Field(None, ge=0)
    storage_gb: int = Field(1, ge=1)
    features: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True
    sort_order: int = 0


class SubscriptionTier(SubscriptionTierBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Subscription Schemas
class SubscriptionBase(BaseModel):
    tier_id: str
    status: str = Field(..., pattern="^(active|cancelled|past_due|trialing)$")


class SubscriptionCreate(BaseModel):
    tier_key: str = Field(..., min_length=1)
    payment_method: Optional[str] = Field(None, pattern="^(credit_card|pix|boleto)$")
    trial_days: Optional[int] = Field(None, ge=0, le=30)


class Subscription(SubscriptionBase):
    id: str
    user_id: str
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool
    cancelled_at: Optional[datetime] = None
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata_json")
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Nested
    tier: SubscriptionTier

    class Config:
        from_attributes = True


# Subscription Payment Schemas
class SubscriptionPaymentBase(BaseModel):
    subscription_id: str
    amount: Decimal = Field(..., gt=0)
    currency: str = Field("BRL", min_length=3, max_length=3)
    status: str = Field(..., pattern="^(pending|paid|failed|refunded)$")
    payment_method: Optional[str] = None


class SubscriptionPaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    payment_method: str = Field(..., pattern="^(credit_card|pix|boleto)$")


class SubscriptionPayment(SubscriptionPaymentBase):
    id: str
    stripe_payment_intent_id: Optional[str] = None
    stripe_invoice_id: Optional[str] = None
    failure_reason: Optional[str] = None
    paid_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata_json")
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Usage Schemas
class UsageStats(BaseModel):
    students_count: int
    students_limit: Optional[int]
    users_count: int
    users_limit: int
    locations_count: int
    locations_limit: Optional[int]
    groups_count: int
    groups_limit: Optional[int]
    storage_used_mb: float
    storage_limit_gb: int
    
    @property
    def students_percentage(self) -> Optional[float]:
        if self.students_limit is None:
            return None
        return (self.students_count / self.students_limit) * 100 if self.students_limit > 0 else 0
    
    @property
    def storage_percentage(self) -> float:
        storage_limit_mb = self.storage_limit_gb * 1024
        return (self.storage_used_mb / storage_limit_mb) * 100 if storage_limit_mb > 0 else 0


# Response Schemas
class SubscriptionWithUsage(BaseModel):
    subscription: Subscription
    usage: UsageStats
    can_create_student: bool
    can_add_user: bool
    can_create_location: bool
    can_create_group: bool


class TierComparison(BaseModel):
    tiers: List[SubscriptionTier]
    current_tier: Optional[SubscriptionTier] = None
    recommended_tier: Optional[SubscriptionTier] = None
