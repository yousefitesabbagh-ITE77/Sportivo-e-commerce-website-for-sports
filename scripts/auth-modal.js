// scripts/auth-modal.js

const ACCOUNT_USER_STORAGE_KEY = 'sportivoAccountUser';

class AuthModal {
  constructor() {
    this.isOpen = false;
    this.modal = null;
    this.init();
  }

  init() {
    this.createModal();
    this.bindEvents();
    this.updateHeaderAuthState();
    this.observeHeaderChanges();
  }

  createModal() {
    if (document.querySelector('.js-login-overlay')) {
      this.modal = document.querySelector('.js-login-overlay');
      return;
    }

    this.modal = document.createElement('div');
    this.modal.className = 'login-modal-overlay js-login-overlay';
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.innerHTML = this.getModalShellHTML();

    document.body.appendChild(this.modal);
  }

  getModalShellHTML() {
    return `
      <div class="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        <button class="login-modal-close js-login-close" type="button" aria-label="Close sign in modal">
          ×
        </button>

        <div class="login-modal-header">
          <p class="login-modal-eyebrow">Sportivo account</p>
          <h2 class="login-modal-title" id="login-modal-title">Sign in</h2>
        </div>

        <div class="login-modal-body js-login-modal-body">
          <!-- Auth content will be rendered by JavaScript. -->
        </div>
      </div>
    `;
  }

  getSignedOutHTML() {
    return `
      <div class="login-account-note">
        <strong>Sportivo account</strong>
        <span>Use your email and a password with at least 6 characters to continue.</span>
      </div>

      <form class="login-form js-account-login-form" novalidate>
        <div class="form-group">
          <label for="login-email" class="form-label">Email address</label>
          <input
            type="email"
            id="login-email"
            class="form-input js-login-email"
            placeholder="you@sportivo.com"
            autocomplete="email"
            required
          >
          <div class="form-feedback js-email-feedback" aria-live="polite"></div>
        </div>

        <div class="form-group">
          <label for="login-password" class="form-label">Password</label>
          <input
            type="password"
            id="login-password"
            class="form-input js-login-password"
            placeholder="Use at least 6 characters"
            autocomplete="current-password"
            required
            minlength="6"
          >
          <div class="form-feedback js-password-feedback" aria-live="polite"></div>
        </div>

        <label class="checkbox-label">
          <input type="checkbox" class="js-keep-signed-in">
          <span class="checkmark"></span>
          Keep me signed in
        </label>

        <div class="form-message js-form-message" aria-live="polite"></div>

        <button type="submit" class="continue-btn js-login-submit">
          <span class="btn-text">Sign in</span>
          <span class="btn-loading">
            <span class="loading-spinner-small"></span>
            Signing in...
          </span>
        </button>
      </form>

      <div class="divider">
        <span class="divider-text">New to Sportivo?</span>
      </div>

      <button class="create-account-btn js-create-account" type="button">
        Create account
      </button>

      <p class="auth-small-print">
        Your account area keeps shopping, wishlist, and order details together on this device.
      </p>
    `;
  }

