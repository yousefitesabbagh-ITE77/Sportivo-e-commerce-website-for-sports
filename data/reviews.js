let reviews = JSON.parse(localStorage.getItem('reviews')) || [];

export { reviews };

function saveToStorage() {
  localStorage.setItem('reviews', JSON.stringify(reviews));
}

// Add a new review
export function addReview(productId, rating, reviewText, userName = 'Customer') {
  const review = {
    id: Date.now().toString(),
    productId: productId,
    userName: userName,
    rating: rating,
    reviewText: reviewText,
    date: new Date().toISOString(),
    helpful: 0
  };
  
  reviews.push(review);
  saveToStorage();
  return review;
}

// Get reviews for a specific product
export function getReviewsForProduct(productId) {
  return reviews.filter(review => review.productId === productId)
               .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Get average rating for a product
export function getAverageRating(productId) {
  const productReviews = getReviewsForProduct(productId);
  if (productReviews.length === 0) return 0;
  
  const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
  return total / productReviews.length;
}

// Mark review as helpful
export function markReviewHelpful(reviewId) {
  const review = reviews.find(r => r.id === reviewId);
  if (review) {
    review.helpful++;
    saveToStorage();
  }
}

// Get review statistics
export function getReviewStatistics(productId) {
  const productReviews = getReviewsForProduct(productId);
  const ratingDistribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
  
  productReviews.forEach(review => {
    ratingDistribution[review.rating]++;
  });
  
  return {
    totalReviews: productReviews.length,
    averageRating: getAverageRating(productId),
    ratingDistribution: ratingDistribution
  };
}