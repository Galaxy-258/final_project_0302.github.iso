// 轮播图功能
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  const prevBtn = document.querySelector('.banner-prev');
  const nextBtn = document.querySelector('.banner-next');
  let currentSlide = 0;
  let slideInterval;
  
  // 初始化轮播图
  function initSlider() {
      if (slides.length === 0) return;
      
      // 设置自动轮播
      slideInterval = setInterval(nextSlide, 3000);
      
      // 添加事件监听器
      prevBtn.addEventListener('click', prevSlide);
      nextBtn.addEventListener('click', nextSlide);
      
      // 为指示点添加事件监听器
      dots.forEach(dot => {
          dot.addEventListener('click', function() {
              const slideIndex = parseInt(this.getAttribute('data-slide'));
              goToSlide(slideIndex);
          });
      });
      
      // 鼠标悬停时暂停自动轮播
      const bannerContainer = document.querySelector('.carousel-container');
      bannerContainer.addEventListener('mouseenter', () => {
          clearInterval(slideInterval);
      });
      
      bannerContainer.addEventListener('mouseleave', () => {
          slideInterval = setInterval(nextSlide, 3000);
      });
  }
  
  // 切换到下一张幻灯片
  function nextSlide() {
      goToSlide((currentSlide + 1) % slides.length);
  }
  
  // 切换到上一张幻灯片
  function prevSlide() {
      goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }
  
  // 跳转到指定幻灯片
  function goToSlide(n) {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      
      currentSlide = n;
      
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
  }
  
  // 初始化轮播图
  initSlider();

  // 统一的初始化函数
  function initComponent(selector, callback) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(callback);
  }

  // 统一的事件绑定函数
  function bindEvents() {
      // 品牌轮播
      initComponent('.jiantou .left, .jiantou .right', element => {
          element.addEventListener('click', handleBrandNav);
      });

      // 分类切换
      initComponent('.fresh .title ul a, .goods .title ul a', link => {
          link.addEventListener('click', handleCategorySwitch);
      });

      // 商品悬停
      initComponent('.goods ul li, .fresh .content .right li, .topic li', item => {
          item.addEventListener('mouseenter', () => item.style.zIndex = '10');
          item.addEventListener('mouseleave', () => item.style.zIndex = '1');
      });

      // 搜索功能
      const searchInput = document.querySelector('.search input');
      if (searchInput) {
          searchInput.addEventListener('keypress', handleSearch);
      }
  }

  // 事件处理函数
  function handleBrandNav(e) {
      console.log(e.target.classList.contains('left') ? '向左滚动品牌' : '向右滚动品牌');
  }

  function handleCategorySwitch(e) {
      e.preventDefault();
      const parentUl = this.closest('ul');
      if (parentUl) {
          parentUl.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      }
      this.classList.add('active');
      console.log('切换到分类:', this.textContent);
  }

  function handleSearch(e) {
      if (e.key === 'Enter' && this.value.trim()) {
          console.log('搜索:', this.value);
      }
  }

  bindEvents();
  
  // 购物车功能
  initShoppingCart();
  
  // ========== 用户状态更新代码 ==========
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
          // 直接绑定悬停事件
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
          
          // 移除下拉菜单
          removeDropdownMenu();
      }
  }
  
  // ========== 下拉菜单功能 ==========
  let currentMenu = null;
  let hoverTimeout = null;
  let closeTimeout = null;
  
  // 绑定悬停下拉菜单事件
  function bindHoverMenu(loginLink, currentUser) {
      // 移除可能存在的旧事件
      loginLink.removeEventListener('mouseenter', showMenu);
      loginLink.removeEventListener('mouseleave', hideMenu);
      
      // 显示菜单函数
      function showMenu(e) {
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
          }, 200); // 200ms延迟，避免误触发
      }
      
      // 隐藏菜单函数
      function hideMenu(e) {
          // 清除显示的计时器
          if (hoverTimeout) {
              clearTimeout(hoverTimeout);
              hoverTimeout = null;
          }
          
          // 延迟隐藏菜单，给用户时间移动到菜单上
          closeTimeout = setTimeout(() => {
              removeDropdownMenu();
          }, 1500); // 1500ms延迟，允许用户移动到菜单
      }
      
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
      currentMenu.addEventListener('mouseenter', function() {
          // 鼠标进入菜单，清除关闭计时器
          if (closeTimeout) {
              clearTimeout(closeTimeout);
              closeTimeout = null;
          }
      });
      
      currentMenu.addEventListener('mouseleave', function() {
          // 鼠标离开菜单，延迟关闭
          closeTimeout = setTimeout(() => {
              removeDropdownMenu();
          }, 1500);
      });
  }
  
  // 绑定菜单项事件
  function bindMenuEvents(menu) {
      console.log('绑定菜单事件，菜单元素:', menu);
      
      // 个人中心 - 改为跳转到实际页面
      const userProfileBtn = menu.querySelector('#userProfile');
      if (userProfileBtn) {
          userProfileBtn.addEventListener('click', function(e) {
              e.preventDefault();
              removeDropdownMenu();
              window.location.href = 'user-center.html';
          });
      }
      
      // 我的订单 - 改为跳转到实际页面
      const myOrdersBtn = menu.querySelector('a[href="order.html"]');
      if (myOrdersBtn) {
          myOrdersBtn.addEventListener('click', function(e) {
              e.preventDefault();
              removeDropdownMenu();
              window.location.href = 'order.html';
          });
      }
      
      // 退出登录 - 关键修复部分
      const logoutBtn = menu.querySelector('#userLogout');
      console.log('找到退出登录按钮:', logoutBtn);
      
      if (logoutBtn) {
          logoutBtn.addEventListener('click', function(e) {
              console.log('退出登录按钮被点击');
              e.preventDefault();
              e.stopPropagation(); // 重要！阻止事件冒泡
              
              if (confirm('确定要退出登录吗？')) {
                  console.log('用户确认退出登录');
                  localStorage.removeItem('currentUser');
                  removeDropdownMenu();
                  
                  // 强制刷新页面，清除所有缓存状态
                  window.location.href = 'index.html';
                  window.location.reload();
              }
          });
      } else {
          console.error('没有找到 #userLogout 按钮');
          // 尝试查找其他可能的退出登录按钮
          const logoutLinks = menu.querySelectorAll('.logout');
          console.log('找到的.logout元素:', logoutLinks.length);
      }
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

  // 调用函数
  updatePageNavigation();
  
});

