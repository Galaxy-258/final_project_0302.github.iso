// 结算页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化结算页面
    initCheckoutPage();
    
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
            
            // 添加悬停下拉菜单功能
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
    let currentMenu = null;
    let hoverTimeout = null;
    let closeTimeout = null;
    
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
            
            // 延迟隐藏菜单，给用户时间移动到菜单上
            closeTimeout = setTimeout(() => {
                removeDropdownMenu();
            }, 300);
        };
        
        // 绑定事件
        loginLink.addEventListener('mouseenter', showMenu);
        loginLink.addEventListener('mouseleave', hideMenu);
    }
    
    // 创建下拉菜单
    function createDropdownMenu(event, currentUser) {
        // 获取购物车数量
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // 创建菜单元素
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
            <a href="#" class="menu-item logout" id="userLogout">
                <span class="menu-icon">🚪</span> 退出登录
            </a>
        `;
        
        // 定位菜单
        const linkRect = event.target.getBoundingClientRect();
        currentMenu.style.top = (linkRect.bottom + window.scrollY + 5) + 'px';
        currentMenu.style.right = (window.innerWidth - linkRect.right + 20) + 'px';
        
        // 添加到页面
        document.body.appendChild(currentMenu);
        
        // 绑定菜单项事件
        bindMenuEvents(currentMenu);
        
        // 菜单本身的鼠标事件
        currentMenu.addEventListener('mouseenter', () => {
            // 鼠标进入菜单，清除关闭计时器
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
        });
        
        currentMenu.addEventListener('mouseleave', () => {
            // 鼠标离开菜单，延迟关闭
            closeTimeout = setTimeout(() => {
                removeDropdownMenu();
            }, 300);
        });
    }
    
    // 绑定菜单项事件
    function bindMenuEvents(menu) {        
        // 退出登录
        menu.querySelector('#userLogout').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('currentUser');
                removeDropdownMenu();
                window.location.reload();
            }
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
    
    // ========== 结算页面核心功能 ==========
    
    function initCheckoutPage() {
        console.log('初始化结算页面');
        // 加载购物车商品
        loadCartProducts();
        
        // 计算订单总金额
        calculateOrderTotal();
        
        // 绑定事件
        bindCheckoutEvents();
        
        // 更新购物车徽章
        updateCartBadge();
    }
    
    // 加载购物车商品
    function loadCartProducts() {
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const productsList = document.getElementById('checkoutProducts');
        const emptyCartState = document.getElementById('emptyCartState');
        
        if (cart.length === 0) {
            // 购物车为空
            emptyCartState.style.display = 'block';
            productsList.classList.remove('has-items');
            
            // 隐藏商品区域
            const productItems = document.querySelectorAll('.product-item');
            productItems.forEach(item => {
                item.style.display = 'none';
            });
        } else {
            // 购物车有商品
            emptyCartState.style.display = 'none';
            productsList.classList.add('has-items');
            
            // 清空现有商品列表（除了空状态）
            const existingItems = document.querySelectorAll('.product-item');
            existingItems.forEach(item => {
                if (!item.classList.contains('empty-cart-state')) {
                    item.remove();
                }
            });
            
            // 添加商品
            cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                const productElement = document.createElement('div');
                productElement.className = 'product-item';
                productElement.innerHTML = `
                    <div class="product-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-name">${item.name}</div>
                        <div class="product-spec">${item.spec || '默认规格'}</div>
                        <div class="product-quantity-price">
                            <div class="quantity">× ${item.quantity}</div>
                            <div class="price">¥${subtotal.toFixed(2)}</div>
                        </div>
                    </div>
                `;
                productElement.style.display = 'flex'; // 确保显示
                productsList.appendChild(productElement);
            });
        }
    }

    
    // 计算订单总金额
    function calculateOrderTotal() {
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        
        // 计算商品总金额
        const subtotal = cart.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        
        // 获取运费 - 根据选中的配送方式判断
        let shippingFee = 15.00; // 默认运费
        
        // 获取选中的配送方式
        const selectedShipping = document.querySelector('.shipping-option.selected');
        if (selectedShipping) {
            // 获取配送方式名称
            const shippingName = selectedShipping.querySelector('.shipping-name').textContent;
            // 如果是顺丰快递，运费为25元
            if (shippingName === '顺丰快递') {
                shippingFee = 25.00;
            }
        }
        
        // 计算优惠（满300减30）
        let discount = 0;
        if (subtotal >= 300) {
            discount = 30;
        }
        
        // 计算应付总额
        const total = subtotal + shippingFee - discount;
        
        // 更新UI
        document.getElementById('subtotalAmount').textContent = `¥${subtotal.toFixed(2)}`;
        document.getElementById('shippingFee').textContent = `¥${shippingFee.toFixed(2)}`;
        document.getElementById('discountAmount').textContent = `-¥${discount.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `¥${total.toFixed(2)}`;
        
        // 保存订单信息到sessionStorage，供订单页面使用
        sessionStorage.setItem('orderInfo', JSON.stringify({
            subtotal: subtotal,
            shippingFee: shippingFee,
            discount: discount,
            total: total,
            items: cart,
            timestamp: new Date().toISOString()
        }));
    }
    
    // 更新购物车徽章
    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartBadges = document.querySelectorAll('.cart-badge');
        cartBadges.forEach(badge => {
            badge.textContent = totalCount;
        });
    }
    
    // 绑定结算页面事件
    function bindCheckoutEvents() {
        // 配送方式选择
        const shippingOptions = document.querySelectorAll('.shipping-option');
        shippingOptions.forEach(option => {
            // 点击整个选项区域
            option.addEventListener('click', function() {
                // 移除所有选项的选中状态
                shippingOptions.forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // 添加当前选项的选中状态
                this.classList.add('selected');
                
                // 选中对应的radio按钮
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
                
                // 更新运费 - 直接调用calculateOrderTotal函数
                calculateOrderTotal(); // 重新计算总金额
            });
            
            // 点击radio按钮时也触发
            const radio = option.querySelector('input[type="radio"]');
            if (radio) {
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        // 移除所有选项的选中状态
                        shippingOptions.forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        
                        // 添加当前选项的选中状态
                        option.classList.add('selected');
                        
                        // 更新运费 - 直接调用calculateOrderTotal函数
                        calculateOrderTotal(); // 重新计算总金额
                    }
                });
            }
        });
        
        // 优惠券使用
        const applyCouponBtn = document.getElementById('applyCoupon');
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', applyCoupon);
        }
        
        const useCouponBtns = document.querySelectorAll('.use-coupon');
        useCouponBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const couponName = this.parentElement.querySelector('.coupon-name').textContent;
                document.getElementById('couponCode').value = couponName;
                applyCoupon();
            });
        });
        
        // 支付方式选择
        const paymentOptions = document.querySelectorAll('.payment-option input');
        paymentOptions.forEach(option => {
            option.addEventListener('change', function() {
                // 更新选中状态
                document.querySelectorAll('.payment-option').forEach(el => {
                    el.classList.remove('selected');
                });
                this.parentElement.classList.add('selected');
            });
        });
        
        // 提交订单按钮
        const submitOrderBtn = document.getElementById('submitOrder');
        if (submitOrderBtn) {
            submitOrderBtn.addEventListener('click', submitOrder);
        }
    }
    
    // 应用优惠券
    function applyCoupon() {
        const couponCode = document.getElementById('couponCode').value.trim();
        
        if (!couponCode) {
            alert('请输入优惠券代码');
            return;
        }
        
        // 这里可以添加实际的优惠券验证逻辑
        if (couponCode === 'NEWUSER20') {
            // 模拟应用优惠券
            alert('优惠券已应用：满100减20');
            // 这里可以更新订单金额
        } else {
            alert('优惠券无效或已过期');
        }
    }
    
    // 提交订单
    function submitOrder() {
        // 检查是否同意条款
        const agreeTerms = document.getElementById('agreeTerms').checked;
        if (!agreeTerms) {
            alert('请先同意用户购买协议');
            return;
        }
        
        // 检查购物车是否为空
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        if (cart.length === 0) {
            alert('购物车为空，请先添加商品');
            return;
        }
        
        // 检查是否登录
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.isLoggedIn) {
            if (confirm('请先登录才能提交订单，是否前往登录页面？')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
        // 禁用按钮防止重复提交
        const submitBtn = document.getElementById('submitOrder');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
        
        // 模拟提交订单处理
        setTimeout(() => {
            // 生成订单号
            const orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
            
            // 获取订单信息
            const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo')) || {};

            // 获取配送方式
            const selectedShipping = document.querySelector('.shipping-option.selected');
            const shippingName = selectedShipping ? selectedShipping.querySelector('.shipping-name').textContent : '普通快递';
            
            // 获取支付方式
            const selectedPayment = document.querySelector('.payment-option.selected');
            const paymentName = selectedPayment ? selectedPayment.querySelector('span').textContent : '支付宝支付';
            
            // 创建订单对象
            const order = {
                id: orderId,
                userId: currentUser.username,
                items: orderInfo.items || [],
                subtotal: orderInfo.subtotal || 0,
                shippingFee: orderInfo.shippingFee || 15,
                discount: orderInfo.discount || 0,
                total: orderInfo.total || 0,
                status: '待付款',
                createdAt: new Date().toISOString(),
                shippingAddress: '北京市朝阳区建国路88号SOHO现代城',
                paymentMethod: document.querySelector('.payment-option.selected span').textContent
            };
            
            // 保存订单到本地存储
            const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
            orders.push(order);
            localStorage.setItem('userOrders', JSON.stringify(orders));

            // 保存订单信息到sessionStorage供订单页面使用
            sessionStorage.setItem('lastOrder', JSON.stringify(order));
            
            // 清空购物车
            localStorage.removeItem('shoppingCart');
            
            // 跳转到订单确认页面
            window.location.href = `order.html?orderId=${orderId}`;
            
        }, 1500);
    }

    // 调用函数
    updatePageNavigation();
});