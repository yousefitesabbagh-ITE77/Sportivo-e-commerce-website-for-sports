// scripts/product-renderer.js

import { products } from '../data/products.js';
import { initializeAddToCartButtons } from './cart-manager.js';
import { initializeQuantityButtons } from './quantity-manager.js';
import { initializeWishlistButtons } from './wishlist-manager.js';
import { initializeRatingToggles } from './rating-manager.js';
import { trackProductView } from '../data/recommendations.js';

const SPORT_LABELS = {
  all: 'All Sports',
  football: 'Football',
  basketball: 'Basketball',
  tabletennis: 'Table Tennis',
  volleyball: 'Volleyball'
};

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getProductSportLabel(product) {
  const sportKey = product.getSportCategory?.() || product.sport || 'all';
  return SPORT_LABELS[sportKey] || 'Sport';
}

function getContextLabels(context) {
  return {
    sports: context.labels?.sports || SPORT_LABELS,
    categories: context.labels?.categories || {},
    prices: context.labels?.prices || {},
    sorts: context.labels?.sorts || {}
  };
}

function getFilterRemovalUrl(paramName) {
  const url = new URL(window.location.href);
  url.searchParams.delete(paramName);
  url.hash = 'products';
  return url.toString();
}

function getResultsSummaryHTML(filteredProducts, context) {
  const {
    searchTerm = '',
    sportFilter = 'all',
    categoryFilter = 'all',
    priceFilter = 'all',
    sortBy = 'featured',
    totalProducts = products.length
  } = context;

  const labels = getContextLabels(context);
  const activeFilters = [];

  if (searchTerm) {
    activeFilters.push({
      label: `Search: "${searchTerm}"`,
      href: getFilterRemovalUrl('search')
    });
  }

  if (sportFilter !== 'all') {
    activeFilters.push({
      label: `Sport: ${labels.sports[sportFilter] || sportFilter}`,
      href: getFilterRemovalUrl('sport')
    });
  }

  if (categoryFilter !== 'all') {
    activeFilters.push({
      label: `Category: ${labels.categories[categoryFilter] || categoryFilter}`,
      href: getFilterRemovalUrl('category')
    });
  }

  if (priceFilter !== 'all') {
    activeFilters.push({
      label: `Price: ${labels.prices[priceFilter] || priceFilter}`,
      href: getFilterRemovalUrl('price')
    });
  }

  if (sortBy !== 'featured') {
    activeFilters.push({
      label: `Sort: ${labels.sorts[sortBy] || sortBy}`,
      href: getFilterRemovalUrl('sort')
    });
  }

  return `
    <div class="products-results-summary">
      <div>
        <strong>${filteredProducts.length}</strong>
        <span>of ${totalProducts} products shown</span>
      </div>

      ${activeFilters.length > 0 ? `
        <div class="active-filter-list" aria-label="Active filters">
          ${activeFilters.map((filter) => `
            <a class="active-filter-pill" href="${filter.href}">
              <span>${escapeHTML(filter.label)}</span>
              <span aria-hidden="true">×</span>
            </a>
          `).join('')}
        </div>
      ` : `
        <span class="catalog-status-note">Showing our best picks across the full catalog.</span>
      `}
    </div>
  `;
}

function getEmptyStateHTML(context) {
  const {
    searchTerm = '',
    sportFilter = 'all',
    categoryFilter = 'all',
    priceFilter = 'all'
  } = context;

  const labels = getContextLabels(context);
  const hasSearch = Boolean(searchTerm);
  const hasSportFilter = sportFilter !== 'all';
  const hasCategoryFilter = categoryFilter !== 'all';
  const hasPriceFilter = priceFilter !== 'all';
  const sportLabel = labels.sports[sportFilter] || 'this sport';
  const categoryLabel = labels.categories[categoryFilter] || 'this category';

  let title = 'No products found';
  let message = 'Try changing your search, category, price range, or sport filter.';

  if (hasSearch && hasSportFilter) {
    title = `No results for "${escapeHTML(searchTerm)}" in ${sportLabel}`;
    message = 'Try a broader search term or browse all sports products.';
  } else if (hasSearch) {
    title = `No results for "${escapeHTML(searchTerm)}"`;
    message = 'Try searching for football, basketball, volleyball, table tennis, brand names, or product categories.';
  } else if (hasSportFilter && hasCategoryFilter) {
    title = `No ${categoryLabel} products in ${sportLabel}`;
    message = 'Try another category or browse all products.';
  } else if (hasSportFilter) {
    title = `No products found in ${sportLabel}`;
    message = 'This sport does not have products that match the selected filters.';
  } else if (hasCategoryFilter) {
    title = `No ${categoryLabel} products found`;
    message = 'Try another category or browse all products.';
  } else if (hasPriceFilter) {
    title = 'No products in this price range';
    message = 'Try another price range or clear filters.';
  }

  return `
    <div class="product-state-card product-empty-state">
      <div class="product-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false"><path d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Zm0-2.2a5.1 5.1 0 1 0 0-10.2 5.1 5.1 0 0 0 0 10.2Zm5.8.2 4.1 4.1-1.6 1.6-4.1-4.1 1.6-1.6Z"/></svg>
      </div>
      <h3>${title}</h3>
      <p>${message}</p>

      <div class="product-state-actions">
        <a href="index.html" class="button-primary product-state-button">
          Browse all products
        </a>
        <a href="index.html?sport=football" class="button-secondary product-state-button">
          View football
        </a>
        <a href="index.html?sport=basketball" class="button-secondary product-state-button">
          View basketball
        </a>
      </div>
    </div>
  `;
}

