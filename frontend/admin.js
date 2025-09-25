// API Configuration
const API_BASE_URL = window.location.origin;
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let products = [];
let orders = [];
let filteredOrders = [];

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    toastContainer: document.getElementById('toastContainer'),
    overlay: document.getElementById('overlay'),
    priceEditModal: document.getElementById('priceEditModal'),
    priceTableBody: document.getElementById('priceTableBody'),
    adminName: document.getElementById('adminName')
};

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    initializeDashboard();
});

// Check if user has admin access
function checkAdminAccess() {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('Admin access required. Redirecting to login...', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
    
    if (elements.adminName) {
        elements.adminName.textContent = currentUser.username;
    }
    return true;
}

// Initialize Dashboard
async function initializeDashboard() {
    if (!checkAdminAccess()) return;
    
    try {
        showLoading();
        await loadDashboardData();
        await loadProducts();
        await loadOrders();
        renderPriceTable();
    } catch (error) {
        showToast('Error loading dashboard: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Load Dashboard Statistics
async function loadDashboardData() {
    try {
        // Load products for stats
        const productsData = await apiCall('/products');
        document.getElementById('totalProducts').textContent = productsData.length;
        document.getElementById('activeProducts').textContent = productsData.filter(p => p.is_active).length;
        document.getElementById('lowStock').textContent = productsData.filter(p => p.stock_quantity < 10).length;
        
        // Load orders if they exist
        if (orders.length > 0) {
            const completedOrders = orders.filter(o => o.status === 'completed');
            const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
            
            document.getElementById('totalOrders').textContent = orders.length;
            document.getElementById('totalUsers').textContent = '45';
            document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
            document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'pending').length;
        } else {
            // Mock data for dashboard when orders aren't loaded yet
            document.getElementById('totalOrders').textContent = '23';
            document.getElementById('totalUsers').textContent = '45';
            document.getElementById('totalRevenue').textContent = '₹12,450';
            document.getElementById('pendingOrders').textContent = '5';
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load Products
async function loadProducts() {
    try {
        products = await apiCall('/products');
    } catch (error) {
        showToast('Error loading products: ' + error.message, 'error');
        products = [];
    }
}

// Render Price Table
function renderPriceTable() {
    if (!products.length) {
        elements.priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">No products found</td>
            </tr>
        `;
        return;
    }
    
    elements.priceTableBody.innerHTML = products.map(product => {
        const stockStatus = product.stock_quantity < 10 ? 'low' : 
                           product.stock_quantity < 50 ? 'medium' : 'high';
        const statusClass = stockStatus === 'low' ? 'status-warning' : 
                           stockStatus === 'medium' ? 'status-info' : 'status-success';
        
        return `
            <tr data-product-id="${product.id}">
                <td class="product-cell">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-desc">${product.description || ''}</div>
                    </div>
                </td>
                <td>
                    <span class="category-tag">${product.category ? product.category.name : 'N/A'}</span>
                </td>
                <td class="price-cell">
                    <span class="price">₹${product.price}</span>
                </td>
                <td class="unit-cell">${product.unit}</td>
                <td class="stock-cell">
                    <span class="stock ${stockStatus}">${product.stock_quantity}</span>
                </td>
                <td>
                    <span class="status ${statusClass}">
                        ${product.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn-edit" onclick="openPriceEditModal(${product.id})" title="Edit Price">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-view" onclick="viewProduct(${product.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Section Management
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked nav link
    const clickedLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (clickedLink) {
        clickedLink.classList.add('active');
    }
    
    // Load section-specific data
    if (sectionId === 'set-price') {
        renderPriceTable();
    }
}

// Toggle User Menu
function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const adminUser = document.querySelector('.admin-user');
    
    if (userMenu && adminUser) {
        userMenu.classList.toggle('show');
        adminUser.classList.toggle('active');
    }
}

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userMenu');
    const adminUser = document.querySelector('.admin-user');
    
    if (userMenu && adminUser) {
        if (!adminUser.contains(event.target)) {
            userMenu.classList.remove('show');
            adminUser.classList.remove('active');
        }
    }
});

// Price Edit Modal Functions
let currentEditProduct = null;

function openPriceEditModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }
    
    currentEditProduct = product;
    
    // Populate modal
    document.getElementById('editProductName').textContent = product.name;
    document.getElementById('editProductCategory').textContent = product.category ? product.category.name : 'N/A';
    document.getElementById('currentPrice').value = product.price;
    document.getElementById('currentUnit').textContent = `/${product.unit}`;
    document.getElementById('newPrice').value = product.price;
    document.getElementById('newUnit').textContent = `/${product.unit}`;
    
    // Reset price change display
    document.getElementById('priceChange').style.display = 'none';
    
    // Show modal
    elements.priceEditModal.classList.add('open');
    elements.overlay.classList.add('open');
    
    // Focus on new price input
    document.getElementById('newPrice').focus();
}

function closePriceEditModal() {
    elements.priceEditModal.classList.remove('open');
    elements.overlay.classList.remove('open');
    currentEditProduct = null;
}

// Calculate and show price change
document.getElementById('newPrice').addEventListener('input', function() {
    const currentPrice = parseFloat(document.getElementById('currentPrice').value) || 0;
    const newPrice = parseFloat(this.value) || 0;
    
    if (newPrice > 0 && newPrice !== currentPrice) {
        const change = newPrice - currentPrice;
        const percentChange = ((change / currentPrice) * 100).toFixed(1);
        
        const changeAmount = document.getElementById('changeAmount');
        const changePercent = document.getElementById('changePercent');
        
        changeAmount.textContent = `${change > 0 ? '+' : ''}₹${change.toFixed(2)}`;
        changePercent.textContent = `(${change > 0 ? '+' : ''}${percentChange}%)`;
        
        changeAmount.className = change > 0 ? 'change-amount text-success' : 'change-amount text-danger';
        changePercent.className = change > 0 ? 'change-percent text-success' : 'change-percent text-danger';
        
        document.getElementById('priceChange').style.display = 'flex';
    } else {
        document.getElementById('priceChange').style.display = 'none';
    }
});

// Handle price update form submission
document.getElementById('priceEditForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentEditProduct) {
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
        
        await apiCall(`/products/${currentEditProduct.id}/price`, {
            method: 'PUT',
            body: JSON.stringify({ price: newPrice })
        });
        
        // Update local product data
        currentEditProduct.price = newPrice;
        
        // Refresh table
        renderPriceTable();
        
        // Close modal
        closePriceEditModal();
        
        showToast(`Price updated successfully! ${currentEditProduct.name} is now ₹${newPrice}/${currentEditProduct.unit}`, 'success');
        
    } catch (error) {
        showToast('Error updating price: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// Refresh prices
async function refreshPrices() {
    try {
        showLoading();
        await loadProducts();
        renderPriceTable();
        showToast('Prices refreshed successfully!', 'success');
    } catch (error) {
        showToast('Error refreshing prices: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// View product details (placeholder)
function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        showToast(`Viewing ${product.name} - Feature coming soon!`, 'warning');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
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

// Utility Functions
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

// Close modal on overlay click
elements.overlay.addEventListener('click', function() {
    closePriceEditModal();
});

// ============ ORDER MANAGEMENT FUNCTIONS ============

// Load Orders
async function loadOrders() {
    try {
        // Since we don't have an orders endpoint yet, we'll create mock data
        orders = generateMockOrders();
        filteredOrders = [...orders];
        updateOrderStats();
        renderOrdersTimeline();
        renderOrdersTable();
    } catch (error) {
        console.error('Error loading orders:', error);
        orders = [];
        filteredOrders = [];
    }
}

// Generate Mock Orders (Replace with real API call)
function generateMockOrders() {
    const mockOrders = [];
    const customers = ['john_doe', 'jane_smith', 'bob_wilson', 'alice_brown', 'charlie_davis'];
    const statuses = ['pending', 'completed', 'cancelled'];
    
    for (let i = 1; i <= 50; i++) {
        const randomDays = Math.floor(Math.random() * 30);
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - randomDays);
        
        const itemCount = Math.floor(Math.random() * 5) + 1;
        const baseAmount = Math.floor(Math.random() * 500) + 50;
        
        mockOrders.push({
            id: i,
            customer: customers[Math.floor(Math.random() * customers.length)],
            items: `${itemCount} item${itemCount > 1 ? 's' : ''}`,
            amount: baseAmount,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            created_at: orderDate.toISOString(),
            items_detail: `Various vegetables and fruits (${itemCount} items)`
        });
    }
    
    return mockOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Update Order Statistics
function updateOrderStats() {
    const totalOrders = orders.length;
    const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.amount, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    }).length;
    
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    // Update DOM elements
    document.getElementById('totalOrdersCount').textContent = totalOrders;
    document.getElementById('totalRevenueStat').textContent = `₹${totalRevenue.toLocaleString()}`;
    document.getElementById('todayOrdersCount').textContent = todayOrders;
    document.getElementById('avgOrderValue').textContent = `₹${avgOrderValue.toLocaleString()}`;
}

// Render Orders Timeline
function renderOrdersTimeline() {
    const timelineContainer = document.getElementById('ordersTimeline');
    if (!timelineContainer) return;
    
    const recentOrders = filteredOrders.slice(0, 10);
    
    if (recentOrders.length === 0) {
        timelineContainer.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-inbox"></i>
                <p>No orders found</p>
            </div>
        `;
        return;
    }
    
    timelineContainer.innerHTML = recentOrders.map(order => {
        const orderDate = new Date(order.created_at);
        const timeAgo = formatTimeAgo(orderDate);
        
        return `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-order-id">Order #${order.id}</div>
                    <div class="timeline-customer">${order.customer}</div>
                    <div class="timeline-amount">₹${order.amount}</div>
                </div>
                <div class="timeline-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

// Render Orders Table
function renderOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-orders">
                    <i class="fas fa-search"></i>
                    <p>No orders found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredOrders.map(order => {
        const orderDate = new Date(order.created_at);
        const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        return `
            <tr>
                <td class="order-id">#${order.id}</td>
                <td class="order-customer">${order.customer}</td>
                <td class="order-items">${order.items_detail}</td>
                <td class="order-amount">₹${order.amount.toLocaleString()}</td>
                <td>
                    <span class="order-status ${order.status}">${order.status}</span>
                </td>
                <td class="order-date">${formattedDate}</td>
                <td class="order-actions">
                    <button class="btn-order-view" onclick="viewOrderDetails(${order.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Section Management (Updated to handle orders)
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav link
    event.target.closest('.nav-link').classList.add('active');
    
    // Load section-specific data
    if (sectionId === 'set-price') {
        refreshPrices();
    } else if (sectionId === 'orders') {
        refreshOrders();
    }
}

// Filter Orders by Timeline
function filterOrderTimeline() {
    const filter = document.getElementById('timelineFilter').value;
    const now = new Date();
    
    switch (filter) {
        case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.created_at);
                return orderDate >= today && orderDate < tomorrow;
            });
            break;
        case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredOrders = orders.filter(order => new Date(order.created_at) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filteredOrders = orders.filter(order => new Date(order.created_at) >= monthAgo);
            break;
        default:
            filteredOrders = [...orders];
    }
    
    renderOrdersTimeline();
    renderOrdersTable();
}

// Search Orders
function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredOrders = orders.filter(order => {
        const matchesSearch = !searchTerm || 
            order.id.toString().includes(searchTerm) ||
            order.customer.toLowerCase().includes(searchTerm) ||
            order.items_detail.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderOrdersTable();
}

// Filter Orders by Status
function filterOrders() {
    searchOrders(); // Reuse search logic which includes status filtering
}

// Refresh Orders
async function refreshOrders() {
    try {
        showLoading();
        await loadOrders();
        showToast('Orders refreshed successfully!', 'success');
    } catch (error) {
        showToast('Error refreshing orders: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// View Order Details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showToast(`Order #${orderId} details - Feature coming soon!`, 'info');
    }
}

// Utility function to format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}