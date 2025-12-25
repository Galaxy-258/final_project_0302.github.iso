// 订单确认页面功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('订单页面加载完成');
    
    // 从URL获取订单ID
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    // 如果没有订单ID，尝试从localStorage获取
    if (!orderId) {
        loadOrderFromStorage();
    } else {
        loadOrderById(orderId);
    }
    
    // 初始化页面按钮
    initOrderButtons();
    
    // 更新用户导航状态
    updateUserNavigation();
});

// 从localStorage加载订单
function loadOrderFromStorage() {
    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo'));
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    
    if (orderInfo) {
        displayOrderInfo(orderInfo);
    } else if (orders.length > 0) {
        const latestOrder = orders[orders.length - 1];
        displayOrderInfo(latestOrder);
    } else {
        displayDefaultOrder();
    }
}

// 根据订单ID加载订单
function loadOrderById(orderId) {
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        displayOrderInfo(order);
    } else {
        loadOrderFromStorage();
    }
}

// 显示订单信息
function displayOrderInfo(order) {
    // 显示订单号
    const orderIdElement = document.getElementById('orderId');
    if (orderIdElement && order.id) {
        orderIdElement.textContent = order.id;
    } else if (orderIdElement) {
        orderIdElement.textContent = 'ORD' + Date.now();
    }
    
    // 显示订单时间
    const orderTimeElement = document.getElementById('orderTime');
    if (orderTimeElement) {
        const time = order.createdAt ? new Date(order.createdAt) : new Date();
        orderTimeElement.textContent = time.toLocaleString('zh-CN');
    }
    
    // 显示订单金额
    const totalElement = document.getElementById('orderTotal');
    const subtotalElement = document.getElementById('orderSubtotal');
    const shippingFeeElement = document.getElementById('orderShippingFee');
    const discountElement = document.getElementById('orderDiscount');
    const finalTotalElement = document.getElementById('orderFinalTotal');
    
    if (totalElement) totalElement.textContent = `¥${(order.total || 0).toFixed(2)}`;
    if (subtotalElement) subtotalElement.textContent = `¥${(order.subtotal || 0).toFixed(2)}`;
    if (shippingFeeElement) shippingFeeElement.textContent = `¥${(order.shippingFee || 15).toFixed(2)}`;
    if (discountElement) discountElement.textContent = `-¥${(order.discount || 0).toFixed(2)}`;
    if (finalTotalElement) finalTotalElement.textContent = `¥${(order.total || 0).toFixed(2)}`;
    
    // 显示配送和支付方式
    const shippingElement = document.getElementById('orderShipping');
    const paymentElement = document.getElementById('orderPayment');
    const addressElement = document.getElementById('orderAddress');
    
    if (shippingElement && order.shipping) shippingElement.textContent = order.shipping;
    if (paymentElement && order.paymentMethod) paymentElement.textContent = order.paymentMethod;
    if (addressElement && order.shippingAddress) addressElement.textContent = order.shippingAddress;
    
    // 显示订单商品
    displayOrderItems(order.items || []);
}

// 显示订单商品
function displayOrderItems(items) {
    const itemsContainer = document.getElementById('orderItems');
    if (!itemsContainer) return;
    
    itemsContainer.innerHTML = '';
    
    if (items.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-order">
                <p>没有商品信息</p>
            </div>
        `;
        return;
    }
    
    items.forEach(item => {
        const subtotal = item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="order-item-image">
                <img src="${item.image || './uploads/default-product.png'}" alt="${item.name}">
            </div>
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-spec">${item.spec || '默认规格'}</div>
                <div class="order-item-price-quantity">
                    <div class="order-item-price">¥${subtotal.toFixed(2)}</div>
                    <div class="order-item-quantity">× ${item.quantity}</div>
                </div>
            </div>
        `;
        itemsContainer.appendChild(itemElement);
    });
}

