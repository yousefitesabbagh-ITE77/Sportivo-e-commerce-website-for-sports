// scripts/wishlist-manager.js

import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  calculateWishlistQuantity,
  getWishlistItems
} from '../data/wishlist.js';

let wishlistButtonsInitialized = false;

export function updateWishlistCounter() {
  const wishlistCount = calculateWishlistQuantity();
  const wishlistCounter = document.querySelector('.js-wishlist-count');

  if (wishlistCounter) {
    wishlistCounter.textContent = wishlistCount;
    wishlistCounter.style.display = wishlistCount > 0 ? 'flex' : 'none';
  }
}

function updateWishlistButtonState(button) {
  if (!button) {
    return;
  }

  const productId = button.dataset.productId;

  if (!productId) {
    return;
  }

  const productIsInWishlist = isInWishlist(productId);

  button.textContent = productIsInWishlist ? '♥' : '♡';
  button.classList.toggle('in-wishlist', productIsInWishlist);
  button.title = productIsInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
  button.setAttribute(
    'aria-label',
    productIsInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
  );
}

function syncWishlistButtons(container = document) {
  container.querySelectorAll('.js-wishlist-button').forEach((button) => {
    updateWishlistButtonState(button);
  });
}

function handleWishlistButtonClick(event) {
  const button = event.target.closest('.js-wishlist-button');

  if (!button) {
    return;
  }

  const productId = button.dataset.productId;

  if (!productId) {
    return;
  }

  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
  } else {
    addToWishlist(productId);
  }

  syncWishlistButtons();
  updateWishlistCounter();
}

export function initializeWishlistButtons() {
  syncWishlistButtons();

  if (wishlistButtonsInitialized) {
    return;
  }

  wishlistButtonsInitialized = true;
  document.addEventListener('click', handleWishlistButtonClick);
}

export function initializeWishlistButtonsInContainer(container) {
  if (!container) {
    return;
  }

  syncWishlistButtons(container);

  if (wishlistButtonsInitialized) {
    return;
  }

  wishlistButtonsInitialized = true;
  document.addEventListener('click', handleWishlistButtonClick);
}

export function checkEmptyWishlist(container) {
  const wishlistItems = getWishlistItems();

  if (wishlistItems.length === 0 && container) {
    container.innerHTML = `
      <div class="empty-wishlist-state">
        <div class="empty-wishlist-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M12 21.1 10.6 19.8C5.4 15.1 2 12 2 8.2 2 5.1 4.4 2.8 7.5 2.8c1.7 0 3.4.8 4.5 2.1 1.1-1.3 2.8-2.1 4.5-2.1 3.1 0 5.5 2.3 5.5 5.4 0 3.8-3.4 6.9-8.6 11.6L12 21.1Zm0-2.7.1-.1c4.8-4.4 7.9-7.2 7.9-10.1 0-2-1.5-3.4-3.5-3.4-1.5 0-3 .9-3.6 2.2h-1.8C10.5 5.7 9 4.8 7.5 4.8 5.5 4.8 4 6.2 4 8.2c0 2.9 3.1 5.7 7.9 10.1l.1.1Z"/>
          </svg>
        </div>
        <h3>Your Wishlist is empty</h3>
        <p>Save items you love for later. They'll appear here so you can easily find them again.</p>

        <div class="empty-wishlist-actions">
          <a href="index.html" class="button-primary">Start shopping</a>
          <a href="index.html?sport=football" class="button-secondary">Explore Football</a>
          <a href="index.html?sport=basketball" class="button-secondary">Explore Basketball</a>
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