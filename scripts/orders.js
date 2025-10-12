import {getProduct, loadProductsFetch} from '../data/products.js';
import {orders} from '../data/order.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { formatPrice } from './shared/currency-manager.js'; // <-- UPDATED IMPORT
import { addToCart , calculateCartQuantity } from '../data/cart.js';
import { calculateWishlistQuantity } from '../data/wishlist.js';
import { createLoadingOverlay, removeLoadingOverlay } from './utils/loading.js';

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

// NEW: This function now contains all the rendering logic.
// We can call this from anywhere to update the orders page.
export function renderOrdersPage() {
  const ordersGrid = document.querySelector('.js-orders-grid');
  
  // Check if there are no orders
  if (!orders || orders.length === 0) {
    ordersGrid.innerHTML = `
      <div class="empty-orders-state">
        <div class="empty-orders-icon">📦</div>
        <h3>You haven't placed any orders yet</h3>
        <p>When you make your first purchase, your order history will appear here.</p>
        <div class="empty-orders-actions">
          <a href="sportivo.html" class="button-primary">Start shopping</a>
          <a href="sportivo.html?sport=football" class="button-secondary">Shop Football</a>
          <a href="sportivo.html?sport=basketball" class="button-secondary">Shop Basketball</a>
        </div>
        <div class="empty-orders-benefits">
          <h4>Benefits of shopping with us:</h4>
          <div class="benefits-grid">
            <div class="benefit-item">
              <span class="benefit-icon">🚚</span>
              <span>Fast delivery</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🔒</span>
              <span>Secure checkout</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">📱</span>
              <span>Easy returns</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">⭐</span>
              <span>Quality products</span>
            </div>
          </div>
        </div>
      </div>
    `;
    updateCartQuantity();
    updateWishlistCounter();
    return;
  }

  let ordersHTML = '';

  orders.forEach((order) => {
    const orderTimeString = dayjs(order.orderTime).format('MMMM D');

    ordersHTML += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${orderTimeString}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>${formatPrice(order.totalCostCents)}</div> <!-- UPDATED -->
            </div>
          </div>

          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          </div>
        </div>

        <div class="order-details-grid">
          ${productsListHTML(order)}
        </div>
      </div>
    `;
  });

  function productsListHTML(order) {
    let productsListHTML = '';

    if (!order.products || !Array.isArray(order.products)) {
        console.warn('No products found for order:', order.id);
        return '<div class="no-products">No products in this order</div>';
    }

    order.products.forEach((productDetails) => {
        const product = getProduct(productDetails.productId);

        if (!product) {
            console.warn('Product not found:', productDetails.productId);
            return;
        }

        productsListHTML += `
            <div class="product-image-container">
                <img src="${product.image}">
            </div>

            <div class="product-details">
                <div class="product-name">
                    ${product.name}
                </div>
                <div class="product-delivery-date">
                    Arriving on: ${
                        dayjs(productDetails.estimatedDeliveryTime).format('MMMM D')
                    }
                </div>
                <div class="product-quantity">
                    Quantity: ${productDetails.quantity}
                </div>
                <button class="buy-again-button button-primary js-buy-again"
                    data-product-id="${product.id}">
                    <img class="buy-again-icon" src="images/icons/buy-again.png">
                    <span class="buy-again-message">Buy it again</span>
                </button>
            </div>

            <div class="product-actions">
                <a href="tracking.html?orderId=${order.id}&productId=${product.id}">
                    <button class="track-package-button button-secondary">
                        Track package
                    </button>
                </a>
            </div>
        `;
    });

    return productsListHTML;
  }

  ordersGrid.innerHTML = ordersHTML;

  document.querySelectorAll('.js-buy-again').forEach((button) => {
    button.addEventListener('click', () => {
      addToCart(button.dataset.productId);
      updateCartQuantity();

      button.innerHTML = 'Added';
      setTimeout(() => {
        button.innerHTML = `
          <img class="buy-again-icon" src="images/icons/buy-again.png">
          <span class="buy-again-message">Buy it again</span>
        `;
      }, 1000);
    });
  });

  updateCartQuantity();
  updateWishlistCounter();
}

// This function now just loads the data and calls the render function.
async function loadPage() {
  const ordersGrid = document.querySelector('.js-orders-grid');
  createLoadingOverlay('Loading your orders...');
  
  try {
    await loadProductsFetch();
    renderOrdersPage(); // <-- Call the new render function
  } catch (error) {
    removeLoadingOverlay();
    ordersGrid.innerHTML = `
      <div class="error-state">
        <h3>Unable to load your orders</h3>
        <p>Please check your connection and try again.</p>
        <button class="retry-button button-primary" onclick="location.reload()">
          Try Again
        </button>
      </div>
    `;
    console.error('Error loading orders:', error);
  } finally {
    removeLoadingOverlay();
  }
}

loadPage();