// scripts/sportivo.js

import { products, loadProducts } from '../data/products.js';
import { SearchManager } from './search-manager.js';
import { updateWishlistCounter } from './wishlist-manager.js';
import { filterProductsBySport } from './sport-filter.js';
import { updateProductsDisplay } from './product-renderer.js';
import { updateCartQuantity } from './cart-manager.js';
import {
  initializeRecommendations,
  showMainPageRecommendations
} from './recommendations-manager.js';
import { showSkeletonProducts } from './utils/loading.js';

const SPORT_LABELS = {
  all: 'All Sports',
  football: 'Football',
  basketball: 'Basketball',
  tabletennis: 'Table Tennis',
  volleyball: 'Volleyball'
};

const CATEGORY_LABELS = {
  all: 'All categories',
  accessories: 'Accessories',
  bags: 'Bags',
  balls: 'Balls',
  care: 'Care',
  equipment: 'Equipment',
  shoes: 'Shoes',
  protection: 'Protection',
  training: 'Training'
};

const PRICE_LABELS = {
  all: 'All prices',
  under25: 'Under $25',
  '25to50': '$25 to $50',
  '50to75': '$50 to $75',
  over75: 'Over $75'
};

const SORT_LABELS = {
  featured: 'Featured',
  newest: 'Newest',
  priceLowHigh: 'Price: low to high',
  priceHighLow: 'Price: high to low',
  ratingHighLow: 'Top rated'
};

let searchManager;

function getPageFilters() {
  const url = new URL(window.location.href);

  return {
    searchTerm: (url.searchParams.get('search') || '').trim(),
    sportFilter: url.searchParams.get('sport') || 'all',
    categoryFilter: url.searchParams.get('category') || 'all',
    priceFilter: url.searchParams.get('price') || 'all',
    sortBy: url.searchParams.get('sort') || 'featured'
  };
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function productMatchesSearch(product, searchTerm) {
  const normalizedSearchTerm = normalizeText(searchTerm);

  if (!normalizedSearchTerm) {
    return true;
  }

  if (typeof product.getSearchText === 'function') {
    return product.getSearchText().includes(normalizedSearchTerm);
  }

  const keywordMatch = Array.isArray(product.keywords)
    ? product.keywords.some((keyword) => normalizeText(keyword).includes(normalizedSearchTerm))
    : false;

  return (
    normalizeText(product.name).includes(normalizedSearchTerm) ||
    normalizeText(product.brand).includes(normalizedSearchTerm) ||
    normalizeText(product.category).includes(normalizedSearchTerm) ||
    normalizeText(product.getSportCategory?.() || product.sport).includes(normalizedSearchTerm) ||
    keywordMatch
  );
}

function productMatchesCategory(product, categoryFilter) {
  if (categoryFilter === 'all') {
    return true;
  }

  return normalizeText(product.category) === normalizeText(categoryFilter);
}

function productMatchesPrice(product, priceFilter) {
  const price = Number(product.priceCents) || 0;

  if (priceFilter === 'under25') {
    return price < 2500;
  }

  if (priceFilter === '25to50') {
    return price >= 2500 && price <= 5000;
  }

  if (priceFilter === '50to75') {
    return price > 5000 && price <= 7500;
  }

  if (priceFilter === 'over75') {
    return price > 7500;
  }

  return true;
}

function sortProducts(productList, sortBy) {
  const sortedProducts = [...productList];

  if (sortBy === 'newest') {
    return sortedProducts.sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }

  if (sortBy === 'priceLowHigh') {
    return sortedProducts.sort((a, b) => a.priceCents - b.priceCents);
  }

  if (sortBy === 'priceHighLow') {
    return sortedProducts.sort((a, b) => b.priceCents - a.priceCents);
  }

  if (sortBy === 'ratingHighLow') {
    return sortedProducts.sort((a, b) => {
      const ratingDifference = b.rating.stars - a.rating.stars;
      return ratingDifference || b.rating.count - a.rating.count;
    });
  }

  return sortedProducts.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return Number(b.isFeatured) - Number(a.isFeatured);
    }

    const ratingDifference = b.rating.stars - a.rating.stars;
    return ratingDifference || a.priceCents - b.priceCents;
  });
}

function syncHeaderControls({ searchTerm }) {
  const searchBar = document.querySelector('.js-search-bar');

  if (searchBar) {
    searchBar.value = searchTerm;
  }
}

