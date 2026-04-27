import { cart, resetCart } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import {
  getDeliveryOption,
  calculateDeliveryDateISO
} from '../../data/deliveryOptions.js';
import { formatPrice } from '../shared/currency-manager.js';
import { addOrder } from '../../data/order.js';

const CHECKOUT_PROFILE_STORAGE_KEY = 'sportivo:checkout-profile';

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function generateOrderId() {
  return `SP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function getValidCartItems() {
  return cart
    .map((cartItem) => {
      const product = getProduct(cartItem.productId);

      if (!product) {
        return null;
      }

      return {
        cartItem,
        product,
        deliveryOption: getDeliveryOption(cartItem.deliveryOptionId)
      };
    })
    .filter(Boolean);
}

function calculatePaymentTotals(validCartItems) {
  let productPriceCents = 0;
  let shippingPriceCents = 0;
  let cartQuantity = 0;

  validCartItems.forEach(({ cartItem, product, deliveryOption }) => {
    productPriceCents += product.priceCents * cartItem.quantity;
    shippingPriceCents += deliveryOption.priceCents;
    cartQuantity += cartItem.quantity;
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = Math.round(totalBeforeTaxCents * 0.1);
  const totalCents = totalBeforeTaxCents + taxCents;

  return {
    productPriceCents,
    shippingPriceCents,
    cartQuantity,
    totalBeforeTaxCents,
    taxCents,
    totalCents
  };
}

function getPaymentMethodLabel(paymentMethod) {
  const labels = {
    card: 'Credit card',
    paypal: 'PayPal',
    cod: 'Cash on delivery'
  };

  return labels[paymentMethod] || labels.card;
}

function readSavedCheckoutProfile() {
  try {
    const storedProfile = localStorage.getItem(CHECKOUT_PROFILE_STORAGE_KEY);
    return storedProfile ? JSON.parse(storedProfile) : {};
  } catch (error) {
    console.warn('Saved checkout profile was invalid and has been ignored.', error);
    return {};
  }
}

function saveCheckoutProfile(data) {
  const profile = {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    postalCode: data.postalCode,
    country: data.country,
    paymentMethod: data.paymentMethod
  };

  localStorage.setItem(CHECKOUT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function clearCheckoutProfile() {
  localStorage.removeItem(CHECKOUT_PROFILE_STORAGE_KEY);
}

function getCheckoutForm() {
  return document.querySelector('.js-checkout-form');
}

function getCheckoutFormData() {
  const form = getCheckoutForm();

  if (!form) {
    return null;
  }

  const formData = new FormData(form);

  return {
    fullName: String(formData.get('fullName') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    address: String(formData.get('address') || '').trim(),
    city: String(formData.get('city') || '').trim(),
    postalCode: String(formData.get('postalCode') || '').trim(),
    country: String(formData.get('country') || '').trim(),
    paymentMethod: String(formData.get('paymentMethod') || 'card'),
    orderNotes: String(formData.get('orderNotes') || '').trim(),
    saveInformation: formData.get('saveInformation') === 'on'
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCheckoutForm(data) {
  const errors = {};

  if (!data.fullName) {
    errors.fullName = 'Enter your full name.';
  } else if (data.fullName.length < 3) {
    errors.fullName = 'Name must be at least 3 characters.';
  }

  if (!data.email) {
    errors.email = 'Enter your email address.';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!data.phone) {
    errors.phone = 'Enter your phone number.';
  } else if (data.phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!data.address) {
    errors.address = 'Enter your street address.';
  }

  if (!data.city) {
    errors.city = 'Enter your city.';
  }

  if (!data.postalCode) {
    errors.postalCode = 'Enter your postal code.';
  }

  if (!data.country) {
    errors.country = 'Select your country.';
  }

  return errors;
}

function showCheckoutErrors(errors) {
  const form = getCheckoutForm();
  const errorSummary = document.querySelector('.js-checkout-error-summary');

  if (!form) {
    return;
  }

  form.querySelectorAll('.js-field-error').forEach((element) => {
    element.textContent = '';
  });

  form.querySelectorAll('[aria-invalid="true"]').forEach((element) => {
    element.setAttribute('aria-invalid', 'false');
  });

  Object.entries(errors).forEach(([fieldName, message]) => {
    const input = form.elements[fieldName];
    const errorElement = form.querySelector(`.js-error-${fieldName}`);

    if (input) {
      input.setAttribute('aria-invalid', 'true');
    }

    if (errorElement) {
      errorElement.textContent = message;
    }
  });

  if (errorSummary) {
    const messages = Object.values(errors);

    if (messages.length === 0) {
      errorSummary.hidden = true;
      errorSummary.innerHTML = '';
      return;
    }

    errorSummary.hidden = false;
    errorSummary.innerHTML = `
      <strong>Please fix these checkout details:</strong>
      <ul>
        ${messages.map((message) => `<li>${escapeHTML(message)}</li>`).join('')}
      </ul>
    `;
  }

  const firstInvalidField = form.querySelector('[aria-invalid="true"]');

  if (firstInvalidField) {
    firstInvalidField.focus();
  }
}

function createOrder(validCartItems, totalCents, checkoutData) {
  const orderTime = new Date().toISOString();
  const paymentLabel = getPaymentMethodLabel(checkoutData.paymentMethod);

  return {
    id: generateOrderId(),
    orderTime,
    totalCostCents: totalCents,
    status: 'processing',
    customer: {
      fullName: checkoutData.fullName,
      email: checkoutData.email,
      phone: checkoutData.phone
    },
    shippingAddress: {
      address: checkoutData.address,
      city: checkoutData.city,
      postalCode: checkoutData.postalCode,
      country: checkoutData.country
    },
    payment: {
      method: checkoutData.paymentMethod,
      label: paymentLabel,
      status: 'Payment method selected'
    },
    notes: checkoutData.orderNotes,
    products: validCartItems.map(({ cartItem, product, deliveryOption }) => {
      const estimatedDeliveryDateISO = calculateDeliveryDateISO(deliveryOption, orderTime);

      return {
        productId: product.id,
        quantity: cartItem.quantity,
        deliveryOptionId: deliveryOption.id,
        estimatedDeliveryDateISO,
        estimatedDeliveryTime: estimatedDeliveryDateISO,
        unitPriceCents: product.priceCents
      };
    })
  };
}

function checkoutFormHTML(currentFormData = null) {
  const savedProfile = {
    ...readSavedCheckoutProfile(),
    ...(currentFormData || {})
  };
  const hasStoredProfile = Object.keys(readSavedCheckoutProfile()).length > 0;
  const selectedPaymentMethod = savedProfile.paymentMethod || 'card';
  const shouldSaveInformation = currentFormData ? savedProfile.saveInformation : hasStoredProfile;

  return `
    <form class="checkout-customer-form js-checkout-form" novalidate>
      <div class="checkout-form-error-summary js-checkout-error-summary" hidden aria-live="polite"></div>

      <section class="checkout-form-section">
        <div class="checkout-form-section-header">
          <span class="checkout-step-number">1</span>
          <div>
            <h3>Contact information</h3>
            <p>We will use these details to prepare your order and delivery updates.</p>
          </div>
        </div>

        <label class="checkout-field">
          <span>Full name</span>
          <input
            type="text"
            name="fullName"
            value="${escapeHTML(savedProfile.fullName)}"
            placeholder="Yousef Sabbagh"
            autocomplete="name"
            aria-invalid="false"
          >
          <small class="field-error js-field-error js-error-fullName" aria-live="polite"></small>
        </label>

        <div class="checkout-field-grid">
          <label class="checkout-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value="${escapeHTML(savedProfile.email)}"
              placeholder="name@example.com"
              autocomplete="email"
              aria-invalid="false"
            >
            <small class="field-error js-field-error js-error-email" aria-live="polite"></small>
          </label>

          <label class="checkout-field">
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              value="${escapeHTML(savedProfile.phone)}"
              placeholder="+1 514 000 0000"
              autocomplete="tel"
              aria-invalid="false"
            >
            <small class="field-error js-field-error js-error-phone" aria-live="polite"></small>
          </label>
        </div>
      </section>

      <section class="checkout-form-section">
        <div class="checkout-form-section-header">
          <span class="checkout-step-number">2</span>
          <div>
            <h3>Shipping address</h3>
            <p>This creates a realistic checkout flow without real payments.</p>
          </div>
        </div>

        <label class="checkout-field">
          <span>Street address</span>
          <input
            type="text"
            name="address"
            value="${escapeHTML(savedProfile.address)}"
            placeholder="123 Sportivo Street"
            autocomplete="street-address"
            aria-invalid="false"
          >
          <small class="field-error js-field-error js-error-address" aria-live="polite"></small>
        </label>

        <div class="checkout-field-grid">
          <label class="checkout-field">
            <span>City</span>
            <input
              type="text"
              name="city"
              value="${escapeHTML(savedProfile.city)}"
              placeholder="Montreal"
              autocomplete="address-level2"
              aria-invalid="false"
            >
            <small class="field-error js-field-error js-error-city" aria-live="polite"></small>
          </label>

          <label class="checkout-field">
            <span>Postal code</span>
            <input
              type="text"
              name="postalCode"
              value="${escapeHTML(savedProfile.postalCode)}"
              placeholder="H1A 1A1"
              autocomplete="postal-code"
              aria-invalid="false"
            >
            <small class="field-error js-field-error js-error-postalCode" aria-live="polite"></small>
          </label>
        </div>

        <label class="checkout-field">
          <span>Country</span>
          <select name="country" autocomplete="country-name" aria-invalid="false">
            <option value="">Select country</option>
            <option value="Canada" ${savedProfile.country === 'Canada' ? 'selected' : ''}>Canada</option>
            <option value="United States" ${savedProfile.country === 'United States' ? 'selected' : ''}>United States</option>
            <option value="United Kingdom" ${savedProfile.country === 'United Kingdom' ? 'selected' : ''}>United Kingdom</option>
            <option value="Germany" ${savedProfile.country === 'Germany' ? 'selected' : ''}>Germany</option>
            <option value="France" ${savedProfile.country === 'France' ? 'selected' : ''}>France</option>
            <option value="United Arab Emirates" ${savedProfile.country === 'United Arab Emirates' ? 'selected' : ''}>United Arab Emirates</option>
          </select>
          <small class="field-error js-field-error js-error-country" aria-live="polite"></small>
        </label>
      </section>

      <section class="checkout-form-section">
        <div class="checkout-form-section-header">
          <span class="checkout-step-number">3</span>
          <div>
            <h3>Payment method</h3>
            <p>Choose the payment method you prefer for this order.</p>
          </div>
        </div>

        <div class="payment-method-options" role="radiogroup" aria-label="Payment method">
          <label class="payment-method-card">
            <input type="radio" name="paymentMethod" value="card" ${selectedPaymentMethod === 'card' ? 'checked' : ''}>
            <span>
              <strong>Credit card</strong>
              <small>Pay with a card at checkout</small>
            </span>
          </label>

          <label class="payment-method-card">
            <input type="radio" name="paymentMethod" value="paypal" ${selectedPaymentMethod === 'paypal' ? 'checked' : ''}>
            <span>
              <strong>PayPal</strong>
              <small>Use your preferred wallet</small>
            </span>
          </label>

          <label class="payment-method-card">
            <input type="radio" name="paymentMethod" value="cod" ${selectedPaymentMethod === 'cod' ? 'checked' : ''}>
            <span>
              <strong>Cash on delivery</strong>
              <small>Pay when your package arrives</small>
            </span>
          </label>
        </div>

        <label class="checkout-field">
          <span>Order notes <em>optional</em></span>
          <textarea
            name="orderNotes"
            rows="3"
            placeholder="Example: Please leave the package near the front desk."
          >${escapeHTML(savedProfile.orderNotes)}</textarea>
        </label>

        <label class="checkout-save-info">
          <input type="checkbox" name="saveInformation" ${shouldSaveInformation ? 'checked' : ''}>
          <span>Save checkout details on this browser for next time.</span>
        </label>
      </section>
    </form>
  `;
}

function orderTotalsHTML(totals) {
  return `
    <section class="checkout-totals-card">
      <div class="payment-summary-title">
        Order Summary
      </div>

      <div class="payment-summary-row">
        <div>Items (${totals.cartQuantity}):</div>
        <div class="payment-summary-money">
          ${formatPrice(totals.productPriceCents)}
        </div>
      </div>

      <div class="payment-summary-row">
        <div>Shipping &amp; handling:</div>
        <div class="payment-summary-money">
          ${formatPrice(totals.shippingPriceCents)}
        </div>
      </div>

      <div class="payment-summary-row subtotal-row">
        <div>Total before tax:</div>
        <div class="payment-summary-money">
          ${formatPrice(totals.totalBeforeTaxCents)}
        </div>
      </div>

      <div class="payment-summary-row">
        <div>Estimated tax (10%):</div>
        <div class="payment-summary-money">
          ${formatPrice(totals.taxCents)}
        </div>
      </div>

      <div class="payment-summary-row total-row">
        <div>Order total:</div>
        <div class="payment-summary-money">
          ${formatPrice(totals.totalCents)}
        </div>
      </div>

      <button class="place-order-button button-primary js-place-order" type="button">
        Place order
      </button>

      <p class="checkout-security-note">
        Secure checkout. No card details are stored in this browser.
      </p>
    </section>
  `;
}

function setPlaceOrderLoading(isLoading) {
  const button = document.querySelector('.js-place-order');

  if (!button) {
    return;
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? 'Creating order...' : 'Place order';
}

function attachCheckoutEventListeners(totals) {
  const form = getCheckoutForm();
  const placeOrderButton = document.querySelector('.js-place-order');

  if (!form || !placeOrderButton) {
    return;
  }

  form.addEventListener('input', (event) => {
    const field = event.target;

    if (!field.name) {
      return;
    }

    field.setAttribute('aria-invalid', 'false');

    const errorElement = form.querySelector(`.js-error-${field.name}`);

    if (errorElement) {
      errorElement.textContent = '';
    }

    const errorSummary = document.querySelector('.js-checkout-error-summary');

    if (errorSummary) {
      errorSummary.hidden = true;
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    placeOrderButton.click();
  });

  placeOrderButton.addEventListener('click', () => {
    try {
      const checkoutData = getCheckoutFormData();
      const errors = validateCheckoutForm(checkoutData);

      if (Object.keys(errors).length > 0) {
        showCheckoutErrors(errors);
        return;
      }

      setPlaceOrderLoading(true);

      const latestValidCartItems = getValidCartItems();

      if (latestValidCartItems.length === 0) {
        window.location.href = 'checkout.html';
        return;
      }

      const latestTotals = calculatePaymentTotals(latestValidCartItems);
      const order = createOrder(latestValidCartItems, latestTotals.totalCents, checkoutData);
      const wasSaved = addOrder(order);

      if (!wasSaved) {
        throw new Error('Order could not be saved.');
      }

      if (checkoutData.saveInformation) {
        saveCheckoutProfile(checkoutData);
      } else {
        clearCheckoutProfile();
      }

      localStorage.setItem('sportivo:last-order-id', order.id);
      resetCart();
      window.location.href = `order-confirmation.html?orderId=${encodeURIComponent(order.id)}`;
    } catch (error) {
      setPlaceOrderLoading(false);
      showCheckoutErrors({
        fullName: 'Something went wrong while creating the order. Please try again.'
      });
      console.error('Error placing order:', error);
    }
  });
}

export function renderPaymentSummary() {
  const paymentSummaryElement = document.querySelector('.js-payment-summary');

  if (!paymentSummaryElement) {
    return;
  }

  const currentFormData = getCheckoutFormData();
  const validCartItems = getValidCartItems();

  if (validCartItems.length === 0) {
    paymentSummaryElement.innerHTML = '';
    paymentSummaryElement.style.display = 'none';
    return;
  }

  paymentSummaryElement.style.display = '';

  const totals = calculatePaymentTotals(validCartItems);

  paymentSummaryElement.innerHTML = `
    ${checkoutFormHTML(currentFormData)}
    ${orderTotalsHTML(totals)}
  `;

  attachCheckoutEventListeners(totals);
}
