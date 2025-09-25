// API Configuration
const API_BASE_URL = window.location.origin;
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// DOM Elements
const elements = {
    categoriesContainer: document.getElementById('categoriesContainer'),
    productsGrid: document.getElementById('productsGrid'),
    searchInput: document.getElementById('searchInput'),
    cartSection: document.getElementById('cartSection'),
    cartCount: document.getElementById('cartCount'),
    cartSidebar: document.getElementById('cartSidebar'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    authSection: document.getElementById('authSection'),
    authText: document.getElementById('authText'),
    loginModal: document.getElementById('loginModal'),
    priceModal: document.getElementById('priceModal'),
    overlay: document.getElementById('overlay'),
    loading: document.getElementById('loading'),
    toastContainer: document.getElementById('toastContainer')
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateCartUI();
    updateAuthUI();
});

// Initialize Application
async function initializeApp() {
    try {
        showLoading();
        await loadCategories();
        await loadProducts();
    } catch (error) {
        showToast('Error loading data: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Cart toggle
    elements.cartSection.addEventListener('click', toggleCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    
    // Auth modal
    elements.authSection.addEventListener('click', openAuthModal);
    document.getElementById('closeModal').addEventListener('click', closeAuthModal);
    document.getElementById('authSwitchBtn').addEventListener('click', switchAuthMode);
    
    // Auth form
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    
    // Price form
    document.getElementById('priceForm').addEventListener('submit', handlePriceUpdate);
    
    // Demo account buttons
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const username = e.target.dataset.user;
            const password = e.target.dataset.pass;
            loginWithDemo(username, password);
        });
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts(e.target.dataset.filter);
        });
    });
    
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);
    
    // Overlay click
    elements.overlay.addEventListener('click', closeModals);
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
}

// Load Categories
async function loadCategories() {
    try {
        const categories = await apiCall('/categories');
        renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        // Show default categories if API fails
        const defaultCategories = [
            { id: 1, name: 'Vegetables', icon: '🥕' },
            { id: 2, name: 'Fruits', icon: '🍎' },
            { id: 3, name: 'Leafy Greens', icon: '🥬' },
            { id: 4, name: 'Root Vegetables', icon: '🥔' },
            { id: 5, name: 'Citrus Fruits', icon: '🍊' },
            { id: 6, name: 'Berries', icon: '🍓' }
        ];
        renderCategories(defaultCategories);
    }
}

