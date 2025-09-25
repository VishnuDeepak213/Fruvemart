from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum

# Enums
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

# User schemas
class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    """Schema for user creation"""
    password: str
    role: UserRole = UserRole.USER
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        return v

class UserResponse(UserBase):
    """Schema for user response (without password)"""
    id: int
    role: UserRole
    is_active: bool = True
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    """Schema for user updates"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

# Authentication schemas
class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str
    user_role: UserRole

class TokenData(BaseModel):
    """Token data schema"""
    username: Optional[str] = None

# Category schemas
class CategoryBase(BaseModel):
    """Base category schema"""
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    """Schema for category creation"""
    pass

class CategoryResponse(CategoryBase):
    """Schema for category response"""
    id: int
    is_active: bool = True
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# Product schemas
class ProductBase(BaseModel):
    """Base product schema"""
    name: str
    description: Optional[str] = None
    price: Decimal
    unit: str = "kg"
    category_id: int
    stock_quantity: int = 0
    image_url: Optional[str] = None
    nutritional_info: Optional[str] = None
    origin: Optional[str] = None
    is_organic: bool = False

class ProductCreate(ProductBase):
    """Schema for product creation"""
    pass

class ProductResponse(ProductBase):
    """Schema for product response"""
    id: int
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    category: Optional[CategoryResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

class ProductUpdate(BaseModel):
    """Schema for product updates"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    unit: Optional[str] = None
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    nutritional_info: Optional[str] = None
    origin: Optional[str] = None
    is_organic: Optional[bool] = None
    is_active: Optional[bool] = None

# Cart schemas
class CartItemBase(BaseModel):
    """Base cart item schema"""
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    """Schema for cart item creation"""
    pass

class CartItemResponse(CartItemBase):
    """Schema for cart item response"""
    id: int
    product: ProductResponse
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class CartResponse(BaseModel):
    """Schema for cart response"""
    items: List[CartItemResponse]
    total_items: int
    total_amount: Decimal

# Wishlist schemas
class WishlistItemBase(BaseModel):
    """Base wishlist item schema"""
    product_id: int

class WishlistItemCreate(WishlistItemBase):
    """Schema for wishlist item creation"""
    pass

class WishlistItemResponse(WishlistItemBase):
    """Schema for wishlist item response"""
    id: int
    product: ProductResponse
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# Order schemas
class OrderItemBase(BaseModel):
    """Base order item schema"""
    product_id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal

class OrderItemResponse(OrderItemBase):
    """Schema for order item response"""
    id: int
    product: ProductResponse
    
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    """Base order schema"""
    delivery_address: str
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    """Schema for order creation"""
    pass

class OrderResponse(OrderBase):
    """Schema for order response"""
    id: int
    order_number: str
    total_amount: Decimal
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: str
    qr_code_data: Optional[str] = None
    order_items: List[OrderItemResponse]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class QRCodePayment(BaseModel):
    """Schema for QR code payment"""
    order_id: int
    qr_code_data: str
    amount: Decimal
    payment_method: str = "UPI"

class ProductPriceUpdate(BaseModel):
    """Schema for updating product price"""
    price: Decimal
    
    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v