// 购物车功能
function initShoppingCart() {
  // 获取购物车数据
  function getCart() {
      return JSON.parse(localStorage.getItem('shoppingCart')) || [];
  }
  
  // 保存购物车数据
  function saveCart(cart) {
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
      updateCartBadge();
  }
  
  // 更新购物车徽章
  function updateCartBadge() {
      const cart = getCart();
      const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      const cartBadges = document.querySelectorAll('.cart-badge');
      cartBadges.forEach(badge => {
          badge.textContent = totalCount;
      });
  }
  
  // 添加商品到购物车
  function addToCart(product) {
      const cart = getCart();
      const existingItem = cart.find(item => item.id === product.id);
      
      if (existingItem) {
          existingItem.quantity += 1;
      } else {
          product.quantity = 1;
          product.selected = true;
          cart.push(product);
      }
      
      saveCart(cart);
      showToast('商品已成功添加到购物车');
  }
  
  // 显示提示消息
  function showToast(message) {
      // 移除现有的提示
      const existingToast = document.querySelector('.toast');
      if (existingToast) {
          existingToast.remove();
      }
      
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
          toast.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => {
              if (toast.parentNode) {
                  document.body.removeChild(toast);
              }
          }, 300);
      }, 2000);
  }
  
  // 绑定加入购物车按钮事件
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
      button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const productItem = this.closest('li');
          const product = {
              id: productItem.dataset.id,
              name: productItem.dataset.name,
              price: parseFloat(productItem.dataset.price),
              image: productItem.dataset.image
          };
          
          addToCart(product);
      });
  });
  
  // 初始化购物车徽章
  updateCartBadge();
}