  getSignedInHTML(user) {
    return `
      <div class="signed-in-state">
        <div class="signed-in-avatar">
          ${this.getUserInitial(user)}
        </div>

        <h3>You are signed in</h3>

        <p>
          Signed in as <strong>${this.escapeHTML(user.email)}</strong>.
          Your shopping session is ready on this device.
        </p>

        <div class="signed-in-actions">
          <a href="index.html" class="button-primary signed-in-link">
            Continue shopping
          </a>

          <button class="sign-out-btn js-sign-out" type="button">
            Sign out
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.addEventListener('click', (event) => {
      if (event.target.closest('.js-login-trigger')) {
        event.preventDefault();
        this.openModal();
        return;
      }

      if (
        event.target.classList.contains('js-login-overlay') ||
        event.target.closest('.js-login-close')
      ) {
        this.closeModal();
        return;
      }

      if (event.target.closest('.js-create-account')) {
        this.showFormMessage(
          'Enter your email and a password with at least 6 characters to create an account session.',
          'info'
        );
        return;
      }

      if (event.target.closest('.js-sign-out')) {
        this.signOut();
      }
    });

    document.addEventListener('submit', (event) => {
      if (event.target.classList.contains('js-account-login-form')) {
        event.preventDefault();
        this.handleLogin();
      }
    });

    document.addEventListener('input', (event) => {
      if (event.target.classList.contains('form-input')) {
        this.validateField(event.target, false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.closeModal();
      }
    });
  }

  openModal() {
    this.renderModalContent();
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const emailInput = document.querySelector('.js-login-email');

      if (emailInput) {
        emailInput.focus();
      }
    }, 100);
  }

  closeModal() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  renderModalContent() {
    const modalBody = document.querySelector('.js-login-modal-body');
    const user = this.getStoredUser();

    if (!modalBody) {
      return;
    }

    modalBody.innerHTML = user ? this.getSignedInHTML(user) : this.getSignedOutHTML();
  }

  async handleLogin() {
    const emailInput = document.querySelector('.js-login-email');
    const passwordInput = document.querySelector('.js-login-password');
    const submitButton = document.querySelector('.js-login-submit');

    if (!emailInput || !passwordInput || !submitButton) {
      return;
    }

    this.clearFormMessage();

    const isEmailValid = this.validateField(emailInput, true);
    const isPasswordValid = this.validateField(passwordInput, true);

    if (!isEmailValid || !isPasswordValid) {
      this.showFormMessage('Please fix the highlighted fields.', 'error');
      return;
    }

    this.setButtonLoading(submitButton, true);

    try {
      await this.simulateLoginRequest();

      const user = {
        email: emailInput.value.trim(),
        name: this.getNameFromEmail(emailInput.value.trim()),
        signedInAt: new Date().toISOString()
      };

      localStorage.setItem(ACCOUNT_USER_STORAGE_KEY, JSON.stringify(user));

      this.showFormMessage('Signed in successfully. Updating your account session...', 'success');

      setTimeout(() => {
        this.updateHeaderAuthState();
        this.renderModalContent();
      }, 700);
    } catch (error) {
      this.showFormMessage('Unable to sign in right now. Please try again.', 'error');
      console.error('Sign in error:', error);
    } finally {
      this.setButtonLoading(submitButton, false);
    }
  }

  validateField(field, showEmptyError = true) {
    const value = field.value.trim();
    const feedback = field.parentElement.querySelector('.form-feedback');

    field.classList.remove('valid', 'error');

    if (feedback) {
      feedback.textContent = '';
    }

    if (!value) {
      if (showEmptyError) {
        field.classList.add('error');

        if (feedback) {
          feedback.textContent = 'This field is required.';
        }

        return false;
      }

      return true;
    }

    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) {
        field.classList.add('error');

        if (feedback) {
          feedback.textContent = 'Enter a valid email address.';
        }

        return false;
      }
    }

    if (field.type === 'password' && value.length < 6) {
      field.classList.add('error');

      if (feedback) {
        feedback.textContent = 'Password must be at least 6 characters.';
      }

      return false;
    }

    field.classList.add('valid');
    return true;
  }

  setButtonLoading(button, isLoading) {
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
    this.updateHeaderAuthState();
    this.renderModalContent();
  }

  updateHeaderAuthState() {
    const loginText = document.querySelector('.js-login-trigger .login-text');
    const loginTrigger = document.querySelector('.js-login-trigger');
    const user = this.getStoredUser();

    if (!loginText || !loginTrigger) {
      return false;
    }

    if (user) {
      const nextText = `Hi, ${user.name}`;

      if (loginText.textContent !== nextText) {
        loginText.textContent = nextText;
      }

      loginTrigger.setAttribute('title', `Signed in as ${user.email}`);
      return true;
    }

    if (loginText.textContent !== 'Sign in') {
      loginText.textContent = 'Sign in';
    }

    loginTrigger.setAttribute('title', 'Open sign in modal');
    return true;
  }

  observeHeaderChanges() {
    const headerContainer = document.getElementById('header-container');

    if (!headerContainer) {
      return;
    }

    const observer = new MutationObserver(() => {
      const headerWasUpdated = this.updateHeaderAuthState();

      if (headerWasUpdated) {
        observer.disconnect();
      }
    });

    observer.observe(headerContainer, {
      childList: true
    });
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
    new AuthModal();
  });
} else {
  new AuthModal();
}