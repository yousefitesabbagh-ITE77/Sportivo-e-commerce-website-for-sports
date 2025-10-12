// scripts/checkout/CheckoutHeader.js

export function renderCheckoutHeader() {
  const checkoutHeaderHTML = `
    <div class="sportivo-header">
      <div class="sportivo-header-left-section">
        <!-- Left section is now empty -->
      </div>

      <div class="sportivo-header-middle-section">
        <a href="sportivo.html" class="header-link">
          <img class="sportivo-logo" src="images/logo/sportivo.jpg">
          <img class="sportivo-mobile-logo" src="images/sportivo-mobile-logo-white.png">
        </a>
      </div>

      <div class="sportivo-header-right-section">
        <!-- Right section is now empty -->
      </div>
    </div>
  `;

  document.querySelector('.js-checkout-header').innerHTML = checkoutHeaderHTML;
}