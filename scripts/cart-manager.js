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

export function initializeAddToCartButtons() {
  // Use event delegation to handle all add to cart buttons
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('js-add-to-cart')) {
      const button = event.target;
      const productId = button.dataset.productId;
      
      // FIXED: Find the quantity display within the same product container
      const productContainer = button.closest('.js-product-container');
      const quantityDisplay = productContainer.querySelector(`.js-quantity-display-${productId}`);
      const quantity = Number(quantityDisplay.value);
      
      addToCart(productId, quantity);
      updateCartQuantity();
      
      // Track purchase for recommendations
      trackProductPurchase(productId);

      // FIXED: Find the added message within the same product container
      const addedMessage = productContainer.querySelector(`.js-added-to-cart-${productId}`);
      addedMessage.classList.add('added-to-cart-visible');

      const previousTimeoutId = addedMessageTimeouts[productId];

      if(previousTimeoutId) {
        clearTimeout(previousTimeoutId);
      }

      const timeoutId = setTimeout(() => {
        addedMessage.classList.remove('added-to-cart-visible');
      }, 2000);

      addedMessageTimeouts[productId] = timeoutId;
    }
  });
}

// New function to check and show empty cart state
export function checkEmptyCart(container) {
  if (cart.length === 0 && container) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your Sportivo Cart is empty</h3>
        <p>Shop today's deals and find everything you need</p>
        <div class="empty-cart-actions">
          <a href="sportivo.html" class="button-primary">Shop now</a>
          <a href="sportivo.html?sport=football" class="button-secondary">Browse Football</a>
          <a href="sportivo.html?sport=basketball" class="button-secondary">Browse Basketball</a>
        </div>
      </div>
    `;
    return true;
  }
  return false;
}