// scripts/wishlist.js

import {
  getWishlistItems,
  removeFromWishlist,
  sanitizeWishlist
} from '../data/wishlist.js';
import { products, getProduct, loadProductsFetch } from '../data/products.js';
import { addToCart } from '../data/cart.js';
import { updateCartQuantity } from './cart-manager.js';
import { updateWishlistCounter } from './wishlist-manager.js';
import { createLoadingOverlay, removeLoadingOverlay } from './utils/loading.js';

let wishlistPageListenersInitialized = false;

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDateAdded(dateInput) {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return 'Saved recently';
  }

  return `Saved on ${new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)}`;
}

function getWishlistProducts() {
  return getWishlistItems()
    .map((wishlistItem) => {
      const product = getProduct(wishlistItem.productId);

      if (!product) {
        return null;
      }

      return {
        wishlistItem,
        product
      };
    })
    .filter(Boolean);
}

function getSportLabel(product) {
  const sport = product.getSportCategory?.() || product.sport || 'all';

  const labels = {
    football: 'Football',
    basketball: 'Basketball',
    tabletennis: 'Table Tennis',
    volleyball: 'Volleyball',
    all: 'Sports Gear'
  };

  return labels[sport] || 'Sports Gear';
}

function getRatingText(product) {
  const stars = Number(product.rating?.stars) || 0;
  const count = Number(product.rating?.count) || 0;

  return `${stars.toFixed(1)} · ${count.toLocaleString()} ratings`;
}

function wishlistSummaryHTML(wishlistProducts) {
  const count = wishlistProducts.length;
  const itemLabel = count === 1 ? 'item' : 'items';

  return `
    <section class="wishlist-summary-card">
      <div>
        <p class="wishlist-eyebrow">Saved products</p>
        <h2>${count} ${itemLabel} in your wishlist</h2>
        <p>
          Keep your favorite sports products here, then move them to your cart when you're ready.
        </p>
      </div>

      <div class="wishlist-summary-actions">
        <a href="index.html" class="button-secondary wishlist-summary-link">
          Continue shopping
        </a>
      </div>
    </section>
  `;
}

function emptyWishlistHTML() {
  return `
    <section class="empty-wishlist-state">
      <div class="empty-wishlist-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.3 4.9 13.7C1.2 10.3 3.2 4 8.2 4c1.8 0 3.2.8 3.8 2 .6-1.2 2-2 3.8-2 5 0 7 6.3 3.3 9.7L12 20.3Z"/></svg></div>

      <h2>Your Wishlist is empty</h2>

      <p>
        Save products you like by clicking the heart icon. Your saved products will appear here
        and stay available after refreshing the page.
      </p>

      <div class="empty-wishlist-actions">
        <a href="index.html" class="button-primary empty-wishlist-button">
          Start shopping
        </a>

        <a href="index.html?sport=football" class="button-secondary empty-wishlist-button">
          Browse football
        </a>

        <a href="index.html?sport=basketball" class="button-secondary empty-wishlist-button">
          Browse basketball
        </a>
      </div>

      <div class="wishlist-tips-card">
        <h3>Wishlist features</h3>

        <ul>
          <li>Keeps your saved picks ready while you browse.</li>
          <li>Synced with the wishlist counter in the header.</li>
          <li>Products can be moved directly to the cart.</li>
        </ul>
      </div>
    </section>
  `;
}

