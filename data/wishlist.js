// data/wishlist.js

const WISHLIST_STORAGE_KEY = 'wishlist';

export let wishlist = loadWishlistFromStorage();

function readWishlistFromStorage() {
  try {
    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch (error) {
    console.warn('Wishlist data in localStorage was invalid and has been reset.', error);
    return [];
  }
}

function saveToStorage() {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
}

function normalizeDate(dateInput) {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

function normalizeWishlistItems(wishlistItems) {
  if (!Array.isArray(wishlistItems)) {
    return [];
  }

  const wishlistMap = new Map();

  wishlistItems.forEach((wishlistItem) => {
    if (!wishlistItem || typeof wishlistItem.productId !== 'string') {
      return;
    }

    const productId = wishlistItem.productId.trim();

    if (!productId) {
      return;
    }

    if (!wishlistMap.has(productId)) {
      wishlistMap.set(productId, {
        productId,
        dateAdded: normalizeDate(wishlistItem.dateAdded)
      });
    }
  });

  return Array.from(wishlistMap.values());
}

function loadWishlistFromStorage() {
  const storedWishlist = readWishlistFromStorage();
  const normalizedWishlist = normalizeWishlistItems(storedWishlist);

  if (JSON.stringify(storedWishlist) !== JSON.stringify(normalizedWishlist)) {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(normalizedWishlist));
  }

  return normalizedWishlist;
}

export function addToWishlist(productId) {
  if (!productId) {
    return false;
  }

  const safeProductId = String(productId).trim();

  if (!safeProductId || isInWishlist(safeProductId)) {
    return false;
  }

  wishlist.push({
    productId: safeProductId,
    dateAdded: new Date().toISOString()
  });

  saveToStorage();
  return true;
}

export function removeFromWishlist(productId) {
  const previousLength = wishlist.length;

  wishlist = wishlist.filter((wishlistItem) => {
    return wishlistItem.productId !== productId;
  });

  if (wishlist.length !== previousLength) {
    saveToStorage();
    return true;
  }

  return false;
}

export function isInWishlist(productId) {
  return wishlist.some((wishlistItem) => wishlistItem.productId === productId);
}

export function calculateWishlistQuantity() {
  return wishlist.length;
}

export function getWishlistItems() {
  return [...wishlist];
}

export function sanitizeWishlist(validProductIds = []) {
  const validProductIdsSet = new Set(validProductIds);
  const previousWishlistJSON = JSON.stringify(wishlist);

  wishlist = normalizeWishlistItems(wishlist).filter((wishlistItem) => {
    if (validProductIdsSet.size === 0) {
      return true;
    }

    return validProductIdsSet.has(wishlistItem.productId);
  });

  if (JSON.stringify(wishlist) !== previousWishlistJSON) {
    saveToStorage();
  }

  return wishlist;
}

export function clearWishlist() {
  wishlist = [];
  saveToStorage();
}