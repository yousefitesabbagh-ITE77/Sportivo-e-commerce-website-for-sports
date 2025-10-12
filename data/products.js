// data/products.js

import {formatCurrency} from '../scripts/utils/money.js';
import { formatPrice } from '../scripts/shared/currency-manager.js'; // <-- NEW IMPORT

export function getProduct(productId) {
  let matchingProduct;
      
  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });
  return matchingProduct; 
}

class Product {
  id;
  image;
  name;
  rating;
  priceCents;
  keywords;

  constructor(productDetails) {
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.rating = productDetails.rating;
    this.priceCents = productDetails.priceCents;
    this.keywords = productDetails.keywords;
  }

  getStarsUrl() {
    return `images/ratings/rating-${this.rating.stars * 10}.png`;
  }

  // UPDATED: This method now uses the currency manager
  getPrice() {
    return formatPrice(this.priceCents);
  }

  extraInfoHTML() {
    return '';
  }

  // New method to get sport category from keywords
  getSportCategory() {
    if (this.keywords.includes('football')) return 'football';
    if (this.keywords.includes('basketball')) return 'basketball';
    if (this.keywords.includes('table tennis') || this.keywords.includes('ping pong')) return 'tabletennis';
    if (this.keywords.includes('vollyball')) return 'vollyball';
    return 'all';
  }

  // NEW: Image URL with error handling
  getImageUrl() {
    return this.image || 'images/products/placeholder.jpg';
  }

  // NEW: Rating HTML with beautiful arrow only
getRatingHTML() {
  const fullStars = '★'.repeat(Math.floor(this.rating.stars));
  const hasHalfStar = this.rating.stars % 1 >= 0.5;
  const emptyStars = '☆'.repeat(5 - Math.ceil(this.rating.stars));
  
  const starDisplay = fullStars + (hasHalfStar ? '½' : '') + emptyStars;

  return `
    <div class="product-rating-container js-rating-container" data-product-id="${this.id}">
      <div class="rating-summary js-rating-summary">
        <span class="star-display">${starDisplay}</span>
        <span class="rating-arrow">▼</span>
      </div>
      <div class="rating-details js-rating-details">
        <div class="rating-header">
          <strong>${this.rating.stars} out of 5</strong>
        </div>
        <div class="rating-subheader">
          Average rating: ${this.rating.stars} out of 5 stars
        </div>
        <div class="rating-count">
          ${this.rating.count.toLocaleString()} global ratings
        </div>
        <div class="rating-bars">
          ${this.getRatingBarsHTML()}
        </div>
      </div>
    </div>
  `;
}

  // NEW: Generate rating bars HTML
  getRatingBarsHTML() {
    const stars = [5, 4, 3, 2, 1];
    let barsHTML = '';

    stars.forEach(star => {
      const percentage = this.rating.distribution[star] || 0;
      const barWidth = Math.max(percentage * 2, 5); // Minimum 5px width for visibility
      
      barsHTML += `
        <div class="rating-bar">
          <span class="star-label">${star} star</span>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${barWidth}px"></div>
          </div>
          <span class="percentage">${percentage}%</span>
        </div>
      `;
    });

    return barsHTML;
  }

  // Add this method to your existing Product class
getReviewStats() {
  // This will be populated by the reviews system
  return {
    averageRating: this.rating.stars,
    totalReviews: this.rating.count
  };
}

}


export let products = [];

export function loadProductsFetch() {
  const promise = fetch(
    'http://localhost:3000/products/all'  // ← CHANGED to your backend
  ).then((response) => {
    return response.json();
  }).then((productsData) => {
    // Simplified - all products use base Product class
    products = productsData.map((productDetails) => {
      return new Product(productDetails);
    });

    console.log('Sports products loaded successfully!');
    console.log(`Loaded ${products.length} products`);
  }).catch((error) => {
    console.log('Unexpected error. Please try again later.');
    console.error('Error details:', error);
  });

  return promise;
}

/*
// You can test like this:
loadProductsFetch().then(() => {
  console.log('Products loaded:', products);
});
*/

export function loadProducts(fun) {
  const xhr = new XMLHttpRequest();
  
  xhr.addEventListener('load', () => {
    try {
      products = JSON.parse(xhr.response).map((productDetails) => {
        return new Product(productDetails);  // ← Simplified
      });

      console.log('Sports products loaded successfully!');
      console.log(`Loaded ${products.length} products`);
      fun();
    } catch (error) {
      console.log('Error parsing products data');
      console.error('Error details:', error);
    }
  });

  xhr.addEventListener('error', () => {
    console.log('Unexpected error. Please try again later.');
  });

  xhr.open('GET', 'http://localhost:3000/products/all');  // ← CHANGED to your backend
  xhr.send();
}