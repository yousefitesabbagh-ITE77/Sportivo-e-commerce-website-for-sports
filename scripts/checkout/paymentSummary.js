import { cart , resetCart} from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { getDeliveryOption , calculateDeliveryDate} from '../../data/deliveryOptions.js';
import { formatPrice } from '../shared/currency-manager.js'; // <-- UPDATED IMPORT
import { addOrder } from '../../data/order.js';



function generateOrderId() {
  // Generate a simple unique order ID
  return 'order-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function renderPaymentSummary() {
  // Calculate product price total
  let productPriceCents = 0;
  let shippingPriceCents = 0;
  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    productPriceCents += product.priceCents * cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOption.priceCents;

    cartQuantity += cartItem.quantity;
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;

  const taxCents = totalBeforeTaxCents * 0.1;
  const totalCents = totalBeforeTaxCents + taxCents;

  // until now we saved the data (Model) cause we are using the MVC pattern
  // now we need to update the view (HTML) Generate the HTML

  const paymentSummaryHTML = `
      <div class="payment-summary-title">
          Order Summary
      </div>

      <div class="payment-summary-row">
        <div>Items (${cartQuantity}):</div>
        <div class="payment-summary-money">
          ${formatPrice(productPriceCents)}
        </div>
      </div>

      <div class="payment-summary-row">
        <div>Shipping &amp; handling:</div>
        <div class="payment-summary-money">
          ${formatPrice(shippingPriceCents)}
        </div>
      </div>

      <div class="payment-summary-row subtotal-row">
        <div>Total before tax:</div>
        <div class="payment-summary-money">
          ${formatPrice(totalBeforeTaxCents)}
        </div>
      </div>

      <div class="payment-summary-row">
        <div>Estimated tax (10%):</div>
        <div class="payment-summary-money">
          ${formatPrice(taxCents)}
        </div>
      </div>

      <div class="payment-summary-row total-row">
        <div>Order total:</div>
        <div class="payment-summary-money">
          ${formatPrice(totalCents)}
        </div>
      </div>

      <button class="place-order-button button-primary 
      js-place-order">
        Place your order
      </button>
  `;

  document.querySelector('.js-payment-summary')
    .innerHTML = paymentSummaryHTML;

 document.querySelector('.js-place-order')
  .addEventListener('click', async () => {
    try {
      // Create order locally instead of using old backend
      const order = {
        id: generateOrderId(), // We need to create this function
        orderTime: new Date().toISOString(),
        totalCostCents: totalCents,
        products: cart.map(cartItem => {
          const product = getProduct(cartItem.productId);
          const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
          const deliveryDate = calculateDeliveryDate(deliveryOption);
          
          return {
            productId: product.id,
            quantity: cartItem.quantity,
            estimatedDeliveryTime: deliveryDate,
            deliveryOptionId: cartItem.deliveryOptionId
          };
        })
      };
      
      addOrder(order);

    } catch (error) {
      console.log('Unexpected error. Try again later.');
      console.error('Error details:', error);
    }

    // Extra feature: make the cart empty after creating an order.
    resetCart();

    window.location.href = 'orders.html';
  });
}