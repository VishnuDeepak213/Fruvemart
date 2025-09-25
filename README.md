# FV Commerce - Vegetables & Fruits E-commerce Platform

## Overview
A modern, efficient e-commerce platform built with FastAPI for selling vegetables and fruits. Features include user authentication, admin dashboard, real-time cart management, and QR code payment integration.

## 🚀 Features

### Customer Features
- **Modern UI/UX**: Swiggy-inspired design with real product images from Unsplash
- **Product Catalog**: Browse vegetables and fruits with detailed information
- **Smart Search**: Real-time product search with category filtering
- **Shopping Cart**: Add/remove items with quantity management
- **Wishlist**: Save favorite products for later
- **Order History**: Track past orders and reorder functionality
- **QR Code Payments**: Generate QR codes for quick payments
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Comprehensive Dashboard**: Real-time statistics and analytics
- **Price Management**: Update product prices with detailed tracking
- **Inventory Control**: Monitor stock levels and product status
- **Order Management**: View and manage customer orders
- **User Management**: Admin user controls and permissions

### Technical Features
- **FastAPI Backend**: High-performance Python web framework
- **JWT Authentication**: Secure token-based authentication
- **SQLAlchemy ORM**: Robust database operations
- **Real-time Updates**: Live cart and inventory updates
- **RESTful API**: Well-documented API endpoints

## 🛠 Technology Stack

- **Backend**: FastAPI 0.104.1, Python 3.12
- **Database**: SQLAlchemy with SQLite
- **Authentication**: JWT tokens, bcrypt password hashing
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with Inter font, responsive design
- **Images**: Unsplash API for real product images
- **Icons**: Font Awesome 6.0

## 📋 Installation & Setup

### Prerequisites
- Python 3.12+
- pip package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fv-commerce
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the application**
   - Customer Interface: http://localhost:8000/frontend/index.html
   - Admin Dashboard: http://localhost:8000/frontend/admin.html
   - API Documentation: http://localhost:8000/docs

### Custom Domain Setup (Optional)

For a better experience, you can set up a custom domain:

1. **Open Command Prompt as Administrator**
2. **Add to Windows hosts file**:
   ```cmd
   echo 127.0.0.1 fvcommerce.local >> C:\Windows\System32\drivers\etc\hosts
   ```
3. **Access via custom domain**:
   - Customer: http://fvcommerce.local:8000/frontend/index.html
   - Admin: http://fvcommerce.local:8000/frontend/admin.html

> **Note**: If you get "This site can't be reached" error, use the localhost URLs instead.

## 🔐 Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator (auto-redirects to admin dashboard)

### Test User Account
- **Username**: `john_doe`
- **Password**: `secret123`
- **Role**: Customer (stays on main shopping page)

## 🎯 Login Behavior

### **Admin Login**:
1. Enter admin credentials on the main page
2. **Auto-redirect** to admin dashboard after successful login
3. Access comprehensive admin features (price management, statistics, etc.)

### **Customer Login**:
1. Enter customer credentials on the main page
2. **Stay** on the main shopping page
3. Access shopping features (cart, wishlist, orders, etc.)

### **Alternative Access Methods**:
- **Admin Button**: Click the gear icon (⚙️) in bottom-right corner of main page
- **Direct URL**: Access admin dashboard directly at `/frontend/admin.html`

## 📁 Project Structure

