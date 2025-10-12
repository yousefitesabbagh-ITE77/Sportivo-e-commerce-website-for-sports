// scripts/shared/header.js

import { showModal } from './region-modal.js';

export function renderHeader() {
  const headerHTML = `
    <div class="sportivo-header">
      <div class="sportivo-header-left-section">
        <a href="sportivo.html" class="header-link">
          <img class="sportivo-logo" src="images/logo/sportivo.jpg">
          <img class="sportivo-mobile-logo" src="images/sportivo-mobile-logo-white.png">
        </a>
      </div>

      <div class="sportivo-header-middle-section">
        <!-- Sport Filter -->
        <div class="sport-filter-container">
          <select class="sport-filter js-sport-filter">
            <option value="all">All Sports</option>
            <option value="football">⚽ Football</option>
            <option value="basketball">🏀 Basketball</option>
            <option value="tabletennis">🎾 Table Tennis</option>
            <option value="vollyball">🏐 Volleyball</option>
          </select>
        </div>

        <!-- Search with Suggestions -->
        <div class="search-container">
          <input class="search-bar js-search-bar" type="text" placeholder="Search sports products..." autocomplete="off">
          <button class="search-button js-search-button">
            <img class="search-icon" src="images/icons/search-icon.png">
          </button>
          
          <!-- Search Suggestions Dropdown -->
          <div class="search-suggestions js-search-suggestions" style="display: none;">
            <!-- Suggestions will be inserted here by JavaScript -->
          </div>
        </div>
      </div>

      <div class="sportivo-header-right-section">
        <a class="login-link header-link" href="login.html">
          <span class="login-text">Sign in</span>
        </a>

        <a class="orders-link header-link" href="orders.html">
          <span class="returns-text">Returns</span>
          <span class="orders-text">& Orders</span>
        </a>

        <a class="wishlist-link header-link" href="wishlist.html">
          <span class="wishlist-text">Wishlist</span>
          <div class="wishlist-count js-wishlist-count" style="display: none;">0</div>
        </a>

        <a class="cart-link header-link" href="checkout.html">
          <img class="cart-icon" src="images/icons/cart-icon.png">
          <div class="cart-quantity js-cart-quantity"></div>
          <div class="cart-text">Cart</div>
        </a>
      </div>
    </div>
  `;

  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = headerHTML;
  }

  // Re-attach event listeners for the new header content
  initializeHeaderScripts();
}

function initializeHeaderScripts() {
  // Region Selector Script
  const regionChange = document.querySelector('.region-change');
  if (regionChange) {
    regionChange.addEventListener('click', () => {
      showModal();
    });
  }

  // Load saved region on page load
  const savedRegion = localStorage.getItem('userRegion');
  const savedCurrency = localStorage.getItem('userCurrency');
  const savedFlag = localStorage.getItem('userFlag');
  if (savedRegion && savedCurrency && savedFlag) {
    const regionElement = document.querySelector('.footer-region span:first-child');
    if (regionElement) {
      regionElement.textContent = `${savedFlag} ${savedRegion} / ${savedCurrency}`;
    }
  }
}