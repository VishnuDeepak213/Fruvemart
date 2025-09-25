from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import get_db, engine, Base
from app.models import User, UserRole, Category, Product, CartItem, WishlistItem, Order, OrderItem, OrderStatus, PaymentStatus
from app.schemas import (
    UserCreate, UserResponse, Token, CategoryCreate, CategoryResponse,
    ProductCreate, ProductResponse, CartItemCreate, CartItemResponse, CartResponse,
    WishlistItemCreate, WishlistItemResponse, OrderCreate, OrderResponse, QRCodePayment,
    ProductPriceUpdate
)
from app.auth import (
    authenticate_user, create_access_token, get_current_active_user, 
    get_admin_user, get_password_hash
)
from typing import List
from decimal import Decimal
import uuid
import qrcode
import io
import base64
import uvicorn

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FV Commerce - Vegetables & Fruits Store",
    description="A modern e-commerce API for selling fresh vegetables and fruits with user authentication, cart, wishlist, and QR code payments",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Welcome to FV Commerce - Fresh Vegetables & Fruits Store", 
        "status": "healthy",
        "docs": "/docs",
        "features": [
            "🥕 Fresh Vegetables & Fruits",
            "👤 User/Admin Authentication",
            "🛒 Shopping Cart Management",
            "❤️ Wishlist System",
            "📦 Order History",
            "💳 QR Code Payments",
            "📱 Mobile-Friendly API",
            "🔒 Secure JWT Authentication"
        ]
    }

# ============ AUTHENTICATION ENDPOINTS ============