```
fv-commerce/
├── app/
│   ├── main.py          # FastAPI application
│   ├── models.py        # Database models
│   ├── schemas.py       # Pydantic schemas
│   ├── auth.py          # Authentication logic
│   └── database.py      # Database configuration
├── frontend/
│   ├── index.html       # Customer interface
│   ├── admin.html       # Admin dashboard
│   ├── styles.css       # Main styles
│   ├── admin-styles.css # Admin-specific styles
│   ├── script.js        # Client-side logic
│   └── admin.js         # Admin dashboard logic
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## 🎯 Usage Guide

### For Customers
1. **Browse Products**: View vegetables and fruits with real images
2. **Search & Filter**: Use the search bar or filter by category
3. **Add to Cart**: Click "Add to Cart" on desired products
4. **Manage Wishlist**: Save products for later purchase
5. **Checkout**: Review cart and proceed to checkout
6. **Payment**: Generate QR code for payment completion
7. **Order History**: View past orders and reorder items

### For Administrators
1. **Login**: Use admin credentials to access dashboard
2. **Dashboard Overview**: View key statistics and metrics
3. **Price Management**: 
   - Navigate to "Set Prices" section
   - View all products in table format
   - Click edit icon to modify prices
   - Track price changes with percentage calculations
4. **Refresh Data**: Use refresh button to update product information
5. **User Management**: Monitor user accounts and activity

## 🔧 API Endpoints

### Authentication
- `POST /token` - User login
- `GET /users/me` - Get current user info

### Products
- `GET /products` - List all products
- `GET /products/{id}` - Get product details
- `PUT /products/{id}/price` - Update product price (Admin)

### Categories
- `GET /categories` - List all categories

### Cart & Orders
- `POST /cart/add` - Add item to cart
- `DELETE /cart/remove/{item_id}` - Remove cart item
- `GET /cart` - Get user's cart
- `POST /orders` - Create new order
- `GET /orders` - Get user's orders
- `GET /orders/{id}/qr-code` - Get payment QR code

### Wishlist
- `POST /wishlist/add` - Add to wishlist
- `DELETE /wishlist/remove/{item_id}` - Remove from wishlist
- `GET /wishlist` - Get user's wishlist

## 🎨 Customization

### Theme Colors
The application uses a green-based theme suitable for organic/fresh produce:
- Primary Green: `#2d5a27`
- Secondary Green: `#4a7c59`
- Accent Green: `#6ab04c`

### Product Images
Real images are fetched from Unsplash using category-specific queries:
- Vegetables: Fresh, organic vegetable photography
- Fruits: High-quality fruit images

## 🚀 Deployment

### Local Development
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Deployment
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## � Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, please contact the development team or create an issue in the repository.

---

**FV Commerce** - Fresh vegetables and fruits delivered with modern technology! 🥕🍎Vegetables & Fruits Store

A comprehensive e-commerce API for selling fresh vegetables and fruits, built with FastAPI, featuring multi-role authentication, shopping cart, wishlist, order management, and QR code payments.

## ✨ Features

### � **Multi-Role Authentication System**
- **👤 User Login**: Regular customers with shopping capabilities
- **👨‍💼 Admin Login**: Store administrators with management privileges
- **👨‍💻 Developer Login**: System developers with full access
- **🔒 JWT-based Security**: Secure token-based authentication

### 🛒 **E-Commerce Functionality**
- **🥬 Product Catalog**: Organized by categories (Vegetables, Fruits, Leafy Greens, etc.)
- **🛒 Shopping Cart**: Add, remove, and manage cart items
- **❤️ Wishlist**: Save favorite products for later
- **� Order Management**: Complete order history and tracking
- **💳 QR Code Payments**: Generate UPI QR codes for payments
- **📱 Mobile-Friendly**: Responsive API design

### 🎯 **Advanced Features**
- **🌱 Organic Filtering**: Filter products by organic/conventional
- **� Inventory Management**: Real-time stock tracking
- **🚚 Delivery Management**: Address and delivery tracking
- **📈 Analytics Ready**: Admin dashboard capabilities
- **� Search & Filter**: Advanced product filtering

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- SQLite (default) or PostgreSQL

### Installation

