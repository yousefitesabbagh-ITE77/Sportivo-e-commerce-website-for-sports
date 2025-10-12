// scripts/product-renderer.js

import { products } from '../data/products.js';
import { formatCurrency } from './utils/money.js';
import { initializeAddToCartButtons } from './cart-manager.js';
import { initializeQuantityButtons } from './quantity-manager.js';
import { initializeWishlistButtons } from './wishlist-manager.js';
import { initializeRatingToggles } from './rating-manager.js';
import { showReviewsModal } from './reviews-manager.js';
import { trackProductView } from '../data/recommendations.js';

export function updateProductsDisplay(filteredProducts) {
  const productsGrid = document.querySelector('.js-products-grid');
  
  // Clear any existing skeleton loading
  productsGrid.innerHTML = '';

  let productsHTML = '';

  filteredProducts.forEach((product) => {
    productsHTML += `
      <div class="product-container js-product-container" data-product-id="${product.id}">
        <div class="product-image-container">
          <a href="product.html?id=${product.id}">
            <img class="product-image"
              src="${product.getImageUrl()}"
              alt="${product.name}">
          </a>
        </div>
        
        <button class="wishlist-button js-wishlist-button" 
                data-product-id="${product.id}"
                title="Add to Wishlist"
                aria-label="Add ${product.name} to wishlist">
          ♡
        </button>
        
        <button class="reviews-button js-reviews-button" 
                data-product-id="${product.id}"
                title="View Reviews"
                aria-label="View reviews for ${product.name}">
          💬
        </button>
        
        <div class="product-name limit-text-to-2-lines">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </div>
        ${product.getRatingHTML()}
        <div class="product-price">
          ${product.getPrice()}
        </div>
        <div class="product-quantity-container">
          <div class="quantity-selector js-quantity-selector" data-product-id="${product.id}">
            <button class="quantity-btn minus-btn js-quantity-minus" type="button"
                    aria-label="Decrease quantity for ${product.name}">−</button>
            <input class="quantity-display js-quantity-display-${product.id}" 
                   type="text" 
                   value="1" 
                   readonly
                   aria-label="Quantity for ${product.name}">
            <button class="quantity-btn plus-btn js-quantity-plus" type="button"
                    aria-label="Increase quantity for ${product.name}">+</button>
          </div>
        </div>
        ${product.extraInfoHTML()}
        <div class="product-spacer"></div>
        <div class="added-to-cart js-added-to-cart-${product.id}">
          <img src="images/icons/checkmark.png" alt="Added">
          Added
        </div>
        <button class="add-to-cart-button button-primary js-add-to-cart"
        data-product-id="${product.id}"
        aria-label="Add ${product.name} to cart">
          Add to Cart
        </button>
      </div>
    `;
  });

  // If no products found, show empty state
  if (filteredProducts.length === 0) {
    productsHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try adjusting your search or filter criteria.</p>
        <a href="sportivo.html" class="button-primary">Browse All Products</a>
      </div>
    `;
  }

  productsGrid.innerHTML = productsHTML;
  
  // Initialize all functionality for REGULAR products only
  if (filteredProducts.length > 0) {
    initializeAddToCartButtons();
    initializeQuantityButtons();
    initializeWishlistButtons();
    initializeRatingToggles();
    initializeReviewsButtons();
    initializeProductTracking();
  }
}

function initializeProductTracking() {
  document.querySelectorAll('.js-product-container').forEach(container => {
    container.addEventListener('click', (e) => {
      if (!e.target.closest('.js-add-to-cart') && 
          !e.target.closest('.js-wishlist-button') &&
          !e.target.closest('.js-reviews-button') &&
          !e.target.closest('.js-quantity-selector') &&
          !e.target.closest('a')) { // Don't track if it's a link click
        const productId = container.dataset.productId;
        trackProductView(productId);
      }
    });
  });
}

function initializeReviewsButtons() {
  document.querySelectorAll('.js-reviews-button')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const productId = button.dataset.productId;
        const product = products.find(p => p.id === productId);
        if (product) {
          showReviewsModal(product);
        }
      });
    });
}

// Add empty state CSS to general.css
const emptyStateCSS = `
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #2d3748;
    grid-column: 1 / -1;
  }
  
  .empty-state h3 {
    color: #2d3748;
    margin-bottom: 12px;
    font-size: 18px;
  }
  
  .empty-state p {
    color: #666;
    margin-bottom: 20px;
    font-size: 14px;
  }
`;