#!/usr/bin/env bash
# Render Build Script

echo "🚀 Building FreshMart for Render..."

# Install dependencies
pip install -r requirements.txt

# Create database tables
python -c "
from app.database import engine, Base
from app.models import *
Base.metadata.create_all(bind=engine)
print('✅ Database tables created successfully!')
"

echo "✅ Build completed successfully!"