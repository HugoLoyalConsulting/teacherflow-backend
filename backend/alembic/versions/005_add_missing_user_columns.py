"""add missing user columns for email verification and onboarding

Revision ID: 005_missing_columns
Revises: 004_subscription
Create Date: 2026-03-07 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '005_missing_columns'
down_revision = '004_subscription'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add missing columns to users table"""
    
    # Email verification and onboarding columns
    op.execute("""
        DO $$
        BEGIN
            -- email_verified_at
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='email_verified_at'
            ) THEN
                ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;
            END IF;
            
            -- onboarding_completed
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='onboarding_completed'
            ) THEN
                ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
            END IF;
            
            -- onboarding_completed_at
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='onboarding_completed_at'
            ) THEN
                ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP NULL;
            END IF;
            
            -- profession_category
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='profession_category'
            ) THEN
                ALTER TABLE users ADD COLUMN profession_category VARCHAR NULL;
            END IF;
            
            -- profession_sub_category
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='profession_sub_category'
            ) THEN
                ALTER TABLE users ADD COLUMN profession_sub_category VARCHAR NULL;
            END IF;
            
            -- interactive_tour_completed
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='interactive_tour_completed'
            ) THEN
                ALTER TABLE users ADD COLUMN interactive_tour_completed BOOLEAN DEFAULT FALSE;
            END IF;
            
            -- interactive_tour_step
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='interactive_tour_step'
            ) THEN
                ALTER TABLE users ADD COLUMN interactive_tour_step INTEGER DEFAULT 0;
            END IF;
            
            -- subscription_id
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='subscription_id'
            ) THEN
                ALTER TABLE users ADD COLUMN subscription_id VARCHAR NULL;
            END IF;
        END
        $$;
    """)


def downgrade() -> None:
    """Remove added columns"""
    
    op.drop_column('users', 'subscription_id')
    op.drop_column('users', 'interactive_tour_step')
    op.drop_column('users', 'interactive_tour_completed')
    op.drop_column('users', 'profession_sub_category')
    op.drop_column('users', 'profession_category')
    op.drop_column('users', 'onboarding_completed_at')
    op.drop_column('users', 'onboarding_completed')
    op.drop_column('users', 'email_verified_at')
