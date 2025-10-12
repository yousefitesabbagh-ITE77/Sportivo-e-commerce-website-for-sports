import { products } from '../data/products.js';

export class SearchManager {
  constructor() {
    this.searchBar = document.querySelector('.js-search-bar');
    this.searchButton = document.querySelector('.js-search-button');
    this.suggestionsContainer = document.querySelector('.js-search-suggestions');
    
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Input event with debouncing for suggestions
    this.searchBar.addEventListener('input', this.debounce(() => {
      this.handleInput();
    }, 300));

    // Focus event to show suggestions
    this.searchBar.addEventListener('focus', () => {
      if (this.searchBar.value.trim()) {
        this.handleInput();
      }
    });

    // Click outside to close suggestions
    document.addEventListener('click', (e) => {
      if (!this.searchBar.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
        this.hideSuggestions();
      }
    });

    // Search button click
    this.searchButton.addEventListener('click', () => {
      this.performSearch(this.searchBar.value);
    });

    // Enter key to search
    this.searchBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(this.searchBar.value);
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
    
    // Get matching products
    const matchingProducts = products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.keywords.some(keyword => keyword.toLowerCase().includes(term))
    ).slice(0, 5); // Limit to 5 products

    return matchingProducts;
  }

  displaySuggestions(suggestions, searchTerm) {
    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    let suggestionsHTML = '';

    suggestions.forEach(product => {
      suggestionsHTML += `
        <div class="suggestion-item" data-product-id="${product.id}">
          <img class="suggestion-image" src="${product.getImageUrl()}" alt="${product.name}">
          <div class="suggestion-info">
            <div class="suggestion-name">${product.name}</div>
            <div class="suggestion-price">${product.getPrice()}</div>
          </div>
        </div>
      `;
    });

    // Add "Search for [term]" option
    suggestionsHTML += `
      <div class="suggestion-item search-all-item" data-search-term="${searchTerm}">
        <div class="search-all-icon">🔍</div>
        <div class="search-all-text">Search for "${searchTerm}"</div>
      </div>
    `;

    this.suggestionsContainer.innerHTML = suggestionsHTML;
    this.showSuggestions();
    this.bindSuggestionEvents();
  }

  showSuggestions() {
    this.suggestionsContainer.style.display = 'block';
    
    // Position suggestions directly below search bar
    const searchRect = this.searchBar.getBoundingClientRect();
    this.suggestionsContainer.style.top = (searchRect.bottom + window.scrollY) + 'px';
    this.suggestionsContainer.style.left = searchRect.left + 'px';
    this.suggestionsContainer.style.width = searchRect.width + 'px';
  }

  hideSuggestions() {
    this.suggestionsContainer.style.display = 'none';
  }

  bindSuggestionEvents() {
    // Product suggestion clicks
    this.suggestionsContainer.querySelectorAll('.suggestion-item[data-product-id]').forEach(item => {
      item.addEventListener('click', () => {
        const productId = item.dataset.productId;
        this.searchBar.value = ''; // Clear search bar
        this.hideSuggestions();
        // Redirect to search with the product name for better results
        const product = products.find(p => p.id === productId);
        if (product) {
          this.performSearch(product.name);
        }
      });
    });

    // Search all clicks
    this.suggestionsContainer.querySelectorAll('.search-all-item').forEach(item => {
      item.addEventListener('click', () => {
        const searchTerm = item.dataset.searchTerm;
        this.performSearch(searchTerm);
      });
    });
  }

  performSearch(searchTerm) {
    if (searchTerm.trim()) {
      // Clear the search bar and hide suggestions
      this.searchBar.value = '';
      this.hideSuggestions();
      
      // Redirect to search results
      window.location.href = `sportivo.html?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  }

  // Debounce function to limit API calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}