@app.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        phone=user.phone,
        address=user.address,
        role=user.role,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.model_validate(db_user)

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate user and return access token"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return Token(
        access_token=access_token, 
        token_type="bearer",
        user_role=user.role
    )

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current authenticated user"""
    return UserResponse.model_validate(current_user)

# ============ CATEGORY ENDPOINTS (Admin Only) ============

@app.post("/categories", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Create a new category (Admin only)"""
    if db.query(Category).filter(Category.name == category.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return CategoryResponse.model_validate(db_category)

@app.get("/categories", response_model=List[CategoryResponse])
async def list_categories(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """List all active categories"""
    categories = db.query(Category).filter(Category.is_active == True).offset(skip).limit(limit).all()
    return [CategoryResponse.model_validate(cat) for cat in categories]

# ============ PRODUCT ENDPOINTS ============

@app.post("/products", response_model=ProductResponse)
async def create_product(
    product: ProductCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Create a new product (Admin only)"""
    # Check if category exists
    category = db.query(Category).filter(Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return ProductResponse.model_validate(db_product)

@app.put("/products/{product_id}/price", response_model=ProductResponse)
async def update_product_price(
    product_id: int,
    price_update: ProductPriceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Update product price (Admin only)"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.price = price_update.price
    db.commit()
    db.refresh(db_product)
    return ProductResponse.model_validate(db_product)

@app.get("/products", response_model=List[ProductResponse])
async def list_products(
    skip: int = 0, 
    limit: int = 50,
    category_id: int = None,
    is_organic: bool = None,
    db: Session = Depends(get_db)
):
    """List all active products with optional filters"""
    query = db.query(Product).filter(Product.is_active == True)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if is_organic is not None:
        query = query.filter(Product.is_organic == is_organic)
    
    products = query.offset(skip).limit(limit).all()
    return [ProductResponse.model_validate(product) for product in products]

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product"""
    product = db.query(Product).filter(
        and_(Product.id == product_id, Product.is_active == True)
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(product)

# ============ CART ENDPOINTS ============

@app.post("/cart/add", response_model=CartItemResponse)
async def add_to_cart(
    cart_item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add item to cart"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        and_(CartItem.user_id == current_user.id, CartItem.product_id == cart_item.product_id)
    ).first()
    
    if existing_item:
        existing_item.quantity += cart_item.quantity
        db.commit()
        db.refresh(existing_item)
        return CartItemResponse.model_validate(existing_item)
    
    # Add new item to cart
    db_cart_item = CartItem(
        user_id=current_user.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity
    )
    db.add(db_cart_item)
    db.commit()
    db.refresh(db_cart_item)
    return CartItemResponse.model_validate(db_cart_item)

@app.get("/cart", response_model=CartResponse)
async def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's cart"""
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    total_amount = Decimal("0.00")
    cart_item_responses = []
    
    for item in cart_items:
        item_response = CartItemResponse.model_validate(item)
        total_amount += item.product.price * Decimal(str(item.quantity))
        cart_item_responses.append(item_response)
    
    return CartResponse(
        items=cart_item_responses,
        total_items=len(cart_items),
        total_amount=total_amount
    )

@app.delete("/cart/{item_id}")
async def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove item from cart"""
    cart_item = db.query(CartItem).filter(
        and_(CartItem.id == item_id, CartItem.user_id == current_user.id)
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

# ============ WISHLIST ENDPOINTS ============

@app.post("/wishlist/add", response_model=WishlistItemResponse)
async def add_to_wishlist(
    wishlist_item: WishlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add item to wishlist"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == wishlist_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already in wishlist
    existing_item = db.query(WishlistItem).filter(
        and_(WishlistItem.user_id == current_user.id, WishlistItem.product_id == wishlist_item.product_id)
    ).first()
    
    if existing_item:
        raise HTTPException(status_code=400, detail="Item already in wishlist")
    
    db_wishlist_item = WishlistItem(
        user_id=current_user.id,
        product_id=wishlist_item.product_id
    )
    db.add(db_wishlist_item)
    db.commit()
    db.refresh(db_wishlist_item)
    return WishlistItemResponse.model_validate(db_wishlist_item)

@app.get("/wishlist", response_model=List[WishlistItemResponse])
async def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's wishlist"""
    wishlist_items = db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).all()
    return [WishlistItemResponse.model_validate(item) for item in wishlist_items]

@app.delete("/wishlist/{item_id}")
async def remove_from_wishlist(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove item from wishlist"""
    wishlist_item = db.query(WishlistItem).filter(
        and_(WishlistItem.id == item_id, WishlistItem.user_id == current_user.id)
    ).first()
    
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    
    db.delete(wishlist_item)
    db.commit()
    return {"message": "Item removed from wishlist"}

# ============ ORDER ENDPOINTS ============

@app.post("/orders", response_model=OrderResponse)
async def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create order from cart"""
    # Get cart items
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total
    total_amount = Decimal("0.00")
    order_items_data = []
    
    for item in cart_items:
        unit_price = item.product.price
        total_price = unit_price * Decimal(str(item.quantity))
        total_amount += total_price
        
        order_items_data.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "total_price": total_price
        })
    
    # Create order
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    db_order = Order(
        user_id=current_user.id,
        order_number=order_number,
        total_amount=total_amount,
        delivery_address=order.delivery_address,
        notes=order.notes
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(order_id=db_order.id, **item_data)
        db.add(order_item)
    
    # Clear cart
    for item in cart_items:
        db.delete(item)
    
    db.commit()
    
    # Generate QR code for payment
    qr_data = f"upi://pay?pa=merchant@upi&pn=FVCommerce&mc=5411&tr={order_number}&tn=Payment for {order_number}&am={total_amount}&cu=INR"
    
    db_order.qr_code_data = qr_data
    db.commit()
    db.refresh(db_order)
    
    return OrderResponse.model_validate(db_order)

@app.get("/orders", response_model=List[OrderResponse])
async def get_order_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's order history"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return [OrderResponse.model_validate(order) for order in orders]

@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific order"""
    order = db.query(Order).filter(
        and_(Order.id == order_id, Order.user_id == current_user.id)
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return OrderResponse.model_validate(order)

@app.get("/orders/{order_id}/qr-code")
async def get_payment_qr_code(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get QR code for payment"""
    order = db.query(Order).filter(
        and_(Order.id == order_id, Order.user_id == current_user.id)
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_status == PaymentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Order already paid")
    
    # Generate QR code image
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(order.qr_code_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_str = base64.b64encode(img_buffer.getvalue()).decode()
    
    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "amount": order.total_amount,
        "qr_code_data": order.qr_code_data,
        "qr_code_image": f"data:image/png;base64,{img_str}",
        "payment_instructions": "Scan this QR code with any UPI app to make payment"
    }

# ============ ADMIN ENDPOINTS ============

@app.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    status: OrderStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get all orders (Admin only)"""
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return [OrderResponse.model_validate(order) for order in orders]

@app.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get all users (Admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(user) for user in users]

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "FV Commerce - Vegetables & Fruits Store",
        "version": "2.0.0",
        "database": "connected",
        "features": [
            "Multi-role authentication (User/Admin)",
            "Product catalog with categories",
            "Shopping cart management",
            "Wishlist functionality",
            "Order management & history",
            "QR code payment integration",
            "Admin dashboard features"
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)