// Load Products
async function loadProducts() {
    try {
        const products = await apiCall('/products');
        renderProducts(products);
        window.allProducts = products; // Store for filtering
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

// Render Categories
function renderCategories(categories) {
    const categoryIcons = {
        'Vegetables': '🥕',
        'Fruits': '🍎',
        'Leafy Greens': '🥬',
        'Root Vegetables': '🥔',
        'Citrus Fruits': '🍊',
        'Berries': '🍓'
    };
    
    elements.categoriesContainer.innerHTML = categories.map(category => `
        <div class="category-item" data-category="${category.id}">
            <div class="category-image">
                ${categoryIcons[category.name] || '🌱'}
            </div>
            <div class="category-name">${category.name}</div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            const categoryId = item.dataset.category;
            filterProductsByCategory(categoryId);
        });
    });
}

// Render Products with real images
function renderProducts(products) {
    const productImages = {
        'Fresh Tomatoes': 'https://images.unsplash.com/photo-1546470427-e2e4ec67b914?ixlib=rb-4.0.3&w=400&q=80',
        'Green Bell Peppers': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&w=400&q=80',
        'Fresh Cucumbers': 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?ixlib=rb-4.0.3&w=400&q=80',
        'Red Apples': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&w=400&q=80',
        'Fresh Bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&w=400&q=80',
        'Orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-4.0.3&w=400&q=80',
        'Fresh Spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&w=400&q=80',
        'Mint Leaves': 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?ixlib=rb-4.0.3&w=400&q=80',
        'Potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&w=400&q=80',
        'Carrots': 'https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&w=400&q=80',
        'Strawberries': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-4.0.3&w=400&q=80'
    };
    
    elements.productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${currentUser && currentUser.role === 'admin' ? 
                `<button class="admin-edit-btn" onclick="openPriceModal(${product.id}, '${product.name}', ${product.price})">
                    <i class="fas fa-edit"></i>
                </button>` : ''
            }
            <div class="product-image">
                <img src="${productImages[product.name] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&w=400&q=80'}" 
                     alt="${product.name}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:4rem; background: var(--gradient-accent);">
                    🌱
                </div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description || 'Fresh and high quality'}</div>
                <div class="product-details">
                    <div class="product-price">₹${product.price}<span class="product-unit">/${product.unit}</span></div>
                    <div class="stock">Stock: ${product.stock_quantity}</div>
                </div>
                <div class="product-meta">
                    ${product.is_organic ? '<span class="product-tag organic">Organic</span>' : ''}
                    ${product.origin ? `<span class="product-tag">From ${product.origin}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.unit}')">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="add-to-wishlist" onclick="addToWishlist(${product.id})" title="Add to Wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Price Management Functions
let currentProductId = null;

function openPriceModal(productId, productName, currentPrice) {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('Admin access required', 'error');
        return;
    }
    
    currentProductId = productId;
    document.getElementById('newPrice').value = currentPrice;
    elements.priceModal.classList.add('open');
    elements.overlay.classList.add('open');
}

function closePriceModal() {
    elements.priceModal.classList.remove('open');
    elements.overlay.classList.remove('open');
    currentProductId = null;
}

async function handlePriceUpdate(e) {
    e.preventDefault();
    
    if (!currentProductId) {
        showToast('No product selected', 'error');
        return;
    }
    
    const newPrice = parseFloat(document.getElementById('newPrice').value);
    if (newPrice <= 0) {
        showToast('Price must be positive', 'error');
        return;
    }
    
    try {
        showLoading();
        
        await apiCall(`/products/${currentProductId}/price`, {
            method: 'PUT',
            body: JSON.stringify({ price: newPrice })
        });
        
        // Refresh products
        await loadProducts();
        closePriceModal();
        showToast('Price updated successfully!', 'success');
        
    } catch (error) {
        showToast('Error updating price: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Cart Functions
function addToCart(productId, name, price, unit) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: parseFloat(price),
            unit: unit,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showToast(`${name} added to cart!`, 'success');
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    elements.cartCount.textContent = totalItems;
    elements.cartTotal.textContent = totalAmount.toFixed(2);
    
    renderCartItems();
}

function renderCartItems() {
    if (cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div style="text-align: center; color: #7f8c8d; padding: 40px;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Your cart is empty</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add some fresh products!</p>
            </div>
        `;
        return;
    }
    
    elements.cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="cart-item-image">
                🌱
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}/${item.unit}</div>
            </div>
            <div class="quantity-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
}

function toggleCart() {
    elements.cartSidebar.classList.toggle('open');
    elements.overlay.classList.toggle('open');
}

function closeCart() {
    elements.cartSidebar.classList.remove('open');
    elements.overlay.classList.remove('open');
}

// Authentication Functions
function updateAuthUI() {
    if (currentUser) {
        elements.authText.textContent = `Hi, ${currentUser.username}`;
        if (currentUser.role === 'admin') {
            elements.authText.textContent += ' (Admin)';
        }
        elements.authSection.onclick = showUserMenu;
        
        // Refresh products to show admin buttons
        if (window.allProducts) {
            renderProducts(window.allProducts);
        }
    } else {
        elements.authText.textContent = 'Sign In';
        elements.authSection.onclick = openAuthModal;
    }
}

function openAuthModal() {
    elements.loginModal.classList.add('open');
    elements.overlay.classList.add('open');
}

function closeAuthModal() {
    elements.loginModal.classList.remove('open');
    elements.overlay.classList.remove('open');
}

function switchAuthMode() {
    const isLogin = document.getElementById('authSubmit').textContent === 'Sign In';
    const modalTitle = document.getElementById('modalTitle');
    const authSubmit = document.getElementById('authSubmit');
    const extraFields = document.getElementById('extraFields');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchBtn = document.getElementById('authSwitchBtn');
    
    if (isLogin) {
        modalTitle.textContent = 'Sign Up';
        authSubmit.textContent = 'Sign Up';
        extraFields.style.display = 'block';
        authSwitchText.textContent = 'Already have an account?';
        authSwitchBtn.textContent = 'Sign In';
    } else {
        modalTitle.textContent = 'Sign In';
        authSubmit.textContent = 'Sign In';
        extraFields.style.display = 'none';
        authSwitchText.textContent = "Don't have an account?";
        authSwitchBtn.textContent = 'Sign Up';
    }
}

async function handleAuth(e) {
    e.preventDefault();
    const isLogin = document.getElementById('authSubmit').textContent === 'Sign In';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        showLoading();
        
        if (isLogin) {
            await login(username, password);
        } else {
            const email = document.getElementById('email').value;
            const fullName = document.getElementById('fullName').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            
            await register(username, password, email, fullName, phone, address);
        }
        
        closeAuthModal();
        showToast(isLogin ? 'Login successful!' : 'Registration successful!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    authToken = data.access_token;
    localStorage.setItem('authToken', authToken);
    
    // Get user profile
    const userResponse = await apiCall('/users/me');
    currentUser = userResponse;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateAuthUI();
}

async function register(username, password, email, fullName, phone, address) {
    const userData = {
        username,
        password,
        email,
        full_name: fullName,
        phone,
        address
    };
    
    await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    
    // Auto login after registration
    await login(username, password);
}

async function loginWithDemo(username, password) {
    try {
        showLoading();
        await login(username, password);
        closeAuthModal();
        const role = currentUser.role === 'admin' ? ' (Admin Access)' : '';
        showToast(`Logged in as ${username}${role}!`, 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Search and Filter Functions
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    if (!window.allProducts) return;
    
    const filtered = window.allProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
    );
    
    renderProducts(filtered);
}

function filterProducts(filter) {
    if (!window.allProducts) return;
    
    let filtered = window.allProducts;
    
    switch (filter) {
        case 'organic':
            filtered = window.allProducts.filter(p => p.is_organic);
            break;
        case 'vegetables':
            filtered = window.allProducts.filter(p => 
                p.category && p.category.name && 
                p.category.name.toLowerCase().includes('vegetable')
            );
            break;
        case 'fruits':
            filtered = window.allProducts.filter(p => 
                p.category && p.category.name && 
                p.category.name.toLowerCase().includes('fruit')
            );
            break;
        default:
            filtered = window.allProducts;
    }
    
    renderProducts(filtered);
}

function filterProductsByCategory(categoryId) {
    if (!window.allProducts) return;
    
    const filtered = window.allProducts.filter(p => p.category_id == categoryId);
    renderProducts(filtered);
    
    // Scroll to products section
    document.querySelector('.products').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
    });
}

// Checkout Function
async function handleCheckout() {
    if (!currentUser) {
        openAuthModal();
        showToast('Please sign in to checkout', 'warning');
        return;
    }
    
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        // Add items to cart on server
        for (const item of cart) {
            await apiCall('/cart/add', {
                method: 'POST',
                body: JSON.stringify({
                    product_id: item.id,
                    quantity: item.quantity
                })
            });
        }
        
        // Create order
        const orderData = {
            delivery_address: currentUser.address || 'Default Address',
            notes: 'Order from FreshMart web interface'
        };
        
        const order = await apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        // Clear local cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        closeCart();
        
        // Show order confirmation
        showOrderConfirmation(order);
        
    } catch (error) {
        showToast('Checkout failed: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function showOrderConfirmation(order) {
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Order Confirmed! 🎉</h3>
            </div>
            <div class="modal-body" style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
                <p>Your order <strong>${order.order_number}</strong> has been placed successfully!</p>
                <p>Total Amount: <strong>₹${order.total_amount}</strong></p>
                <button class="auth-btn" onclick="viewQRCode(${order.id})" style="margin: 15px 0;">
                    <i class="fas fa-qrcode"></i> View Payment QR Code
                </button>
                <button class="auth-btn" onclick="closeOrderModal()" style="background: var(--text-secondary);">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    window.closeOrderModal = () => {
        document.body.removeChild(modal);
        elements.overlay.classList.remove('open');
    };
}

async function viewQRCode(orderId) {
    try {
        showLoading();
        const qrData = await apiCall(`/orders/${orderId}/qr-code`);
        
        const modal = document.createElement('div');
        modal.className = 'modal open';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-qrcode"></i> Payment QR Code</h3>
                    <button onclick="closeQRModal()" class="close-modal">×</button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <img src="${qrData.qr_code_image}" alt="QR Code" style="max-width: 250px; margin: 20px 0; border: 2px solid var(--border-color); border-radius: var(--border-radius);">
                    <p><strong>Order:</strong> ${qrData.order_number}</p>
                    <p><strong>Amount:</strong> ₹${qrData.amount}</p>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius);">
                        ${qrData.payment_instructions}
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        window.closeQRModal = () => {
            document.body.removeChild(modal);
        };
        
    } catch (error) {
        showToast('Error loading QR code: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading() {
    elements.loading.classList.add('show');
}

function hideLoading() {
    elements.loading.classList.remove('show');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => elements.toastContainer.removeChild(toast), 300);
    }, 3000);
}

function closeModals() {
    closeCart();
    closeAuthModal();
    closePriceModal();
    elements.overlay.classList.remove('open');
}

// Wishlist Functions
async function addToWishlist(productId) {
    if (!currentUser) {
        openAuthModal();
        showToast('Please sign in to add to wishlist', 'warning');
        return;
    }
    
    try {
        await apiCall('/wishlist/add', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId })
        });
        showToast('Added to wishlist!', 'success');
    } catch (error) {
        showToast('Error adding to wishlist: ' + error.message, 'error');
    }
}