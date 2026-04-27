// scripts/product.js

import { getProduct, loadProductsFetch, products } from '../data/products.js';
import { addToCart } from '../data/cart.js';
import { updateCartQuantity, initializeAddToCartButtons } from './cart-manager.js';
import { initializeQuantityButtons } from './quantity-manager.js';
import { initializeWishlistButtonsInContainer, updateWishlistCounter } from './wishlist-manager.js';
import { trackProductView, trackProductPurchase } from '../data/recommendations.js';
import { createLoadingOverlay, removeLoadingOverlay } from './utils/loading.js';

const SPORT_LABELS = {
  football: 'Football',
  basketball: 'Basketball',
  tabletennis: 'Table Tennis',
  volleyball: 'Volleyball',
  all: 'Sports Gear'
};

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getSportLabel(product) {
  const sportKey = product.getSportCategory?.() || product.sport || 'all';
  return SPORT_LABELS[sportKey] || 'Sports Gear';
}

function generateRatingStarsHTML(rating) {
  const safeRating = Number(rating?.stars) || 0;
  const reviewCount = Number(rating?.count) || 0;
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(safeRating);

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
      <div class="rating-stars" aria-label="Rating ${safeRating} out of 5">
        ${starsHTML}
      </div>

      <div class="rating-info">
        <span class="rating-score">${safeRating.toFixed(1)}</span>
        <span class="rating-count">${reviewCount.toLocaleString()} ratings</span>
      </div>
    </div>
  `;
}

function generateCompactRatingHTML(product) {
  const safeRating = Math.max(0, Math.min(Number(product.rating?.stars) || 0, 5));

  return `
    <div class="compact-rating" aria-label="${safeRating.toFixed(1)} out of 5 stars">
      <span>★</span>
      <strong>${safeRating.toFixed(1)}</strong>
      <small>(${Number(product.rating?.count || 0).toLocaleString()})</small>
    </div>
  `;
}


function getBuyerConfidenceHTML(product) {
  const safeRating = Math.max(0, Math.min(Number(product.rating?.stars) || 0, 5));
  const ratingCount = Number(product.rating?.count || 0);
  const distribution = product.rating?.distribution || {};
  const topTags = Array.isArray(product.tags) ? product.tags.slice(0, 3) : [];
  const sportLabel = escapeHTML(getSportLabel(product));

  const ratingRows = [5, 4, 3, 2, 1].map((star) => {
    const percentage = Math.max(0, Math.min(Number(distribution[star]) || 0, 100));

    return `
      <div class="confidence-rating-row">
        <span>${star} star</span>
        <div class="confidence-rating-track">
          <div class="confidence-rating-fill" style="width: ${percentage}%"></div>
        </div>
        <strong>${percentage}%</strong>
      </div>
    `;
  }).join('');

  return `
    <section class="buyer-confidence-section" aria-label="Buyer confidence">
      <div class="buyer-confidence-main">
        <div class="section-title-block">
          <p class="section-eyebrow">Buyer confidence</p>
          <h2>Why this product stands out</h2>
        </div>

        <p>
          Helpful buying signals at a glance: customer ratings, product tags, availability,
          and category fit for confident product comparison.
        </p>

        <div class="confidence-pill-list">
          <span>${sportLabel}</span>
          ${topTags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join('')}
        </div>
      </div>

      <div class="buyer-rating-panel">
        <div class="buyer-rating-score">
          <strong>${safeRating.toFixed(1)}</strong>
          <span>out of 5</span>
        </div>

        <div class="compact-rating confidence-stars" aria-label="${safeRating.toFixed(1)} out of 5 stars">
          <span>★</span>
          <strong>${safeRating.toFixed(1)}</strong>
          <small>${ratingCount.toLocaleString()} ratings</small>
        </div>

        <div class="confidence-rating-bars">
          ${ratingRows}
        </div>
      </div>
    </section>
  `;
}

function formatSpecificationLabel(label) {
  return String(label || '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (firstLetter) => firstLetter.toUpperCase())
    .trim();
}

function generateSpecsHTML(product) {
  const specifications = product.specifications || {};

  if (Object.keys(specifications).length === 0) {
    return `
      <div class="spec-card">
        <span class="spec-label">Category</span>
        <strong class="spec-value">${escapeHTML(product.category || 'Sports Gear')}</strong>
      </div>

      <div class="spec-card">
        <span class="spec-label">Sport</span>
        <strong class="spec-value">${escapeHTML(getSportLabel(product))}</strong>
      </div>
    `;
  }

  return Object.entries(specifications)
    .map(([key, value]) => {
      return `
        <div class="spec-card">
          <span class="spec-label">${escapeHTML(formatSpecificationLabel(key))}</span>
          <strong class="spec-value">${escapeHTML(value)}</strong>
        </div>
      `;
    })
    .join('');
}

function getProductAboutHTML(product) {
  if (product.description?.details) {
    return product.description.details;
  }

  if (product.description?.summary) {
    return `<p>${escapeHTML(product.description.summary)}</p>`;
  }

  return `
    <ul>
      <li>Designed for reliable sports performance and everyday training.</li>
      <li>Built with durable materials for repeated use.</li>
      <li>Suitable for beginners, hobby players, and active athletes.</li>
    </ul>
  `;
}

function getShortDescription(product) {
  if (product.description?.summary) {
    return product.description.summary;
  }

  return 'A reliable sports product designed for training, practice, and everyday performance.';
}

function getProductTagsHTML(product) {
  if (!Array.isArray(product.tags) || product.tags.length === 0) {
    return '';
  }

  return `
    <div class="product-detail-tags">
      ${product.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join('')}
    </div>
  `;
}

function getDetailPriceHTML(product) {
  const oldPrice = product.getOldPrice?.() || '';
  const discountPercentage = product.getDiscountPercentage?.() || 0;

  return `
    <div class="product-detail-price">${product.getPrice()}</div>
    ${oldPrice ? `
      <div class="product-detail-old-price-row">
        <span class="product-detail-old-price">${oldPrice}</span>
        <span class="product-detail-discount">Save ${discountPercentage}%</span>
      </div>
    ` : ''}
  `;
}

function getGalleryImages(product) {
  const galleryImages = Array.isArray(product.images?.gallery) ? product.images.gallery : [];
  const images = [product.images?.main || product.getImageUrl(), ...galleryImages]
    .filter(Boolean)
    .filter((image, index, array) => array.indexOf(image) === index);

  if (images.length > 0) {
    return images;
  }

  return [product.getImageUrl()];
}

function getProductGalleryHTML(product) {
  const productName = escapeHTML(product.name);
  const sportLabel = escapeHTML(getSportLabel(product));
  const galleryImages = getGalleryImages(product);
  const mainImage = galleryImages[0];

  return `
    <div class="product-gallery js-product-gallery">
      <div class="product-image-card">
        <div class="product-image-badge">${sportLabel}</div>

        <img
          class="product-detail-image js-product-main-image"
          src="${mainImage}"
          alt="${productName}"
        >
      </div>

      ${galleryImages.length > 1 ? `
        <div class="product-gallery-thumbnails" aria-label="Product image gallery">
          ${galleryImages.map((imageUrl, index) => `
            <button
              class="product-gallery-thumbnail js-product-thumbnail ${index === 0 ? 'active' : ''}"
              type="button"
              data-image-url="${escapeHTML(imageUrl)}"
              aria-label="Show image ${index + 1} for ${productName}"
              aria-pressed="${index === 0 ? 'true' : 'false'}"
            >
              <img src="${escapeHTML(imageUrl)}" alt="${productName} thumbnail ${index + 1}">
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function getSelectedDetailQuantity(productId) {
  const quantityDisplay = document.querySelector(`.product-details-column .js-quantity-display-${productId}`);
  const quantity = Number(quantityDisplay?.value) || 1;

  return Math.min(Math.max(quantity, 1), 10);
}

function getRelatedProducts(product, limit = 4) {
  const currentSport = product.getSportCategory?.() || product.sport;
  const currentTags = new Set((product.tags || []).map((tag) => tag.toLowerCase()));
  const currentKeywords = new Set((product.keywords || []).map((keyword) => keyword.toLowerCase()));

  return products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      const candidateTags = (candidate.tags || []).map((tag) => tag.toLowerCase());
      const candidateKeywords = (candidate.keywords || []).map((keyword) => keyword.toLowerCase());
      const sameSport = (candidate.getSportCategory?.() || candidate.sport) === currentSport;
      const sameCategory = candidate.category === product.category;
      const sharedTags = candidateTags.filter((tag) => currentTags.has(tag)).length;
      const sharedKeywords = candidateKeywords.filter((keyword) => currentKeywords.has(keyword)).length;

      const score =
        (sameSport ? 50 : 0) +
        (sameCategory ? 30 : 0) +
        (sharedTags * 8) +
        (sharedKeywords * 3) +
        (Number(candidate.rating?.stars) || 0);

      return { product: candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

function readViewedProductIds() {
  try {
    const storedBehavior = JSON.parse(localStorage.getItem('userBehavior') || '{}');
    return Array.isArray(storedBehavior.viewedProducts) ? storedBehavior.viewedProducts : [];
  } catch (error) {
    console.warn('Recently viewed products could not be read from localStorage.', error);
    return [];
  }
}

function getRecentlyViewedProducts(currentProductId, limit = 4) {
  return readViewedProductIds()
    .filter((productId) => productId !== currentProductId)
    .map((productId) => getProduct(productId))
    .filter(Boolean)
    .slice(0, limit);
}

function getCompactProductCardHTML(product) {
  const productUrl = `product.html?id=${encodeURIComponent(product.id)}`;
  const productName = escapeHTML(product.name);
  const productBrand = escapeHTML(product.brand || 'Sportivo');
  const productCategory = escapeHTML(product.category || 'Sports Gear');
  const stockLabel = escapeHTML(product.getStockLabel?.() || 'In stock');
  const isInStock = product.isInStock?.() ?? true;

  return `
    <article class="detail-product-card js-product-container" data-product-id="${product.id}">
      <a class="detail-product-image-link" href="${productUrl}" aria-label="View ${productName}">
        <img src="${product.getImageUrl()}" alt="${productName}" loading="lazy">
      </a>

      <div class="detail-product-card-body">
        <div class="detail-product-meta">
          <span>${productBrand}</span>
          <span>${productCategory}</span>
        </div>

        <h3>
          <a href="${productUrl}">${productName}</a>
        </h3>

        ${generateCompactRatingHTML(product)}

        <div class="detail-product-card-bottom">
          <div>
            <strong class="detail-product-card-price">${product.getPrice()}</strong>
            <span class="detail-product-card-stock">${stockLabel}</span>
          </div>

          <button
            class="wishlist-button js-wishlist-button"
            data-product-id="${product.id}"
            title="Add to Wishlist"
            aria-label="Add ${productName} to wishlist"
            type="button"
          >
            ♡
          </button>
        </div>

        <div class="added-to-cart detail-added-to-cart js-added-to-cart-${product.id}">
          Added to cart
        </div>

        <button
          class="detail-card-cart-button js-add-to-cart"
          data-product-id="${product.id}"
          type="button"
          ${!isInStock ? 'disabled' : ''}
        >
          ${isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  `;
}

function getProductRailHTML(title, eyebrow, productsToShow) {
  if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
    return '';
  }

  return `
    <section class="detail-products-rail">
      <div class="section-title-block detail-rail-header">
        <div>
          <p class="section-eyebrow">${escapeHTML(eyebrow)}</p>
          <h2>${escapeHTML(title)}</h2>
        </div>

        <a href="index.html" class="detail-rail-link">Browse all products</a>
      </div>

      <div class="detail-products-grid">
        ${productsToShow.map((relatedProduct) => getCompactProductCardHTML(relatedProduct)).join('')}
      </div>
    </section>
  `;
}

function getProductHighlightsHTML(product) {
  const sportLabel = escapeHTML(getSportLabel(product));
  const brand = escapeHTML(product.brand || 'Sportivo');
  const category = escapeHTML(product.category || 'Sports Gear');

  return `
    <section class="product-highlights-section" aria-label="Product shopping highlights">
      <div class="highlight-card">
        <span class="highlight-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 7h-3.2a3 3 0 0 0 .2-1 3 3 0 0 0-5-2.2A3 3 0 0 0 7 6c0 .3.1.7.2 1H4v5h1v8h14v-8h1V7ZM9 5a1 1 0 0 1 1 1v1H8.8A1.2 1.2 0 0 1 9 5Zm6 0a1.2 1.2 0 0 1 .2 2H14V6a1 1 0 0 1 1-1ZM7 12h4v6H7v-6Zm6 6v-6h4v6h-4Z"/></svg></span>
        <div>
          <strong>${brand}</strong>
          <p>Selected gear details prepared to help you compare products quickly.</p>
        </div>
      </div>

      <div class="highlight-card">
        <span class="highlight-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2Zm0 4a6 6 0 1 0 6 6h-2a4 4 0 1 1-4-4V6Zm0 4a2 2 0 1 0 2 2h-2v-2Zm4.5-7v3h-3v2h3v3h2V8h3V6h-3V3h-2Z"/></svg></span>
        <div>
          <strong>${category}</strong>
          <p>Grouped with similar ${sportLabel.toLowerCase()} products for easier browsing.</p>
        </div>
      </div>

      <div class="highlight-card">
        <span class="highlight-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13 2 4 14h6l-1 8 11-14h-6l-1-6Z"/></svg></span>
        <div>
          <strong>Fast checkout flow</strong>
          <p>Add to cart or move straight to checkout from this page.</p>
        </div>
      </div>
    </section>
  `;
}

function renderProductDetails(product, pageData) {
  const productName = escapeHTML(product.name);
  const productCategory = escapeHTML(product.category || 'Sports Gear');
  const productBrand = escapeHTML(product.brand || 'Sportivo');
  const sportLabel = escapeHTML(getSportLabel(product));
  const productBadge = product.badge ? escapeHTML(product.badge) : sportLabel;
  const stockLabel = escapeHTML(product.getStockLabel?.() || 'In stock');
  const isInStock = product.isInStock?.() ?? true;
  const relatedProducts = pageData?.relatedProducts || [];
  const recentlyViewedProducts = pageData?.recentlyViewedProducts || [];

  return `
    <div class="product-detail-page">
      <nav class="product-breadcrumb" aria-label="Product breadcrumb">
        <a href="index.html">Home</a>
        <span>/</span>
        <a href="index.html?sport=${encodeURIComponent(product.getSportCategory())}">
          ${sportLabel}
        </a>
        <span>/</span>
        <span>${productName}</span>
      </nav>

      <section class="product-page-layout">
        <div class="product-image-column">
          ${getProductGalleryHTML(product)}

          <div class="product-side-notes">
            <div class="side-note">
              <span class="side-note-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 7.5h10.5v8H3v-8Zm10.5 2.5h3.4l2.1 2.4v3.1h-5.5V10Zm-8.4 8.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Zm11.8 0a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"/></svg></span>
              <div>
                <strong>Flexible delivery</strong>
                <p>Choose free or faster delivery during checkout.</p>
              </div>
            </div>

            <div class="side-note">
              <span class="side-note-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 7h7.5A4.5 4.5 0 1 1 14.5 16H9v-2h5.5A2.5 2.5 0 1 0 14.5 9H7.8l2.6 2.6L9 13 4 8l5-5 1.4 1.4L7.8 7H7Z"/></svg></span>
              <div>
                <strong>Easy returns</strong>
                <p>Return details are shown at checkout before you place your order.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="product-details-column">
          <div class="product-title-section">
            <div class="product-detail-badges">
              <span>${productBadge}</span>
              <span>${sportLabel}</span>
              <span>${productCategory}</span>
              <span>${productBrand}</span>
              <span>${stockLabel}</span>
            </div>

            <h1 class="product-detail-name">${productName}</h1>

            ${generateRatingStarsHTML(product.rating)}

            ${getProductTagsHTML(product)}

            <p class="product-detail-summary">
              ${escapeHTML(getShortDescription(product))}
            </p>

            <div class="product-detail-price-row">
              <div>
                <span class="price-label">Price</span>
                ${getDetailPriceHTML(product)}
              </div>

              <div class="stock-card ${product.isLowStock?.() ? 'stock-card-low' : ''}">
                <span class="stock-dot"></span>
                ${stockLabel}
              </div>
            </div>
          </div>

          <div class="purchase-section">
            <div class="quantity-section">
              <span class="quantity-section-label">Quantity</span>

              <div class="quantity-selector js-quantity-selector" data-product-id="${product.id}">
                <button
                  class="quantity-btn minus-btn js-quantity-minus"
                  type="button"
                  aria-label="Decrease quantity for ${productName}"
                  ${!isInStock ? 'disabled' : ''}
                >
                  −
                </button>

                <input
                  class="quantity-display js-quantity-display-${product.id}"
                  type="text"
                  value="1"
                  readonly
                  aria-label="Quantity for ${productName}"
                  ${!isInStock ? 'disabled' : ''}
                >

                <button
                  class="quantity-btn plus-btn js-quantity-plus"
                  type="button"
                  aria-label="Increase quantity for ${productName}"
                  ${!isInStock ? 'disabled' : ''}
                >
                  +
                </button>
              </div>
            </div>

            <div class="action-buttons product-detail-actions">
              <button
                class="add-to-cart-button button-primary js-add-to-cart"
                data-product-id="${product.id}"
                type="button"
                ${!isInStock ? 'disabled' : ''}
              >
                ${isInStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                class="buy-now-button button-secondary js-buy-now"
                data-product-id="${product.id}"
                type="button"
                ${!isInStock ? 'disabled' : ''}
              >
                Buy now
              </button>

              <button
                class="wishlist-button js-wishlist-button"
                data-product-id="${product.id}"
                title="Add to Wishlist"
                aria-label="Add ${productName} to wishlist"
                type="button"
              >
                ♡
              </button>
            </div>

            <div class="added-to-cart product-detail-added js-added-to-cart-${product.id}">
              Added to cart
            </div>

            <button class="share-product-button js-share-product" type="button">
              Copy product link
            </button>

            <div class="purchase-info">
              <div class="purchase-info-item">
                <span class="purchase-info-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9h-2Zm-8 0V7a3 3 0 1 1 6 0v2H9Zm4 5.7V18h-2v-3.3a2 2 0 1 1 2 0Z"/></svg></span>
                <p>Checkout is organized with contact, delivery, and payment details.</p>
              </div>

              <div class="purchase-info-item">
                <span class="purchase-info-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.3 4.9 13.7C1.2 10.3 3.2 4 8.2 4c1.8 0 3.2.8 3.8 2 .6-1.2 2-2 3.8-2 5 0 7 6.3 3.3 9.7L12 20.3Z"/></svg></span>
                <p>Save favorite gear and keep your cart ready while you browse.</p>
              </div>

              <div class="purchase-info-item">
                <span class="purchase-info-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 2 8 4.3v9.4L12 22l-8-6.3V6.3L12 2Zm0 2.4L6.7 7.2 12 10l5.3-2.8L12 4.4ZM6 9v5.7l5 3.9V12L6 9Zm12 0-5 3v6.6l5-3.9V9Z"/></svg></span>
                <p>Order history and package tracking stay easy to review.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      ${getProductHighlightsHTML(product)}

      <section class="product-information-section">
        <div class="product-info-panel">
          <div class="section-title-block">
            <p class="section-eyebrow">Product details</p>
            <h2>About this item</h2>
          </div>

          <div class="about-content">
            ${getProductAboutHTML(product)}
          </div>
        </div>

        <div class="product-info-panel">
          <div class="section-title-block">
            <p class="section-eyebrow">Specifications</p>
            <h2>Product information</h2>
          </div>

          <div class="specs-grid">
            ${generateSpecsHTML(product)}
          </div>
        </div>
      </section>

      ${getBuyerConfidenceHTML(product)}

      ${getProductRailHTML('Complete your kit', 'Recommended products', relatedProducts)}
      ${getProductRailHTML('Recently viewed', 'Your browsing history', recentlyViewedProducts)}
    </div>
  `;
}

function renderProductError(container, message) {
  container.innerHTML = `
    <div class="product-detail-page">
      <div class="product-error-state">
        <div class="product-error-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 1.8 20h20.4L12 2Zm1 14h-2v2h2v-2Zm0-7h-2v5h2V9Z"/></svg></div>

        <h2>Product details are not available</h2>

        <p>${escapeHTML(message)}</p>

        <div class="product-error-actions">
          <a href="index.html" class="button-primary">
            Back to Shopping
          </a>

          <a href="index.html?sport=football" class="button-secondary">
            Browse Football
          </a>
        </div>
      </div>
    </div>
  `;
}

function initializeProductGallery() {
  const gallery = document.querySelector('.js-product-gallery');
  const mainImage = gallery?.querySelector('.js-product-main-image');

  if (!gallery || !mainImage) {
    return;
  }

  gallery.addEventListener('click', (event) => {
    const thumbnail = event.target.closest('.js-product-thumbnail');

    if (!thumbnail) {
      return;
    }

    mainImage.src = thumbnail.dataset.imageUrl;

    gallery.querySelectorAll('.js-product-thumbnail').forEach((button) => {
      button.classList.toggle('active', button === thumbnail);
      button.setAttribute('aria-pressed', button === thumbnail ? 'true' : 'false');
    });
  });
}

function initializeBuyNowButton(product) {
  const buyNowButton = document.querySelector('.js-buy-now');

  if (!buyNowButton) {
    return;
  }

  buyNowButton.addEventListener('click', () => {
    const quantity = getSelectedDetailQuantity(product.id);

    addToCart(product.id, quantity);
    trackProductPurchase(product.id);
    updateCartQuantity();

    window.location.href = 'checkout.html';
  });
}

function initializeShareButton() {
  const shareButton = document.querySelector('.js-share-product');

  if (!shareButton) {
    return;
  }

  shareButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      shareButton.textContent = 'Product link copied ✓';
    } catch (error) {
      console.warn('Could not copy the product link automatically.', error);
      shareButton.textContent = 'Copy this page URL from the address bar';
    }

    window.setTimeout(() => {
      shareButton.textContent = 'Copy product link';
    }, 2200);
  });
}

