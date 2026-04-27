// scripts/tracking.js

import { getOrder } from '../data/order.js';
import { getProduct, loadProductsFetch } from '../data/products.js';
import { formatDeliveryDate } from '../data/deliveryOptions.js';
import { calculateWishlistQuantity } from '../data/wishlist.js';
import { calculateCartQuantity, addToCart } from '../data/cart.js';

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
    receipt: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M7 4h10v16l-2-1.1-2 1.1-2-1.1-2 1.1-2-1.1V4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M9.5 8h5M9.5 11.5h5M9.5 15h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
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
    home: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M4.5 10.6 12 4l7.5 6.6V20h-5v-5.2h-5V20h-5v-9.4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
    `,
    check: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="m5 12.5 4.2 4.2L19 6.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    calendar: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M5 5.5h14v14H5v-14Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M8 3.8v3.4M16 3.8v3.4M5 9h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    location: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke="currentColor" stroke-width="1.8"/>
      </svg>
    `,
    card: `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M4 10h16M7 14.5h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
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

function getTrackingContainer() {
  return document.querySelector('.js-order-tracking');
}

function renderTrackingError(title, message) {
  const trackingContainer = getTrackingContainer();

  if (!trackingContainer) {
    return;
  }

  trackingContainer.innerHTML = `
    <section class="tracking-error-state">
      <div class="tracking-error-icon">${iconSVG('alert')}</div>
      <h1>${escapeHTML(title)}</h1>
      <p>${escapeHTML(message)}</p>

      <div class="tracking-error-actions">
        <a class="button-primary tracking-action-link" href="orders.html">View orders</a>
        <a class="button-secondary tracking-action-link" href="index.html">Continue shopping</a>
      </div>
    </section>
  `;

  updateHeaderCounters();
}

function getOrderProductDetails(order, productId) {
  if (!order.products || !Array.isArray(order.products)) {
    return null;
  }

  return order.products.find((productDetails) => productDetails.productId === productId);
}

function getDeliveryDateValue(productDetails) {
  return productDetails.estimatedDeliveryDateISO || productDetails.estimatedDeliveryTime;
}

function calculateTrackingProgress(orderTimeInput, deliveryTimeInput) {
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

function getCurrentStatus(progress) {
  if (progress >= 100) {
    return {
      key: 'delivered',
      label: 'Delivered',
      title: 'Delivered',
      message: 'Your package has arrived at the shipping destination.',
      icon: 'check'
    };
  }

  if (progress >= 75) {
    return {
      key: 'out-for-delivery',
      label: 'Out for delivery',
      title: 'Out for delivery',
      message: 'Your package is with the courier and is expected to arrive soon.',
      icon: 'truck'
    };
  }

  if (progress >= 45) {
    return {
      key: 'shipped',
      label: 'Shipped',
      title: 'On the way',
      message: 'Your package has left the fulfillment center and is moving through the carrier network.',
      icon: 'truck'
    };
  }

  if (progress >= 20) {
    return {
      key: 'packed',
      label: 'Packed',
      title: 'Packed and ready',
      message: 'Your items are packed and waiting for carrier pickup.',
      icon: 'box'
    };
  }

  return {
    key: 'processing',
    label: 'Processing',
    title: 'Order received',
    message: 'Your order has been confirmed and is being prepared for shipment.',
    icon: 'receipt'
  };
}

function getTimelineStepClass(stepKey, currentStatusKey) {
  const stepOrder = ['processing', 'packed', 'shipped', 'out-for-delivery', 'delivered'];
  const stepIndex = stepOrder.indexOf(stepKey);
  const currentIndex = stepOrder.indexOf(currentStatusKey);

  if (stepIndex < currentIndex) {
    return 'completed';
  }

  if (stepIndex === currentIndex) {
    return 'current';
  }

  return 'upcoming';
}

function trackingTimelineHTML(currentStatusKey) {
  const steps = [
    {
      key: 'processing',
      label: 'Order received',
      description: 'Payment and order details were confirmed.',
      icon: 'receipt'
    },
    {
      key: 'packed',
      label: 'Packed',
      description: 'Your gear is packed and ready for pickup.',
      icon: 'box'
    },
    {
      key: 'shipped',
      label: 'Shipped',
      description: 'The package is moving through the carrier network.',
      icon: 'truck'
    },
    {
      key: 'out-for-delivery',
      label: 'Out for delivery',
      description: 'The courier is completing the final delivery step.',
      icon: 'home'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Package delivered to the shipping destination.',
      icon: 'check'
    }
  ];

  return `
    <div class="tracking-timeline">
      ${steps
        .map((step) => {
          const stepClass = getTimelineStepClass(step.key, currentStatusKey);

          return `
            <div class="tracking-step tracking-step-${stepClass}">
              <div class="tracking-step-marker">${iconSVG(step.icon)}</div>
              <div class="tracking-step-content">
                <strong>${step.label}</strong>
                <p>${step.description}</p>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function formatOrderDate(orderTime, includeWeekday = false) {
  return formatDeliveryDate(orderTime, {
    includeWeekday,
    includeYear: true
  });
}

function getShippingAddressLabel(order) {
  const shippingAddress = order.shippingAddress || {};
  const parts = [shippingAddress.address, shippingAddress.city, shippingAddress.postalCode, shippingAddress.country]
    .filter(Boolean);

  return parts.length ? parts.join(', ') : 'Shipping address saved';
}

function getOtherItemsHTML(order, selectedProductId) {
  const otherProducts = (order.products || []).filter((productDetails) => productDetails.productId !== selectedProductId);

  if (otherProducts.length === 0) {
    return '';
  }

  return `
    <section class="tracking-other-items-card">
      <div class="tracking-section-header">
        <p class="tracking-eyebrow">Same order</p>
        <h2>Other packages</h2>
      </div>

      <div class="tracking-other-items-list">
        ${otherProducts
          .map((productDetails) => {
            const product = getProduct(productDetails.productId);

            if (!product) {
              return '';
            }

            const productName = escapeHTML(product.name);
            const trackingUrl = `tracking.html?orderId=${encodeURIComponent(order.id)}&productId=${encodeURIComponent(product.id)}`;

            return `
              <a class="tracking-other-item" href="${trackingUrl}">
                <img src="${product.getImageUrl()}" alt="${productName}" loading="lazy">
                <span>${productName}</span>
              </a>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function renderTrackingPage(order, product, productDetails) {
  const trackingContainer = getTrackingContainer();

  if (!trackingContainer) {
    return;
  }

  const deliveryDate = getDeliveryDateValue(productDetails);
  const progress = calculateTrackingProgress(order.orderTime, deliveryDate);
  const currentStatus = getCurrentStatus(progress);
  const deliveryLabel = currentStatus.key === 'delivered' ? 'Delivered on' : 'Estimated delivery';
  const formattedDeliveryDate = formatDeliveryDate(deliveryDate, {
    includeWeekday: true,
    includeYear: true
  });

  const productName = escapeHTML(product.name);
  const productUrl = `product.html?id=${encodeURIComponent(product.id)}`;
  const payment = order.payment || {};

  trackingContainer.innerHTML = `
    <section class="tracking-page">
      <div class="tracking-top-actions">
        <a class="back-to-orders-link" href="orders.html">Back to orders</a>
        <a class="continue-shopping-link" href="index.html">Continue shopping</a>
      </div>

      <section class="tracking-hero-card">
        <div class="tracking-status-icon">${iconSVG(currentStatus.icon)}</div>

        <div class="tracking-hero-content">
          <p class="tracking-eyebrow">Package tracking</p>
          <h1>${currentStatus.title}</h1>
          <p>${currentStatus.message}</p>
        </div>

        <div class="tracking-delivery-card">
          <span>${deliveryLabel}</span>
          <strong>${formattedDeliveryDate}</strong>
        </div>
      </section>

      <section class="tracking-layout">
        <div class="tracking-main-card">
          <div class="tracking-progress-header">
            <div>
              <p class="tracking-eyebrow">Delivery progress</p>
              <h2>${progress}% complete</h2>
            </div>

            <span class="tracking-status-pill tracking-status-${currentStatus.key}">${currentStatus.label}</span>
          </div>

          <div class="progress-bar-container" aria-label="Delivery progress">
            <div class="progress-bar" style="width: ${progress}%;"></div>
          </div>

          ${trackingTimelineHTML(currentStatus.key)}
        </div>

        <aside class="tracking-side-card">
          <div class="tracking-product-image-container">
            <a href="${productUrl}" aria-label="View ${productName}">
              <img src="${product.getImageUrl()}" alt="${productName}">
            </a>
          </div>

          <div class="tracking-product-details">
            <p class="tracking-eyebrow">Tracking item</p>
            <h2><a href="${productUrl}">${productName}</a></h2>
            <p class="tracking-product-quantity">Quantity: ${productDetails.quantity}</p>

            <div class="tracking-product-actions">
              <a class="button-primary tracking-product-button" href="${productUrl}">View product</a>
              <button class="button-secondary tracking-product-button js-tracking-buy-again" type="button" data-product-id="${escapeHTML(product.id)}">Buy again</button>
            </div>
          </div>
        </aside>
      </section>

      <section class="tracking-info-grid">
        <div class="tracking-info-card">
          <span class="tracking-info-icon">${iconSVG('receipt')}</span>
          <div>
            <span>Order ID</span>
            <strong>${escapeHTML(order.id)}</strong>
          </div>
        </div>

        <div class="tracking-info-card">
          <span class="tracking-info-icon">${iconSVG('calendar')}</span>
          <div>
            <span>Order placed</span>
            <strong>${formatOrderDate(order.orderTime)}</strong>
          </div>
        </div>

        <div class="tracking-info-card">
          <span class="tracking-info-icon">${iconSVG('location')}</span>
          <div>
            <span>Shipping to</span>
            <strong>${escapeHTML(getShippingAddressLabel(order))}</strong>
          </div>
        </div>

        <div class="tracking-info-card">
          <span class="tracking-info-icon">${iconSVG('truck')}</span>
          <div>
            <span>Carrier</span>
            <strong>Sportivo Express</strong>
          </div>
        </div>

        <div class="tracking-info-card">
          <span class="tracking-info-icon">${iconSVG('card')}</span>
          <div>
            <span>Payment</span>
            <strong>${escapeHTML(payment.label || 'Payment selected')}</strong>
          </div>
        </div>
      </section>

      ${getOtherItemsHTML(order, product.id)}
    </section>
  `;

  const buyAgainButton = document.querySelector('.js-tracking-buy-again');

  if (buyAgainButton) {
    buyAgainButton.addEventListener('click', () => {
      addToCart(product.id, 1);
      updateCartQuantity();
      buyAgainButton.textContent = 'Added to cart';
      buyAgainButton.disabled = true;

      setTimeout(() => {
        buyAgainButton.textContent = 'Buy again';
        buyAgainButton.disabled = false;
      }, 1200);
    });
  }

  updateHeaderCounters();
}

async function loadPage() {
  try {
    await loadProductsFetch();

    const url = new URL(window.location.href);
    const orderId = url.searchParams.get('orderId');
    const productId = url.searchParams.get('productId');

    if (!orderId || !productId) {
      renderTrackingError('Missing tracking information', 'Order or product information is missing from the URL.');
      return;
    }

    const order = getOrder(orderId);

    if (!order) {
      renderTrackingError('Order not found', `Order ID "${orderId}" could not be found.`);
      return;
    }

    const product = getProduct(productId);

    if (!product) {
      renderTrackingError('Product not found', 'The product in this order is no longer available.');
      return;
    }

    const productDetails = getOrderProductDetails(order, productId);

    if (!productDetails) {
      renderTrackingError('Order details missing', 'Could not find this product inside the selected order.');
      return;
    }

    renderTrackingPage(order, product, productDetails);
  } catch (error) {
    renderTrackingError('Unable to load tracking', 'Please refresh the page and try again.');
    console.error('Error loading tracking page:', error);
  }
}

loadPage();