// 显示默认订单信息
function displayDefaultOrder() {
    const orderIdElement = document.getElementById('orderId');
    if (orderIdElement) {
        orderIdElement.textContent = Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    const orderTimeElement = document.getElementById('orderTime');
    if (orderTimeElement) {
        orderTimeElement.textContent = new Date().toLocaleString('zh-CN');
    }
    
    const totalElement = document.getElementById('orderTotal');
    const finalTotalElement = document.getElementById('orderFinalTotal');
    if (totalElement) totalElement.textContent = '¥0.00';
    if (finalTotalElement) finalTotalElement.textContent = '¥0.00';
    
    displayOrderItems([]);
}

// 初始化页面按钮
function initOrderButtons() {
    console.log('初始化订单页面按钮');
    
    // 绑定查看订单按钮
    const viewOrdersBtn = document.querySelector('.btn-view-orders');
    if (viewOrdersBtn) {
        viewOrdersBtn.onclick = function(e) {
            e.preventDefault();
            alert('这里可以显示用户的所有订单。');
            return false;
        };
    }
    
    // 绑定支付按钮
    const payNowBtn = document.querySelector('.btn-pay-now');
    if (payNowBtn) {
        payNowBtn.onclick = function(e) {
            e.preventDefault();
            
            if (this.disabled) return false;
            
            const confirmed = confirm('确定要支付吗？');
            if (!confirmed) return false;
            
            this.disabled = true;
            
            alert('支付成功！');
            
            // 更新订单状态
            const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
            if (orders.length > 0) {
                orders[orders.length - 1].status = '已支付';
                localStorage.setItem('userOrders', JSON.stringify(orders));
            }
            
            // 显示成功消息
            const successIcon = document.querySelector('.success-icon');
            const orderTitle = document.querySelector('.order-success h2');
            
            if (successIcon) {
                successIcon.className = 'fas fa-check-double';
                successIcon.style.color = '#27ae60';
            }
            
            if (orderTitle) {
                orderTitle.textContent = '支付成功！';
            }
            
            // 更新按钮
            this.innerHTML = '<i class="fas fa-check"></i> 已支付';
            this.style.background = '#27ae60';
            this.style.borderColor = '#27ae60';
            this.style.cursor = 'default';
            this.onclick = null;
            
            // 更新提示信息
            const tips = document.querySelector('.order-tips p');
            if (tips) {
                tips.innerHTML = '<i class="fas fa-check-circle"></i> 支付成功！订单已确认，我们会尽快为您安排发货。';
                tips.style.color = '#27ae60';
            }
            
            return false;
        };
    }
}

// ========== 用户状态管理 ==========
function updateUserNavigation() {
    console.log('更新用户导航状态');
    
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const loginLink = document.querySelector('.shortcut a[href="login.html"]');
    const registerLi = document.querySelector('.shortcut a[href="register.html"]')?.closest('li');
    
    if (!loginLink) return;
    
    if (user?.isLoggedIn) {
        // 用户已登录
        loginLink.textContent = `欢迎，${user.username}`;
        loginLink.href = 'javascript:void(0);';
        loginLink.style.color = '#5EB69C';
        loginLink.style.fontWeight = 'bold';
        
        // 调整间距
        const loginLi = loginLink.closest('li');
        if (loginLi) {
            loginLi.style.padding = '0 20px 0 15px';
        }
        
        // 移除注册链接
        if (registerLi) {
            registerLi.remove();
        }
        
        // 重新设置边框
        setTimeout(() => {
            const lis = document.querySelectorAll('.shortcut ul li');
            lis.forEach((li, i) => {
                // 设置间距
                if (i === 0 && loginLi) {
                    li.style.padding = '0 20px 0 15px';
                } else {
                    li.style.padding = '0 15px';
                }
                
                // 设置边框
                li.style.borderRight = i < lis.length - 1 ? '0.5px solid #999' : 'none';
            });
        }, 50);
        
        // 添加下拉菜单
        addUserDropdownMenu(loginLink, user);
        
    } else {
        // 用户未登录
        loginLink.textContent = '请先登录';
        loginLink.href = 'login.html';
        loginLink.style.color = '#fff';
        loginLink.style.fontWeight = 'normal';
        
        // 恢复默认间距
        const loginLi = loginLink.closest('li');
        if (loginLi) {
            loginLi.style.padding = '0 15px';
        }
    }
}

function addUserDropdownMenu(loginLink, user) {
    let menu = null;
    let hoverTimer = null;
    let closeTimer = null;
    
    const showMenu = (e) => {
        if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
        }
        
        hoverTimer = setTimeout(() => {
            if (!menu) {
                menu = createDropdownMenu(e, user);
                document.body.appendChild(menu);
                
                // 绑定菜单事件
                menu.addEventListener('mouseenter', () => {
                    if (closeTimer) clearTimeout(closeTimer);
                });
                
                menu.addEventListener('mouseleave', () => {
                    closeTimer = setTimeout(() => {
                        if (menu) {
                            menu.remove();
                            menu = null;
                        }
                    }, 300);
                });
            }
        }, 200);
    };
    
    const hideMenu = (e) => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        
        closeTimer = setTimeout(() => {
            if (menu) {
                menu.remove();
                menu = null;
            }
        }, 300);
    };
    
    loginLink.addEventListener('mouseenter', showMenu);
    loginLink.addEventListener('mouseleave', hideMenu);
}

function createDropdownMenu(event, user) {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const menu = document.createElement('div');
    menu.className = 'user-dropdown-menu';
    menu.innerHTML = `
        <div class="menu-header">
            <div class="user-info-small">
                <div class="username">${user.username}</div>
                <div class="user-email">${user.email || '未设置邮箱'}</div>
            </div>
        </div>
        <div class="menu-divider"></div>
        <a href="user-center.html" class="menu-item" id="userProfile">
            <span class="menu-icon">👤</span> 个人中心
        </a>
        <a href="cart.html" class="menu-item">
            <span class="menu-icon">🛒</span> 我的购物车
            <span class="cart-count">${cartCount}</span>
        </a>
        <a href="order.html" class="menu-item">
            <span class="menu-icon">📦</span> 我的订单
        </a>
        <a href="index.html" class="menu-item">
            <span class="menu-icon">🏠</span> 返回首页
        </a>
        <div class="menu-divider"></div>
        <a href="#" class="menu-item logout" onclick="logout()">
            <span class="menu-icon">🚪</span> 退出登录
        </a>
    `;
    
    const rect = event.target.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 5) + 'px';
    menu.style.right = (window.innerWidth - rect.right + 20) + 'px';
    menu.style.zIndex = '10000';
    
    return menu;
}

// 全局退出登录函数
window.logout = function() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('currentUser');
        window.location.reload();
    }
};

// 监听用户状态变化
window.addEventListener('storage', function(e) {
    if (e.key === 'currentUser') {
        updateUserNavigation();
    }
});

// 页面显示时更新用户状态
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateUserNavigation();
    }
});