function getPriceHTML(product) {
  const oldPrice = product.getOldPrice?.() || '';
  const discountPercentage = product.getDiscountPercentage?.() || 0;

  return `
    <div class="product-price-stack">
      <div class="product-price">
        ${product.getPrice()}
      </div>
      ${oldPrice ? `
        <div class="product-old-price-row">
          <span class="product-old-price">${oldPrice}</span>
          <span class="product-discount">Save ${discountPercentage}%</span>
        </div>
      ` : ''}
    </div>
  `;
}

function getTagsHTML(product) {
  if (!Array.isArray(product.tags) || product.tags.length === 0) {
    return '';
  }

  return `
    <div class="product-tag-list">
      ${product.tags.slice(0, 3).map((tag) => `<span>${escapeHTML(tag)}</span>`).join('')}
    </div>
  `;
}

export function productCardHTML(product) {
  const productUrl = `product.html?id=${encodeURIComponent(product.id)}`;
  const productName = escapeHTML(product.name);
  const productCategory = escapeHTML(product.category || 'Sports Gear');
  const productBrand = escapeHTML(product.brand || 'Sportivo');
  const productSportLabel = escapeHTML(getProductSportLabel(product));
  const productBadge = product.badge ? escapeHTML(product.badge) : productSportLabel;
  const isInStock = product.isInStock?.() ?? true;
  const stockClass = product.isLowStock?.() ? 'product-stock-label-low' : '';

  return `
    <article class="product-container product-card js-product-container" data-product-id="${product.id}">
      <div class="product-card-top">
        <span class="product-card-badge">${productBadge}</span>

        <div class="product-card-actions">
          <button
            class="wishlist-button js-wishlist-button"
            data-product-id="${product.id}"
            title="Add to Wishlist"
            aria-label="Add ${productName} to wishlist"
            type="button"
          >
            <span aria-hidden="true">♥</span>
          </button>

        </div>
      </div>

      <div class="product-image-container product-card-image">
        <a href="${productUrl}" aria-label="View details for ${productName}">
          <img
            class="product-image"
            src="${product.getImageUrl()}"
            alt="${productName}"
            loading="lazy"
          >
        </a>
      </div>

      <div class="product-card-body">
        <div class="product-card-meta">
          <span>${productBrand}</span>
          <span>${productCategory}</span>
        </div>

        <h3 class="product-name limit-text-to-2-lines">
          <a href="${productUrl}">${productName}</a>
        </h3>

        ${product.getRatingHTML()}

        ${getTagsHTML(product)}

        <div class="product-price-row">
          ${getPriceHTML(product)}

          <span class="product-stock-label ${stockClass}">
            ${escapeHTML(product.getStockLabel?.() || 'In stock')}
          </span>
        </div>

        <div class="product-quantity-container">
          <span class="quantity-label-text">Qty</span>

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

        ${product.extraInfoHTML()}

        <div class="product-spacer"></div>

        <div class="added-to-cart js-added-to-cart-${product.id}">
          <img src="images/icons/checkmark.png" alt="">
          Added to cart
        </div>

        <button
          class="add-to-cart-button button-primary js-add-to-cart"
          data-product-id="${product.id}"
          aria-label="Add ${productName} to cart"
          type="button"
          ${!isInStock ? 'disabled' : ''}
        >
          ${isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  `;
}

export function updateProductsDisplay(filteredProducts, context = {}) {
  const productsGrid = document.querySelector('.js-products-grid');
  const catalogStatus = document.querySelector('.js-catalog-status');

  if (!productsGrid) {
    return;
  }

  const safeProducts = Array.isArray(filteredProducts) ? filteredProducts : [];

  if (catalogStatus) {
    catalogStatus.innerHTML = getResultsSummaryHTML(safeProducts, context);
  }

  if (safeProducts.length === 0) {
    productsGrid.innerHTML = getEmptyStateHTML(context);
    return;
  }

  const productsHTML = safeProducts
    .map((product) => productCardHTML(product))
    .join('');

  productsGrid.innerHTML = productsHTML;

  initializeProductCardInteractions();
}

export function initializeProductCardInteractions() {
  initializeAddToCartButtons();
  initializeQuantityButtons();
  initializeWishlistButtons();
  initializeRatingToggles();
  initializeProductTracking();
}

function initializeProductTracking() {
  document.querySelectorAll('.js-product-container').forEach((container) => {
    if (container.dataset.trackingInitialized === 'true') {
      return;
    }

    container.dataset.trackingInitialized = 'true';
    container.addEventListener('click', (event) => {
      const ignoredElement = event.target.closest(
        '.js-add-to-cart, .js-wishlist-button, .js-quantity-selector, .js-rating-container, a'
      );

      if (ignoredElement) {
        return;
      }

      const productId = container.dataset.productId;

      if (productId) {
        trackProductView(productId);
        window.location.href = `product.html?id=${encodeURIComponent(productId)}`;
      }
    });
  });
}
