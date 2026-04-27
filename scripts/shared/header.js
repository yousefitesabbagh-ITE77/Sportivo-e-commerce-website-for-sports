// scripts/shared/header.js

const HEADER_VARIANTS = {
  store: {
    className: 'sportivo-header--store',
    tagline: '',
    includeSearch: true,
    actions: ['account', 'orders', 'wishlist', 'cart']
  },
  account: {
    className: 'sportivo-header--compact sportivo-header--account',
    tagline: 'Orders and account support',
    includeSearch: false,
    actions: ['shop', 'orders', 'wishlist', 'cart', 'account']
  },
  process: {
    className: 'sportivo-header--compact sportivo-header--process',
    tagline: 'Order tracking',
    includeSearch: false,
    actions: ['orders', 'shop', 'cart']
  },
  confirmation: {
    className: 'sportivo-header--compact sportivo-header--confirmation',
    tagline: 'Order placed',
    includeSearch: false,
    actions: ['orders', 'shop', 'cart']
  },
  legal: {
    className: 'sportivo-header--compact sportivo-header--legal',
    tagline: 'Customer information',
    includeSearch: false,
    actions: ['shop', 'orders', 'cart']
  }
};

const HEADER_ACTIONS = {
  shop: {
    href: 'index.html#products',
    className: 'shop-link',
    label: 'Shop',
    value: 'Products'
  },
  account: {
    href: 'login.html',
    className: 'login-link js-login-trigger',
    label: 'Account',
    value: 'Sign in',
    valueClass: 'login-text'
  },
  orders: {
    href: 'orders.html',
    className: 'orders-link',
    label: 'Track',
    value: 'Orders',
    valueClass: 'orders-text'
  },
  wishlist: {
    href: 'wishlist.html',
    className: 'wishlist-link',
    label: 'Saved',
    value: 'Saved',
    valueClass: 'wishlist-text',
    countClass: 'wishlist-count js-wishlist-count'
  },
  cart: {
    href: 'checkout.html',
    className: 'cart-link',
    label: 'Cart',
    value: 'Checkout',
    valueClass: 'cart-text',
    cart: true
  }
};

export function renderHeader(options = {}) {
  const headerContainer = document.getElementById('header-container');

  if (!headerContainer) {
    return;
  }

  const requestedVariant = options.variant || 'store';
  const headerConfig = HEADER_VARIANTS[requestedVariant] || HEADER_VARIANTS.store;
  const activeAction = options.active || getActiveActionFromPath();
  

  document.body.classList.remove('has-store-header', 'has-compact-header');
  document.body.classList.add(headerConfig.includeSearch ? 'has-store-header' : 'has-compact-header');
  document.body.dataset.headerVariant = requestedVariant;

  headerContainer.innerHTML = `
    <header class="sportivo-header ${headerConfig.className}" data-header-variant="${requestedVariant}">
      <div class="sportivo-header-left-section">
        <a href="index.html" class="brand-link" aria-label="Go to Sportivo homepage">
          <img class="sportivo-logo" src="images/logo/sportivo-logo.svg" alt="Sportivo">
          <img class="sportivo-mobile-logo" src="images/logo/sportivo-mark.svg" alt="Sportivo">
        </a>
      </div>

      <div class="sportivo-header-middle-section">
        ${headerConfig.includeSearch ? renderSearchBox() : renderHeaderTagline(headerConfig.tagline)}
      </div>

      <nav class="sportivo-header-right-section" aria-label="Main navigation">
        ${headerConfig.actions.map((actionKey) => renderHeaderAction(actionKey, activeAction)).join('')}
      </nav>
    </header>
  `;

  initializeHeaderNavigation();
}

function renderSearchBox() {
  return `
    <div class="search-container" role="search">
      <input
        class="search-bar js-search-bar"
        type="text"
        placeholder="Search balls, shoes, training gear..."
        autocomplete="off"
        aria-label="Search products"
        aria-controls="site-search-suggestions"
        aria-expanded="false"
      >

      <button class="search-button js-search-button" type="button" aria-label="Search products">
        <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Zm0-2.2a5.1 5.1 0 1 0 0-10.2 5.1 5.1 0 0 0 0 10.2Zm5.8.2 4.1 4.1-1.6 1.6-4.1-4.1 1.6-1.6Z"/>
        </svg>
      </button>

      <div id="site-search-suggestions" class="search-suggestions js-search-suggestions" style="display: none;"></div>
    </div>
  `;
}

function renderHeaderTagline(tagline) {
  if (!tagline) {
    return '';
  }

  return `
    <div class="header-context-label" aria-label="Current section">
      ${tagline}
    </div>
  `;
}

function renderHeaderAction(actionKey, activeAction) {
  const action = HEADER_ACTIONS[actionKey];

  if (!action) {
    return '';
  }

  const isActive = activeAction === actionKey;
  const activeClass = isActive ? ' is-active' : '';
  const activeAria = isActive ? ' aria-current="page"' : '';

  if (action.cart) {
    return `
      <a class="cart-link nav-link${activeClass}" href="${action.href}" aria-label="Open cart"${activeAria}>
        <span class="cart-icon-wrap" aria-hidden="true">
          <svg class="cart-icon" viewBox="0 0 24 24" focusable="false">
            <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 .1 0H17ZM3 4h2l2.1 9.2A2.5 2.5 0 0 0 9.5 15H17a2.5 2.5 0 0 0 2.4-1.8L21 7H7.1L6.6 5H3V4Z"/>
          </svg>
          <span class="cart-quantity js-cart-quantity">0</span>
        </span>
        <span class="cart-text nav-link-value">Cart</span>
      </a>
    `;
  }

  const valueClass = action.valueClass || 'nav-link-value';
  const countMarkup = action.countClass
    ? `<span class="${action.countClass}" style="display: none;">0</span>`
    : '';

  return `
    <a class="nav-link ${action.className}${activeClass}" href="${action.href}"${activeAria}>
      <span class="nav-link-label">${action.label}</span>
      <span class="${valueClass} nav-link-value">${action.value}</span>
      ${countMarkup}
    </a>
  `;
}

function getActiveActionFromPath() {
  const currentPath = window.location.pathname.toLowerCase();

  if (currentPath.endsWith('/orders.html')) return 'orders';
  if (currentPath.endsWith('/wishlist.html')) return 'wishlist';
  if (currentPath.endsWith('/checkout.html')) return 'cart';
  if (currentPath.endsWith('/login.html')) return 'account';
  if (currentPath.endsWith('/index.html') || currentPath.endsWith('/sportivo.html') || currentPath === '/' || currentPath.endsWith('/')) return 'shop';

  return '';
}

function isProductsPage() {
  const currentPath = window.location.pathname.toLowerCase();

  return (
    currentPath.endsWith('/index.html') ||
    currentPath.endsWith('/sportivo.html') ||
    currentPath === '/' ||
    currentPath.endsWith('/')
  );
}

function initializeHeaderNavigation() {
  const searchBar = document.querySelector('.js-search-bar');
  const searchButton = document.querySelector('.js-search-button');

  if (!searchBar || !searchButton) {
    return;
  }

  if (isProductsPage()) {
    return;
  }

  function goToSearchPage() {
    const searchTerm = searchBar.value.trim();

    if (!searchTerm) {
      window.location.href = 'index.html#products';
      return;
    }

    window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}#products`;
  }

  searchButton.addEventListener('click', goToSearchPage);

  searchBar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      goToSearchPage();
    }
  });
}
