// data/products.js

import { formatPrice } from '../scripts/shared/currency-manager.js';
import { productsData } from './products-data.js';

export let products = [];

export function getProduct(productId) {
  return products.find((product) => product.id === productId);
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

class Product {
  constructor(productDetails) {
    this.id = productDetails.id;
    this.name = productDetails.name;
    this.brand = productDetails.brand || 'Sportivo';
    this.category = productDetails.category || 'General';
    this.sport = productDetails.sport || 'all';
    this.image = productDetails.image || productDetails.images?.main || 'images/products/placeholder.jpg';
    this.priceCents = Number(productDetails.priceCents) || 0;
    this.oldPriceCents = Number(productDetails.oldPriceCents) || 0;
    this.stock = Number.isFinite(Number(productDetails.stock)) ? Number(productDetails.stock) : 0;
    this.badge = productDetails.badge || '';
    this.isFeatured = Boolean(productDetails.isFeatured);
    this.createdAt = productDetails.createdAt || '';
    this.tags = Array.isArray(productDetails.tags) ? productDetails.tags : [];
    this.keywords = Array.isArray(productDetails.keywords) ? productDetails.keywords : [];

    this.rating = {
      stars: Number(productDetails.rating?.stars) || 0,
      count: Number(productDetails.rating?.count) || 0,
      distribution: productDetails.rating?.distribution || {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      }
    };

    this.images = {
      main: productDetails.images?.main || this.image,
      gallery: Array.isArray(productDetails.images?.gallery) ? productDetails.images.gallery : []
    };

    this.description = productDetails.description || {
      summary: '',
      details: ''
    };

    this.specifications = productDetails.specifications || {};
  }

  getStarsUrl() {
    const roundedRating = Math.round(this.rating.stars * 2) * 5;
    return `images/ratings/rating-${roundedRating}.png`;
  }

  getPrice() {
    return formatPrice(this.priceCents);
  }

  getOldPrice() {
    if (!this.oldPriceCents || this.oldPriceCents <= this.priceCents) {
      return '';
    }

    return formatPrice(this.oldPriceCents);
  }

  getDiscountPercentage() {
    if (!this.oldPriceCents || this.oldPriceCents <= this.priceCents) {
      return 0;
    }

    return Math.round(((this.oldPriceCents - this.priceCents) / this.oldPriceCents) * 100);
  }

  isInStock() {
    return this.stock > 0;
  }

  isLowStock() {
    return this.stock > 0 && this.stock <= 10;
  }

  getStockLabel() {
    if (!this.isInStock()) {
      return 'Out of stock';
    }

    if (this.isLowStock()) {
      return `Only ${this.stock} left`;
    }

    return 'In stock';
  }

  extraInfoHTML() {
    return '';
  }

  getSportCategory() {
    if (this.sport) {
      return this.sport;
    }

    const normalizedKeywords = this.keywords.map((keyword) => normalizeText(keyword));

    if (normalizedKeywords.includes('football') || normalizedKeywords.includes('soccer')) {
      return 'football';
    }

    if (normalizedKeywords.includes('basketball')) {
      return 'basketball';
    }

    if (
      normalizedKeywords.includes('table tennis') ||
      normalizedKeywords.includes('ping pong') ||
      normalizedKeywords.includes('tabletennis')
    ) {
      return 'tabletennis';
    }

    if (normalizedKeywords.includes('volleyball')) {
      return 'volleyball';
    }

    return 'all';
  }

  getImageUrl() {
    return this.image || this.images.main || 'images/products/placeholder.jpg';
  }

  getSearchText() {
    return [
      this.name,
      this.brand,
      this.category,
      this.getSportCategory(),
      ...this.keywords,
      ...this.tags
    ].map(normalizeText).join(' ');
  }

  getRatingHTML() {
    const safeRating = Math.max(0, Math.min(Number(this.rating.stars) || 0, 5));
    const fullStars = '★'.repeat(Math.floor(safeRating));
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = '☆'.repeat(5 - Math.ceil(safeRating));
    const starDisplay = fullStars + (hasHalfStar ? '½' : '') + emptyStars;

    return `
      <div class="product-rating-container js-rating-container" data-product-id="${this.id}">
        <div class="rating-summary js-rating-summary">
          <span class="star-display">${starDisplay}</span>
          <span class="rating-score-inline">${safeRating.toFixed(1)}</span>
          <span class="rating-arrow">▼</span>
        </div>
        <div class="rating-details js-rating-details">
          <div class="rating-header">
            <strong>${safeRating.toFixed(1)} out of 5</strong>
          </div>
          <div class="rating-subheader">
            Average rating: ${safeRating.toFixed(1)} out of 5 stars
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

  getRatingBarsHTML() {
    const stars = [5, 4, 3, 2, 1];
    let barsHTML = '';

    stars.forEach((star) => {
      const percentage = Number(this.rating.distribution[star]) || 0;
      const barWidth = Math.max(percentage * 2, 5);

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

  getReviewStats() {
    return {
      averageRating: this.rating.stars,
      totalReviews: this.rating.count
    };
  }
}

function mapProducts(productList) {
  products = productList.map((productDetails) => {
    return new Product(productDetails);
  });

  return products;
}

export function loadProductsFetch() {
  return new Promise((resolve, reject) => {
    try {
      const loadedProducts = mapProducts(productsData);
      resolve(loadedProducts);
    } catch (error) {
      console.error('Error loading local products:', error);
      reject(error);
    }
  });
}

export function loadProducts(callback) {
  return loadProductsFetch().then(() => {
    if (typeof callback === 'function') {
      callback();
    }
  });
}
