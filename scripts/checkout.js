import { renderOrderSummary } from "./checkout/orderSummay.js";
import { renderPaymentSummary } from "./checkout/paymentSummary.js";
import { renderCheckoutHeader } from "./checkout/CheckoutHeader.js";
import { loadProducts , loadProductsFetch } from "../data/products.js";
import { loadCart , loadCartFetch} from "../data/cart.js";
import { checkEmptyCart } from "./cart-manager.js";
import { createLoadingOverlay, removeLoadingOverlay } from "./utils/loading.js";

async function loadPage() {
  try {
    // Show loading overlay
    const loadingOverlay = createLoadingOverlay('Loading your cart...');
    
    // Load products from your new sports backend
    await loadProductsFetch();
    
    // Load cart from localStorage (no backend fetch needed)
    await loadCartFetch();

    // Remove loading overlay
    removeLoadingOverlay();

    // Check if cart is empty
    const orderSummary = document.querySelector('.js-order-summary');
    if (checkEmptyCart(orderSummary)) {
      // Hide payment summary if cart is empty
      document.querySelector('.js-payment-summary').style.display = 'none';
      document.querySelector('.page-title').textContent = 'Your Cart is Empty';
    } else {
      // Render normal checkout if cart has items
      renderCheckoutHeader();
      renderOrderSummary();
      renderPaymentSummary();
    }
    
  } catch (error) {
    removeLoadingOverlay();
    
    const orderSummary = document.querySelector('.js-order-summary');
    orderSummary.innerHTML = `
      <div class="error-state">
        <h3>Unable to load your cart</h3>
        <p>Please check your connection and try again.</p>
        <button class="retry-button button-primary" onclick="location.reload()">
          Try Again
        </button>
      </div>
    `;
    
    console.log('Unexpected error. Please try again later.');
    console.error('Error details:', error);
  }
}

loadPage();