// scripts/orders.js

import { getProduct, loadProductsFetch } from '../data/products.js';
import { orders } from '../data/order.js';
import { formatDeliveryDate } from '../data/deliveryOptions.js';
import { formatPrice } from './shared/currency-manager.js';
import { addToCart, calculateCartQuantity } from '../data/cart.js';
import { calculateWishlistQuantity } from '../data/wishlist.js';
import { createLoadingOverlay, removeLoadingOverlay } from './utils/loading.js';

let orderPageListenersInitialized = false;
let activeStatusFilter = 'all';

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function updateCartQuantity() {
  const cartQuantity = calculateCartQuantity();
  const cartQuantityElement = document.querySelector('.js-cart-quantity');

  if (cartQuantityElement) {
    cartQuantityElement.textContent = cartQuantity;
  }
}

function updateWishlistCounter() {
  const wishlistCount = calculateWishlistQuantity();
  const wishlistCounter = document.querySelector('.js-wishlist-count');

  if (wishlistCounter) {
    wishlistCounter.textContent = wishlistCount;
    wishlistCounter.style.display = wishlistCount > 0 ? 'flex' : 'none';
  }
}

function updateHeaderCounters() {
  updateCartQuantity();
  updateWishlistCounter();
}

function iconSVG(name) {
  const icons = {
    box: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M4 8.4 12 4l8 4.4v7.2L12 20l-8-4.4V8.4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="m4.5 8.6 7.5 4 7.5-4M12 12.6V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    truck: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M3 6.5h11v9H3v-9ZM14 10h3.8l2.2 2.7v2.8h-6V10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M7.2 18a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM17.6 18a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" stroke="currentColor" stroke-width="1.8"/>
      </svg>
    `,
    check: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="m5 12.5 4.2 4.2L19 6.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    receipt: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M7 4h10v16l-2-1.1-2 1.1-2-1.1-2 1.1-2-1.1V4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M9.5 8h5M9.5 11.5h5M9.5 15h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    empty: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M5 8h14l-1.2 11H6.2L5 8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M9 8a3 3 0 0 1 6 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    alert: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M12 4 3.5 19h17L12 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M12 9v4M12 16.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `
  };

  return icons[name] || icons.box;
}

function getOrderProductDeliveryDate(productDetails) {
  return productDetails.estimatedDeliveryDateISO || productDetails.estimatedDeliveryTime;
}

function getFormattedOrderDate(orderTime, includeWeekday = false) {
  return formatDeliveryDate(orderTime, {
    includeWeekday,
    includeYear: true
  });
}

function getFormattedDeliveryDate(productDetails, includeWeekday = false) {
  const deliveryDate = getOrderProductDeliveryDate(productDetails);

  if (!deliveryDate) {
    return 'Date not available';
  }

  const formattedDate = formatDeliveryDate(deliveryDate, {
    includeWeekday,
    includeYear: true
  });

  return formattedDate === 'Date not available' ? deliveryDate : formattedDate;
}

function calculateProgress(orderTimeInput, deliveryTimeInput) {
  const orderTime = new Date(orderTimeInput);
  const deliveryTime = new Date(deliveryTimeInput);
  const now = new Date();

  if (Number.isNaN(orderTime.getTime()) || Number.isNaN(deliveryTime.getTime())) {
    return 8;
  }

  if (now.getTime() >= deliveryTime.getTime()) {
    return 100;
  }

  if (now.getTime() <= orderTime.getTime()) {
    return 8;
  }

  const totalTime = deliveryTime.getTime() - orderTime.getTime();
  const timePassed = now.getTime() - orderTime.getTime();

  if (totalTime <= 0) {
    return 100;
  }

  return Math.max(8, Math.min(96, Math.round((timePassed / totalTime) * 100)));
}

