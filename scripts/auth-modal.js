// Professional Modal Manager - Generates everything with JS
class AuthModal {
    constructor() {
        this.isOpen = false;
        this.modal = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        console.log('AuthModal initialized - Click "Hello, sign in" to open');
    }

    createModal() {
        // Create modal overlay element
        this.modal = document.createElement('div');
        this.modal.className = 'login-modal-overlay js-login-overlay';
        this.modal.innerHTML = this.getModalHTML();
        
        // Add to the end of body
        document.body.appendChild(this.modal);
    }

    getModalHTML() {
        return `
            <div class="login-modal">
                <button class="login-modal-close js-login-close" aria-label="Close login modal">×</button>
                
                <div class="login-modal-header">
                    <h2 class="login-modal-title">Sign in</h2>
                </div>

                <div class="login-modal-body">
                    <form class="login-form" id="loginForm" novalidate>
                        <div class="form-group">
                            <label for="login-email" class="form-label">Email or mobile phone number</label>
                            <input 
                                type="text" 
                                id="login-email" 
                                class="form-input" 
                                placeholder="Enter email or mobile number"
                                autocomplete="email"
                                required
                            >
                            <div class="form-feedback"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="login-password" class="form-label">Password</label>
                            <input 
                                type="password" 
                                id="login-password" 
                                class="form-input" 
                                placeholder="Enter your password"
                                autocomplete="current-password"
                                required
                                minlength="6"
                            >
                            <div class="form-feedback"></div>
                        </div>
                        
                        <button type="submit" class="continue-btn">
                            <span class="btn-text">Continue</span>
                            <div class="btn-loading" style="display: none;">
                                <div class="loading-spinner-small"></div>
                                <span>Signing in...</span>
                            </div>
                        </button>
                    </form>

                    <div class="login-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="keep-signed-in">
                            <span class="checkmark"></span>
                            Keep me signed in
                        </label>
                        <a href="#" class="help-link">Need help?</a>
                    </div>

                    <div class="divider">
                        <span class="divider-text">New to Sportivo?</span>
                    </div>

                    <button class="create-account-btn" type="button">
                        Create your Sportivo account
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Open modal when login link is clicked
        document.addEventListener('click', (e) => {
            if (e.target.closest('.js-login-trigger')) {
                e.preventDefault();
                this.openModal();
            }
        });

        // Close modal when overlay or X is clicked
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('js-login-overlay') || 
                e.target.closest('.js-login-close')) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });

        // Handle form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin();
            }
        });

        // Real-time validation
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('form-input')) {
                this.validateField(e.target);
            }
        });

        // Validate on blur
        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('form-input') && e.target.value.trim() !== '') {
                this.validateField(e.target);
            }
        }, true);
    }

    openModal() {
        this.modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Clear any previous errors and values
        this.clearForm();
        
        // Auto-focus on email input for better UX
        setTimeout(() => {
            const emailInput = document.getElementById('login-email');
            if (emailInput) emailInput.focus();
        }, 100);
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
    }

    async handleLogin() {
        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');
        const submitBtn = document.querySelector('.continue-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        // Clear previous errors
        this.clearErrors();
        
        // Validate all fields
        const isEmailValid = this.validateField(email);
        const isPasswordValid = this.validateField(password);
        
        if (!isEmailValid || !isPasswordValid) {
            this.showFormError('Please fix the errors above.');
            this.resetButtonState(submitBtn, btnText, btnLoading);
            return;
        }
        
        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();
        
        try {
            // Simulate API call
            await this.simulateLoginRequest(emailValue, passwordValue);
            
            // Success - show success message
            this.showSuccessMessage('Successfully signed in!');
            
            // Close modal after success
            setTimeout(() => {
                this.closeModal();
                this.updateUIAfterLogin();
            }, 1500);
            
        } catch (error) {
            this.showFormError('Invalid email or password. Please try again.');
            this.resetButtonState(submitBtn, btnText, btnLoading);
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const feedback = field.parentNode.querySelector('.form-feedback');
        
        // Clear previous state
        field.classList.remove('valid', 'error');
        feedback.textContent = '';
        
        // Check required field
        if (field.hasAttribute('required') && !value) {
            field.classList.add('error');
            feedback.textContent = 'This field is required';
            return false;
        }
        
        // Email validation
        if (field.id === 'login-email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            
            if (!emailRegex.test(value) && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                field.classList.add('error');
                feedback.textContent = 'Enter a valid email or mobile number';
                return false;
            }
        }
        
        // Password validation
        if (field.id === 'login-password' && value) {
            if (value.length < 6) {
                field.classList.add('error');
                feedback.textContent = 'Password must be at least 6 characters';
                return false;
            }
        }
        
        // If valid
        if (value) {
            field.classList.add('valid');
        }
        
        return true;
    }

    clearForm() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.reset();
        }
        this.clearErrors();
    }

    clearErrors() {
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.classList.remove('error', 'valid');
        });
        
        const feedbacks = document.querySelectorAll('.form-feedback');
        feedbacks.forEach(feedback => {
            feedback.textContent = '';
        });
        
        // Remove form-level error
        const formError = document.querySelector('.form-error-message');
        if (formError) {
            formError.remove();
        }
    }

    showFormError(message) {
        // Remove existing form error
        const existingError = document.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create new form error
        const form = document.getElementById('loginForm');
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error-message';
        errorElement.textContent = message;
        
        form.insertBefore(errorElement, form.querySelector('.continue-btn'));
    }

    showSuccessMessage(message) {
        const form = document.getElementById('loginForm');
        const successElement = document.createElement('div');
        successElement.className = 'form-success-message';
        successElement.innerHTML = `
            <div class="success-icon">✓</div>
            <span>${message}</span>
        `;
        
        form.innerHTML = '';
        form.appendChild(successElement);
    }

    resetButtonState(submitBtn, btnText, btnLoading) {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }

    updateUIAfterLogin() {
        // Update login link to show user is signed in
        const loginLink = document.querySelector('.js-login-trigger .login-text');
        if (loginLink) {
            loginLink.textContent = 'Hello, User!';
        }
        
        // You could also update other UI elements here
        console.log('User signed in - UI updated');
    }

    async simulateLoginRequest(email, password) {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate successful login for demo purposes
                // In real app, this would be your actual API call
                if (email && password.length >= 6) {
                    resolve({ success: true, user: { name: 'User', email: email } });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1500);
        });
    }
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AuthModal();
    });
} else {
    new AuthModal();
}