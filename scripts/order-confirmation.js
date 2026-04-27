import { getOrder } from '../data/order.js';
import { getProduct, loadProductsFetch } from '../data/products.js';
import { formatDeliveryDate } from '../data/deliveryOptions.js';
import { formatPrice } from './shared/currency-manager.js';
import { calculateCartQuantity } from '../data/cart.js';
import { calculateWishlistQuantity } from '../data/wishlist.js';
import { createLoadingOverlay, removeLoadingOverlay } from './utils/loading.js';

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function updateHeaderCounters() {
  const cartQuantityElement = document.querySelector('.js-cart-quantity');
  const wishlistCounter = document.querySelector('.js-wishlist-count');
  const wishlistCount = calculateWishlistQuantity();

  if (cartQuantityElement) {
    cartQuantityElement.textContent = calculateCartQuantity();
  }

  if (wishlistCounter) {
    wishlistCounter.textContent = wishlistCount;
    wishlistCounter.style.display = wishlistCount > 0 ? 'flex' : 'none';
  }
}

function getConfirmationContainer() {
  return document.querySelector('.js-order-confirmation');
}

function getOrderIdFromURL() {
  const url = new URL(window.location.href);
  return url.searchParams.get('orderId') || localStorage.getItem('sportivo:last-order-id');
}

function getFormattedDate(dateValue) {
  return formatDeliveryDate(dateValue, {
    includeWeekday: false,
    includeYear: true
  });
}

function getEarliestDeliveryDate(order) {
  const deliveryDates = order.products
    .map((productDetails) => productDetails.estimatedDeliveryDateISO || productDetails.estimatedDeliveryTime)
    .filter(Boolean)
    .map((dateValue) => new Date(dateValue))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((firstDate, secondDate) => firstDate.getTime() - secondDate.getTime());

  return deliveryDates[0]?.toISOString() || null;
}

function getOrderItemCount(order) {
  return order.products.reduce((total, productDetails) => total + productDetails.quantity, 0);
}

function orderProductPreviewHTML(productDetails) {
  const product = getProduct(productDetails.productId);

  if (!product) {
    return `
      <article class="confirmation-product-card">
        <div class="confirmation-product-image">
          <img src="images/products/placeholder.jpg" alt="Unavailable product">
        </div>

        <div>
          <h3>Product no longer available</h3>
          <p>Quantity: ${productDetails.quantity}</p>
        </div>
      </article>
    `;
  }

  const productName = escapeHTML(product.name);
  const productUrl = `product.html?id=${encodeURIComponent(product.id)}`;
  const trackingUrl = `tracking.html?orderId=${encodeURIComponent(productDetails.orderId || '')}`;

  return `
    <article class="confirmation-product-card">
      <a class="confirmation-product-image" href="${productUrl}" aria-label="View ${productName}">
        <img src="${product.getImageUrl()}" alt="${productName}" loading="lazy">
      </a>

      <div class="confirmation-product-info">
        <h3>
          <a href="${productUrl}">${productName}</a>
        </h3>
        <p>Quantity: ${productDetails.quantity}</p>
        <strong>${product.getPrice()}</strong>
      </div>
    </article>
  `;
}

function renderMissingOrder() {
  const container = getConfirmationContainer();

  if (!container) {
    return;
  }

  container.innerHTML = `
    <section class="confirmation-error-state">
      <div class="confirmation-icon warning">!</div>
      <h1>Order not found</h1>
      <p>The order confirmation could not be loaded. You can still view your saved orders from the Orders page.</p>
      <div class="confirmation-actions">
        <a class="button-primary confirmation-action" href="orders.html">View orders</a>
        <a class="button-secondary confirmation-action" href="index.html">Continue shopping</a>
      </div>
    </section>
  `;

  updateHeaderCounters();
}

