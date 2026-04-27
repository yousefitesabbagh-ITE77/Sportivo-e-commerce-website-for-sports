import { cart, addToCart, calculateCartQuantity } from '../data/cart.js';
import { trackProductPurchase } from '../data/recommendations.js';

export function updateCartQuantity() {
  const cartQuantity = calculateCartQuantity();
  const cartQuantityElement = document.querySelector('.js-cart-quantity');

  if (cartQuantityElement) {
    cartQuantityElement.textContent = cartQuantity;
  }
}

const addedMessageTimeouts = {};
let addToCartButtonsInitialized = false;

function getSelectedQuantity(button, productId) {
  const productContainer =
    button.closest('.js-product-container') ||
    button.closest('.js-product-details-container') ||
    button.closest('[data-product-id]');

  const quantityDisplay = productContainer?.querySelector(`.js-quantity-display-${productId}`);
  const quantity = Number(quantityDisplay?.value) || 1;

  if (quantity < 1) {
    return 1;
  }

  if (quantity > 10) {
    return 10;
  }

  return quantity;
}

function showAddedToCartFeedback(button, productId) {
  const productContainer =
    button.closest('.js-product-container') ||
    button.closest('.js-product-details-container') ||
    button.closest('[data-product-id]');

  const addedMessage = productContainer?.querySelector(`.js-added-to-cart-${productId}`);
  const previousTimeoutId = addedMessageTimeouts[productId];

  if (previousTimeoutId) {
    clearTimeout(previousTimeoutId);
  }

  if (addedMessage) {
    addedMessage.classList.add('added-to-cart-visible');
  }

  const originalButtonText = button.dataset.originalText || button.textContent.trim() || 'Add to Cart';
  button.dataset.originalText = originalButtonText;
  button.textContent = 'Added ✓';
  button.disabled = true;

  const timeoutId = setTimeout(() => {
    if (addedMessage) {
      addedMessage.classList.remove('added-to-cart-visible');
    }

    button.textContent = originalButtonText;
    button.disabled = false;
  }, 2000);

  addedMessageTimeouts[productId] = timeoutId;
}

export function initializeAddToCartButtons() {
  if (addToCartButtonsInitialized) {
    return;
  }

  addToCartButtonsInitialized = true;

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.js-add-to-cart');

    if (!button) {
      return;
    }

    const productId = button.dataset.productId;

    if (!productId) {
      console.warn('Add to Cart button is missing a product id.');
      return;
    }

    const quantity = getSelectedQuantity(button, productId);

    addToCart(productId, quantity);
    updateCartQuantity();
    trackProductPurchase(productId);
    showAddedToCartFeedback(button, productId);
  });
}

export function checkEmptyCart(container) {
  if (cart.length === 0 && container) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-cart-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 .1 0H17ZM3 4h2l2.1 9.2A2.5 2.5 0 0 0 9.5 15H17a2.5 2.5 0 0 0 2.4-1.8L21 7H7.1L6.6 5H3V4Z"/></svg></div>
        <h3>Your Sportivo Cart is empty</h3>
        <p>Shop today’s picks and find the gear you need</p>
        <div class="empty-cart-actions">
          <a href="index.html" class="button-primary">Shop now</a>
          <a href="index.html?sport=football" class="button-secondary">Browse Football</a>
          <a href="index.html?sport=basketball" class="button-secondary">Browse Basketball</a>
        </div>
      </div>
    `;
    return true;
  }

  return false;
}