function updateFilterControlValues(filters) {
  const catalogSearchInput = document.querySelector('.js-catalog-search');
  const sportSelect = document.querySelector('.js-sport-filter');
  const categorySelect = document.querySelector('.js-category-filter');
  const priceSelect = document.querySelector('.js-price-filter');
  const sortSelect = document.querySelector('.js-sort-filter');

  if (catalogSearchInput) {
    catalogSearchInput.value = filters.searchTerm;
  }

  if (sportSelect) {
    sportSelect.value = filters.sportFilter;
  }

  if (categorySelect) {
    categorySelect.value = filters.categoryFilter;
  }

  if (priceSelect) {
    priceSelect.value = filters.priceFilter;
  }

  if (sortSelect) {
    sortSelect.value = filters.sortBy;
  }
}

function updateUrlParameter(paramName, paramValue, defaultValue = 'all') {
  const currentUrl = new URL(window.location.href);

  if (paramValue === defaultValue || !paramValue) {
    currentUrl.searchParams.delete(paramName);
  } else {
    currentUrl.searchParams.set(paramName, paramValue);
  }

  currentUrl.hash = 'products';
  window.location.href = currentUrl.toString();
}

function initializeFilterControls(filters) {
  const catalogSearchInput = document.querySelector('.js-catalog-search');
  const catalogSearchButton = document.querySelector('.js-apply-catalog-search');
  const sportSelect = document.querySelector('.js-sport-filter');
  const categorySelect = document.querySelector('.js-category-filter');
  const priceSelect = document.querySelector('.js-price-filter');
  const sortSelect = document.querySelector('.js-sort-filter');
  const clearButton = document.querySelector('.js-clear-product-filters');

  function applyCatalogSearch() {
    const searchTerm = catalogSearchInput?.value.trim() || '';
    const currentUrl = new URL(window.location.href);

    if (searchTerm) {
      currentUrl.searchParams.set('search', searchTerm);
    } else {
      currentUrl.searchParams.delete('search');
    }

    currentUrl.hash = 'products';
    window.location.href = currentUrl.toString();
  }

  if (catalogSearchButton && !catalogSearchButton.dataset.initialized) {
    catalogSearchButton.dataset.initialized = 'true';
    catalogSearchButton.addEventListener('click', applyCatalogSearch);
  }

  if (catalogSearchInput && !catalogSearchInput.dataset.initialized) {
    catalogSearchInput.dataset.initialized = 'true';
    catalogSearchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyCatalogSearch();
      }
    });
  }

  if (sportSelect && !sportSelect.dataset.initialized) {
    sportSelect.dataset.initialized = 'true';
    sportSelect.addEventListener('change', (event) => {
      updateUrlParameter('sport', event.target.value, 'all');
    });
  }

  if (categorySelect && !categorySelect.dataset.initialized) {
    categorySelect.dataset.initialized = 'true';
    categorySelect.addEventListener('change', (event) => {
      updateUrlParameter('category', event.target.value, 'all');
    });
  }

  if (priceSelect && !priceSelect.dataset.initialized) {
    priceSelect.dataset.initialized = 'true';
    priceSelect.addEventListener('change', (event) => {
      updateUrlParameter('price', event.target.value, 'all');
    });
  }

  if (sortSelect && !sortSelect.dataset.initialized) {
    sortSelect.dataset.initialized = 'true';
    sortSelect.addEventListener('change', (event) => {
      updateUrlParameter('sort', event.target.value, 'featured');
    });
  }

  if (clearButton && !clearButton.dataset.initialized) {
    clearButton.dataset.initialized = 'true';
    clearButton.addEventListener('click', () => {
      window.location.href = 'index.html#products';
    });
  }

  updateFilterControlValues(filters);
}

function hasActiveFilters(filters) {
  return Boolean(filters.searchTerm) ||
    filters.sportFilter !== 'all' ||
    filters.categoryFilter !== 'all' ||
    filters.priceFilter !== 'all' ||
    filters.sortBy !== 'featured';
}

