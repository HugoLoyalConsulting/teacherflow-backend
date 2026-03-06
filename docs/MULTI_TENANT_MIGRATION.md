# Migration Guide: Multi-Tenant Architecture with Organization Model

This guide explains how to migrate from the current `teacher_id`-based architecture to a proper organization-based multi-tenant architecture.

---

## 🎯 Goal

Transform the current single-teacher model to a multi-tenant organization model that:
- Allows multiple users within an organization
- Proper data isolation between organizations
- Scalable for enterprise customers
- Maintains backward compatibility

---

## 📊 Current vs Target Architecture

### Current (teacher_id)
```
users (teachers)
  └── students (teacher_id)
  └── groups (teacher_id)
  └── payments (teacher_id)
```

### Target (organization_id)
```
organizations
  └── users (organization_id)
      └── students (organization_id)
      └── groups (organization_id)
      └── payments (organization_id)
```

---

## 🗄️ Database Changes

### Step 1: Create Organization Model

**File:** `backend/app/models.py`

Add **before** the User model:

```python
class Organization(Base):
    """Organization model for multi-tenancy"""
    __tablename__ = "organizations"
    
    # Core
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    
    # Subscription
    subscription_tier = Column(String, default="free")  # free, starter, pro, enterprise
    max_students = Column(Integer, default=100)
    max_users = Column(Integer, default=1)
    
    # Status
    is_active = Column(Boolean, default=True)
    trial_ends_at = Column(DateTime, nullable=True)
    
    # Settings
    settings = Column(JSON, default={})
    
    # Soft delete
    deleted_at = Column(DateTime, nullable=True)
    archived_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="organization", cascade="all, delete-orphan")
    groups = relationship("Group", back_populates="organization", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="organization", cascade="all, delete-orphan")
```

### Step 2: Update User Model

Add to User model:

```python
class User(Base):
    __tablename__ = "users"
    
    # ... existing fields ...
    
    # Add organization relationship
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    role = Column(String, default="owner")  # owner, admin, teacher, viewer
    
    # Soft delete
    deleted_at = Column(DateTime, nullable=True)
    archived_at = Column(DateTime, nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    # ... rest of relationships ...
```

### Step 3: Update All Models

For **each** model (Student, Group, Location, Schedule, Lesson, Payment), add:

```python
# Replace teacher_id with organization_id
organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)

# Keep created_by for audit trail
created_by_user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)

# Soft delete
deleted_at = Column(DateTime, nullable=True)
archived_at = Column(DateTime, nullable=True)

# Relationships
organization = relationship("Organization", back_populates="<model_plural>")
created_by = relationship("User", foreign_keys=[created_by_user_id])
```

### Step 4: Create Migration

**File:** `backend/alembic/versions/002_add_organizations.py`