function getShipmentStatus(order, productDetails) {
  const deliveryDate = getOrderProductDeliveryDate(productDetails);
  const progress = calculateProgress(order.orderTime, deliveryDate);

  if (progress >= 100) {
    return {
      key: 'delivered',
      group: 'delivered',
      label: 'Delivered',
      description: 'Delivered to the customer',
      className: 'status-delivered',
      icon: 'check'
    };
  }

  if (progress >= 75) {
    return {
      key: 'out-for-delivery',
      group: 'in-transit',
      label: 'Out for delivery',
      description: 'Arriving soon',
      className: 'status-out-for-delivery',
      icon: 'truck'
    };
  }

  if (progress >= 45) {
    return {
      key: 'shipped',
      group: 'in-transit',
      label: 'Shipped',
      description: 'On the way',
      className: 'status-shipped',
      icon: 'truck'
    };
  }

  if (progress >= 20) {
    return {
      key: 'packed',
      group: 'processing',
      label: 'Packed',
      description: 'Ready for carrier pickup',
      className: 'status-packed',
      icon: 'box'
    };
  }

  return {
    key: 'processing',
    group: 'processing',
    label: 'Processing',
    description: 'Order confirmed',
    className: 'status-processing',
    icon: 'receipt'
  };
}

function getOrderPrimaryProduct(order) {
  return order.products?.[0] || null;
}

function getOrderStatus(order) {
  const statuses = (order.products || []).map((productDetails) => getShipmentStatus(order, productDetails));

  if (statuses.length === 0) {
    return {
      key: 'processing',
      group: 'processing',
      label: 'Processing',
      description: 'Order confirmed',
      className: 'status-processing',
      icon: 'receipt'
    };
  }

  if (statuses.every((status) => status.key === 'delivered')) {
    return statuses[0];
  }

  const priority = ['out-for-delivery', 'shipped', 'packed', 'processing'];
  return statuses.find((status) => priority.includes(status.key)) || statuses[0];
}

function getOrderDeliveryWindow(order) {
  const deliveryDates = (order.products || [])
    .map((productDetails) => getOrderProductDeliveryDate(productDetails))
    .filter(Boolean)
    .map((dateValue) => new Date(dateValue))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((firstDate, secondDate) => firstDate.getTime() - secondDate.getTime());

  if (deliveryDates.length === 0) {
    return 'Date not available';
  }

  const firstDate = deliveryDates[0].toISOString();
  const lastDate = deliveryDates[deliveryDates.length - 1].toISOString();
  const formattedFirstDate = getFormattedOrderDate(firstDate);
  const formattedLastDate = getFormattedOrderDate(lastDate);

  if (formattedFirstDate === formattedLastDate) {
    return formattedFirstDate;
  }

  return `${formattedFirstDate} - ${formattedLastDate}`;
}

function getOrderItemCount(order) {
  return (order.products || []).reduce((sum, productDetails) => sum + productDetails.quantity, 0);
}

function getOrdersStats() {
  const totalOrders = orders.length;
  const activeOrders = orders.filter((order) => getOrderStatus(order).group !== 'delivered').length;
  const deliveredOrders = orders.filter((order) => getOrderStatus(order).group === 'delivered').length;
  const totalSpentCents = orders.reduce((sum, order) => sum + order.totalCostCents, 0);

  return {
    totalOrders,
    activeOrders,
    deliveredOrders,
    totalSpentCents
  };
}

function getFilteredOrders() {
  if (activeStatusFilter === 'all') {
    return orders;
  }

  return orders.filter((order) => getOrderStatus(order).group === activeStatusFilter);
}

