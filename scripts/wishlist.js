import { getWishlistItems, removeFromWishlist, calculateWishlistQuantity } from '../data/wishlist.js';
import { getProduct, loadProductsFetch } from '../data/products.js';
import { addToCart, calculateCartQuantity } from '../data/cart.js';
import { formatCurrency } from './utils/money.js';


function updateWishlistCounter() {
  const wishlistCount = calculateWishlistQuantity();
  const wishlistCounter = document.querySelector('.js-wishlist-count');
  
  if (wishlistCounter) {
    wishlistCounter.textContent = wishlistCount;
    wishlistCounter.style.display = wishlistCount > 0 ? 'flex' : 'none';
  }
}

function updateCartQuantity() {
  const cartQuantity = calculateCartQuantity();
  const cartQuantityElement = document.querySelector('.js-cart-quantity');
  if (cartQuantityElement) {
    cartQuantityElement.textContent = cartQuantity;
  }
}

function updateWishlistDisplay() {
  const wishlistItems = getWishlistItems();
  const wishlistGrid = document.querySelector('.js-wishlist-grid');
  
  if (wishlistItems.length === 0) {
    wishlistGrid.innerHTML = `
      <div class="empty-wishlist">
        <div class="empty-wishlist-icon">♡</div>
        <h2>Your Wishlist is Empty</h2>
        <p>Save items you love for later</p>
        <a href="sportivo.html" class="button-primary" style="margin-top: 20px; display: inline-block;">
          Continue Shopping
        </a>
      </div>
    `;
    return;
  }

  let wishlistHTML = '';

  wishlistItems.forEach((wishlistItem) => {
    const product = getProduct(wishlistItem.productId);
    
    if (!product) {
      console.warn('Product not found:', wishlistItem.productId);
      return;
    }

    wishlistHTML += `
      <div class="wishlist-item js-wishlist-item-${product.id}">
        <img class="wishlist-item-image" src="${product.getImageUrl()}" alt="${product.name}">
        <div class="wishlist-item-name">${product.name}</div>
        <div class="wishlist-item-price">${product.getPrice()}</div>
        <div class="wishlist-item-actions">
          <button class="add-to-cart-wishlist js-add-to-cart-wishlist" 
                  data-product-id="${product.id}">
            Add to Cart
          </button>
          <button class="remove-from-wishlist js-remove-from-wishlist" 
                  data-product-id="${product.id}">
            Remove
          </button>
        </div>
      </div>
    `;
  });

  wishlistGrid.innerHTML = wishlistHTML;

  // Add event listeners for remove buttons
  document.querySelectorAll('.js-remove-from-wishlist')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const productId = button.dataset.productId;
        removeFromWishlist(productId);
        updateWishlistDisplay(); // Refresh the display
      });
    });

  // Add event listeners for add to cart buttons
  document.querySelectorAll('.js-add-to-cart-wishlist')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const productId = button.dataset.productId;
        addToCart(productId, 1);
        updateCartQuantity();
        
        // Show feedback
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.style.background = '#26a541';
        button.style.color = 'white';
        
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '';
          button.style.color = '';
        }, 1000);
      });
    });
}

async function loadPage() {
  try {
    await loadProductsFetch();
    updateWishlistDisplay();
    updateCartQuantity();
    updateWishlistCounter(); // ADD THIS LINE
  } catch (error) {
    console.log('Unexpected error. Please try again later.');
    console.error('Error details:', error);
  }
}

loadPage();