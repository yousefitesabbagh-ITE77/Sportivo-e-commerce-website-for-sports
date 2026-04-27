const CART_STORAGE_KEY = 'cart';
const DEFAULT_DELIVERY_OPTION_ID = '2';
const MAX_CART_QUANTITY = 10;

let cart = loadCartFromStorage();

export { cart };

function readCartFromStorage() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.warn('Cart data in localStorage was invalid and has been reset.', error);
    return [];
  }
}

function normalizeQuantity(quantity) {
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity)) {
    return null;
  }

  const wholeQuantity = Math.floor(parsedQuantity);

  if (wholeQuantity < 1) {
    return null;
  }

  return Math.min(wholeQuantity, MAX_CART_QUANTITY);
}

function normalizeDeliveryOptionId(deliveryOptionId) {
  if (typeof deliveryOptionId === 'string' && deliveryOptionId.trim() !== '') {
    return deliveryOptionId;
  }

  return DEFAULT_DELIVERY_OPTION_ID;
}

function normalizeCartItems(cartItems) {
  if (!Array.isArray(cartItems)) {
    return [];
  }

  const cartMap = new Map();

  cartItems.forEach((cartItem) => {
    if (!cartItem || typeof cartItem.productId !== 'string') {
      return;
    }

    const productId = cartItem.productId.trim();
    const quantity = normalizeQuantity(cartItem.quantity);

    if (!productId || !quantity) {
      return;
    }

    const deliveryOptionId = normalizeDeliveryOptionId(cartItem.deliveryOptionId);
    const existingItem = cartMap.get(productId);

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, MAX_CART_QUANTITY);
      return;
    }

    cartMap.set(productId, {
      productId,
      quantity,
      deliveryOptionId
    });
  });

  return Array.from(cartMap.values());
}

function loadCartFromStorage() {
  const normalizedCart = normalizeCartItems(readCartFromStorage());
  return normalizedCart;
}

function saveToStorage() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function addToCart(productId, quantity = 1) {
  if (!productId) {
    return;
  }

  const safeQuantity = normalizeQuantity(quantity) || 1;
  const matchingItem = cart.find((cartItem) => cartItem.productId === productId);

  if (matchingItem) {
    matchingItem.quantity = Math.min(matchingItem.quantity + safeQuantity, MAX_CART_QUANTITY);
  } else {
    cart.push({
      productId,
      quantity: safeQuantity,
      deliveryOptionId: DEFAULT_DELIVERY_OPTION_ID
    });
  }

  saveToStorage();
}

export function removeFromCart(productId) {
  cart = cart.filter((cartItem) => cartItem.productId !== productId);
  saveToStorage();
}

export function calculateCartQuantity() {
  return cart.reduce((totalQuantity, cartItem) => {
    return totalQuantity + cartItem.quantity;
  }, 0);
}

export function updateQuantity(productId, newQuantity) {
  const matchingItem = cart.find((cartItem) => cartItem.productId === productId);
  const safeQuantity = normalizeQuantity(newQuantity);

  if (!matchingItem || !safeQuantity) {
    return false;
  }

  matchingItem.quantity = safeQuantity;
  saveToStorage();
  return true;
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  const matchingItem = cart.find((cartItem) => cartItem.productId === productId);

  if (!matchingItem) {
    return false;
  }

  matchingItem.deliveryOptionId = normalizeDeliveryOptionId(deliveryOptionId);
  saveToStorage();
  return true;
}

export function sanitizeCart(validProductIds = []) {
  const validProductIdsSet = new Set(validProductIds);
  const previousCartJSON = JSON.stringify(cart);

  cart = normalizeCartItems(cart).filter((cartItem) => {
    if (validProductIdsSet.size === 0) {
      return true;
    }

    return validProductIdsSet.has(cartItem.productId);
  });

  if (JSON.stringify(cart) !== previousCartJSON) {
    saveToStorage();
  }

  return cart;
}

export function loadCart(callback) {
  if (typeof callback === 'function') {
    callback();
  }
}

export async function loadCartFetch() {
  cart = normalizeCartItems(cart);
  saveToStorage();
  return cart;
}

export function resetCart() {
  cart = [];
  saveToStorage();
}