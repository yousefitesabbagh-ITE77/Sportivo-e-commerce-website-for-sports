let userBehavior = JSON.parse(localStorage.getItem('userBehavior')) || {
  viewedProducts: [],
  purchasedProducts: [],
  searchHistory: []
};

export { userBehavior };

function saveToStorage() {
  localStorage.setItem('userBehavior', JSON.stringify(userBehavior));
}

// Track when user views a product
export function trackProductView(productId) {
  if (!userBehavior.viewedProducts.includes(productId)) {
    userBehavior.viewedProducts.unshift(productId);
    // Keep only last 20 viewed products
    userBehavior.viewedProducts = userBehavior.viewedProducts.slice(0, 20);
    saveToStorage();
  }
}

// Track when user purchases a product
export function trackProductPurchase(productId) {
  if (!userBehavior.purchasedProducts.includes(productId)) {
    userBehavior.purchasedProducts.unshift(productId);
    // Keep only last 10 purchased products
    userBehavior.purchasedProducts = userBehavior.purchasedProducts.slice(0, 10);
    saveToStorage();
  }
}

// Track search terms
export function trackSearch(searchTerm) {
  if (searchTerm.trim()) {
    userBehavior.searchHistory.unshift(searchTerm.toLowerCase());
    // Keep only last 10 searches
    userBehavior.searchHistory = userBehavior.searchHistory.slice(0, 10);
    saveToStorage();
  }
}

// Get recommendations based on user behavior
export function getRecommendations(allProducts, currentProductId = null) {
  const recommendations = new Set();
  
  // Based on viewed products
  userBehavior.viewedProducts.forEach(viewedId => {
    if (viewedId !== currentProductId) {
      const similarProducts = findSimilarProducts(viewedId, allProducts);
      similarProducts.forEach(product => recommendations.add(product));
    }
  });
  
  // Based on purchased products
  userBehavior.purchasedProducts.forEach(purchasedId => {
    if (purchasedId !== currentProductId) {
      const similarProducts = findSimilarProducts(purchasedId, allProducts);
      similarProducts.forEach(product => recommendations.add(product));
    }
  });
  
  // Convert Set to Array and limit to 8 products
  return Array.from(recommendations).slice(0, 8);
}

// Find similar products based on categories and keywords
function findSimilarProducts(productId, allProducts) {
  const targetProduct = allProducts.find(p => p.id === productId);
  if (!targetProduct) return [];
  
  const targetSport = targetProduct.getSportCategory();
  const targetKeywords = targetProduct.keywords;
  
  return allProducts
    .filter(product => product.id !== productId)
    .filter(product => {
      // Same sport category
      if (product.getSportCategory() === targetSport) return true;
      
      // Shared keywords
      const sharedKeywords = product.keywords.filter(keyword => 
        targetKeywords.includes(keyword)
      );
      return sharedKeywords.length > 0;
    })
    .sort((a, b) => {
      // Prioritize products with higher ratings
      return b.rating.stars - a.rating.stars;
    });
}

// Get "Customers who bought this also bought" recommendations
export function getCustomersAlsoBought(productId, allProducts) {
  const targetProduct = allProducts.find(p => p.id === productId);
  if (!targetProduct) return [];
  
  const targetSport = targetProduct.getSportCategory();
  
  return allProducts
    .filter(product => product.id !== productId)
    .filter(product => product.getSportCategory() === targetSport)
    .sort((a, b) => b.rating.stars - a.rating.stars)
    .slice(0, 6);
}