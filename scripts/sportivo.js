// scripts/sportivo.js

// Import all modules
import { cart, addToCart, calculateCartQuantity } from '../data/cart.js';
import { products, loadProducts } from '../data/products.js';
import { SearchManager } from './search-manager.js';
import { updateWishlistCounter } from './wishlist-manager.js';
import { filterProductsBySport, initializeSportFilter } from './sport-filter.js';
import { updateProductsDisplay } from './product-renderer.js';
import { updateCartQuantity } from './cart-manager.js';
import { initializeRecommendations, showMainPageRecommendations } from './recommendations-manager.js';
import { showReviewsModal } from './reviews-manager.js';
import { showSkeletonProducts } from './utils/loading.js';
import { showModal } from './shared/region-modal.js'; // <-- NEW IMPORT

// Global search manager
let searchManager;

function initializeSearch() {
  searchManager = new SearchManager();
}

// Initialize recommendations tracking
initializeRecommendations();

// Function to initialize the region selector
function initializeRegionSelector() {
    const regionChange = document.querySelector('.region-change');
    
    if (regionChange) {
        regionChange.addEventListener('click', () => {
            showModal();
        });
    }

    // Load saved region on page load
    const savedRegion = localStorage.getItem('userRegion');
    const savedCurrency = localStorage.getItem('userCurrency');
    const savedFlag = localStorage.getItem('userFlag');
    if (savedRegion && savedCurrency && savedFlag) {
        const regionElement = document.querySelector('.footer-region span:first-child');
        if (regionElement) {
            regionElement.textContent = `${savedFlag} ${savedRegion} / ${savedCurrency}`;
        }
    }
}


export function renderProductsGrid() {
  const url = new URL(window.location.href);
  const search = url.searchParams.get('search');
  const sport = url.searchParams.get('sport') || 'all';
  
  let filteredProducts = products;

  // Apply sport filter
  filteredProducts = filterProductsBySport(sport, filteredProducts);

  // Apply search filter
  if (search) {
    filteredProducts = filteredProducts.filter((product) => {
      let matchingKeyword = false;

      product.keywords.forEach((keyword) => {
        if (keyword.toLowerCase().includes(search.toLowerCase())) {
          matchingKeyword = true;
        }
      });

      return matchingKeyword ||
        product.name.toLowerCase().includes(search.toLowerCase());
    });
  }

  updateProductsDisplay(filteredProducts);
  initializeSportFilter(sport);
  updateCartQuantity();
  updateWishlistCounter();
  
  // Show recommendations (only on main page without filters/search)
  showMainPageRecommendations();

  // Search functionality
  document.querySelector('.js-search-button')
    .addEventListener('click', () => {
      const search = document.querySelector('.js-search-bar').value;
      if (search.trim()) {
        window.location.href = `sportivo.html?search=${encodeURIComponent(search)}`;
      }
    });

  // Extra feature: searching by pressing "Enter" on the keyboard.
  document.querySelector('.js-search-bar')
    .addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const searchTerm = document.querySelector('.js-search-bar').value;
        if (searchTerm.trim()) {
          window.location.href = `sportivo.html?search=${encodeURIComponent(searchTerm)}`;
        }
      }
    });

  initializeSearch();
  
  // Initialize the region selector
  initializeRegionSelector();
}

// Initialize the page with loading state
async function initializePage() {
  const productsGrid = document.querySelector('.js-products-grid');
  
  // Show skeleton loading for better UX
  showSkeletonProducts(productsGrid, 8);
  
  try {
    await loadProducts(renderProductsGrid);
    // Loading is hidden automatically when products render
  } catch (error) {
    productsGrid.innerHTML = `
      <div class="error-state">
        <h3>Unable to load products</h3>
        <p>Please check your connection and try again.</p>
        <button class="retry-button button-primary" onclick="location.reload()">
          Try Again
        </button>
      </div>
    `;
    console.error('Error loading products:', error);
  }
}

// Initialize the page
initializePage();