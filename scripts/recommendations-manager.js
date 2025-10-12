// scripts/recommendations-manager.js

import { getRecommendations, getCustomersAlsoBought, trackProductView, trackSearch } from '../data/recommendations.js';
import { products } from '../data/products.js';
import { updateProductsDisplay } from './product-renderer.js';
import { initializeWishlistButtonsInContainer } from './wishlist-manager.js';

export function initializeRecommendations() {
  trackProductViews();
  trackSearches();
}

function trackProductViews() {
  // This will be called when product details are viewed
  // We'll implement this when we add product detail pages
}

function trackSearches() {
  const searchButton = document.querySelector('.js-search-button');
  const searchBar = document.querySelector('.js-search-bar');
  
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const searchTerm = searchBar.value;
      trackSearch(searchTerm);
    });
  }
  
  if (searchBar) {
    searchBar.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const searchTerm = searchBar.value;
        trackSearch(searchTerm);
      }
    });
  }
}

export function showMainPageRecommendations() {
  if (!shouldShowRecommendations()) {
    return;
  }
  
  const recommendations = getRecommendations(products);
  
  if (recommendations.length === 0) {
    const popularProducts = products
      .sort((a, b) => b.rating.stars - a.rating.stars)
      .slice(0, 8);
    showRecommendationsSection('Popular Products', popularProducts);
    return;
  }
  
  showRecommendationsSection('Recommended For You', recommendations);
}

export function showCustomersAlsoBought(productId) {
  const alsoBought = getCustomersAlsoBought(productId, products);
  
  if (alsoBought.length > 0) {
    return `
      <div class="customers-also-bought-section">
        <h3>Customers who bought this also bought</h3>
        <div class="also-bought-grid">
          ${alsoBought.map(product => `
            <div class="also-bought-item" data-product-id="${product.id}">
              <img src="${product.getImageUrl()}" alt="${product.name}">
              <div class="also-bought-name">${product.name}</div>
              <div class="also-bought-price">${product.getPrice()}</div>
              <div class="also-bought-rating">${product.getRatingHTML()}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  return '';
}

function showRecommendationsSection(title, recommendedProducts) {
  const recommendationsHTML = `
    <div class="recommendations-section">
      <div class="recommendations-header">
        <h2>${title}</h2>
      </div>
      <div class="recommendations-grid">
        ${recommendedProducts.map(product => `
          <div class="recommended-product js-product-container" data-product-id="${product.id}">
            <div class="recommended-image-container">
              <a href="product.html?id=${product.id}">
                <img src="${product.getImageUrl()}" alt="${product.name}">
              </a>
            </div>
            
            <button class="wishlist-button js-wishlist-button" 
                    data-product-id="${product.id}"
                    title="Add to Wishlist">
              ♡
            </button>
            
            <button class="reviews-button js-reviews-button" 
                    data-product-id="${product.id}"
                    title="View Reviews">
              💬
            </button>
            
            <div class="recommended-name limit-text-to-2-lines">
              <a href="product.html?id=${product.id}">${product.name}</a>
            </div>
            <div class="recommended-rating">${product.getRatingHTML()}</div>
            <div class="recommended-price">${product.getPrice()}</div>
            <div class="product-quantity-container">
              <div class="quantity-selector js-quantity-selector" data-product-id="${product.id}">
                <button class="quantity-btn minus-btn js-quantity-minus" type="button">−</button>
                <input class="quantity-display js-quantity-display-${product.id}" type="text" value="1" readonly>
                <button class="quantity-btn plus-btn js-quantity-plus" type="button">+</button>
              </div>
            </div>
            <div class="product-spacer"></div>
            <div class="added-to-cart js-added-to-cart-${product.id}">
              <img src="images/icons/checkmark.png">
              Added
            </div>
            <button class="add-to-cart-button button-primary js-add-to-cart"
            data-product-id="${product.id}">
              Add to Cart
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  const productsGrid = document.querySelector('.js-products-grid');
  if (productsGrid) {
    productsGrid.insertAdjacentHTML('beforebegin', recommendationsHTML);
    
    // Get the newly added recommendations section
    const newRecommendationsSection = productsGrid.previousElementSibling;

    // Initialize buttons only within this new section
    initializeWishlistButtonsInContainer(newRecommendationsSection);
    
    // ONLY initialize reviews for recommendations - avoid duplicates
    initializeRecommendationReviews();
    initializeRecommendationRatings();
  }
}

// ONLY initialize reviews for recommended products
function initializeRecommendationReviews() {
  document.querySelectorAll('.recommendations-section .js-reviews-button')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const productId = button.dataset.productId;
        const product = products.find(p => p.id === productId);
        if (product) {
          import('./reviews-manager.js').then(module => {
            module.showReviewsModal(product);
          });
        }
      });
    });
}

// ONLY initialize ratings for recommended products  
function initializeRecommendationRatings() {
  document.querySelectorAll('.recommendations-section .js-rating-summary').forEach(summary => {
    summary.addEventListener('click', (event) => {
      event.stopPropagation();
      const container = summary.closest('.js-rating-container');
      container.classList.toggle('rating-container-expanded');
    });
  });
}

function shouldShowRecommendations() {
  const url = new URL(window.location.href);
  const sport = url.searchParams.get('sport');
  const search = url.searchParams.get('search');
  return !sport && !search;
} 