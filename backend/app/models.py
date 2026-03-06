"""SQLAlchemy ORM models"""
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean, JSON, Date, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
import uuid
from app.core.database import Base


class User(Base):
    """User model (teachers/admins) - Enterprise Security"""
    __tablename__ = "users"
    
    # Core Identity
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Account Status
    is_active = Column(Boolean, default=False)  # False até email verificado
    is_admin = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime, nullable=True)  # When email was verified
    
    # Onboarding & Profession
    onboarding_completed = Column(Boolean, default=False)
    onboarding_completed_at = Column(DateTime, nullable=True)
    profession_category = Column(String, nullable=True)  # music, language, academic, etc.
    profession_sub_category = Column(String, nullable=True)  # Piano, Violão, etc.
    
    # Security
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_method = Column(String, nullable=True)  # email, sms, totp
    totp_secret = Column(String, nullable=True)  # Base32 encoded secret
    phone = Column(String, nullable=True)
    phone_verified = Column(Boolean, default=False)
    
    # Backup codes para 2FA
    backup_codes = Column(JSON, nullable=True)  # Lista de códigos hash
    backup_codes_generated_at = Column(DateTime, nullable=True)
    
    # Security Audit
    created_ip = Column(String, nullable=True)  # IPv4/IPv6 do registro
    last_login_at = Column(DateTime, nullable=True)
    last_login_ip = Column(String, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)  # Account lock para brute force
    password_changed_at = Column(DateTime, nullable=True)
    
    # OAuth2
    google_id = Column(String, nullable=True, unique=True)
    google_email = Column(String, nullable=True)
    
    # LGPD Compliance (Brazilian Data Protection Law)
    lgpd_consent = Column(Boolean, default=False, nullable=False)  # Consentimento para tratamento de dados
    lgpd_consent_date = Column(DateTime, nullable=True)  # Data do consentimento
    lgpd_consent_ip = Column(String, nullable=True)  # IP de onde foi dado o consentimento
    lgpd_consent_version = Column(String, default="1.0")  # Versão dos termos aceitos
    lgpd_data_retention_until = Column(DateTime, nullable=True)  # Data limite para retenção dos dados
    lgpd_right_to_delete_requested = Column(Boolean, default=False)  # Direito ao esquecimento solicitado
    lgpd_right_to_delete_requested_at = Column(DateTime, nullable=True)
    lgpd_data_access_logs = Column(JSON, nullable=True)  # Log de acessos aos dados (últimos 10)
    
    # Interactive Onboarding
    interactive_tour_completed = Column(Boolean, default=False)  # Tour guiado finalizado
    interactive_tour_step = Column(Integer, default=0)  # Último step completado
    
    # Subscription
    subscription_id = Column(String, ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    students = relationship("Student", back_populates="teacher", cascade="all, delete-orphan")
    groups = relationship("Group", back_populates="teacher", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="teacher", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="teacher", cascade="all, delete-orphan")
    lessons = relationship("Lesson", back_populates="teacher", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="teacher", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    verification_codes = relationship("VerificationCode", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", foreign_keys=[subscription_id])


class Student(Base):
    """Student model"""
    __tablename__ = "students"
    
    id = Column(String, primary_key=True, index=True)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # Primary Location (optional) - where student primarily studies
    # This is independent of group locations
    location_id = Column(String, ForeignKey("locations.id"), nullable=True, index=True)
    
    name = Column(String, nullable=False)
    email = Column(String, nullable=True, index=True)
    phone = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    profile_type = Column(String, default="free")  # free, trial, premium
    payment_status = Column(String, default="pending")  # pending, active, inactive, paused
    
    # Inadimplência
    is_paused = Column(Boolean, default=False)  # Pausado por inadimplência
    paused_at = Column(DateTime, nullable=True)  # Quando ficou pausado
    inadimplency_start_date = Column(DateTime, nullable=True)  # Quando começou a ficar inadimplente
    last_payment_date = Column(Date, nullable=True)  # Último pagamento recebido
    days_without_payment = Column(Integer, default=0)  # Dias sem pagar
    
    notes = Column(Text, nullable=True)
    
    # LGPD Compliance - Student Data (Dados Sensíveis de Terceiros)
    lgpd_parent_consent = Column(Boolean, default=False)  # Consentimento dos pais (se menor de idade)
    lgpd_parent_consent_date = Column(DateTime, nullable=True)
    lgpd_consent_document_url = Column(String, nullable=True)  # URL do documento de consentimento assinado
    lgpd_data_classification = Column(String, default="personal")  # personal, sensitive, anonymous
    lgpd_purpose = Column(String, default="educational_services")  # Finalidade do tratamento
    lgpd_can_contact = Column(Boolean, default=True)  # Autoriza contato para fins educacionais
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", back_populates="students")
    primary_location = relationship("Location", foreign_keys=[location_id])
    group_associations = relationship("GroupStudent", back_populates="student", cascade="all, delete-orphan")
    lessons = relationship("StudentLesson", back_populates="student", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="student", cascade="all, delete-orphan")


class Location(Base):
    """Location/venue model"""
    __tablename__ = "locations"
    
    id = Column(String, primary_key=True, index=True)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    capacity = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", back_populates="locations")
    groups = relationship("Group", back_populates="location", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="location", cascade="all, delete-orphan")


class Group(Base):
    """Group/class model"""
    __tablename__ = "groups"
    
    id = Column(String, primary_key=True, index=True)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    hourly_rate = Column(Float, nullable=True, default=0.0)  # Valor por hora da aula
    max_students = Column(Integer, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", back_populates="groups")
    location = relationship("Location", back_populates="groups")
    schedules = relationship("Schedule", back_populates="group", cascade="all, delete-orphan")
    students = relationship("GroupStudent", back_populates="group", cascade="all, delete-orphan")


class GroupStudent(Base):
    """Association between groups and students (many-to-many)"""
    __tablename__ = "group_students"
    
    id = Column(String, primary_key=True, index=True)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False, index=True)
    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime, nullable=True)
    
    # Relationships
    group = relationship("Group", back_populates="students")
    student = relationship("Student", back_populates="group_associations")


class Schedule(Base):
    """Schedule/timetable model"""
    __tablename__ = "schedules"
    
    id = Column(String, primary_key=True, index=True)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False, index=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0 = Monday, 6 = Sunday
    start_time = Column(String, nullable=False)  # HH:MM format
    end_time = Column(String, nullable=False)  # HH:MM format
    notes = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", back_populates="schedules")
    group = relationship("Group", back_populates="schedules")
    location = relationship("Location", back_populates="schedules")
    lessons = relationship("Lesson", back_populates="schedule", cascade="all, delete-orphan")


class Lesson(Base):
    """Lesson/class instance model"""
    __tablename__ = "lessons"
    
    id = Column(String, primary_key=True, index=True)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    schedule_id = Column(String, ForeignKey("schedules.id"), nullable=False, index=True)
    description = Column(Text, nullable=True)
    lesson_date = Column(Date, nullable=False, index=True)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    attendance_data = Column(JSON, default={})  # {student_id: bool, ...}
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", back_populates="lessons")
    schedule = relationship("Schedule", back_populates="lessons")
    students = relationship("StudentLesson", back_populates="lesson", cascade="all, delete-orphan")


class StudentLesson(Base):
    """Association between students and lessons (attendance tracking)"""
    __tablename__ = "student_lessons"
    
    id = Column(String, primary_key=True, index=True)
    lesson_id = Column(String, ForeignKey("lessons.id"), nullable=False, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False, index=True)
    attended = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    
    # Relationships
    lesson = relationship("Lesson", back_populates="students")
    student = relationship("Student", back_populates="lessons")


class Payment(Base):
    """Payment model"""
    __tablename__ = "payments"
    
    id = Column(String, primary_key=True, index=True)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="BRL")
    due_date = Column(Date, nullable=False, index=True)  # Data de vencimento
    payment_date = Column(Date, nullable=True, index=True)  # Data de pagamento real
    payment_method = Column(String, nullable=True)  # cash, card, bank_transfer, pix
    description = Column(String, nullable=True)
    status = Column(String, default="PENDING")  # PENDING, PAID, OVERDUE
    reference = Column(String, nullable=True, unique=True, index=True)
    notes = Column(Text, nullable=True)
    
    # Recurrence fields - para gerar pagamentos futuros
    recurrence = Column(String, nullable=True)  # WEEKLY, BIWEEKLY, MONTHLY, ONCE
    recurrence_end_date = Column(Date, nullable=True)  # Até quando repetir (ex: quando aluno sair da turma)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", back_populates="payments")
    student = relationship("Student", back_populates="payments")

class AuditLog(Base):
    """Security Audit Log - Track all authentication events"""
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)  # Pode ser NULL para eventos pre-auth
    action = Column(String, nullable=False, index=True)  # login, logout, register, password_change, etc
    status = Column(String, nullable=False, index=True)  # success, failed, blocked, suspicious
    ip_address = Column(String, nullable=True, index=True)  # IPv4/IPv6 do cliente
    user_agent = Column(String, nullable=True)  # Browser/app info
    details = Column(JSON, nullable=True)  # Dados adicionais em JSON
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    
    class Config:
        indexes = [
            # Índices para queries de auditoria comuns
            ('user_id', 'created_at'),
            ('action', 'created_at'),
            ('status', 'created_at'),
            ('ip_address', 'created_at'),
        ]