function ordersSummaryHTML() {
  const stats = getOrdersStats();

  return `
    <section class="orders-summary-card">
      <div class="orders-summary-content">
        <p class="orders-eyebrow">Order history</p>
        <h2>Manage your Sportivo orders</h2>
        <p>
          Review recent purchases, check delivery progress, and quickly reorder your favorite training essentials.
        </p>
      </div>

      <div class="orders-stats-grid" aria-label="Order summary statistics">
        <div class="orders-stat">
          <strong>${stats.totalOrders}</strong>
          <span>Total orders</span>
        </div>
        <div class="orders-stat">
          <strong>${stats.activeOrders}</strong>
          <span>In progress</span>
        </div>
        <div class="orders-stat">
          <strong>${formatPrice(stats.totalSpentCents)}</strong>
          <span>Lifetime total</span>
        </div>
      </div>
    </section>
  `;
}

function filterTabsHTML() {
  const filters = [
    { key: 'all', label: 'All orders', count: orders.length },
    { key: 'processing', label: 'Processing', count: orders.filter((order) => getOrderStatus(order).group === 'processing').length },
    { key: 'in-transit', label: 'In transit', count: orders.filter((order) => getOrderStatus(order).group === 'in-transit').length },
    { key: 'delivered', label: 'Delivered', count: orders.filter((order) => getOrderStatus(order).group === 'delivered').length }
  ];

  return `
    <section class="orders-toolbar" aria-label="Filter orders by status">
      <div>
        <p class="orders-eyebrow">Filter orders</p>
        <h2>Find an order faster</h2>
      </div>

      <div class="orders-filter-tabs" role="tablist" aria-label="Order status filters">
        ${filters
          .map((filter) => `
            <button
              class="orders-filter-tab ${activeStatusFilter === filter.key ? 'active' : ''}"
              type="button"
              data-status-filter="${filter.key}"
              aria-pressed="${activeStatusFilter === filter.key}"
            >
              <span>${filter.label}</span>
              <strong>${filter.count}</strong>
            </button>
          `)
          .join('')}
      </div>
    </section>
  `;
}

function emptyOrdersHTML() {
  return `
    <section class="empty-orders-state">
      <div class="state-icon state-icon-empty">
        ${iconSVG('empty')}
      </div>

      <h2>You have not placed any orders yet</h2>
      <p>
        Start browsing Sportivo gear and your completed orders will appear here.
      </p>

      <div class="empty-orders-actions">
        <a href="index.html" class="button-primary empty-orders-button">Shop products</a>
        <a href="wishlist.html" class="button-secondary empty-orders-button">View wishlist</a>
      </div>
    </section>
  `;
}

function emptyFilteredOrdersHTML() {
  return `
    <section class="empty-orders-state compact-state">
      <div class="state-icon state-icon-empty">
        ${iconSVG('box')}
      </div>

      <h2>No orders match this status</h2>
      <p>Choose another status filter or view your full order history.</p>

      <button class="button-secondary empty-orders-button js-clear-order-filter" type="button">
        View all orders
      </button>
    </section>
  `;
}

function unavailableProductHTML(order, productDetails) {
  const status = getShipmentStatus(order, productDetails);

  return `
    <article class="order-product-card unavailable-product-card">
      <div class="order-product-image-container unavailable-product-image">
        ${iconSVG('box')}
      </div>

      <div class="order-product-info">
        <div class="order-product-top-row">
          <span class="order-product-status ${status.className}">${status.label}</span>
        </div>

        <h3 class="order-product-name">Product no longer available</h3>
        <p class="order-product-delivery">Expected delivery: ${getFormattedDeliveryDate(productDetails)}</p>
        <p class="order-product-quantity">Quantity: ${productDetails.quantity}</p>
      </div>

      <div class="order-product-actions">
        <a href="index.html" class="track-package-button button-secondary">Continue shopping</a>
      </div>
    </article>
  `;
}

