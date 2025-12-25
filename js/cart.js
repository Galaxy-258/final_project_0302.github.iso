// 购物车功能
class ShoppingCart {
    constructor() {
        this.cartKey = 'shoppingCart';
        this.items = this.getCartItems();
        // 下拉菜单相关属性
        this.currentMenu = null;
        this.hoverTimeout = null;
        this.closeTimeout = null;
        this.init();
    }

    // 初始化购物车
    init() {
        this.renderCart();
        this.bindEvents();
        this.loadRecommendProducts();
        this.updateCartBadge();
        // 在购物车页面也添加用户状态更新
        this.updatePageNavigation();
    }

    // 获取购物车商品
    getCartItems() {
        const cart = localStorage.getItem(this.cartKey);
        return cart ? JSON.parse(cart) : [];
    }

    // 保存购物车到本地存储
    saveCart() {
        localStorage.setItem(this.cartKey, JSON.stringify(this.items));
        this.updateCartBadge();
    }

    // 添加商品到购物车
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.items.push({
                ...product,
                quantity: product.quantity || 1,
                selected: true
            });
        }
        
        this.saveCart();
        this.renderCart();
        
        // 显示添加成功提示
        this.showToast('商品已成功添加到购物车');
    }

    // 更新商品数量
    updateQuantity(itemId, quantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.renderCart();
        }
    }

    // 删除商品
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.renderCart();
    }

    // 清空购物车
    clearCart() {
        if (this.items.length > 0) {
            if (confirm('确定要清空购物车吗？')) {
                this.items = [];
                this.saveCart();
                this.renderCart();
            }
        }
    }

    // 选择/取消选择商品
    toggleSelect(itemId) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.selected = !item.selected;
            this.saveCart();
            this.renderCart();
        }
    }

    // 全选/取消全选
    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const allSelected = selectAllCheckbox.checked;
        
        this.items.forEach(item => {
            item.selected = allSelected;
        });
        
        this.saveCart();
        this.renderCart();
    }

    // 渲染购物车 - 使用CSS类控制显示/隐藏
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartTableBody = document.getElementById('cartTableBody');
        
        if (this.items.length === 0) {
            // 购物车为空：显示空状态，隐藏商品列表
            cartEmpty.classList.remove('hidden');
            cartItems.classList.remove('cart-has-items');
            cartTableBody.innerHTML = ''; // 清空表格内容
            this.resetSummary(); // 重置摘要信息
        } else {
            // 购物车有商品：隐藏空状态，显示商品列表
            cartEmpty.classList.add('hidden');
            cartItems.classList.add('cart-has-items');
            
            // 清空现有内容
            cartTableBody.innerHTML = '';
            
            // 渲染每个商品
            this.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-checkbox">
                        <input type="checkbox" ${item.selected ? 'checked' : ''} 
                               data-id="${item.id}">
                    </div>
                    <div class="product-info">
                        <div class="product-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="product-details">
                            <div class="product-name">${item.name}</div>
                            <div class="product-spec">${item.spec || ''}</div>
                        </div>
                    </div>
                    <div class="unit-price">￥${item.price.toFixed(2)}</div>
                    <div class="quantity">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <input type="number" class="quantity-input" 
                                   value="${item.quantity}" min="1" 
                                   data-id="${item.id}">
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="subtotal">￥${(item.price * item.quantity).toFixed(2)}</div>
                    <div class="operation">
                        <div class="remove-item" data-id="${item.id}">删除</div>
                    </div>
                `;
                cartTableBody.appendChild(itemElement);
            });
            
            // 更新总计
            this.updateSummary();
        }
    }

    // 更新购物车摘要
    updateSummary() {
        const selectedItems = this.items.filter(item => item.selected);
        const totalAmount = selectedItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        
        // 计算优惠（满300减30）
        let discount = 0;
        if (totalAmount >= 300) {
            discount = 30;
        }
        
        const finalAmount = totalAmount - discount;
        
        // 更新UI
        document.getElementById('selectedCount').textContent = selectedItems.length;
        document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
        document.getElementById('discountAmount').textContent = discount.toFixed(2);
        document.getElementById('finalAmount').textContent = finalAmount.toFixed(2);
        
        // 更新全选状态
        const allSelected = this.items.length > 0 && this.items.every(item => item.selected);
        document.getElementById('selectAll').checked = allSelected;
    }

    // 重置摘要信息
    resetSummary() {
        document.getElementById('selectedCount').textContent = '0';
        document.getElementById('totalAmount').textContent = '0.00';
        document.getElementById('discountAmount').textContent = '0.00';
        document.getElementById('finalAmount').textContent = '0.00';
        document.getElementById('selectAll').checked = false;
    }

    // 绑定事件
    bindEvents() {
        // 事件委托处理商品操作
        document.addEventListener('click', (e) => {
            const target = e.target;
            const itemId = target.dataset.id;
            
            if (!itemId) return;
            
            if (target.classList.contains('minus')) {
                const item = this.items.find(item => item.id === itemId);
                if (item && item.quantity > 1) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            } else if (target.classList.contains('plus')) {
                const item = this.items.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            } else if (target.classList.contains('remove-item')) {
                this.removeItem(itemId);
            } else if (target.type === 'checkbox') {
                if (target.id === 'selectAll') {
                    this.toggleSelectAll();
                } else {
                    this.toggleSelect(itemId);
                }
            }
        });
        
        // 数量输入框变化事件
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input') && e.target.dataset.id) {
                const quantity = parseInt(e.target.value) || 1;
                this.updateQuantity(e.target.dataset.id, quantity);
            }
        });
        
        // 清空购物车按钮
        const clearCartBtn = document.getElementById('clearCart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }
        
        // 结算按钮
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    // 结算
    checkout() {
        const selectedItems = this.items.filter(item => item.selected);
        
        if (selectedItems.length === 0) {
            alert('请选择要结算的商品');
            return;
        }
        
        // 检查是否登录
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.isLoggedIn) {
            if (confirm('请先登录才能结算，是否前往登录页面？')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
         // 1. 保存选中的商品到 sessionStorage，供结算页面使用
        sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    
        // 2. 跳转到结算页面
        window.location.href = 'checkout.html';
    }

    // 加载推荐商品
    loadRecommendProducts() {
        const recommendProducts = [
            {
                id: 'rec1',
                name: 'KN95级莫兰迪色防护口罩',
                price: 79.00,
                image: './uploads/新鲜好物1.png'
            },
            {
                id: 'rec2',
                name: '紫檀外独板三层普洱茶盒',
                price: 566.00,
                image: './uploads/新鲜好物2.png'
            },
            {
                id: 'rec3',
                name: '法拉蒙高颜值记事本可定制',
                price: 58.00,
                image: './uploads/新鲜好物3.png'
            },
            {
                id: 'rec4',
                name: '科技布布艺沙发',
                price: 3579.00,
                image: './uploads/新鲜好物4.png'
            }
        ];
        
        const container = document.getElementById('recommendProducts');
        if (container) {
            recommendProducts.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'recommend-product';
                productElement.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="recommend-product-info">
                        <div class="recommend-product-name">${product.name}</div>
                        <div class="recommend-product-price">￥${product.price.toFixed(2)}</div>
                        <button class="add-to-cart-btn" data-id="${product.id}">加入购物车</button>
                    </div>
                `;
                container.appendChild(productElement);
            });
            
            // 绑定推荐商品的加入购物车按钮
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart-btn')) {
                    const productId = e.target.dataset.id;
                    const product = recommendProducts.find(p => p.id === productId);
                    if (product) {
                        this.addItem(product);
                    }
                }
            });
        }
    }

    // 更新购物车徽章
    updateCartBadge() {
        const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // 更新购物车页面徽章
        const cartBadge = document.getElementById('cartTotalCount');
        if (cartBadge) {
            cartBadge.textContent = totalCount;
        }
        
        // 更新其他页面的购物车徽章
        const allCartBadges = document.querySelectorAll('.cart-badge');
        allCartBadges.forEach(badge => {
            if (badge.id !== 'cartTotalCount') {
                badge.textContent = totalCount;
            }
        });
    }

    // ========== 在购物车页面添加用户状态和下拉菜单 ==========
    
    updatePageNavigation() {
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
            this.bindHoverMenu(loginLink, currentUser);
            
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
    
    currentMenu = null;
    hoverTimeout = null;
    closeTimeout = null;
    
    // 绑定悬停下拉菜单事件
    bindHoverMenu(loginLink, currentUser) {
        // 保存 loginLink 引用，供 createDropdownMenu 使用
        this.loginLink = loginLink;
        // 显示菜单函数
        const showMenu = (e) => {
            // 清除关闭的计时器
            if (this.closeTimeout) {
                clearTimeout(this.closeTimeout);
                this.closeTimeout = null;
            }
            
            // 延迟显示菜单，避免快速移动时频繁显示
            this.hoverTimeout = setTimeout(() => {
                if (!this.currentMenu) {
                    this.createDropdownMenu(e, currentUser);
                }
            }, 200);
        };
        
        // 隐藏菜单函数
        const hideMenu = (e) => {
            // 清除显示的计时器
            if (this.hoverTimeout) {
                clearTimeout(this.hoverTimeout);
                this.hoverTimeout = null;
            }
            
            // 检查鼠标是否移动到了菜单上
            if (this.currentMenu && this.currentMenu.contains(e.relatedTarget)) {
                return; // 鼠标移动到了菜单上，不隐藏
            }

            // 延迟隐藏菜单，给用户时间移动到菜单上
            this.closeTimeout = setTimeout(() => {
                this.removeDropdownMenu();
            }, 500);
        };
        
        // 绑定事件
        loginLink.addEventListener('mouseenter', showMenu);
        loginLink.addEventListener('mouseleave', hideMenu);
    }
    
    // 创建下拉菜单
    createDropdownMenu(event, currentUser) {
        this.removeDropdownMenu();
        
        // 获取购物车数量
        const cartCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // 创建菜单元素
        this.currentMenu = document.createElement('div');
        this.currentMenu.className = 'user-dropdown-menu';
        this.currentMenu.innerHTML = `
            <div class="menu-header">
                <div class="user-info-small">
                    <div class="username">${currentUser.username}</div>
                    <div class="user-email">${currentUser.email || '未设置邮箱'}</div>
                </div>
            </div>
            <div class="menu-divider"></div>
            <a href="user-center.html" class="menu-item">
                <span class="menu-icon">👤</span> 个人中心
            </a>
            <a href="cart.html" class="menu-item">
                <span class="menu-icon">🛒</span> 我的购物车
                ${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}
            </a>
            <a href="order.html" class="menu-item">
                <span class="menu-icon">📦</span> 我的订单
            </a>
            <a href="index.html" class="menu-item">
                <span class="menu-icon">🏠</span> 返回首页
            </a>
            <div class="menu-divider"></div>
            <a href="#" class="menu-item logout" id="userLogout">
                <span class="menu-icon">🚪</span> 退出登录
            </a>
        `;
        
        // 定位菜单
        const linkRect = event.target.getBoundingClientRect();
        this.currentMenu.style.position = 'absolute';
        this.currentMenu.style.top = (linkRect.bottom + window.scrollY + 5) + 'px';
        this.currentMenu.style.right = (window.innerWidth - linkRect.right + 20) + 'px';
        this.currentMenu.style.zIndex = '1000';
        
        // 添加到页面
        document.body.appendChild(this.currentMenu);
        
        // 绑定退出登录事件
        const logoutBtn = this.currentMenu.querySelector('#userLogout');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('currentUser');
                this.removeDropdownMenu();
                window.location.reload();
            }
        });
        
        // 绑定普通链接点击事件
        const menuLinks = this.currentMenu.querySelectorAll('.menu-item:not(.logout)');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeDropdownMenu();
            });
        });
        
        // 菜单本身的鼠标事件
        this.currentMenu.addEventListener('mouseenter', () => {
            if (this.closeTimeout) {
                clearTimeout(this.closeTimeout);
                this.closeTimeout = null;
            }
        });
        
        this.currentMenu.addEventListener('mouseleave', () => {
            // 增加延迟时间到500ms
            this.closeTimeout = setTimeout(() => {
                this.removeDropdownMenu();
            }, 500);
        });
    }

    // 绑定菜单项事件 - 改为空函数
    bindMenuEvents(menu) {
        // 函数保留，但内容为空
    }

    // 移除下拉菜单
    removeDropdownMenu() {
        if (this.currentMenu) {
            this.currentMenu.remove();
            this.currentMenu = null;
        }
        // 清除所有计时器
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }
    }

    // 显示提示消息
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #5EB69C;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }
}

// 初始化购物车
document.addEventListener('DOMContentLoaded', function() {
    const cart = new ShoppingCart();
    
    // 暴露到全局，方便商品页调用
    window.shoppingCart = cart;
});