function renderOrderConfirmation(order) {
  const container = getConfirmationContainer();

  if (!container) {
    return;
  }

  const firstProduct = order.products[0];
  const firstProductTrackingUrl = firstProduct
    ? `tracking.html?orderId=${encodeURIComponent(order.id)}&productId=${encodeURIComponent(firstProduct.productId)}`
    : 'orders.html';
  const earliestDeliveryDate = getEarliestDeliveryDate(order);
  const shippingAddress = order.shippingAddress || {};
  const customer = order.customer || {};
  const payment = order.payment || {};

  container.innerHTML = `
    <section class="confirmation-hero-card">
      <div class="confirmation-icon">✓</div>

      <div class="confirmation-hero-content">
        <p class="confirmation-eyebrow">Order confirmed</p>
        <h1>Thanks${customer.fullName ? `, ${escapeHTML(customer.fullName.split(' ')[0])}` : ''}! Your order was placed.</h1>
        <p>
          We received your order details and prepared your delivery timeline.
        </p>
      </div>

      <div class="confirmation-total-card">
        <span>Order total</span>
        <strong>${formatPrice(order.totalCostCents)}</strong>
      </div>
    </section>

    <section class="confirmation-layout">
      <div class="confirmation-main-column">
        <section class="confirmation-card">
          <div class="confirmation-card-header">
            <div>
              <p class="confirmation-eyebrow">Next step</p>
              <h2>Track your package</h2>
            </div>
            <span class="confirmation-status-pill">Processing</span>
          </div>

          <div class="confirmation-progress-list">
            <div class="confirmation-progress-step active">
              <span>1</span>
              <div>
                <strong>Order created</strong>
                <p>${getFormattedDate(order.orderTime)}</p>
              </div>
            </div>

            <div class="confirmation-progress-step">
              <span>2</span>
              <div>
                <strong>Preparing shipment</strong>
                <p>Your items are being prepared.</p>
              </div>
            </div>

            <div class="confirmation-progress-step">
              <span>3</span>
              <div>
                <strong>Estimated delivery</strong>
                <p>${earliestDeliveryDate ? getFormattedDate(earliestDeliveryDate) : 'Delivery date not available'}</p>
              </div>
            </div>
          </div>

          <a class="button-primary confirmation-wide-button" href="${firstProductTrackingUrl}">
            Track first package
          </a>
        </section>

        <section class="confirmation-card">
          <div class="confirmation-card-header">
            <div>
              <p class="confirmation-eyebrow">Items</p>
              <h2>${getOrderItemCount(order)} item${getOrderItemCount(order) === 1 ? '' : 's'} in this order</h2>
            </div>
          </div>

          <div class="confirmation-products-list">
            ${order.products.map((productDetails) => orderProductPreviewHTML(productDetails)).join('')}
          </div>
        </section>
      </div>

      <aside class="confirmation-side-column">
        <section class="confirmation-card compact">
          <p class="confirmation-eyebrow">Order details</p>

          <dl class="confirmation-details-list">
            <div>
              <dt>Order ID</dt>
              <dd>${escapeHTML(order.id)}</dd>
            </div>

            <div>
              <dt>Order date</dt>
              <dd>${getFormattedDate(order.orderTime)}</dd>
            </div>

            <div>
              <dt>Payment</dt>
              <dd>${escapeHTML(payment.label || 'Payment selected')}</dd>
            </div>
          </dl>
        </section>

        <section class="confirmation-card compact">
          <p class="confirmation-eyebrow">Shipping to</p>

          <address class="confirmation-address">
            <strong>${escapeHTML(customer.fullName || 'Customer')}</strong>
            <span>${escapeHTML(shippingAddress.address || 'Address not available')}</span>
            <span>${escapeHTML([shippingAddress.city, shippingAddress.postalCode].filter(Boolean).join(', '))}</span>
            <span>${escapeHTML(shippingAddress.country || '')}</span>
          </address>
        </section>
      </aside>
    </section>

    <div class="confirmation-actions bottom-actions">
      <a class="button-primary confirmation-action" href="orders.html">View all orders</a>
      <a class="button-secondary confirmation-action" href="index.html">Continue shopping</a>
    </div>
  `;

  updateHeaderCounters();
}

async function loadPage() {
  createLoadingOverlay('Loading order confirmation...');

  try {
    await loadProductsFetch();

    const orderId = getOrderIdFromURL();
    const order = orderId ? getOrder(orderId) : null;

    if (!order) {
      renderMissingOrder();
      return;
    }

    renderOrderConfirmation(order);
  } catch (error) {
    console.error('Error loading order confirmation:', error);
    renderMissingOrder();
  } finally {
    removeLoadingOverlay();
  }
}

loadPage();
