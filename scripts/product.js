// scripts/product.js

import { products, loadProductsFetch } from '../data/products.js';
import { addToCart } from '../data/cart.js';
import { updateCartQuantity } from './cart-manager.js';
import { initializeWishlistButtonsInContainer, updateWishlistCounter } from './wishlist-manager.js';
import { showReviewsModal } from './reviews-manager.js';
import { createLoadingOverlay, removeLoadingOverlay } from './utils/loading.js';

// NEW: A beautiful, visual rating component for the detail page
function generateRatingStarsHTML(rating) {
  const fullStars = Math.floor(rating.stars);
  const hasHalfStar = rating.stars % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating.stars);
  
  let starsHTML = '';
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<span class="star full">★</span>';
  }
  if (hasHalfStar) {
    starsHTML += '<span class="star half">★</span>';
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<span class="star empty">★</span>';
  }

  return `
    <div class="product-detail-rating">
      <div class="rating-stars">
        ${starsHTML}
      </div>
      <div class="rating-info">
        <span class="rating-score">${rating.stars}</span>
        <span class="rating-count">(${rating.count.toLocaleString()})</span>
      </div>
    </div>
  `;
}

// NEW: Function to generate specs from the ACTUAL product data
function generateSpecsTableHTML(product) {
  // Check if the product has specifications data
  if (!product.specifications || typeof product.specifications !== 'object') {
    // Fallback to the old generic method if no data is available
    return generateGenericSpecsTableHTML(product);
  }

  let tableRowsHTML = '';
  for (const [key, value] of Object.entries(product.specifications)) {
    // Format the key to be more readable (e.g., "Material" instead of "Material")
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    tableRowsHTML += `
      <tr>
        <td class="spec-label">${formattedKey}</td>
        <td class="spec-value">${value}</td>
      </tr>
    `;
  }

  return `
    <table class="specs-table">
      <tbody>
        ${tableRowsHTML}
      </tbody>
    </table>
  `;
}

// Fallback function for generic specs if data is missing
function generateGenericSpecsTableHTML(product) {
  const baseSpecs = [
    { label: 'Brand', value: product.name.split(' ')[0] },
    { label: 'Product Line', value: product.name },
    { label: 'Warranty', value: '1 Year Manufacturer\'s Warranty' }
  ];

  if (product.keywords.includes('ball')) {
    baseSpecs.push({ label: 'Size', value: '5 (Official)' }, { label: 'Weight', value: '410-450 grams' });
  } else if (product.keywords.includes('shirt')) {
    baseSpecs.push({ label: 'Material', value: '100% Polyester' }, { label: 'Fit', value: 'Standard Fit' });
  } else {
    baseSpecs.push({ label: 'Material', value: 'Synthetic Upper' }, { label: 'Sole', value: 'Rubber outsole' });
  }

  let tableRowsHTML = '';
  baseSpecs.forEach(spec => {
    tableRowsHTML += `
      <tr>
        <td class="spec-label">${spec.label}</td>
        <td class="spec-value">${spec.value}</td>
      </tr>
    `;
  });

  return `
    <table class="specs-table">
      <tbody>
        ${tableRowsHTML}
      </tbody>
    </table>
  `;
}

async function renderProductPage() {
  const productDetailsContainer = document.querySelector('.js-product-details-container');
  createLoadingOverlay('Loading product details...');

  try {
    const url = new URL(window.location.href);
    const productId = url.searchParams.get('id');
    if (!productId) throw new Error('Product ID is missing from the URL.');

    await loadProductsFetch();
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error(`Product with ID "${productId}" not found.`);

    // NEW: Use the ACTUAL description from the product data, with a fallback
    const aboutContent = product.description?.details || `
      <ul>
        <li>Premium construction designed for peak performance and durability.</li>
        <li>Engineered with advanced materials for superior comfort and feel.</li>
        <li>Trusted by professional athletes and enthusiasts worldwide.</li>
        <li>Stylish design that stands out, whether on the field or on the street.</li>
        <li>Perfect for training, competition, or casual recreational use.</li>
      </ul>
    `;

    const productHTML = `
      <div class="product-page-layout">
        <div class="product-image-column">
          <div class="main-image-container">
            <img class="product-detail-image" src="${product.getImageUrl()}" alt="${product.name}">
          </div>
        </div>
        
        <div class="product-details-column">
          <div class="product-title-section">
            <h1 class="product-detail-name">${product.name}</h1>
            ${generateRatingStarsHTML(product.rating)}
            <div class="product-detail-price">${product.getPrice()}</div>
          </div>

          <div class="purchase-section">
            <div class="action-buttons">
              <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
                Add to Cart
              </button>
              <button class="wishlist-button js-wishlist-button" data-product-id="${product.id}" title="Add to Wishlist">
                <span class="wishlist-icon">♡</span>
              </button>
            </div>
            <div class="purchase-info">
              <div class="shipping-info">
                <span class="shipping-icon">🚚</span>
                <span>Free delivery on eligible orders</span>
              </div>
              <div class="stock-info">
                <span class="stock-icon">✓</span>
                <span>In Stock</span>
              </div>
            </div>
          </div>

          <div class="product-info-tabs">
            <div class="tab" data-tab="about">
              <input type="radio" name="product-tab" id="tab-about" checked>
              <label for="tab-about">About this item</label>
              <div class="tab-content">
                ${aboutContent}
              </div>
            </div>
            <div class="tab" data-tab="specs">
              <input type="radio" name="product-tab" id="tab-specs">
              <label for="tab-specs">Product information</label>
              <div class="tab-content">
                ${generateSpecsTableHTML(product)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    productDetailsContainer.innerHTML = productHTML;
    initializeProductPageInteractions(product);

  } catch (error) {
    console.error('Error loading product page:', error);
    productDetailsContainer.innerHTML = `
      <div class="error-state">
        <h3>Oops! Something went wrong.</h3>
        <p>${error.message}</p>
        <a href="sportivo.html" class="button-primary">Back to Shopping</a>
      </div>
    `;
  } finally {
    removeLoadingOverlay();
  }
}

function initializeProductPageInteractions(product) {
  import('./cart-manager.js').then(module => {
    module.initializeAddToCartButtons();
  });
  const wishlistContainer = document.querySelector('.product-details-column');
  if (wishlistContainer) {
    initializeWishlistButtonsInContainer(wishlistContainer);
    updateWishlistCounter();
  }
  const tabLabels = document.querySelectorAll('.tab label');
  tabLabels.forEach(label => {
    label.addEventListener('click', () => {
      // No JS needed, the radio button handles the state
    });
  });
  updateCartQuantity();
}

document.addEventListener('DOMContentLoaded', renderProductPage);