// 认证功能 - 注册和登录
document.addEventListener('DOMContentLoaded', function() {
    // 生成随机验证码
    function generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let captcha = '';
        for (let i = 0; i < 4; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return captcha;
    }

    // 初始化验证码
    const captchaElement = document.getElementById('captchaCode');
    const refreshBtn = document.getElementById('refreshCaptcha');
    
    if (captchaElement && refreshBtn) {
        // 设置初始验证码
        captchaElement.textContent = generateCaptcha();
        
        // 刷新验证码
        refreshBtn.addEventListener('click', function() {
            captchaElement.textContent = generateCaptcha();
        });
    }

    // 表单验证函数
    function validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;
        
        if (formId === 'registerForm') {
            // 注册表单验证
            const username = document.getElementById('username');
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            const captcha = document.getElementById('captcha');
            const agreeTerms = document.getElementById('agreeTerms');
            
            // 用户名验证
            if (!username.value.trim()) {
                showError('usernameError', '请输入用户名');
                isValid = false;
            } else if (username.value.trim().length < 3 || username.value.trim().length > 20) {
                showError('usernameError', '用户名长度应在3-20个字符之间');
                isValid = false;
            } else {
                hideError('usernameError');
            }
            
            // 邮箱验证
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim()) {
                showError('emailError', '请输入邮箱');
                isValid = false;
            } else if (!emailRegex.test(email.value)) {
                showError('emailError', '请输入有效的邮箱地址');
                isValid = false;
            } else {
                hideError('emailError');
            }
            
            // 密码验证
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!password.value) {
                showError('passwordError', '请输入密码');
                isValid = false;
            } else if (!passwordRegex.test(password.value)) {
                showError('passwordError', '密码至少8位，且包含字母和数字');
                isValid = false;
            } else {
                hideError('passwordError');
            }
            
            // 确认密码验证
            if (!confirmPassword.value) {
                showError('confirmPasswordError', '请再次输入密码');
                isValid = false;
            } else if (password.value !== confirmPassword.value) {
                showError('confirmPasswordError', '两次输入的密码不一致');
                isValid = false;
            } else {
                hideError('confirmPasswordError');
            }
            
            // 验证码验证
            if (!captcha.value.trim()) {
                showError('captchaError', '请输入验证码');
                isValid = false;
            } else if (captcha.value.trim().toUpperCase() !== captchaElement.textContent) {
                showError('captchaError', '验证码错误');
                isValid = false;
            } else {
                hideError('captchaError');
            }
            
            // 条款同意验证
            if (!agreeTerms.checked) {
                showError('termsError', '请同意用户服务协议和隐私政策');
                isValid = false;
            } else {
                hideError('termsError');
            }
            
        } else if (formId === 'loginForm') {
            // 登录表单验证
            const username = document.getElementById('loginUsername');
            const password = document.getElementById('loginPassword');
            
            if (!username.value.trim()) {
                showError('loginUsernameError', '请输入用户名或邮箱');
                isValid = false;
            } else {
                hideError('loginUsernameError');
            }
            
            if (!password.value) {
                showError('loginPasswordError', '请输入密码');
                isValid = false;
            } else {
                hideError('loginPasswordError');
            }
        }
        
        return isValid;
    }

    // 显示错误信息
    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    // 隐藏错误信息
    function hideError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }

    // 忘记密码功能
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('忘记密码功能暂未开放，请联系客服 400-0000-000');
        });
    }

    // 注册表单提交
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm('registerForm')) {
                // 模拟注册成功
                const submitBtn = this.querySelector('.auth-btn');
                submitBtn.disabled = true;
                submitBtn.textContent = '注册中...';
                
                setTimeout(() => {
                    alert('注册成功！已为您自动登录');
                    
                    // 存储用户信息到localStorage
                    const user = {
                        username: document.getElementById('username').value,
                        email: document.getElementById('email').value,
                        isLoggedIn: true,
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    // 跳转到首页
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }

    // 登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm('loginForm')) {
                // 模拟登录成功
                const submitBtn = this.querySelector('.auth-btn');
                submitBtn.disabled = true;
                submitBtn.textContent = '登录中...';
                
                setTimeout(() => {
                    // 存储用户信息到localStorage
                    const user = {
                        username: document.getElementById('loginUsername').value,
                        isLoggedIn: true,
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    // 跳转到首页
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }

    function updatePageNavigation() {
        // 从localStorage获取用户信息
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // 找到登录链接
        const loginLink = document.querySelector('.shortcut a[href="login.html"]');
        if (!loginLink) return;
        
        // 找到对应的li元素
        const loginLi = loginLink.closest('li');
        
        if (currentUser && currentUser.isLoggedIn) {
            // 用户已登录：显示用户名
            loginLink.textContent = `欢迎，${currentUser.username}`;
            loginLink.href = 'javascript:void(0);';
            loginLink.style.cursor = 'pointer';
            loginLink.style.fontWeight = '500';
            loginLink.style.color = '#5EB69C';
            
            // 移除之前的点击事件（避免重复绑定）
            const newLoginLink = loginLink.cloneNode(true);
            loginLink.parentNode.replaceChild(newLoginLink, loginLink);
            
            // 重新获取引用
            const updatedLoginLink = document.querySelector('.shortcut a[href="login.html"]');
            
            // 添加点击事件 - 显示下拉菜单
            updatedLoginLink.addEventListener('click', handleLoginClick);
            
            // 隐藏注册链接
            const registerLink = document.querySelector('.shortcut a[href="register.html"]');
            if (registerLink && registerLink.closest('li')) {
                registerLink.closest('li').style.display = 'none';
            }
            
            // 移除边框
            if (loginLi) {
                loginLi.style.borderRight = 'none';
            }
            
        } else {
            // 用户未登录：恢复默认状态
            loginLink.textContent = '请先登录';
            loginLink.href = 'login.html';
            loginLink.style.cursor = 'pointer';
            loginLink.style.fontWeight = 'normal';
            loginLink.style.color = '#fff';
            
            // 显示注册链接
            const registerLink = document.querySelector('.shortcut a[href="register.html"]');
            if (registerLink && registerLink.closest('li')) {
                registerLink.closest('li').style.display = 'block';
            }
            
            // 恢复边框
            if (loginLi) {
                loginLi.style.borderRight = '';
            }
            
            // 移除可能存在的下拉菜单
            removeUserMenu();
        }
    }

    // 页面加载时立即执行
    updatePageNavigation();
});