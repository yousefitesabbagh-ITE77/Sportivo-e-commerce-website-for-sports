// Component-based architecture for Sportivo Login
class SportivoLogin {
    constructor() {
        this.app = document.getElementById('app');
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.app.innerHTML = `
            ${this.renderHeader()}
            ${this.renderMain()}
            ${this.renderFooter()}
        `;
    }

    renderHeader() {
        return `
            <header class="login-header">
                <div class="header-container">
                    <div class="sportivo-logo">
                        <a href="sportivo.html" class="logo-link" aria-label="Sportivo Home">
                            <img src="images/logo/sportivo.jpg" alt="Sportivo Logo" class="login-page-logo">
                        </a>
                    </div>
                </div>
            </header>
        `;
    }

    renderMain() {
        return `
            <main class="login-main">
                <div class="login-card">
                    <h1 class="login-title">Sign in</h1>
                    
                    <form class="login-form" id="loginForm" novalidate>
                        ${this.renderFormField('email', 'Email or mobile phone number', 'email', true)}
                        ${this.renderFormField('password', 'Password', 'password', true)}
                        
                        <button type="submit" class="continue-btn" id="submitBtn">
                            Continue
                        </button>
                    </form>
                    
                    <div class="login-options">
                        <label class="checkbox-container" for="keepSignedIn">
                            <input type="checkbox" id="keepSignedIn" class="sr-only">
                            <span class="custom-checkbox" aria-hidden="true"></span>
                            Keep me signed in
                        </label>
                        
                        <a href="#" class="help-link">Details</a>
                    </div>
                    
                    <div class="login-divider">
                        <span>New to Sportivo?</span>
                    </div>
                    
                    <button class="create-account-btn" id="createAccountBtn">
                        Create your Sportivo account
                    </button>
                    
                    <div class="login-footer">
                        <a href="#" class="footer-link">Conditions of Use</a>
                        <a href="#" class="footer-link">Privacy Notice</a>
                        <a href="#" class="footer-link">Help</a>
                    </div>
                </div>
            </main>
        `;
    }

    renderFormField(id, label, type, required) {
    const placeholders = {
        'email': 'Enter email or mobile number',
        'password': 'Enter your password'
    };

    const placeholder = placeholders[id];

    return `
        <div class="form-group">
            <label for="${id}" class="form-label">${label}</label>
            <input 
                type="${type}" 
                id="${id}" 
                class="form-input" 
                ${required ? 'required' : ''}
                autocomplete="${type === 'password' ? 'current-password' : 'email'}"
                placeholder="${placeholder}"
            >
            <div class="error-message" id="${id}Error"></div>
        </div>
    `;
}

    renderFooter() {
        return `
            <footer class="global-footer">
                <div class="footer-container">
                    <div class="footer-links">
                        <a href="#">Terms and Privacy Notice</a>
                        <a href="#">Send us feedback</a>
                        <a href="#">Help</a>
                    </div>
                    <div class="copyright">
                        © 1996-2024, Sportivo.com, Inc. or its affiliates
                    </div>
                </div>
            </footer>
        `;
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', this.handleSubmit.bind(this));

        // Checkbox toggle
        const checkbox = document.getElementById('keepSignedIn');
        const customCheckbox = document.querySelector('.custom-checkbox');
        checkbox.addEventListener('change', (e) => {
            customCheckbox.classList.toggle('checked', e.target.checked);
        });

        // Create account button
        const createAccountBtn = document.getElementById('createAccountBtn');
        createAccountBtn.addEventListener('click', this.handleCreateAccount.bind(this));

        // Real-time validation
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearError.bind(this));
        });

        // Accessibility: Enter key support
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type !== 'checkbox') {
                e.preventDefault();
                this.handleSubmit(e);
            }
        });
    }

    validateField(e) {
        const field = e.target;
        const errorElement = document.getElementById(`${field.id}Error`);
        
        this.clearError(field);

        if (field.required && !field.value.trim()) {
            this.showError(field, 'This field is required');
            return false;
        }

        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                this.showError(field, 'Please enter a valid email address');
                return false;
            }
        }

        if (field.type === 'password' && field.value.trim()) {
            if (field.value.length < 6) {
                this.showError(field, 'Password must be at least 6 characters');
                return false;
            }
        }

        return true;
    }

    showError(field, message) {
        field.classList.add('error');
        const errorElement = document.getElementById(`${field.id}Error`);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    clearError(e) {
        const field = e.target || e;
        field.classList.remove('error');
        const errorElement = document.getElementById(`${field.id}Error`);
        errorElement.classList.remove('show');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const inputs = form.querySelectorAll('input');
        let isValid = true;

        // Validate all fields
        inputs.forEach(input => {
            if (!this.validateField({ target: input })) {
                isValid = false;
            }
        });

        if (!isValid) return;

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = '';

        try {
            // Simulate API call
            await this.mockAuthAPI();
            
            // Success handling would go here
            console.log('Login successful');
            this.showSuccessMessage();
            
        } catch (error) {
            this.showError(document.getElementById('email'), 'Invalid email or password');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Continue';
        }
    }

    mockAuthAPI() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                Math.random() > 0.3 ? resolve() : reject();
            }, 1500);
        });
    }

    showSuccessMessage() {
        // Would typically redirect or show success state
        alert('Login successful! (This is a demo)');
    }

    handleCreateAccount() {
        // Redirect to signup flow
        console.log('Redirecting to signup');
        alert('Redirecting to account creation...');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SportivoLogin();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SportivoLogin;
}