function orderProductHTML(order, productDetails) {
  const product = getProduct(productDetails.productId);

  if (!product) {
    console.warn('Product not found for order history:', productDetails.productId);
    return unavailableProductHTML(order, productDetails);
  }

  const status = getShipmentStatus(order, productDetails);
  const productName = escapeHTML(product.name);
  const productUrl = `product.html?id=${encodeURIComponent(product.id)}`;
  const trackingUrl = `tracking.html?orderId=${encodeURIComponent(order.id)}&productId=${encodeURIComponent(product.id)}`;

  return `
    <article class="order-product-card">
      <div class="order-product-image-container">
        <a href="${productUrl}" aria-label="View ${productName}">
          <img src="${product.getImageUrl()}" alt="${productName}" loading="lazy">
        </a>
      </div>

      <div class="order-product-info">
        <div class="order-product-top-row">
          <span class="order-product-status ${status.className}">${status.label}</span>
          <span class="order-product-price">${product.getPrice()}</span>
        </div>

        <h3 class="order-product-name">
          <a href="${productUrl}">${productName}</a>
        </h3>

        <p class="order-product-delivery">
          ${status.key === 'delivered' ? 'Delivered' : 'Expected delivery'}: ${getFormattedDeliveryDate(productDetails, true)}
        </p>

        <p class="order-product-quantity">Quantity: ${productDetails.quantity}</p>

        <button class="buy-again-button js-buy-again" data-product-id="${product.id}" type="button">
          <span class="button-icon" aria-hidden="true">${iconSVG('box')}</span>
          <span class="buy-again-message">Buy again</span>
        </button>
      </div>

      <div class="order-product-actions">
        <a href="${trackingUrl}" class="track-package-button button-secondary">Track package</a>
        <a href="${productUrl}" class="view-product-button">View product</a>
      </div>
    </article>
  `;
}

function orderMetaHTML(order) {
  const shippingAddress = order.shippingAddress || {};
  const payment = order.payment || {};
  const status = getOrderStatus(order);
  const cityCountry = [shippingAddress.city, shippingAddress.country]
    .filter(Boolean)
    .join(', ');

  return `
    <div class="order-meta-strip">
      <div>
        <span>Ship to</span>
        <strong>${escapeHTML(cityCountry || 'Address saved')}</strong>
      </div>
      <div>
        <span>Payment</span>
        <strong>${escapeHTML(payment.label || 'Payment selected')}</strong>
      </div>
      <div>
        <span>Delivery window</span>
        <strong>${escapeHTML(getOrderDeliveryWindow(order))}</strong>
      </div>
      <div>
        <span>Status</span>
        <strong>${escapeHTML(status.label)}</strong>
      </div>
    </div>
  `;
}

function productsListHTML(order) {
  if (!order.products || !Array.isArray(order.products) || order.products.length === 0) {
    return `<div class="no-products">No products in this order.</div>`;
  }

  return order.products
    .map((productDetails) => orderProductHTML(order, productDetails))
    .join('');
}

function orderHTML(order) {
  const orderStatus = getOrderStatus(order);
  const primaryProduct = getOrderPrimaryProduct(order);
  const primaryTrackingUrl = primaryProduct
    ? `tracking.html?orderId=${encodeURIComponent(order.id)}&productId=${encodeURIComponent(primaryProduct.productId)}`
    : 'orders.html';
  const itemCount = getOrderItemCount(order);

  return `
    <section class="order-container">
      <header class="order-header">
        <div class="order-header-main">
          <div class="order-status-marker ${orderStatus.className}" aria-hidden="true">
            ${iconSVG(orderStatus.icon)}
          </div>

          <div>
            <div class="order-header-row">
              <span class="order-product-status ${orderStatus.className}">${orderStatus.label}</span>
              <span class="order-item-count">${itemCount} item${itemCount === 1 ? '' : 's'}</span>
            </div>

            <h2>Order ${escapeHTML(order.id)}</h2>

            <p>
              Placed ${getFormattedOrderDate(order.orderTime)} · Total ${formatPrice(order.totalCostCents)}
            </p>
          </div>
        </div>

        <div class="order-header-actions">
          <a href="${primaryTrackingUrl}" class="button-primary order-header-button">Track order</a>
          <button class="button-secondary order-header-button js-buy-order-again" type="button" data-order-id="${escapeHTML(order.id)}">
            Buy again
          </button>
        </div>
      </header>

      ${orderMetaHTML(order)}

      <div class="order-details-grid">
        ${productsListHTML(order)}
      </div>
    </section>
  `;
}

