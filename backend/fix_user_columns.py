"""Add all missing columns to users table"""
import os
from sqlalchemy import create_engine, text
from app.core.config import settings

def add_columns():
    """Add missing columns if they don't exist"""
    engine = create_engine(settings.DATABASE_URL)
    
    # List of columns to add: (column_name, column_type, default_value)
    columns_to_add = [
        ('email_verified_at', 'TIMESTAMP', 'NULL'),
        ('onboarding_completed', 'BOOLEAN', 'DEFAULT FALSE'),
        ('onboarding_completed_at', 'TIMESTAMP', 'NULL'),
        ('profession_category', 'VARCHAR', 'NULL'),
        ('profession_sub_category', 'VARCHAR', 'NULL'),
        ('interactive_tour_completed', 'BOOLEAN', 'DEFAULT FALSE'),
        ('interactive_tour_step', 'INTEGER', 'DEFAULT 0'),
        ('lgpd_consent', 'BOOLEAN', 'DEFAULT FALSE NOT NULL'),
        ('lgpd_consent_date', 'TIMESTAMP', 'NULL'),
        ('lgpd_consent_ip', 'VARCHAR', 'NULL'),
        ('lgpd_consent_version', 'VARCHAR', 'DEFAULT \'1.0\''),
        ('lgpd_data_retention_until', 'TIMESTAMP', 'NULL'),
        ('lgpd_right_to_delete_requested', 'BOOLEAN', 'DEFAULT FALSE'),
        ('lgpd_right_to_delete_requested_at', 'TIMESTAMP', 'NULL'),
        ('lgpd_data_access_logs', 'JSONB', 'NULL'),
        ('subscription_id', 'VARCHAR', 'NULL'),
    ]
    
    with engine.connect() as conn:
        for column_name, column_type, default in columns_to_add:
            # Check if column exists
            check_sql = f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='{column_name}'
            """
            result = conn.execute(text(check_sql))
            exists = result.fetchone()
            
            if not exists:
                print(f"Adding column {column_name}...")
                alter_sql = f"""
                ALTER TABLE users 
                ADD COLUMN {column_name} {column_type} {default}
                """
                conn.execute(text(alter_sql))
                conn.commit()
                print(f"✅ Column {column_name} added!")
            else:
                print(f"✅ Column {column_name} already exists.")

if __name__ == "__main__":
    add_columns()