```python
"""Add organizations and multi-tenancy

Revision ID: 002
Revises: 001
Create Date: 2026-03-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('subscription_tier', sa.String(), server_default='free'),
        sa.Column('max_students', sa.Integer(), server_default='100'),
        sa.Column('max_users', sa.Integer(), server_default='1'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('trial_ends_at', sa.DateTime(), nullable=True),
        sa.Column('settings', postgresql.JSON(astext_type=sa.Text()), server_default='{}'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('archived_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_organizations_id', 'organizations', ['id'])
    op.create_index('ix_organizations_slug', 'organizations', ['slug'], unique=True)
    
    # Migrate existing users to organizations
    # Each teacher gets their own organization
    connection = op.get_bind()
    
    # Get all existing users
    users = connection.execute(sa.text("SELECT id, full_name, email FROM users")).fetchall()
    
    for user in users:
        org_id = str(uuid.uuid4())
        org_name = f"{user.full_name}'s Organization"
        org_slug = user.email.split('@')[0].lower().replace('.', '-')
        
        # Create organization
        connection.execute(
            sa.text("""
                INSERT INTO organizations (id, name, slug, created_at, updated_at)
                VALUES (:id, :name, :slug, NOW(), NOW())
            """),
            {"id": org_id, "name": org_name, "slug": org_slug}
        )
        
        # Add organization_id to users table
        if not column_exists(connection, 'users', 'organization_id'):
            op.add_column('users', sa.Column('organization_id', sa.String(), nullable=True))
            op.add_column('users', sa.Column('role', sa.String(), server_default='owner'))
            op.add_column('users', sa.Column('deleted_at', sa.DateTime(), nullable=True))
            op.add_column('users', sa.Column('archived_at', sa.DateTime(), nullable=True))
        
        # Update user with organization_id
        connection.execute(
            sa.text("UPDATE users SET organization_id = :org_id WHERE id = :user_id"),
            {"org_id": org_id, "user_id": user.id}
        )
    
    # Make organization_id not nullable
    op.alter_column('users', 'organization_id', nullable=False)
    op.create_foreign_key('fk_users_organization', 'users', 'organizations', ['organization_id'], ['id'])
    op.create_index('ix_users_organization_id', 'users', ['organization_id'])
    
    # Update all other tables
    tables_to_update = ['students', 'groups', 'locations', 'schedules', 'lessons', 'payments']
    
    for table in tables_to_update:
        # Add new columns
        op.add_column(table, sa.Column('organization_id', sa.String(), nullable=True))
        op.add_column(table, sa.Column('created_by_user_id', sa.String(), nullable=True))
        op.add_column(table, sa.Column('deleted_at', sa.DateTime(), nullable=True))
        op.add_column(table, sa.Column('archived_at', sa.DateTime(), nullable=True))
        
        # Populate organization_id from teacher_id
        connection.execute(
            sa.text(f"""
                UPDATE {table} t
                SET organization_id = u.organization_id,
                    created_by_user_id = t.teacher_id
                FROM users u
                WHERE t.teacher_id = u.id
            """)
        )
        
        # Make not nullable
        op.alter_column(table, 'organization_id', nullable=False)
        
        # Add foreign keys
        op.create_foreign_key(
            f'fk_{table}_organization',
            table, 'organizations',
            ['organization_id'], ['id']
        )
        op.create_foreign_key(
            f'fk_{table}_created_by',
            table, 'users',
            ['created_by_user_id'], ['id']
        )
        
        # Add indexes
        op.create_index(f'ix_{table}_organization_id', table, ['organization_id'])
        op.create_index(f'ix_{table}_deleted_at', table, ['deleted_at'])


def downgrade() -> None:
    # Remove organization_id from all tables
    tables = ['payments', 'lessons', 'schedules', 'locations', 'groups', 'students', 'users']
    
    for table in tables:
        op.drop_constraint(f'fk_{table}_organization', table, type_='foreignkey')
        op.drop_index(f'ix_{table}_organization_id', table)
        if table != 'users':
            op.drop_constraint(f'fk_{table}_created_by', table, type_='foreignkey')
            op.drop_column(table, 'created_by_user_id')
        op.drop_column(table, 'organization_id')
        op.drop_column(table, 'deleted_at')
        op.drop_column(table, 'archived_at')
    
    # Drop organizations table
    op.drop_index('ix_organizations_slug', 'organizations')
    op.drop_index('ix_organizations_id', 'organizations')
    op.drop_table('organizations')


def column_exists(connection, table_name, column_name):
    result = connection.execute(
        sa.text("""
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = :table 
                AND column_name = :column
            )
        """),
        {"table": table_name, "column": column_name}
    )
    return result.scalar()
```

---

## 🔧 Code Changes

### Step 1: Update Database Queries

**Before:**
```python
def get_students(db: Session, current_user: User):
    return db.query(Student).filter(
        Student.teacher_id == current_user.id
    ).all()
```

**After:**
```python
def get_students(db: Session, current_user: User):
    return db.query(Student).filter(
        Student.organization_id == current_user.organization_id,
        Student.deleted_at.is_(None)  # Soft delete filter
    ).all()
```

### Step 2: Create Dependency for Organization

**File:** `backend/app/core/dependencies.py`

```python
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Organization

async def get_current_organization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Organization:
    """Get current user's organization"""
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id,
        Organization.deleted_at.is_(None),
        Organization.is_active == True
    ).first()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found or inactive"
        )
    
    return organization
```

### Step 3: Update All Endpoints

**Example:** `backend/app/routers/students.py`

