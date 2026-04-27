import { renderOrderSummary } from './checkout/orderSummary.js';
import { renderPaymentSummary } from './checkout/paymentSummary.js';
import { renderCheckoutHeader } from './checkout/CheckoutHeader.js';
import { products, loadProductsFetch } from '../data/products.js';
import { loadCartFetch, sanitizeCart } from '../data/cart.js';
import { checkEmptyCart } from './cart-manager.js';
import { createLoadingOverlay, removeLoadingOverlay } from './utils/loading.js';

function renderEmptyCheckoutState() {
  const orderSummaryElement = document.querySelector('.js-order-summary');
  const paymentSummaryElement = document.querySelector('.js-payment-summary');
  const pageTitleElement = document.querySelector('.page-title');

  if (checkEmptyCart(orderSummaryElement)) {
    if (paymentSummaryElement) {
      paymentSummaryElement.style.display = 'none';
    }

    if (pageTitleElement) {
      pageTitleElement.textContent = 'Your Cart is Empty';
    }

    return true;
  }

  if (paymentSummaryElement) {
    paymentSummaryElement.style.display = '';
  }

  if (pageTitleElement) {
    pageTitleElement.textContent = 'Checkout';
  }

  return false;
}

function renderCheckoutError(error) {
  const orderSummaryElement = document.querySelector('.js-order-summary');
  const paymentSummaryElement = document.querySelector('.js-payment-summary');

  if (paymentSummaryElement) {
    paymentSummaryElement.style.display = 'none';
  }

  if (orderSummaryElement) {
    orderSummaryElement.innerHTML = `
      <div class="error-state">
        <h3>Unable to load your cart</h3>
        <p>Please refresh the page and try again.</p>
        <button class="retry-button button-primary" onclick="location.reload()">
          Try Again
        </button>
      </div>
    `;
  }

  console.error('Error loading checkout page:', error);
}

async function loadPage() {
  createLoadingOverlay('Loading your cart...');

  try {
    await loadProductsFetch();
    await loadCartFetch();

    const validProductIds = products.map((product) => product.id);
    sanitizeCart(validProductIds);

    renderCheckoutHeader();

    if (renderEmptyCheckoutState()) {
      return;
    }

    renderOrderSummary();
    renderPaymentSummary();
  } catch (error) {
    renderCheckoutHeader();
    renderCheckoutError(error);
  } finally {
    removeLoadingOverlay();
  }
}

loadPage();