function initializeProductPageInteractions(product) {
  initializeAddToCartButtons();
  initializeQuantityButtons();
  initializeProductGallery();
  initializeBuyNowButton(product);
  initializeShareButton();

  const productPage = document.querySelector('.product-detail-page');

  if (productPage) {
    initializeWishlistButtonsInContainer(productPage);
  }

  updateCartQuantity();
  updateWishlistCounter();
  trackProductView(product.id);
}

async function renderProductPage() {
  const productDetailsContainer = document.querySelector('.js-product-details-container');

  if (!productDetailsContainer) {
    return;
  }

  createLoadingOverlay('Loading product details...');

  try {
    const url = new URL(window.location.href);
    const productId = url.searchParams.get('id');

    if (!productId) {
      throw new Error('No product id was provided in the URL.');
    }

    await loadProductsFetch();

    const product = getProduct(productId);

    if (!product) {
      throw new Error(`Product with id "${productId}" was not found.`);
    }

    const pageData = {
      relatedProducts: getRelatedProducts(product),
      recentlyViewedProducts: getRecentlyViewedProducts(product.id)
    };

    productDetailsContainer.innerHTML = renderProductDetails(product, pageData);
    initializeProductPageInteractions(product);
  } catch (error) {
    console.error('Error loading product page:', error);
    renderProductError(productDetailsContainer, error.message);
  } finally {
    removeLoadingOverlay();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderProductPage);
} else {
  renderProductPage();
}
