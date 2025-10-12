export function initializeQuantityButtons() {
  // Plus button click - FIXED: Use event delegation and closest()
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('js-quantity-plus')) {
      const button = event.target;
      const selector = button.closest('.js-quantity-selector');
      const productId = selector.dataset.productId;
      
      // FIXED: Find the quantity display within the same container
      const display = selector.querySelector(`.js-quantity-display-${productId}`);
      let currentValue = parseInt(display.value);
      
      if (currentValue < 10) {
        display.value = currentValue + 1;
        updateQuantityButtonStates(selector);
      }
    }
    
    // Minus button click - FIXED: Use event delegation and closest()
    if (event.target.classList.contains('js-quantity-minus')) {
      const button = event.target;
      const selector = button.closest('.js-quantity-selector');
      const productId = selector.dataset.productId;
      
      // FIXED: Find the quantity display within the same container
      const display = selector.querySelector(`.js-quantity-display-${productId}`);
      let currentValue = parseInt(display.value);
      
      if (currentValue > 1) {
        display.value = currentValue - 1;
        updateQuantityButtonStates(selector);
      }
    }
  });

  // Set initial button states for all quantity selectors
  updateAllQuantityButtonStates();
}

// Update button states (enable/disable) - FIXED: Accept selector instead of productId
function updateQuantityButtonStates(selector) {
  const productId = selector.dataset.productId;
  const display = selector.querySelector(`.js-quantity-display-${productId}`);
  const currentValue = parseInt(display.value);
  
  const minusBtn = selector.querySelector('.js-quantity-minus');
  const plusBtn = selector.querySelector('.js-quantity-plus');

  if (minusBtn) minusBtn.disabled = currentValue <= 1;
  if (plusBtn) plusBtn.disabled = currentValue >= 10;
}

// Update all quantity buttons on page load - FIXED: Update each selector individually
function updateAllQuantityButtonStates() {
  document.querySelectorAll('.js-quantity-selector').forEach(selector => {
    updateQuantityButtonStates(selector);
  });
}