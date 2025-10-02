"""
Database reset script - completely recreate database with new schema
"""

import os
from sqlalchemy import create_engine
from app.database import DATABASE_URL, Base
from app.models import *  # Import all models to register them
from seed_data import create_sample_data

def reset_database():
    """Completely reset and recreate the database"""
    
    # Try to remove existing database file if using SQLite
    if DATABASE_URL.startswith("sqlite"):
        db_file = DATABASE_URL.replace("sqlite:///./", "")
        try:
            if os.path.exists(db_file):
                os.remove(db_file)
                print(f"🗑️ Removed old database file: {db_file}")
        except PermissionError:
            print(f"⚠️ Cannot remove {db_file} (in use), will recreate schema instead")
    
    # Create new engine and recreate all tables
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
    
    print("🔄 Dropping and recreating database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database schema recreated successfully!")
    
    # Create sample data
    print("📊 Creating sample data...")
    create_sample_data()

if __name__ == "__main__":
    reset_database()