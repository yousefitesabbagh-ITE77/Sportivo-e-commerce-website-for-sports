// scripts/recommendations-manager.js

import { getRecommendations, getCustomersAlsoBought, trackSearch } from '../data/recommendations.js';
import { products } from '../data/products.js';
import { productCardHTML, initializeProductCardInteractions } from './product-renderer.js';

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function initializeRecommendations() {
  trackSearches();
}

function trackSearches() {
  const searchButton = document.querySelector('.js-search-button');
  const searchBar = document.querySelector('.js-search-bar');

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      trackSearch(searchBar?.value || '');
    });
  }

  if (searchBar) {
    searchBar.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        trackSearch(searchBar.value);
      }
    });
  }
}

export function showMainPageRecommendations() {
  if (!shouldShowRecommendations()) {
    return;
  }

  const recommendations = getRecommendations(products);
  const productsToShow = recommendations.length > 0
    ? recommendations
    : [...products]
        .sort((a, b) => (Number(b.rating?.stars) || 0) - (Number(a.rating?.stars) || 0))
        .slice(0, 8);

  if (productsToShow.length === 0) {
    return;
  }

  showRecommendationsSection(
    recommendations.length > 0 ? 'Recommended for you' : 'Popular products',
    productsToShow
  );
}

export function showCustomersAlsoBought(productId) {
  const alsoBought = getCustomersAlsoBought(productId, products);

  if (alsoBought.length === 0) {
    return '';
  }

  return `
    <section class="detail-products-rail also-bought-products-section">
      <div class="section-title-block detail-rail-header">
        <div>
          <p class="section-eyebrow">Popular pairings</p>
          <h2>Customers also explore</h2>
        </div>

        <a href="index.html" class="detail-rail-link">Browse all products</a>
      </div>

      <div class="detail-products-grid">
        ${alsoBought.map((product) => `
          <article class="mini-product-card" data-product-id="${escapeHTML(product.id)}">
            <a class="mini-product-image-link" href="product.html?id=${encodeURIComponent(product.id)}">
              <img src="${escapeHTML(product.getImageUrl())}" alt="${escapeHTML(product.name)}" loading="lazy">
            </a>

            <div class="mini-product-card-body">
              <h3>
                <a href="product.html?id=${encodeURIComponent(product.id)}">
                  ${escapeHTML(product.name)}
                </a>
              </h3>

              <div class="compact-rating" aria-label="${Number(product.rating?.stars || 0).toFixed(1)} out of 5 stars">
                <span>★</span>
                <strong>${Number(product.rating?.stars || 0).toFixed(1)}</strong>
                <small>(${Number(product.rating?.count || 0).toLocaleString()})</small>
              </div>

              <strong class="mini-product-price">${product.getPrice()}</strong>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function showRecommendationsSection(title, recommendedProducts) {
  const productsGrid = document.querySelector('.js-products-grid');

  if (!productsGrid) {
    return;
  }

  const recommendationsHTML = `
    <section class="recommendations-section unified-product-recommendations">
      <div class="section-title-block recommendations-header">
        <p class="section-eyebrow">Picked for you</p>
        <h2>${escapeHTML(title)}</h2>
      </div>

      <div class="products-grid recommendations-grid">
        ${recommendedProducts.map((product) => productCardHTML(product)).join('')}
      </div>
    </section>
  `;

  productsGrid.insertAdjacentHTML('beforebegin', recommendationsHTML);

  const newRecommendationsSection = productsGrid.previousElementSibling;
  initializeProductCardInteractions(newRecommendationsSection);
}

function shouldShowRecommendations() {
  const url = new URL(window.location.href);
  const sport = url.searchParams.get('sport');
  const search = url.searchParams.get('search');
  const category = url.searchParams.get('category');
  const price = url.searchParams.get('price');

  return !sport && !search && !category && !price;
}
