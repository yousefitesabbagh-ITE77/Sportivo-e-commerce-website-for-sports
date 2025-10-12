import { addReview, getReviewsForProduct, markReviewHelpful, getReviewStatistics } from '../data/reviews.js';
import { formatCurrency } from './utils/money.js';
import { showCustomersAlsoBought } from './recommendations-manager.js';

export function initializeReviews() {
  // We'll call this from product pages later
}

// Show reviews modal for a product
export function showReviewsModal(product) {
  const reviews = getReviewsForProduct(product.id);
  const stats = getReviewStatistics(product.id);
  
  // Get customers also bought section
  const alsoBoughtHTML = showCustomersAlsoBought(product.id);
  
  const modalHTML = `
    <div class="reviews-modal-overlay">
      <div class="reviews-modal">
        <div class="reviews-modal-header">
          <h2>Customer Reviews</h2>
          <button class="close-reviews-modal">&times;</button>
        </div>
        
        <div class="reviews-summary">
          <div class="overall-rating">
            <div class="rating-large">${stats.averageRating.toFixed(1)}</div>
            <div class="stars-large">${getStarsHTML(stats.averageRating)}</div>
            <div class="total-reviews">${stats.totalReviews} reviews</div>
          </div>
          
          <div class="rating-breakdown">
            ${getRatingBreakdownHTML(stats.ratingDistribution, stats.totalReviews)}
          </div>
        </div>
        
        <div class="add-review-section">
          <h3>Write a Review</h3>
          <div class="star-rating-input">
            <span>Your Rating:</span>
            <div class="star-selector">
              ${[1,2,3,4,5].map(star => `
                <span class="star" data-rating="${star}">☆</span>
              `).join('')}
            </div>
          </div>
          <textarea class="review-text-input" placeholder="Share your thoughts about this product..."></textarea>
          <button class="submit-review-button">Submit Review</button>
        </div>
        
        <div class="reviews-list">
          ${reviews.length > 0 ? 
            reviews.map(review => getReviewHTML(review)).join('') :
            '<div class="no-reviews">No reviews yet. Be the first to review!</div>'
          }
        </div>
        
        <!-- ADD CUSTOMERS ALSO BOUGHT SECTION -->
        ${alsoBoughtHTML}
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Initialize modal functionality
  initializeReviewsModal(product);
}

function getStarsHTML(rating) {
  const fullStars = '★'.repeat(Math.floor(rating));
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = '☆'.repeat(5 - Math.ceil(rating));
  return fullStars + (hasHalfStar ? '½' : '') + emptyStars;
}

function getRatingBreakdownHTML(distribution, total) {
  return [5,4,3,2,1].map(rating => {
    const percentage = total > 0 ? (distribution[rating] / total) * 100 : 0;
    return `
      <div class="rating-bar-item">
        <span class="rating-label">${rating} star</span>
        <div class="rating-bar-bg">
          <div class="rating-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="rating-percentage">${distribution[rating]}</span>
      </div>
    `;
  }).join('');
}

function getReviewHTML(review) {
  const date = new Date(review.date).toLocaleDateString();
  
  return `
    <div class="review-item">
      <div class="review-header">
        <div class="reviewer-name">${review.userName}</div>
        <div class="review-rating">${getStarsHTML(review.rating)}</div>
      </div>
      <div class="review-date">Reviewed on ${date}</div>
      <div class="review-text">${review.reviewText}</div>
      <div class="review-helpful">
        <span>Helpful?</span>
        <button class="helpful-button" data-review-id="${review.id}">
          Yes (${review.helpful})
        </button>
      </div>
    </div>
  `;
}

function initializeReviewsModal(product) {
  const overlay = document.querySelector('.reviews-modal-overlay');
  const closeBtn = document.querySelector('.close-reviews-modal');
  const stars = document.querySelectorAll('.star-selector .star');
  const submitBtn = document.querySelector('.submit-review-button');
  const reviewText = document.querySelector('.review-text-input');
  
  let selectedRating = 0;
  
  // Star rating selection
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      selectedRating = rating;
      
      // Update star display
      stars.forEach((s, index) => {
        s.textContent = index < rating ? '★' : '☆';
      });
    });
  });
  
  // Close modal
  closeBtn.addEventListener('click', () => {
    overlay.remove();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  // Submit review
  submitBtn.addEventListener('click', () => {
    if (selectedRating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (!reviewText.value.trim()) {
      alert('Please write a review');
      return;
    }
    
    addReview(product.id, selectedRating, reviewText.value.trim());
    alert('Thank you for your review!');
    overlay.remove();
    
    // Refresh the modal to show new review
    showReviewsModal(product);
  });
  
  // Helpful buttons
  document.querySelectorAll('.helpful-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const reviewId = btn.dataset.reviewId;
      markReviewHelpful(reviewId);
      btn.textContent = `Yes (${parseInt(btn.textContent.match(/\d+/)[0]) + 1})`;
      btn.disabled = true;
    });
  });
}