"""
Sample data seeder for FV Commerce
Run this script to populate the database with sample categories, products, and admin user
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, UserRole, Category, Product
from app.auth import get_password_hash
from decimal import Decimal

def create_sample_data():
    """Create sample data for the e-commerce store"""
    db = SessionLocal()
    
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Create admin user
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                email="admin@fvcommerce.com",
                username="admin",
                full_name="Store Administrator",
                role=UserRole.ADMIN,
                hashed_password=get_password_hash("admin123"),
                is_active=True
            )
            db.add(admin_user)
            print("✅ Created admin user (username: admin, password: admin123)")
        
        # Create developer user
        dev_user = db.query(User).filter(User.username == "developer").first()
        if not dev_user:
            dev_user = User(
                email="dev@fvcommerce.com",
                username="developer",
                full_name="System Developer",
                role=UserRole.DEVELOPER,
                hashed_password=get_password_hash("dev123"),
                is_active=True
            )
            db.add(dev_user)
            print("✅ Created developer user (username: developer, password: dev123)")
        
        # Create sample regular user
        sample_user = db.query(User).filter(User.username == "john_doe").first()
        if not sample_user:
            sample_user = User(
                email="john@example.com",
                username="john_doe",
                full_name="John Doe",
                phone="9876543210",
                address="123 Main St, City",
                role=UserRole.USER,
                hashed_password=get_password_hash("user123"),
                is_active=True
            )
            db.add(sample_user)
            print("✅ Created sample user (username: john_doe, password: user123)")
        
        db.commit()
        
        # Create categories
        categories_data = [
            {"name": "Vegetables", "description": "Fresh seasonal vegetables"},
            {"name": "Fruits", "description": "Fresh seasonal fruits"},
            {"name": "Leafy Greens", "description": "Fresh leafy vegetables and herbs"},
            {"name": "Root Vegetables", "description": "Potatoes, carrots, onions and more"},
            {"name": "Citrus Fruits", "description": "Oranges, lemons, limes and citrus varieties"},
            {"name": "Berries", "description": "Strawberries, blueberries and seasonal berries"}
        ]
        
        created_categories = {}
        for cat_data in categories_data:
            category = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not category:
                category = Category(**cat_data)
                db.add(category)
                db.commit()
                db.refresh(category)
                print(f"✅ Created category: {category.name}")
            created_categories[cat_data["name"]] = category
        
        # Create sample products
        products_data = [
            # Vegetables
            {
                "name": "Fresh Tomatoes",
                "description": "Juicy red tomatoes, perfect for cooking and salads",
                "price": Decimal("45.00"),
                "unit": "kg",
                "category": "Vegetables",
                "stock_quantity": 50,
                "nutritional_info": "Rich in Vitamin C and Lycopene",
                "origin": "Local Farm",
                "is_organic": True
            },
            {
                "name": "Green Bell Peppers",
                "description": "Fresh green capsicum, crisp and flavorful",
                "price": Decimal("60.00"),
                "unit": "kg",
                "category": "Vegetables",
                "stock_quantity": 30,
                "nutritional_info": "High in Vitamin C and antioxidants",
                "origin": "Local Farm",
                "is_organic": False
            },
            {
                "name": "Fresh Cucumbers",
                "description": "Cool and refreshing cucumbers",
                "price": Decimal("35.00"),
                "unit": "kg",
                "category": "Vegetables",
                "stock_quantity": 40,
                "nutritional_info": "High water content, low calories",
                "origin": "Local Farm",
                "is_organic": True
            },
            
            # Fruits
            {
                "name": "Red Apples",
                "description": "Sweet and crispy red apples",
                "price": Decimal("120.00"),
                "unit": "kg",
                "category": "Fruits",
                "stock_quantity": 60,
                "nutritional_info": "Rich in fiber and Vitamin C",
                "origin": "Hill Station Farm",
                "is_organic": False
            },
            {
                "name": "Fresh Bananas",
                "description": "Ripe yellow bananas, naturally sweet",
                "price": Decimal("50.00"),
                "unit": "dozen",
                "category": "Fruits",
                "stock_quantity": 80,
                "nutritional_info": "High in potassium and natural sugars",
                "origin": "Southern Farm",
                "is_organic": True
            },
            {
                "name": "Orange",
                "description": "Juicy oranges packed with Vitamin C",
                "price": Decimal("80.00"),
                "unit": "kg",
                "category": "Citrus Fruits",
                "stock_quantity": 45,
                "nutritional_info": "Excellent source of Vitamin C",
                "origin": "Citrus Farm",
                "is_organic": False
            },
            
            # Leafy Greens
            {
                "name": "Fresh Spinach",
                "description": "Tender baby spinach leaves",
                "price": Decimal("40.00"),
                "unit": "bunch",
                "category": "Leafy Greens",
                "stock_quantity": 25,
                "nutritional_info": "Rich in iron and folate",
                "origin": "Local Farm",
                "is_organic": True
            },
            {
                "name": "Mint Leaves",
                "description": "Fresh aromatic mint leaves",
                "price": Decimal("20.00"),
                "unit": "bunch",
                "category": "Leafy Greens",
                "stock_quantity": 15,
                "nutritional_info": "Natural digestive aid",
                "origin": "Local Farm",
                "is_organic": True
            },
            
            # Root Vegetables
            {
                "name": "Potatoes",
                "description": "Fresh white potatoes, versatile cooking staple",
                "price": Decimal("30.00"),
                "unit": "kg",
                "category": "Root Vegetables",
                "stock_quantity": 100,
                "nutritional_info": "Good source of carbohydrates and fiber",
                "origin": "Hill Farm",
                "is_organic": False
            },
            {
                "name": "Carrots",
                "description": "Sweet orange carrots, crunchy and nutritious",
                "price": Decimal("55.00"),
                "unit": "kg",
                "category": "Root Vegetables",
                "stock_quantity": 70,
                "nutritional_info": "High in Beta-carotene and Vitamin A",
                "origin": "Local Farm",
                "is_organic": True
            },
            
            # Berries
            {
                "name": "Strawberries",
                "description": "Sweet and juicy fresh strawberries",
                "price": Decimal("200.00"),
                "unit": "kg",
                "category": "Berries",
                "stock_quantity": 20,
                "nutritional_info": "Rich in Vitamin C and antioxidants",
                "origin": "Hill Station Farm",
                "is_organic": True
            },
        ]
        
        for product_data in products_data:
            product = db.query(Product).filter(Product.name == product_data["name"]).first()
            if not product:
                category_name = product_data.pop("category")
                category = created_categories[category_name]
                product = Product(
                    category_id=category.id,
                    **product_data
                )
                db.add(product)
                db.commit()
                db.refresh(product)
                print(f"✅ Created product: {product.name} - ₹{product.price}/{product.unit}")
        
        print("\n🎉 Sample data creation completed successfully!")
        print("\n👥 Login Credentials:")
        print("🔹 Admin: username='admin', password='admin123'")
        print("🔹 Developer: username='developer', password='dev123'")
        print("🔹 User: username='john_doe', password='user123'")
        print("\n🌐 Visit http://localhost:8000/docs to explore the API!")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()