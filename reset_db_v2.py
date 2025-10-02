#!/usr/bin/env python3
"""
Reset database and add sample data for FV Commerce
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine, get_db, Base
from app.models import User, UserRole, Category, Product
from app.auth import get_password_hash

def reset_database():
    """Drop all tables and recreate them"""
    print("🗂️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("🏗️  Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database reset complete!")

def create_sample_users(db: Session):
    """Create sample users"""
    print("👥 Creating sample users...")
    
    users_data = [
        {
            "username": "testuser",
            "password": "testpass123",
            "email": "user@test.com",
            "full_name": "Test User",
            "phone": "+1234567890",
            "address": "123 User Street, User City",
            "role": UserRole.USER
        },
        {
            "username": "admin", 
            "password": "admin123",
            "email": "admin@fvcommerce.com",
            "full_name": "Store Admin",
            "phone": "+1234567891",
            "address": "456 Admin Boulevard, Admin City",
            "role": UserRole.ADMIN
        },
        {
            "username": "dev",
            "password": "dev123", 
            "email": "dev@fvcommerce.com",
            "full_name": "System Developer",
            "phone": "+1234567892",
            "address": "789 Tech Avenue, Dev City",
            "role": UserRole.ADMIN  # Changed from DEVELOPER to ADMIN
        }
    ]
    
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == user_data["username"]).first()
        if not existing_user:
            password = user_data.pop("password")
            hashed_password = get_password_hash(password)
            
            user = User(
                hashed_password=hashed_password,
                **user_data
            )
            db.add(user)
            print(f"   ✅ Created user: {user.username} ({user.role})")
        else:
            print(f"   ⏭️  User {user_data['username']} already exists")
    
    db.commit()

def create_sample_categories(db: Session):
    """Create sample product categories"""
    print("🏷️  Creating sample categories...")
    
    categories_data = [
        {"name": "Vegetables", "description": "Fresh organic vegetables"},
        {"name": "Fruits", "description": "Seasonal fresh fruits"},
        {"name": "Leafy Greens", "description": "Fresh leafy green vegetables"},
        {"name": "Root Vegetables", "description": "Potatoes, carrots, and root vegetables"},
        {"name": "Citrus Fruits", "description": "Oranges, lemons, and citrus varieties"},
        {"name": "Berries", "description": "Strawberries, blueberries, and berry varieties"}
    ]
    
    for cat_data in categories_data:
        existing_cat = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not existing_cat:
            category = Category(**cat_data)
            db.add(category)
            print(f"   ✅ Created category: {category.name}")
        else:
            print(f"   ⏭️  Category {cat_data['name']} already exists")
    
    db.commit()

def create_sample_products(db: Session):
    """Create sample products with real-world pricing"""
    print("🥕 Creating sample products...")
    
    # Get categories
    vegetables = db.query(Category).filter(Category.name == "Vegetables").first()
    fruits = db.query(Category).filter(Category.name == "Fruits").first()
    leafy = db.query(Category).filter(Category.name == "Leafy Greens").first()
    root = db.query(Category).filter(Category.name == "Root Vegetables").first()
    citrus = db.query(Category).filter(Category.name == "Citrus Fruits").first()
    berries = db.query(Category).filter(Category.name == "Berries").first()
    
    products_data = [
        # Vegetables
        {"name": "Fresh Tomatoes", "description": "Juicy red tomatoes", "price": 45.00, "unit": "kg", "stock_quantity": 100, "category_id": vegetables.id, "is_organic": True, "origin": "Local Farm"},
        {"name": "Green Bell Peppers", "description": "Crisp green peppers", "price": 60.00, "unit": "kg", "stock_quantity": 75, "category_id": vegetables.id, "is_organic": False, "origin": "Gujarat"},
        {"name": "Fresh Cucumbers", "description": "Crunchy fresh cucumbers", "price": 35.00, "unit": "kg", "stock_quantity": 80, "category_id": vegetables.id, "is_organic": True, "origin": "Punjab"},
        
        # Fruits  
        {"name": "Red Apples", "description": "Sweet and crispy red apples", "price": 120.00, "unit": "kg", "stock_quantity": 60, "category_id": fruits.id, "is_organic": False, "origin": "Kashmir"},
        {"name": "Fresh Bananas", "description": "Ripe yellow bananas", "price": 50.00, "unit": "dozen", "stock_quantity": 100, "category_id": fruits.id, "is_organic": True, "origin": "Kerala"},
        {"name": "Orange", "description": "Sweet oranges full of vitamin C", "price": 80.00, "unit": "kg", "stock_quantity": 90, "category_id": citrus.id, "is_organic": False, "origin": "Maharashtra"},
        
        # Leafy Greens
        {"name": "Fresh Spinach", "description": "Nutrient-rich green spinach", "price": 25.00, "unit": "bunch", "stock_quantity": 50, "category_id": leafy.id, "is_organic": True, "origin": "Local Farm"},
        {"name": "Mint Leaves", "description": "Aromatic fresh mint leaves", "price": 15.00, "unit": "bunch", "stock_quantity": 40, "category_id": leafy.id, "is_organic": True, "origin": "Local Farm"},
        
        # Root Vegetables  
        {"name": "Potatoes", "description": "Fresh potatoes for cooking", "price": 30.00, "unit": "kg", "stock_quantity": 150, "category_id": root.id, "is_organic": False, "origin": "UP"},
        {"name": "Carrots", "description": "Orange carrots rich in beta-carotene", "price": 40.00, "unit": "kg", "stock_quantity": 70, "category_id": root.id, "is_organic": True, "origin": "Haryana"},
        
        # Berries
        {"name": "Strawberries", "description": "Sweet and juicy strawberries", "price": 200.00, "unit": "box", "stock_quantity": 25, "category_id": berries.id, "is_organic": True, "origin": "Himachal"}
    ]
    
    for prod_data in products_data:
        existing_prod = db.query(Product).filter(Product.name == prod_data["name"]).first()
        if not existing_prod:
            product = Product(**prod_data)
            db.add(product)
            print(f"   ✅ Created product: {product.name} - ₹{product.price}/{product.unit}")
        else:
            print(f"   ⏭️  Product {prod_data['name']} already exists")
    
    db.commit()

def main():
    """Main function to reset database and add sample data"""
    print("🚀 Starting FV Commerce database setup...")
    
    # Reset database
    reset_database()
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create sample data
        create_sample_users(db)
        create_sample_categories(db)
        create_sample_products(db)
        
        print("\n🎉 Database setup completed successfully!")
        print("\n📋 Sample Accounts Created:")
        print("   👤 User: testuser / testpass123")
        print("   👨‍💼 Admin: admin / admin123") 
        print("   🔧 Dev: dev / dev123 (Admin access)")
        print("\n🌐 Start the server with: python -m uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()