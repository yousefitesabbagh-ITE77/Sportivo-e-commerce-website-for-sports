import {
  cart,
  removeFromCart,
  updateQuantity,
  updateDeliveryOption
} from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { formatPrice } from '../shared/currency-manager.js';
import {
  deliveryOptions,
  getDeliveryOption,
  calculateDeliveryDate
} from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';
import { renderCheckoutHeader } from './CheckoutHeader.js';
import { checkEmptyCart } from '../cart-manager.js';

function updateCheckoutEmptyState() {
  const orderSummaryElement = document.querySelector('.js-order-summary');
  const paymentSummaryElement = document.querySelector('.js-payment-summary');
  const pageTitleElement = document.querySelector('.page-title');

  renderCheckoutHeader();

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

function removeInvalidCartItems() {
  const invalidProductIds = [];

  cart.forEach((cartItem) => {
    if (!getProduct(cartItem.productId)) {
      invalidProductIds.push(cartItem.productId);
    }
  });

  invalidProductIds.forEach((productId) => {
    removeFromCart(productId);
  });

  if (invalidProductIds.length > 0) {
    console.warn('Removed unavailable products from cart:', invalidProductIds);
  }
}

function deliveryOptionsHTML(product, cartItem) {
  let html = '';

  deliveryOptions.forEach((deliveryOption) => {
    const dateString = calculateDeliveryDate(deliveryOption);
    const priceString = deliveryOption.priceCents === 0
      ? 'FREE'
      : `${formatPrice(deliveryOption.priceCents)} -`;
    const isChecked = deliveryOption.id === getDeliveryOption(cartItem.deliveryOptionId).id;

    html += `
      <div class="delivery-option js-delivery-option"
        data-product-id="${product.id}"
        data-delivery-option-id="${deliveryOption.id}">
        <input type="radio"
          ${isChecked ? 'checked' : ''}
          class="delivery-option-input"
          name="delivery-option-${product.id}"
          data-product-id="${product.id}"
          data-delivery-option-id="${deliveryOption.id}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
            ${priceString} Shipping
          </div>
        </div>
      </div>
    `;
  });

  return html;
}

function cartItemHTML(cartItem) {
  const product = getProduct(cartItem.productId);
  const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
  const dateString = calculateDeliveryDate(deliveryOption);

  return `
    <div class="cart-item-container js-cart-item-container-${product.id}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>
      <div class="cart-item-details-grid">
        <img class="product-image" src="${product.image}" alt="${product.name}">

        <div class="cart-item-details">
          <div class="product-name">
            ${product.name}
          </div>
          <div class="product-price">
            ${product.getPrice()}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label js-quantity-label-${product.id}">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary js-update-link"
              data-product-id="${product.id}">
              Update
            </span>
            <input class="quantity-input js-quantity-input-${product.id}" type="number" min="1" max="10" value="${cartItem.quantity}">
            <span class="save-quantity-link link-primary js-save-link"
              data-product-id="${product.id}">
              Save
            </span>
            <span class="delete-quantity-link link-primary js-delete-link"
              data-product-id="${product.id}">
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryOptionsHTML(product, cartItem)}
        </div>
      </div>
    </div>
  `;
}

function attachCartItemEventListeners() {
  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;

      removeFromCart(productId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const container = document.querySelector(`.js-cart-item-container-${productId}`);

      if (container) {
        container.classList.add('is-editing-quantity');
      }
    });
  });

  document.querySelectorAll('.js-save-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const quantityInput = document.querySelector(`.js-quantity-input-${productId}`);
      const newQuantity = Number(quantityInput?.value);
      const wasUpdated = updateQuantity(productId, newQuantity);

      if (!wasUpdated) {
        alert('Quantity must be between 1 and 10.');
        return;
      }

      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll('.delivery-option-input').forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;

      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });
}

export function renderOrderSummary() {
  const orderSummaryElement = document.querySelector('.js-order-summary');

  if (!orderSummaryElement) {
    return;
  }

  removeInvalidCartItems();

  if (updateCheckoutEmptyState()) {
    return;
  }

  const cartSummaryHTML = cart
    .map((cartItem) => cartItemHTML(cartItem))
    .join('');

  orderSummaryElement.innerHTML = cartSummaryHTML;
  attachCartItemEventListeners();
  renderCheckoutHeader();
}