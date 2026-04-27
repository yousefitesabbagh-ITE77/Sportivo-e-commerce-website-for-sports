// scripts/search-manager.js

import { products } from '../data/products.js';

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export class SearchManager {
  constructor() {
    this.searchBar = document.querySelector('.js-search-bar');
    this.searchButton = document.querySelector('.js-search-button');
    this.suggestionsContainer = document.querySelector('.js-search-suggestions');

    this.init();
  }

  init() {
    if (!this.searchBar || !this.searchButton || !this.suggestionsContainer) {
      return;
    }

    this.searchBar.setAttribute('aria-expanded', 'false');
    this.searchBar.setAttribute('aria-autocomplete', 'list');
    this.suggestionsContainer.setAttribute('role', 'listbox');

    this.bindEvents();
  }

  bindEvents() {
    this.searchBar.addEventListener('input', this.debounce(() => {
      this.handleInput();
    }, 250));

    this.searchBar.addEventListener('focus', () => {
      if (this.searchBar.value.trim()) {
        this.handleInput();
      }
    });

    document.addEventListener('click', (event) => {
      if (
        !this.searchBar.contains(event.target) &&
        !this.suggestionsContainer.contains(event.target)
      ) {
        this.hideSuggestions();
      }
    });

    this.searchButton.addEventListener('click', () => {
      this.performSearch(this.searchBar.value);
    });

    this.searchBar.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.performSearch(this.searchBar.value);
      }

      if (event.key === 'Escape') {
        this.hideSuggestions();
      }
    });
  }

  handleInput() {
    const searchTerm = this.searchBar.value.trim();

    if (searchTerm.length === 0) {
      this.hideSuggestions();
      return;
    }

    const suggestions = this.getSearchSuggestions(searchTerm);
    this.displaySuggestions(suggestions, searchTerm);
  }

  getSearchSuggestions(searchTerm) {
    const term = searchTerm.toLowerCase();

    return products.filter((product) => {
      const searchText = typeof product.getSearchText === 'function'
        ? product.getSearchText()
        : [
          product.name,
          product.brand,
          product.category,
          product.sport,
          ...(product.keywords || []),
          ...(product.tags || [])
        ].join(' ').toLowerCase();

      return searchText.includes(term);
    }).slice(0, 6);
  }

  displaySuggestions(suggestions, searchTerm) {
    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    const suggestionsHTML = suggestions.map((product) => {
      const productName = escapeHTML(product.name);
      const productBrand = escapeHTML(product.brand || 'Sportivo');
      const productCategory = escapeHTML(product.category || 'Sports Gear');
      const productPrice = escapeHTML(product.getPrice());

      return `
        <button class="suggestion-item" data-product-id="${product.id}" type="button" role="option">
          <img class="suggestion-image" src="${product.getImageUrl()}" alt="${productName}" loading="lazy">
          <span class="suggestion-info">
            <span class="suggestion-name">${productName}</span>
            <span class="suggestion-meta">${productBrand} · ${productCategory}</span>
            <span class="suggestion-price">${productPrice}</span>
          </span>
        </button>
      `;
    }).join('');

    const safeSearchTerm = escapeHTML(searchTerm);

    this.suggestionsContainer.innerHTML = `
      ${suggestionsHTML}
      <button class="suggestion-item search-all-item" data-search-term="${safeSearchTerm}" type="button" role="option">
        <span class="search-all-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Zm0-2.2a5.1 5.1 0 1 0 0-10.2 5.1 5.1 0 0 0 0 10.2Zm5.8.2 4.1 4.1-1.6 1.6-4.1-4.1 1.6-1.6Z"/></svg></span>
        <span class="search-all-text">Search for "${safeSearchTerm}"</span>
      </button>
    `;

    this.showSuggestions();
    this.bindSuggestionEvents();
  }

  showSuggestions() {
    this.suggestionsContainer.style.display = 'block';
    this.searchBar.setAttribute('aria-expanded', 'true');
    this.suggestionsContainer.style.top = 'calc(100% + 8px)';
    this.suggestionsContainer.style.left = '0';
    this.suggestionsContainer.style.width = '100%';
  }

  hideSuggestions() {
    this.suggestionsContainer.style.display = 'none';
    this.searchBar.setAttribute('aria-expanded', 'false');
  }

  bindSuggestionEvents() {
    this.suggestionsContainer.querySelectorAll('.suggestion-item[data-product-id]').forEach((item) => {
      item.addEventListener('click', () => {
        const productId = item.dataset.productId;
        const product = products.find((matchingProduct) => matchingProduct.id === productId);

        if (product) {
          window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
        }
      });
    });

    this.suggestionsContainer.querySelectorAll('.search-all-item').forEach((item) => {
      item.addEventListener('click', () => {
        const searchTerm = item.dataset.searchTerm;
        this.performSearch(searchTerm);
      });
    });
  }

  performSearch(searchTerm) {
    const safeSearchTerm = searchTerm.trim();

    if (!safeSearchTerm) {
      return;
    }

    this.searchBar.value = safeSearchTerm;
    this.hideSuggestions();

    const currentPath = window.location.pathname.toLowerCase();
    const isProductsPage = currentPath.endsWith('/index.html') ||
      currentPath.endsWith('/sportivo.html') ||
      currentPath === '/' ||
      currentPath.endsWith('/');

    if (isProductsPage) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('search', safeSearchTerm);
      currentUrl.hash = 'products';
      window.location.href = currentUrl.toString();
      return;
    }

    window.location.href = `index.html?search=${encodeURIComponent(safeSearchTerm)}#products`;
  }

  debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }
}
