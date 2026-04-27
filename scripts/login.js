// scripts/login.js

const ACCOUNT_USER_STORAGE_KEY = 'sportivoAccountUser';

class SportivoLoginPage {
  constructor() {
    this.app = document.getElementById('app');
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const user = this.getStoredUser();

    this.app.innerHTML = `
      <div class="login-page-shell">
        <a class="skip-link" href="#main-content">Skip to main content</a>
        ${this.renderHeader()}
        ${user ? this.renderSignedInMain(user) : this.renderLoginMain()}
        ${this.renderFooter()}
      </div>
    `;
  }

  renderHeader() {
    return `
      <header class="login-header">
        <a href="index.html" class="login-logo-link" aria-label="Go to Sportivo homepage">
          <img src="images/logo/sportivo-logo.svg" alt="Sportivo" class="login-page-logo">
        </a>

        <a href="index.html" class="login-header-link">
          Continue shopping
        </a>
      </header>
    `;
  }

  renderLoginMain() {
    return `
      <main id="main-content" class="login-main" tabindex="-1">
        <section class="login-info-panel">
          <p class="login-eyebrow">Sportivo account</p>

          <h1>Sign in to your Sportivo account.</h1>

          <p>
            Access saved items, review orders, and keep your shopping details ready while you browse.
          </p>

          <div class="login-feature-list">
            <div>
              <span>${this.checkIcon()}</span>
              <strong>Save checkout details</strong>
            </div>

            <div>
              <span>${this.checkIcon()}</span>
              <strong>Track orders quickly</strong>
            </div>

            <div>
              <span>${this.checkIcon()}</span>
              <strong>Keep wishlist ready</strong>
            </div>
          </div>
        </section>

        <section class="login-card" aria-labelledby="login-title">
          <p class="login-card-eyebrow">Sportivo account</p>
          <h2 class="login-title" id="login-title">Sign in</h2>

          <div class="login-account-note">
            Use your email and a password with at least 6 characters to continue.
          </div>

          <form class="login-form js-login-form" novalidate>
            <div class="form-group">
              <label for="email" class="form-label">Email address</label>
              <input
                type="email"
                id="email"
                class="form-input js-email"
                placeholder="you@sportivo.com"
                autocomplete="email"
                required
              >
              <div class="error-message js-email-error" aria-live="polite"></div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                id="password"
                class="form-input js-password"
                placeholder="Use at least 6 characters"
                autocomplete="current-password"
                required
                minlength="6"
              >
              <div class="error-message js-password-error" aria-live="polite"></div>
            </div>

            <label class="checkbox-container">
              <input type="checkbox" class="js-keep-signed-in">
              <span class="custom-checkbox" aria-hidden="true"></span>
              <span>Keep me signed in</span>
            </label>

            <div class="form-message js-form-message" aria-live="polite"></div>

            <button type="submit" class="continue-btn js-submit-btn">
              <span class="btn-text">Sign in</span>
              <span class="btn-loading">
                <span class="loading-spinner-small"></span>
                Signing in...
              </span>
            </button>
          </form>

          <div class="login-divider">
            <span>New to Sportivo?</span>
          </div>

          <button class="create-account-btn js-create-account-btn" type="button">
            Create account
          </button>

          <p class="login-small-print">
            Your account area helps keep shopping, wishlist, and order details together.
          </p>
        </section>
      </main>
    `;
  }

  renderSignedInMain(user) {
    return `
      <main id="main-content" class="login-main signed-in-main" tabindex="-1">
        <section class="signed-in-card">
          <div class="signed-in-avatar">
            ${this.getUserInitial(user)}
          </div>

          <p class="login-eyebrow">Account session active</p>

          <h1>You are signed in</h1>

          <p>
            Signed in as <strong>${this.escapeHTML(user.email)}</strong>.
            Your shopping session is ready on this device.
          </p>

          <div class="signed-in-actions">
            <a href="index.html" class="button-primary signed-in-link">
              Continue to store
            </a>

            <button class="sign-out-btn js-sign-out" type="button">
              Sign out
            </button>
          </div>
        </section>
      </main>
    `;
  }

  renderFooter() {
    const year = new Date().getFullYear();

    return `
      <footer class="login-footer">
        <div class="login-footer-links">
          <a href="terms.html">Terms</a>
          <a href="privacy.html">Privacy</a>
          <a href="accessibility.html">Accessibility</a>
        </div>

        <p>&copy; ${year} Sportivo. All rights reserved.</p>
      </footer>
    `;
  }

