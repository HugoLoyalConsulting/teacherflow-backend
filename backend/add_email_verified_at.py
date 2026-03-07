"""Add email_verified_at column to users table"""
import os
from sqlalchemy import create_engine, text
from app.core.config import settings

def add_column():
    """Add email_verified_at column if it doesn't exist"""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if column exists
        check_sql = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='email_verified_at'
        """
        result = conn.execute(text(check_sql))
        exists = result.fetchone()
        
        if not exists:
            print("Column email_verified_at does not exist. Adding it now...")
            alter_sql = """
            ALTER TABLE users 
            ADD COLUMN email_verified_at TIMESTAMP NULL
            """
            conn.execute(text(alter_sql))
            conn.commit()
            print("✅ Column email_verified_at added successfully!")
        else:
            print("✅ Column email_verified_at already exists.")

if __name__ == "__main__":
    add_column()