function wishlistItemHTML({ wishlistItem, product }) {
  const productName = escapeHTML(product.name);
  const productCategory = escapeHTML(product.category || 'Sports Gear');
  const sportLabel = escapeHTML(getSportLabel(product));
  const productUrl = `product.html?id=${encodeURIComponent(product.id)}`;

  return `
    <article class="wishlist-item" data-product-id="${product.id}">
      <div class="wishlist-item-image-container">
        <a href="${productUrl}" aria-label="View details for ${productName}">
          <img
            class="wishlist-item-image"
            src="${product.getImageUrl()}"
            alt="${productName}"
            loading="lazy"
          >
        </a>
      </div>

      <div class="wishlist-item-content">
        <div class="wishlist-item-meta">
          <span>${sportLabel}</span>
          <span>${productCategory}</span>
        </div>

        <h2 class="wishlist-item-name">
          <a href="${productUrl}">
            ${productName}
          </a>
        </h2>

        <div class="wishlist-item-rating">
          <span class="wishlist-rating-stars">★</span>
          <span>${getRatingText(product)}</span>
        </div>

        <div class="wishlist-item-price-row">
          <div class="wishlist-item-price">${product.getPrice()}</div>
          <span class="wishlist-stock-label">In stock</span>
        </div>

        <div class="wishlist-date-added">
          ${formatDateAdded(wishlistItem.dateAdded)}
        </div>

        <div class="wishlist-item-actions">
          <button
            class="add-to-cart-wishlist js-add-to-cart-wishlist"
            data-product-id="${product.id}"
            type="button"
          >
            Add to Cart
          </button>

          <button
            class="remove-from-wishlist js-remove-from-wishlist"
            data-product-id="${product.id}"
            type="button"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderWishlistError(error) {
  const wishlistGrid = document.querySelector('.js-wishlist-grid');

  if (!wishlistGrid) {
    return;
  }

  wishlistGrid.innerHTML = `
    <section class="wishlist-error-state">
      <div class="empty-wishlist-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 1.8 20h20.4L12 2Zm1 14h-2v2h2v-2Zm0-7h-2v5h2V9Z"/></svg></div>

      <h2>Unable to load your wishlist</h2>

      <p>
        Something went wrong while loading saved products. Please refresh the page and try again.
      </p>

      <button class="button-primary empty-wishlist-button" type="button" onclick="location.reload()">
        Try again
      </button>
    </section>
  `;

  console.error('Error loading wishlist:', error);
}

function renderWishlistDisplay() {
  const wishlistGrid = document.querySelector('.js-wishlist-grid');

  if (!wishlistGrid) {
    return;
  }

  const wishlistProducts = getWishlistProducts();

  if (wishlistProducts.length === 0) {
    wishlistGrid.innerHTML = emptyWishlistHTML();
    updateCartQuantity();
    updateWishlistCounter();
    return;
  }

  wishlistGrid.innerHTML = `
    ${wishlistSummaryHTML(wishlistProducts)}
    ${wishlistProducts.map((wishlistProduct) => wishlistItemHTML(wishlistProduct)).join('')}
  `;

  updateCartQuantity();
  updateWishlistCounter();
}

function showAddToCartFeedback(button) {
  const originalText = button.dataset.originalText || button.textContent.trim();

  button.dataset.originalText = originalText;
  button.textContent = 'Added ✓';
  button.disabled = true;

  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 1200);
}

function initializeWishlistPageListeners() {
  if (wishlistPageListenersInitialized) {
    return;
  }

  wishlistPageListenersInitialized = true;

  document.addEventListener('click', (event) => {
    const addToCartButton = event.target.closest('.js-add-to-cart-wishlist');

    if (addToCartButton) {
      const productId = addToCartButton.dataset.productId;

      if (!productId) {
        return;
      }

      addToCart(productId, 1);
      updateCartQuantity();
      showAddToCartFeedback(addToCartButton);
      return;
    }

    const removeButton = event.target.closest('.js-remove-from-wishlist');

    if (removeButton) {
      const productId = removeButton.dataset.productId;

      if (!productId) {
        return;
      }

      removeFromWishlist(productId);
      renderWishlistDisplay();
    }
  });
}

async function loadWishlistPage() {
  createLoadingOverlay('Loading your wishlist...');

  try {
    await loadProductsFetch();

    const validProductIds = products.map((product) => product.id);
    sanitizeWishlist(validProductIds);

    initializeWishlistPageListeners();
    renderWishlistDisplay();
  } catch (error) {
    renderWishlistError(error);
  } finally {
    removeLoadingOverlay();
  }
}

loadWishlistPage();