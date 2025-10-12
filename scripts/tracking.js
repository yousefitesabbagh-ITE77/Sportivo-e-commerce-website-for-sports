import {getOrder} from '../data/order.js';
import {getProduct, loadProductsFetch} from '../data/products.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { calculateWishlistQuantity } from '../data/wishlist.js';
import { calculateCartQuantity } from '../data/cart.js';

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

// REAL PROGRESS CALCULATION FUNCTION
function calculateRealProgress(orderTime, deliveryTime) {
  const today = dayjs();
  const orderDate = dayjs(orderTime);
  const deliveryDate = dayjs(deliveryTime);
  
  // If delivery date has passed, show 100%
  if (today >= deliveryDate) {
    return 100;
  }
  
  // If order was just placed, show 5% (minimum)
  if (today <= orderDate) {
    return 5;
  }
  
  // Calculate progress based on time passed vs total delivery time
  const totalTime = deliveryDate.diff(orderDate, 'hour');
  const timePassed = today.diff(orderDate, 'hour');
  
  let progress = (timePassed / totalTime) * 100;
  
  // Ensure progress is between 5% and 95% until delivered
  progress = Math.max(5, Math.min(95, progress));
  
  return Math.round(progress);
}

// GET CURRENT STATUS BASED ON PROGRESS
function getCurrentStatus(progress) {
  if (progress >= 90) return 'delivered';
  if (progress >= 50) return 'shipped';
  return 'preparing';
}

async function loadPage() {
  await loadProductsFetch();

  const url = new URL(window.location.href);
  const orderId = url.searchParams.get('orderId');
  const productId = url.searchParams.get('productId');

  // Add comprehensive error handling
  if (!orderId || !productId) {
    document.querySelector('.js-order-tracking').innerHTML = `
      <div class="error-message">
        <h2>Missing Information</h2>
        <p>Order or product information is missing.</p>
        <a class="back-to-orders-link link-primary" href="orders.html">
          View all orders
        </a>
      </div>
    `;
    return;
  }

  const order = getOrder(orderId);
  if (!order) {
    document.querySelector('.js-order-tracking').innerHTML = `
      <div class="error-message">
        <h2>Order Not Found</h2>
        <p>Order ID: ${orderId} could not be found.</p>
        <a class="back-to-orders-link link-primary" href="orders.html">
          View all orders
        </a>
      </div>
    `;
    return;
  }

  const product = getProduct(productId);
  if (!product) {
    document.querySelector('.js-order-tracking').innerHTML = `
      <div class="error-message">
        <h2>Product Not Found</h2>
        <p>The product in this order is no longer available.</p>
        <a class="back-to-orders-link link-primary" href="orders.html">
          View all orders
        </a>
      </div>
    `;
    return;
  }

  // Get additional details about the product like
  // the estimated delivery time.
  let productDetails;
  if (order.products && Array.isArray(order.products)) {
    order.products.forEach((details) => {
      if (details.productId === product.id) {
        productDetails = details;
      }
    });
  }

  if (!productDetails) {
    document.querySelector('.js-order-tracking').innerHTML = `
      <div class="error-message">
        <h2>Order Details Missing</h2>
        <p>Could not find product details in this order.</p>
        <a class="back-to-orders-link link-primary" href="orders.html">
          View all orders
        </a>
      </div>
    `;
    return;
  }

  const today = dayjs();
  const orderTime = dayjs(order.orderTime);
  const deliveryTime = dayjs(productDetails.estimatedDeliveryTime);
  
  // CALCULATE REAL PROGRESS
  const realProgress = calculateRealProgress(order.orderTime, productDetails.estimatedDeliveryTime);
  const currentStatus = getCurrentStatus(realProgress);

  // Extra feature: display "delivered" on the tracking page
  // if today's date is past the delivery date.
  const deliveredMessage = today < deliveryTime ? 'Arriving on' : 'Delivered on';

  const trackingHTML = `
    <a class="back-to-orders-link link-primary" href="orders.html">
      ← Back to Orders
    </a>

    <div class="delivery-date">
      ${deliveredMessage} ${
        dayjs(productDetails.estimatedDeliveryTime).format('dddd, MMMM D')
      }
    </div>

    <div class="product-info">
      ${product.name}
    </div>

    <div class="product-info">
      Quantity: ${productDetails.quantity}
    </div>

    <img class="product-image" src="${product.image}">

    <div class="progress-labels-container">
      <div class="progress-label ${
        currentStatus === 'preparing' ? 'current-status' : ''
      }">
        Preparing
      </div>
      <div class="progress-label ${
        currentStatus === 'shipped' ? 'current-status' : ''
      }">
        Shipped
      </div>
      <div class="progress-label ${
        currentStatus === 'delivered' ? 'current-status' : ''
      }">
        Delivered
      </div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${realProgress}%;"></div>
    </div>
    
    <div style="text-align: center; color: #667eea; font-weight: 600; margin-top: -20px; margin-bottom: 20px;">
      ${realProgress}% Complete • ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
    </div>
  `;

  document.querySelector('.js-order-tracking').innerHTML = trackingHTML;
  
  updateCartQuantity();
  updateWishlistCounter();
}

loadPage();