  bindEvents() {
    document.addEventListener('submit', (event) => {
      if (event.target.classList.contains('js-login-form')) {
        event.preventDefault();
        this.handleSubmit();
      }
    });

    document.addEventListener('input', (event) => {
      if (event.target.classList.contains('form-input')) {
        this.validateField(event.target, false);
      }
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('.js-create-account-btn')) {
        this.showFormMessage(
          'Creating an account uses the same form. Enter any valid email and password.',
          'info'
        );
      }

      if (event.target.closest('.js-sign-out')) {
        this.signOut();
      }
    });
  }

  async handleSubmit() {
    const emailInput = document.querySelector('.js-email');
    const passwordInput = document.querySelector('.js-password');
    const submitButton = document.querySelector('.js-submit-btn');

    const isEmailValid = this.validateField(emailInput, true);
    const isPasswordValid = this.validateField(passwordInput, true);

    if (!isEmailValid || !isPasswordValid) {
      this.showFormMessage('Please fix the highlighted fields.', 'error');
      return;
    }

    this.clearFormMessage();
    this.setButtonLoading(submitButton, true);

    try {
      await this.simulateLoginRequest();

      const user = {
        email: emailInput.value.trim(),
        name: this.getNameFromEmail(emailInput.value.trim()),
        signedInAt: new Date().toISOString()
      };

      localStorage.setItem(ACCOUNT_USER_STORAGE_KEY, JSON.stringify(user));
      this.showFormMessage('Signed in successfully. Redirecting to the store...', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 900);
    } catch (error) {
      this.showFormMessage('Unable to sign in right now. Please try again.', 'error');
      console.error('Sign in error:', error);
    } finally {
      this.setButtonLoading(submitButton, false);
    }
  }

  validateField(field, showEmptyError = true) {
    if (!field) {
      return false;
    }

    const value = field.value.trim();
    const errorElement = document.querySelector(`.js-${field.id}-error`);

    field.classList.remove('error', 'valid');

    if (errorElement) {
      errorElement.textContent = '';
    }

    if (!value) {
      if (showEmptyError) {
        field.classList.add('error');

        if (errorElement) {
          errorElement.textContent = 'This field is required.';
        }

        return false;
      }

      return true;
    }

    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) {
        field.classList.add('error');

        if (errorElement) {
          errorElement.textContent = 'Enter a valid email address.';
        }

        return false;
      }
    }

    if (field.type === 'password' && value.length < 6) {
      field.classList.add('error');

      if (errorElement) {
        errorElement.textContent = 'Password must be at least 6 characters.';
      }

      return false;
    }

    field.classList.add('valid');
    return true;
  }

  setButtonLoading(button, isLoading) {
    if (!button) {
      return;
    }

    button.disabled = isLoading;
    button.classList.toggle('is-loading', isLoading);
  }

  showFormMessage(message, type = 'info') {
    const messageElement = document.querySelector('.js-form-message');

    if (!messageElement) {
      return;
    }

    messageElement.textContent = message;
    messageElement.className = `form-message js-form-message form-message-${type}`;
  }

  clearFormMessage() {
    const messageElement = document.querySelector('.js-form-message');

    if (!messageElement) {
      return;
    }

    messageElement.textContent = '';
    messageElement.className = 'form-message js-form-message';
  }

  simulateLoginRequest() {
    return new Promise((resolve) => {
      setTimeout(resolve, 600);
    });
  }

  getStoredUser() {
    try {
      const storedUser = localStorage.getItem(ACCOUNT_USER_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      localStorage.removeItem(ACCOUNT_USER_STORAGE_KEY);
      return null;
    }
  }

  signOut() {
    localStorage.removeItem(ACCOUNT_USER_STORAGE_KEY);
    this.render();
  }

  getNameFromEmail(email) {
    const namePart = email.split('@')[0] || 'User';

    return namePart
      .replace(/[._-]+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'User';
  }

  getUserInitial(user) {
    const name = user?.name || user?.email || 'U';
    return this.escapeHTML(name.charAt(0).toUpperCase());
  }

  escapeHTML(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SportivoLoginPage();
  });
} else {
  new SportivoLoginPage();
}