function updateProductsSectionHeading(filters, resultCount, totalCount) {
  const titleElement = document.querySelector('#products-section-title');
  const eyebrowElement = document.querySelector('.homepage-products-section .section-eyebrow');
  const viewAllLink = document.querySelector('.homepage-products-section .view-all-link');
  const clearButton = document.querySelector('.js-clear-product-filters');

  if (!titleElement || !eyebrowElement) {
    return;
  }

  const sportLabel = SPORT_LABELS[filters.sportFilter] || SPORT_LABELS.all;
  const categoryLabel = CATEGORY_LABELS[filters.categoryFilter] || filters.categoryFilter;
  const activeFilterExists = hasActiveFilters(filters);

  eyebrowElement.textContent = `${resultCount} of ${totalCount} products`;

  if (filters.searchTerm && filters.sportFilter !== 'all') {
    titleElement.textContent = `Results for "${filters.searchTerm}" in ${sportLabel}`;
  } else if (filters.searchTerm) {
    titleElement.textContent = `Search results for "${filters.searchTerm}"`;
  } else if (filters.sportFilter !== 'all' && filters.categoryFilter !== 'all') {
    titleElement.textContent = `${sportLabel} ${categoryLabel}`;
  } else if (filters.sportFilter !== 'all') {
    titleElement.textContent = `${sportLabel} products`;
  } else if (filters.categoryFilter !== 'all') {
    titleElement.textContent = `${categoryLabel} products`;
  } else {
    eyebrowElement.textContent = 'Featured products';
    titleElement.textContent = 'Shop sports products';
  }

  if (viewAllLink) {
    viewAllLink.style.display = activeFilterExists ? 'inline-flex' : 'none';
  }

  if (clearButton) {
    clearButton.style.display = activeFilterExists ? 'inline-flex' : 'none';
  }
}

function removeExistingRecommendations() {
  document.querySelectorAll('.recommendations-section').forEach((section) => {
    section.remove();
  });
}

function initializeSearch() {
  if (searchManager) {
    return;
  }

  searchManager = new SearchManager();
}

export function renderProductsGrid() {
  const filters = getPageFilters();

  let filteredProducts = [...products];

  filteredProducts = filterProductsBySport(filters.sportFilter, filteredProducts)
    .filter((product) => productMatchesCategory(product, filters.categoryFilter))
    .filter((product) => productMatchesPrice(product, filters.priceFilter));

  if (filters.searchTerm) {
    filteredProducts = filteredProducts.filter((product) => {
      return productMatchesSearch(product, filters.searchTerm);
    });
  }

  filteredProducts = sortProducts(filteredProducts, filters.sortBy);

  syncHeaderControls(filters);
  initializeFilterControls(filters);
  updateProductsSectionHeading(filters, filteredProducts.length, products.length);

  removeExistingRecommendations();

  updateProductsDisplay(filteredProducts, {
    ...filters,
    totalProducts: products.length,
    labels: {
      sports: SPORT_LABELS,
      categories: CATEGORY_LABELS,
      prices: PRICE_LABELS,
      sorts: SORT_LABELS
    }
  });

  updateCartQuantity();
  updateWishlistCounter();
  initializeSearch();

  if (!hasActiveFilters(filters)) {
    showMainPageRecommendations();
  }
}

function renderProductsLoadError(error) {
  const productsGrid = document.querySelector('.js-products-grid');
  const titleElement = document.querySelector('#products-section-title');
  const eyebrowElement = document.querySelector('.homepage-products-section .section-eyebrow');

  if (titleElement) {
    titleElement.textContent = 'Products could not be loaded';
  }

  if (eyebrowElement) {
    eyebrowElement.textContent = 'Loading error';
  }

  if (productsGrid) {
    productsGrid.innerHTML = `
      <div class="product-state-card product-error-state">
        <div class="product-state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="M12 2 1.8 20h20.4L12 2Zm1 14h-2v2h2v-2Zm0-7h-2v5h2V9Z"/></svg>
        </div>
        <h3>Unable to load products</h3>
        <p>
          The product list could not be loaded. Please refresh the page and try again.
        </p>
        <button class="button-primary product-state-button js-retry-products" type="button">
          Try again
        </button>
      </div>
    `;

    productsGrid.querySelector('.js-retry-products')?.addEventListener('click', () => {
      location.reload();
    });
  }

  console.error('Error loading products:', error);
}

async function initializePage() {
  const productsGrid = document.querySelector('.js-products-grid');

  if (!productsGrid) {
    return;
  }

  showSkeletonProducts(productsGrid, 4);

  try {
    initializeRecommendations();
    await loadProducts(renderProductsGrid);
  } catch (error) {
    renderProductsLoadError(error);
  }
}

initializePage();