```python
from app.core.dependencies import get_current_organization

@router.post("/students", response_model=StudentResponse)
async def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    organization: Organization = Depends(get_current_organization)
):
    # Create student with organization_id
    new_student = Student(
        id=str(uuid.uuid4()),
        organization_id=organization.id,
        created_by_user_id=current_user.id,
        **student_data.dict()
    )
    
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    # Track event
    track_event(
        event_name=Events.STUDENT_CREATED,
        user_id=current_user.id,
        organization_id=organization.id,
        properties={"student_id": new_student.id}
    )
    
    return new_student
```

---

## 🗑️ Soft Delete Implementation

### Step 1: Create Soft Delete Utility

**File:** `backend/app/core/soft_delete.py`

```python
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Base

def soft_delete(db: Session, instance: Base) -> None:
    """Soft delete a record"""
    instance.deleted_at = datetime.utcnow()
    db.commit()

def soft_delete_bulk(db: Session, model: Base, filters: dict) -> int:
    """Soft delete multiple records"""
    count = db.query(model).filter_by(**filters).update({
        "deleted_at": datetime.utcnow()
    })
    db.commit()
    return count

def restore(db: Session, instance: Base) -> None:
    """Restore a soft-deleted record"""
    instance.deleted_at = None
    db.commit()

def archive(db: Session, instance: Base) -> None:
    """Archive a record (different from delete)"""
    instance.archived_at = datetime.utcnow()
    db.commit()

def active_only(query):
    """Filter to show only non-deleted records"""
    return query.filter_by(deleted_at=None)
```

### Step 2: Update Query Helpers

**File:** `backend/app/services/base_service.py`

```python
from app.core.soft_delete import active_only

class BaseService:
    """Base service with soft delete support"""
    
    @staticmethod
    def get_all(db: Session, model: Base, organization_id: str):
        """Get all active records for organization"""
        return active_only(
            db.query(model).filter_by(organization_id=organization_id)
        ).all()
    
    @staticmethod
    def get_by_id(db: Session, model: Base, id: str, organization_id: str):
        """Get single record by ID with org check"""
        return active_only(
            db.query(model).filter_by(
                id=id,
                organization_id=organization_id
            )
        ).first()
    
    @staticmethod
    def soft_delete(db: Session, instance: Base):
        """Soft delete a record"""
        from app.core.soft_delete import soft_delete as _soft_delete
        _soft_delete(db, instance)
```

---

## 🧪 Testing the Migration

### Step 1: Test Locally

```bash
# Backup your local database first
pg_dump teacherflow > backup_before_migration.sql

# Run migration
cd backend
alembic upgrade head

# Verify tables
psql teacherflow -c "\dt"
psql teacherflow -c "SELECT COUNT(*) FROM organizations;"

# Test API
curl http://localhost:8000/api/v1/students
```

### Step 2: Test Staging

```bash
# Update staging DATABASE_URL
# Run migration on staging database

# Test with Postman/curl
```

### Step 3: Production Migration

**CRITICAL: Do this during low-traffic period**

```bash
# 1. Backup production database (Neon does automatic backups)
# 2. Put application in maintenance mode
# 3. Run migration
alembic upgrade head

# 4. Test health endpoint
curl https://teacherflow-backend.onrender.com/health

# 5. Test API endpoints
# 6. Remove maintenance mode
```

---

## 📋 Checklist

- [ ] Create Organization model
- [ ] Add organization_id to all models
- [ ] Add deleted_at/archived_at to all models
- [ ] Create migration script
- [ ] Update all database queries
- [ ] Update all API endpoints
- [ ] Create soft delete utilities
- [ ] Update tests
- [ ] Test locally
- [ ] Test on staging
- [ ] Run on production
- [ ] Update frontend (if needed)
- [ ] Update documentation

---

## 🚨 Rollback Plan

If migration fails:

```bash
# Restore from backup
psql teacherflow < backup_before_migration.sql

# Or use Alembic downgrade
alembic downgrade -1
```

---

## 📚 Additional Resources

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Multi-tenancy Patterns](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Soft Delete Best Practices](https://www.enterpriseintegrationpatterns.com/patterns/conversation/SoftDelete.html)

---

**Estimated Time:** 2-4 hours  
**Risk Level:** Medium  
**Reversible:** Yes (via backup or downgrade)