class VerificationCode(Base):
    """Email verification codes - 6-digit codes with expiration"""
    __tablename__ = "verification_codes"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    code = Column(String(6), nullable=False)  # 6-digit code
    expires_at = Column(DateTime, nullable=False, index=True)  # Expires in 10 minutes
    attempts = Column(Integer, default=0, nullable=False)  # Max 3 attempts
    is_valid = Column(Boolean, default=True, nullable=False, index=True)  # Invalidated after use or expiration
    verified_at = Column(DateTime, nullable=True)  # When successfully verified
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="verification_codes")
    
    class Config:
        indexes = [
            ('user_id', 'is_valid', 'created_at'),
            ('expires_at', 'is_valid'),
        ]


class SubscriptionTier(Base):
    """Subscription tier model (Free, Pro, Premium)"""
    __tablename__ = "subscription_tiers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), nullable=False)  # "Gratuito", "Profissional", "Premium"
    tier_key = Column(String(20), unique=True, nullable=False, index=True)  # "free", "pro", "premium"
    description = Column(Text, nullable=True)
    price_monthly_brl = Column(Numeric(10, 2), nullable=False)
    price_yearly_brl = Column(Numeric(10, 2), nullable=True)
    
    # Limits
    max_students = Column(Integer, nullable=True)  # None = unlimited
    max_users = Column(Integer, nullable=False, default=1)
    max_locations = Column(Integer, nullable=True)
    max_groups = Column(Integer, nullable=True)
    storage_gb = Column(Integer, nullable=False, default=1)
    
    # Features (JSONB)
    features = Column(JSONB, nullable=False, default={})
    
    is_active = Column(Boolean, default=True, index=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscriptions = relationship("Subscription", back_populates="tier")


class Subscription(Base):
    """Subscription model"""
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tier_id = Column(String, ForeignKey("subscription_tiers.id", ondelete="RESTRICT"), nullable=False)
    
    status = Column(String(20), nullable=False, index=True)  # active, cancelled, past_due, trialing
    
    # Stripe integration
    stripe_subscription_id = Column(String(255), unique=True, index=True, nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)
    
    # Billing period
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Trial
    trial_start = Column(DateTime, nullable=True)
    trial_end = Column(DateTime, nullable=True)
    
    metadata = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscription")
    tier = relationship("SubscriptionTier", back_populates="subscriptions")
    payments = relationship("SubscriptionPayment", back_populates="subscription", cascade="all, delete-orphan")


class SubscriptionPayment(Base):
    """Subscription payment model"""
    __tablename__ = "subscription_payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    subscription_id = Column(String, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="BRL", nullable=False)
    status = Column(String(20), nullable=False, index=True)  # pending, paid, failed, refunded
    payment_method = Column(String(50), nullable=True)  # credit_card, pix, boleto
    
    # Stripe integration
    stripe_payment_intent_id = Column(String(255), index=True, nullable=True)
    stripe_invoice_id = Column(String(255), nullable=True)
    
    failure_reason = Column(Text, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    
    metadata = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="payments")
