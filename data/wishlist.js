// data/wishlist.js

let wishlist = JSON.parse(localStorage.getItem('wishlist'));
if (!wishlist) {
  wishlist = []; // Empty wishlist
}

export { wishlist };

function saveToStorage() {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Add product to wishlist
export function addToWishlist(productId) {
  let matchingItem;
  wishlist.forEach((wishlistItem) => {
    if (productId === wishlistItem.productId) {
      matchingItem = wishlistItem;
    }
  });
  
  if (!matchingItem) {
    wishlist.push({
      productId: productId,
      dateAdded: new Date().toISOString()
    });
    saveToStorage();
    return true; // Added successfully
  }
  return false; // Already in wishlist
}

// Remove product from wishlist
export function removeFromWishlist(productId) {
  const newWishlist = [];
  wishlist.forEach((wishlistItem) => {
    if (wishlistItem.productId !== productId) {
      newWishlist.push(wishlistItem);
    }
  });
  wishlist = newWishlist;
  saveToStorage();
}

// Check if product is in wishlist
export function isInWishlist(productId) {
  return wishlist.some(item => item.productId === productId);
}

// Get wishlist count for header
export function calculateWishlistQuantity() {
  return wishlist.length;
}

// Get all wishlist items with product details
export function getWishlistItems() {
  return wishlist;
}