1. **Navigate to project**:
   ```bash
   cd "v:\fv commerce"
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize database with sample data**:
   ```bash
   python reset_db.py
   ```

4. **Start the server**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

### 🌐 **Access the API**
- **🏠 Homepage**: http://localhost:8000
- **📚 Interactive Docs**: http://localhost:8000/docs
- **📖 ReDoc**: http://localhost:8000/redoc
- **💚 Health Check**: http://localhost:8000/health

## 👥 **Login Credentials**

The database comes pre-populated with sample users:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| 🔹 **User** | `john_doe` | `user123` | Regular customer account |
| 🔹 **Admin** | `admin` | `admin123` | Store administrator |
| � **Developer** | `developer` | `dev123` | System developer |

## 🛠️ **API Endpoints**

### 🔐 Authentication
- `POST /register` - Register new user
- `POST /token` - Login and get access token
- `GET /users/me` - Get current user profile

### 🛒 Products & Categories
- `GET /categories` - List all categories
- `GET /products` - List products (with filters)
- `GET /products/{id}` - Get specific product
- `POST /products` - Create product (Admin only)
- `POST /categories` - Create category (Admin only)

### 🛒 Shopping Cart
- `POST /cart/add` - Add item to cart
- `GET /cart` - View cart with total
- `DELETE /cart/{item_id}` - Remove from cart

### ❤️ Wishlist
- `POST /wishlist/add` - Add to wishlist
- `GET /wishlist` - View wishlist
- `DELETE /wishlist/{item_id}` - Remove from wishlist

### 📦 Orders & Payments
- `POST /orders` - Create order from cart
- `GET /orders` - Order history
- `GET /orders/{id}` - Specific order details
- `GET /orders/{id}/qr-code` - Get payment QR code

### 👨‍💼 Admin Endpoints
- `GET /admin/orders` - All orders management
- `GET /admin/users` - User management

## 🏗️ **Project Structure**

```
fv commerce/
├── app/
│   ├── main.py          # FastAPI application & routes
│   ├── models.py        # Database models
│   ├── schemas.py       # Pydantic schemas
│   ├── auth.py          # Authentication logic
│   └── database.py      # Database configuration
├── tests/
│   └── test_main.py     # Test suite
├── seed_data.py         # Sample data creator
├── reset_db.py          # Database reset utility
├── requirements.txt     # Dependencies
└── README.md           # This file
```

## 📱 **Sample Products Available**

### 🥬 **Vegetables**
- Fresh Tomatoes (₹45/kg) 🍅
- Green Bell Peppers (₹60/kg) 🌶️
- Fresh Cucumbers (₹35/kg) 🥒

### 🍎 **Fruits**
- Red Apples (₹120/kg) 🍎
- Fresh Bananas (₹50/dozen) 🍌
- Oranges (₹80/kg) 🍊

### 🥬 **Leafy Greens**
- Fresh Spinach (₹40/bunch) 🥬
- Mint Leaves (₹20/bunch) 🌿

### 🥕 **Root Vegetables**
- Potatoes (₹30/kg) 🥔
- Carrots (₹55/kg) 🥕

### 🍓 **Berries**
- Strawberries (₹200/kg) 🍓

## 💳 **QR Code Payment System**

The system generates UPI QR codes for seamless payments:
- **📱 UPI Integration**: Compatible with all UPI apps
- **🔒 Secure**: Unique transaction IDs
- **⚡ Instant**: Real-time payment processing
- **📊 Tracking**: Payment status updates

## 🧪 **Testing**

Run the comprehensive test suite:
```bash
pytest tests/ -v
```

## 🔧 **Configuration**

Environment variables (`.env`):
```env
DATABASE_URL=sqlite:///./fv_commerce.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

## � **Production Deployment**

For production:
1. Use PostgreSQL instead of SQLite
2. Set secure `SECRET_KEY`
3. Configure proper CORS origins
4. Use production WSGI server:
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

## 📈 **Why This Solution?**

- **⚡ FastAPI**: 3x faster than Flask, 2x faster than Django
- **🔒 Security**: Multi-role authentication with JWT
- **📱 Modern**: API-first design, mobile-ready
- **🎯 Specialized**: Built specifically for fresh produce
- **💳 Payment Ready**: QR code integration
- **🛒 Complete**: Cart, wishlist, orders - everything needed

## 📄 License

MIT License - feel free to use for your vegetable and fruit business! 🥕🍎