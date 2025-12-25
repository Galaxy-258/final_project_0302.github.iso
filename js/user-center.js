// 个人中心功能
document.addEventListener('DOMContentLoaded', function() {
    // ========== 下拉菜单变量 ==========
    let currentMenu = null;
    let hoverTimeout = null;
    let closeTimeout = null;
    let currentLoginLink = null; // 保存当前的登录链接引用

    // 初始化个人中心
    initUserCenter();
    
    // ========== 用户状态更新 ==========
    function updatePageNavigation() {
        // 从localStorage获取用户信息
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // 找到登录和注册链接
        const loginLink = document.querySelector('.shortcut a[href="login.html"]');
        const registerLink = document.querySelector('.shortcut a[href="register.html"]');
        
        // 如果没有快捷导航，直接返回
        if (!loginLink) return;
        
        if (currentUser && currentUser.isLoggedIn) {
            // 用户已登录：显示用户名
            loginLink.textContent = `欢迎，${currentUser.username}`;
            loginLink.href = 'javascript:void(0);';
            loginLink.style.cursor = 'pointer';
            loginLink.style.fontWeight = '500';
            loginLink.style.color = '#5EB69C';
            
            // 隐藏注册链接
            if (registerLink) {
                registerLink.style.display = 'none';
            }
            
            // ========== 添加悬停下拉菜单功能 ==========
            currentLoginLink = loginLink; // 保存引用
            bindHoverMenu(loginLink, currentUser);
            
        } else {
            // 用户未登录：恢复默认状态
            loginLink.textContent = '请先登录';
            loginLink.href = 'login.html';
            loginLink.style.cursor = 'pointer';
            loginLink.style.fontWeight = 'normal';
            loginLink.style.color = '#fff';
            
            // 显示注册链接
            if (registerLink) {
                registerLink.style.display = 'block';
            }
        }
    }
    
    // ========== 下拉菜单功能 ==========
    
    // 绑定悬停下拉菜单事件
    function bindHoverMenu(loginLink, currentUser) {
        // 显示菜单函数
        const showMenu = (e) => {
            // 清除关闭的计时器
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
            
            // 延迟显示菜单，避免快速移动时频繁显示
            hoverTimeout = setTimeout(() => {
                if (!currentMenu) {
                    createDropdownMenu(e, currentUser);
                }
            }, 200);
        };
        
        // 隐藏菜单函数
        const hideMenu = (e) => {
            // 清除显示的计时器
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            
            // 检查鼠标是否移动到了菜单上
            if (currentMenu && currentMenu.contains(e.relatedTarget)) {
                return; // 鼠标移动到了菜单上，不隐藏
            }

            // 延迟隐藏菜单，给用户时间移动到菜单上
            closeTimeout = setTimeout(() => {
                removeDropdownMenu();
            }, 300);
        };
        
        // 绑定事件
        loginLink.addEventListener('mouseenter', showMenu);
        loginLink.addEventListener('mouseleave', hideMenu);
    }
    
    // 创建下拉菜单 - 使用表情符号
    function createDropdownMenu(event, currentUser) {
        // 获取购物车数量
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // 移除现有的菜单
        removeDropdownMenu();
        
        // 创建菜单元素 - 使用表情符号
        currentMenu = document.createElement('div');
        currentMenu.className = 'user-dropdown-menu';
        currentMenu.innerHTML = `
            <div class="menu-header">
                <div class="user-info-small">
                    <div class="username">${currentUser.username}</div>
                    <div class="user-email">${currentUser.email || '未设置邮箱'}</div>
                </div>
            </div>
            <div class="menu-divider"></div>
            <a href="user-center.html" class="menu-item">
                <span class="menu-icon">👤</span>
                <span>个人中心</span>
            </a>
            <a href="cart.html" class="menu-item">
                <span class="menu-icon">🛒</span>
                <span>我的购物车</span>
                ${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}
            </a>
            <a href="order.html" class="menu-item">
                <span class="menu-icon">📦</span>
                <span>我的订单</span>
            </a>
            <a href="index.html" class="menu-item">
                <span class="menu-icon">🏠</span>
                <span>返回首页</span>
            </a>
            <div class="menu-divider"></div>
            <a href="#" class="menu-item logout" id="userLogout">
                <span class="menu-icon">🚪</span>
                <span>退出登录</span>
            </a>
        `;
        
        // 定位菜单
        const linkRect = event.target.getBoundingClientRect();
        currentMenu.style.position = 'absolute';
        currentMenu.style.top = (linkRect.bottom + window.scrollY + 2) + 'px';
        currentMenu.style.right = (window.innerWidth - linkRect.right - 10) + 'px';
        currentMenu.style.zIndex = '1000';
        
        // 添加到页面
        document.body.appendChild(currentMenu);
        
        // 绑定退出登录事件
        const logoutBtn = currentMenu.querySelector('#userLogout');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('currentUser');
                removeDropdownMenu();
                window.location.reload();
            }
        });
        
        // 绑定链接点击事件，防止菜单过早关闭
        const menuItems = currentMenu.querySelectorAll('.menu-item:not(.logout)');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                removeDropdownMenu();
                // 允许正常跳转
            });
        });
        
        // 菜单本身的鼠标事件
        currentMenu.addEventListener('mouseenter', () => {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
        });
        
        currentMenu.addEventListener('mouseleave', (e) => {
            // 检查鼠标是否移动到了触发按钮上
            if (currentLoginLink && currentLoginLink.contains(e.relatedTarget)) {
                return;
            }
            
            closeTimeout = setTimeout(() => {
                removeDropdownMenu();
            }, 300);
        });
    }
    
    // 移除下拉菜单
    function removeDropdownMenu() {
        if (currentMenu) {
            currentMenu.remove();
            currentMenu = null;
        }
        // 清除所有计时器
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
    }
    
    // ========== 个人中心核心功能 ==========
    
    function initUserCenter() {
        // 检查登录状态
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.isLoggedIn) {
            // 显示一次提示后跳转
            alert('请先登录！');
            window.location.href = 'login.html';
            return;
        }
        
        // 加载用户信息
        loadUserInfo();
        
        // 加载订单数据
        loadOrders();
        
        // 绑定事件
        bindEvents();
        
        // 更新购物车徽章
        updateCartBadge();
        
        // 更新页面导航（这会添加下拉菜单）
        updatePageNavigation();
    }
    
    // 加载用户信息
    function loadUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) return;
        
        // 更新用户信息显示
        document.getElementById('usernameDisplay').textContent = currentUser.username;
        document.getElementById('emailDisplay').textContent = currentUser.email || '未设置邮箱';
        document.getElementById('usernameInput').value = currentUser.username;
        document.getElementById('emailInput').value = currentUser.email || '';
        
        // 设置注册时间（模拟数据）
        const registerTime = currentUser.registerTime || new Date().toISOString();
        const date = new Date(registerTime);
        document.getElementById('registerTime').value = date.toLocaleString('zh-CN');
        
        // 更新订单数量
        const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
        document.getElementById('orderCount').textContent = orders.length;
    }
    
    // 加载订单数据
    function loadOrders() {
        const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
        const ordersList = document.getElementById('ordersList');
        const emptyOrders = document.getElementById('emptyOrders');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // 过滤当前用户的订单
        const userOrders = orders.filter(order => order.userId === currentUser.username);
        
        if (userOrders.length === 0) {
            // 显示空状态
            emptyOrders.style.display = 'block';
            return;
        }
        
        // 隐藏空状态
        emptyOrders.style.display = 'none';
        
        // 清空现有订单（除了空状态）
        const existingOrders = document.querySelectorAll('.order-item');
        existingOrders.forEach(order => {
            if (!order.classList.contains('empty-orders')) {
                order.remove();
            }
        });
        
        // 添加订单（按创建时间倒序）
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        userOrders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            
            // 获取状态对应的CSS类
            let statusClass = 'status-unpaid';
            let statusText = '待付款';
            
            if (order.status === '待发货') {
                statusClass = 'status-shipping';
                statusText = '待发货';
            } else if (order.status === '待收货') {
                statusClass = 'status-delivered';
                statusText = '待收货';
            } else if (order.status === '已完成') {
                statusClass = 'status-completed';
                statusText = '已完成';
            }
            
            // 构建商品列表HTML
            let productsHtml = '';
            order.items.forEach(item => {
                productsHtml += `
                    <div class="order-product">
                        <div class="product-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="product-info">
                            <div class="product-name">${item.name}</div>
                            <div class="product-quantity">× ${item.quantity}</div>
                        </div>
                    </div>
                `;
            });
            
            orderElement.innerHTML = `
                <div class="order-header">
                    <div class="order-id">订单号：${order.id}</div>
                    <div class="order-status ${statusClass}">${statusText}</div>
                </div>
                <div class="order-products">
                    ${productsHtml}
                </div>
                <div class="order-footer">
                    <div class="order-total">实付：¥${order.total.toFixed(2)}</div>
                    <div class="order-actions">
                        ${order.status === '待付款' ? '<button class="btn-action btn-pay">立即支付</button>' : ''}
                        <button class="btn-action">查看详情</button>
                        <button class="btn-action">再次购买</button>
                    </div>
                </div>
            `;
            
            ordersList.appendChild(orderElement);
        });
    }
    
    // 更新购物车徽章
    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // 更新顶部购物车徽章
        const cartBadges = document.querySelectorAll('.cart-badge');
        cartBadges.forEach(badge => {
            badge.textContent = totalCount;
        });
        
        // 更新侧边栏购物车徽章
        const sidebarCartCount = document.getElementById('sidebarCartCount');
        if (sidebarCartCount) {
            sidebarCartCount.textContent = totalCount;
        }
    }
    
    // ========== 绑定事件（增加同步选中状态） ==========
    function bindEvents() {
        // 获取所有标签（顶部和侧边栏）
        const topTabs = document.querySelectorAll('.user-tabs .tab');
        const sideMenuItems = document.querySelectorAll('.sidebar-menu .menu-item:not(.logout)');
        const allTabs = document.querySelectorAll('.tab, .menu-item:not(.logout)');
        
        // 初始化：设置默认选中状态（个人信息）
        updateAllTabs('profile');
        
        // 统一处理所有标签点击
        allTabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                // 获取链接地址
                const href = this.getAttribute('href');
                
                // 如果是侧边栏的"我的购物车"或"返回首页"，直接跳转
                if (href === 'cart.html' || href === 'index.html') {
                    e.preventDefault();
                    window.location.href = href;
                    return;
                }
                
                e.preventDefault();
                
                // 获取目标面板ID
                const targetId = href.substring(1);
                const targetPanel = document.getElementById(targetId + 'Panel');
                
                if (!targetPanel) return;
                
                // 更新所有标签状态
                updateAllTabs(targetId);
                
                // 更新内容面板
                document.querySelectorAll('.content-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                targetPanel.classList.add('active');
            });
        });
        
        // 更新所有标签状态的函数
        function updateAllTabs(activeId) {
            // 更新顶部标签
            topTabs.forEach(tab => {
                const tabId = tab.getAttribute('href').substring(1);
                if (tabId === activeId) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            // 更新侧边栏菜单
            sideMenuItems.forEach(item => {
                const itemHref = item.getAttribute('href');
                if (itemHref === '#profile' && activeId === 'profile') {
                    item.classList.add('active');
                } else if (itemHref === '#orders' && activeId === 'orders') {
                    item.classList.add('active');
                } else if (itemHref === '#address' && activeId === 'address') {
                    item.classList.add('active');
                } else if (itemHref === '#security' && activeId === 'security') {
                    item.classList.add('active');
                } else if (itemHref === 'cart.html' || itemHref === 'index.html') {
                    // 这些是跳转链接，不处理active状态
                    item.classList.remove('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
        
        // 保存邮箱修改
        const saveEmailBtn = document.getElementById('saveEmail');
        if (saveEmailBtn) {
            saveEmailBtn.addEventListener('click', function() {
                const newEmail = document.getElementById('emailInput').value.trim();
                
                if (!newEmail) {
                    alert('邮箱不能为空');
                    return;
                }
                
                if (!validateEmail(newEmail)) {
                    alert('请输入有效的邮箱地址');
                    return;
                }
                
                // 更新用户信息
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser) {
                    currentUser.email = newEmail;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    // 更新显示
                    document.getElementById('emailDisplay').textContent = newEmail;
                    alert('邮箱修改成功！');
                }
            });
        }
        
        // 订单筛选
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // 这里可以添加按状态筛选订单的逻辑
                alert('筛选功能开发中...');
            });
        });
        
        // 添加地址按钮
        const addAddressBtn = document.getElementById('addAddressBtn');
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', function() {
                alert('添加地址功能开发中...');
            });
        }
        
        // 修改密码按钮
        const modifyPasswordBtn = document.getElementById('modifyPassword');
        if (modifyPasswordBtn) {
            modifyPasswordBtn.addEventListener('click', function() {
                const newPassword = prompt('请输入新密码：');
                if (newPassword) {
                    const confirmPassword = prompt('请确认新密码：');
                    if (newPassword === confirmPassword) {
                        // 更新密码（实际项目中应该加密）
                        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                        if (currentUser) {
                            currentUser.password = newPassword; // 注意：这仅用于演示，实际应该加密
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                            alert('密码修改成功！');
                        }
                    } else {
                        alert('两次输入的密码不一致！');
                    }
                }
            });
        }
        
        // 退出登录按钮（侧边栏的）
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (confirm('确定要退出登录吗？')) {
                    localStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                }
            });
        }
        
        // 地址操作按钮
        document.addEventListener('click', function(e) {
            // 编辑地址
            if (e.target.classList.contains('btn-edit')) {
                alert('编辑地址功能开发中...');
            }
            
            // 删除地址
            if (e.target.classList.contains('btn-delete')) {
                if (confirm('确定要删除这个地址吗？')) {
                    e.target.closest('.address-item').remove();
                }
            }
            
            // 设为默认地址
            if (e.target.classList.contains('btn-set-default')) {
                const addressItems = document.querySelectorAll('.address-item');
                addressItems.forEach(item => {
                    item.classList.remove('default');
                });
                e.target.closest('.address-item').classList.add('default');
                alert('默认地址设置成功！');
            }
            
            // 立即支付按钮
            if (e.target.classList.contains('btn-pay')) {
                if (confirm('确认支付该订单吗？')) {
                    // 模拟支付处理
                    e.target.disabled = true;
                    e.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 支付中...';
                    
                    setTimeout(() => {
                        // 这里可以更新订单状态
                        alert('支付成功！');
                        e.target.innerHTML = '已支付';
                        e.target.style.background = '#52c41a';
                        e.target.style.borderColor = '#52c41a';
                        e.target.disabled = true;
                    }, 1500);
                }
            }
        });
    }
    
    // 邮箱验证函数
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});