function renderOrdersError(error) {
  const ordersGrid = document.querySelector('.js-orders-grid');

  if (!ordersGrid) {
    return;
  }

  ordersGrid.innerHTML = `
    <section class="orders-error-state">
      <div class="state-icon state-icon-error">
        ${iconSVG('alert')}
      </div>

      <h2>Unable to load your orders</h2>
      <p>Something went wrong while loading your order history. Refresh the page and try again.</p>
      <button class="button-primary empty-orders-button" type="button" onclick="location.reload()">Try again</button>
    </section>
  `;

  console.error('Error loading orders:', error);
}

function renderOrdersDisplay() {
  const ordersGrid = document.querySelector('.js-orders-grid');

  if (!ordersGrid) {
    return;
  }

  if (!orders || orders.length === 0) {
    ordersGrid.innerHTML = emptyOrdersHTML();
    updateHeaderCounters();
    return;
  }

  const filteredOrders = getFilteredOrders();

  ordersGrid.innerHTML = `
    ${ordersSummaryHTML()}
    ${filterTabsHTML()}
    <div class="orders-result-count" aria-live="polite">
      Showing ${filteredOrders.length} of ${orders.length} order${orders.length === 1 ? '' : 's'}
    </div>
    ${filteredOrders.length ? filteredOrders.map((order) => orderHTML(order)).join('') : emptyFilteredOrdersHTML()}
  `;

  updateHeaderCounters();
}

function showButtonFeedback(button, message = 'Added') {
  const originalHTML = button.dataset.originalHtml || button.innerHTML;

  button.dataset.originalHtml = originalHTML;
  button.innerHTML = `${message} ✓`;
  button.disabled = true;

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.disabled = false;
  }, 1200);
}

function addOrderProductsToCart(orderId) {
  const order = orders.find((matchingOrder) => matchingOrder.id === orderId);

  if (!order) {
    return false;
  }

  order.products.forEach((productDetails) => {
    addToCart(productDetails.productId, productDetails.quantity);
  });

  updateCartQuantity();
  return true;
}

function initializeOrdersPageListeners() {
  if (orderPageListenersInitialized) {
    return;
  }

  orderPageListenersInitialized = true;

  document.addEventListener('click', (event) => {
    const filterButton = event.target.closest('[data-status-filter]');

    if (filterButton) {
      activeStatusFilter = filterButton.dataset.statusFilter || 'all';
      renderOrdersDisplay();
      return;
    }

    const clearFilterButton = event.target.closest('.js-clear-order-filter');

    if (clearFilterButton) {
      activeStatusFilter = 'all';
      renderOrdersDisplay();
      return;
    }

    const buyAgainButton = event.target.closest('.js-buy-again');

    if (buyAgainButton) {
      const productId = buyAgainButton.dataset.productId;

      if (productId) {
        addToCart(productId, 1);
        updateCartQuantity();
        showButtonFeedback(buyAgainButton);
      }

      return;
    }

    const buyOrderAgainButton = event.target.closest('.js-buy-order-again');

    if (buyOrderAgainButton) {
      const orderId = buyOrderAgainButton.dataset.orderId;

      if (orderId && addOrderProductsToCart(orderId)) {
        showButtonFeedback(buyOrderAgainButton, 'Order added');
      }
    }
  });
}

async function loadPage() {
  createLoadingOverlay('Loading your orders...');

  try {
    await loadProductsFetch();
    initializeOrdersPageListeners();
    renderOrdersDisplay();
  } catch (error) {
    renderOrdersError(error);
  } finally {
    removeLoadingOverlay();
  }
}

loadPage();
