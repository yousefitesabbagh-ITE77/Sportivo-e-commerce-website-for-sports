// scripts/checkout/CheckoutHeader.js

export function renderCheckoutHeader() {
  const checkoutHeaderElement = document.querySelector('.js-checkout-header');

  if (!checkoutHeaderElement) {
    return;
  }

  checkoutHeaderElement.innerHTML = `
    <header class="sportivo-header checkout-sportivo-header" data-header-variant="checkout">
      <div class="sportivo-header-left-section checkout-header-side">
        <a href="index.html#products" class="checkout-back-link" aria-label="Continue shopping">
          <span aria-hidden="true">←</span>
          <span>Continue shopping</span>
        </a>
      </div>

      <div class="sportivo-header-middle-section checkout-header-logo-section">
        <a href="index.html" class="header-link checkout-logo-link" aria-label="Go to Sportivo homepage">
          <img class="sportivo-logo checkout-logo" src="images/logo/sportivo-logo.svg" alt="Sportivo">
          <img class="sportivo-mobile-logo checkout-mobile-logo" src="images/logo/sportivo-mark.svg" alt="Sportivo">
        </a>

        <div class="checkout-step-label" aria-label="Checkout step">
          Cart review and delivery
        </div>
      </div>

      <div class="sportivo-header-right-section checkout-header-side checkout-secure-section">
        <span class="checkout-secure-text">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 2 5 5v6c0 4.4 2.8 8.5 7 10 4.2-1.5 7-5.6 7-10V5l-7-3Zm0 2.2 5 2.1V11c0 3.3-1.9 6.4-5 7.8-3.1-1.4-5-4.5-5-7.8V6.3l5-2.1Zm-1 9.4 4.2-4.2 1.4 1.4-5.6 5.6-3.1-3.1 1.4-1.4 1.7 1.7Z"/>
          </svg>
          <span>Secure checkout</span>
        </span>
      </div>
    </header>
  `;
}
