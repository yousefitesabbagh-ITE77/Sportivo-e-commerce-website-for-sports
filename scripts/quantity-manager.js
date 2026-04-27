// scripts/quantity-manager.js

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;

let quantityButtonsInitialized = false;

function getQuantityDisplay(selector) {
  const productId = selector?.dataset.productId;

  if (!productId) {
    return null;
  }

  return selector.querySelector(`.js-quantity-display-${productId}`);
}

function getCurrentQuantity(display) {
  const currentValue = Number(display?.value);

  if (!Number.isFinite(currentValue)) {
    return MIN_QUANTITY;
  }

  return Math.min(Math.max(currentValue, MIN_QUANTITY), MAX_QUANTITY);
}

function updateQuantityButtonStates(selector) {
  if (!selector) {
    return;
  }

  const display = getQuantityDisplay(selector);
  const currentValue = getCurrentQuantity(display);

  const minusButton = selector.querySelector('.js-quantity-minus');
  const plusButton = selector.querySelector('.js-quantity-plus');

  if (minusButton) {
    minusButton.disabled = currentValue <= MIN_QUANTITY;
  }

  if (plusButton) {
    plusButton.disabled = currentValue >= MAX_QUANTITY;
  }
}

export function updateAllQuantityButtonStates() {
  document.querySelectorAll('.js-quantity-selector').forEach((selector) => {
    updateQuantityButtonStates(selector);
  });
}

function handleQuantityButtonClick(event) {
  const button = event.target.closest('.js-quantity-minus, .js-quantity-plus');

  if (!button) {
    return;
  }

  const selector = button.closest('.js-quantity-selector');
  const display = getQuantityDisplay(selector);

  if (!selector || !display) {
    return;
  }

  const currentValue = getCurrentQuantity(display);
  const isPlusButton = button.classList.contains('js-quantity-plus');
  const nextValue = isPlusButton ? currentValue + 1 : currentValue - 1;

  display.value = Math.min(Math.max(nextValue, MIN_QUANTITY), MAX_QUANTITY);
  updateQuantityButtonStates(selector);
}

export function initializeQuantityButtons() {
  updateAllQuantityButtonStates();

  if (quantityButtonsInitialized) {
    return;
  }

  quantityButtonsInitialized = true;
  document.addEventListener('click', handleQuantityButtonClick);
}