// scripts/wishlist-manager.js

import { 
  addToWishlist, 
  removeFromWishlist, 
  isInWishlist,
  calculateWishlistQuantity,
  getWishlistItems,
  wishlist
} from '../data/wishlist.js';

export function updateWishlistCounter() {
  const wishlistCount = calculateWishlistQuantity();
  const wishlistCounter = document.querySelector('.js-wishlist-count');
  
  if (wishlistCounter) {
    wishlistCounter.textContent = wishlistCount;
    wishlistCounter.style.display = wishlistCount > 0 ? 'flex' : 'none';
  }
}

export function initializeWishlistButtons() {
  document.querySelectorAll('.js-wishlist-button')
    .forEach((button) => {
      const productId = button.dataset.productId;
      
      // Set initial state (filled heart if in wishlist)
      if (isInWishlist(productId)) {
        button.innerHTML = '♥';
        button.classList.add('in-wishlist');
        button.title = 'Remove from Wishlist';
      } else {
        button.innerHTML = '♡';
        button.classList.remove('in-wishlist');
        button.title = 'Add to Wishlist';
      }
      
      // Add click event
      button.addEventListener('click', () => {
        if (isInWishlist(productId)) {
          removeFromWishlist(productId);
          button.innerHTML = '♡';
          button.classList.remove('in-wishlist');
          button.title = 'Add to Wishlist';
        } else {
          addToWishlist(productId);
          button.innerHTML = '♥';
          button.classList.add('in-wishlist');
          button.title = 'Remove from Wishlist';
        }
        updateWishlistCounter();
      });
    });
}

// NEW FUNCTION: Initializes buttons only within a given container
export function initializeWishlistButtonsInContainer(container) {
  container.querySelectorAll('.js-wishlist-button')
    .forEach((button) => {
      const productId = button.dataset.productId;
      
      // Set initial state (filled heart if in wishlist)
      if (isInWishlist(productId)) {
        button.innerHTML = '♥';
        button.classList.add('in-wishlist');
        button.title = 'Remove from Wishlist';
      } else {
        button.innerHTML = '♡';
        button.classList.remove('in-wishlist');
        button.title = 'Add to Wishlist';
      }
      
      // Add click event
      button.addEventListener('click', () => {
        if (isInWishlist(productId)) {
          removeFromWishlist(productId);
          button.innerHTML = '♡';
          button.classList.remove('in-wishlist');
          button.title = 'Add to Wishlist';
        } else {
          addToWishlist(productId);
          button.innerHTML = '♥';
          button.classList.add('in-wishlist');
          button.title = 'Remove from Wishlist';
        }
        updateWishlistCounter();
      });
    });
}

// New function to handle empty wishlist state
export function checkEmptyWishlist(container) {
  const wishlistItems = getWishlistItems();
  if (wishlistItems.length === 0 && container) {
    container.innerHTML = `
      <div class="empty-wishlist-state">
        <div class="empty-wishlist-icon">💝</div>
        <h3>Your Wishlist is empty</h3>
        <p>Save items you love for later. They'll appear here so you can easily find them again.</p>
        <div class="empty-wishlist-actions">
          <a href="sportivo.html" class="button-primary">Start shopping</a>
          <a href="sportivo.html?sport=football" class="button-secondary">Explore Football</a>
          <a href="sportivo.html?sport=basketball" class="button-secondary">Explore Basketball</a>
        </div>
        <div class="empty-wishlist-tips">
          <h4>How to add items to your wishlist:</h4>
          <ul>
            <li>Click the ♡ heart icon on any product</li>
            <li>Find all your saved items here</li>
            <li>Move items to cart when ready to buy</li>
          </ul>
        </div>
      </div>
    `;
    return true;
  }
  return false;
}