const ORDERS_STORAGE_KEY = 'orders';

export let orders = loadOrdersFromStorage();

function readOrdersFromStorage() {
  try {
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    return storedOrders ? JSON.parse(storedOrders) : [];
  } catch (error) {
    console.warn('Orders data in localStorage was invalid and has been reset.', error);
    return [];
  }
}

function saveToStorage() {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function normalizeQuantity(quantity) {
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    return 1;
  }

  return Math.floor(parsedQuantity);
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeOrderProduct(productDetails) {
  if (!productDetails || typeof productDetails.productId !== 'string') {
    return null;
  }

  const productId = productDetails.productId.trim();

  if (!productId) {
    return null;
  }

  const estimatedDeliveryDateISO =
    productDetails.estimatedDeliveryDateISO ||
    productDetails.estimatedDeliveryTime ||
    null;

  return {
    productId,
    quantity: normalizeQuantity(productDetails.quantity),
    deliveryOptionId: productDetails.deliveryOptionId || '1',
    estimatedDeliveryDateISO,
    estimatedDeliveryTime: estimatedDeliveryDateISO,
    unitPriceCents: Number(productDetails.unitPriceCents) || 0
  };
}

function normalizeCustomer(customer = {}) {
  return {
    fullName: normalizeText(customer.fullName),
    email: normalizeText(customer.email),
    phone: normalizeText(customer.phone)
  };
}

function normalizeShippingAddress(shippingAddress = {}) {
  return {
    address: normalizeText(shippingAddress.address),
    city: normalizeText(shippingAddress.city),
    postalCode: normalizeText(shippingAddress.postalCode),
    country: normalizeText(shippingAddress.country)
  };
}

function normalizePayment(payment = {}) {
  return {
    method: normalizeText(payment.method) || 'card',
    label: normalizeText(payment.label) || 'Payment selected',
    status: normalizeText(payment.status) || 'Payment method selected'
  };
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') {
    return null;
  }

  if (!order.id || !Array.isArray(order.products)) {
    return null;
  }

  const products = order.products
    .map((productDetails) => normalizeOrderProduct(productDetails))
    .filter(Boolean);

  if (products.length === 0) {
    return null;
  }

  const orderTime = new Date(order.orderTime);

  return {
    id: String(order.id),
    orderTime: Number.isNaN(orderTime.getTime()) ? new Date().toISOString() : orderTime.toISOString(),
    totalCostCents: Number(order.totalCostCents) || 0,
    status: normalizeText(order.status) || 'processing',
    customer: normalizeCustomer(order.customer),
    shippingAddress: normalizeShippingAddress(order.shippingAddress),
    payment: normalizePayment(order.payment),
    notes: normalizeText(order.notes),
    products
  };
}

function loadOrdersFromStorage() {
  const storedOrders = readOrdersFromStorage();

  if (!Array.isArray(storedOrders)) {
    return [];
  }

  const normalizedOrders = storedOrders
    .map((order) => normalizeOrder(order))
    .filter(Boolean);

  if (JSON.stringify(storedOrders) !== JSON.stringify(normalizedOrders)) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(normalizedOrders));
  }

  return normalizedOrders;
}

export function addOrder(order) {
  const normalizedOrder = normalizeOrder(order);

  if (!normalizedOrder) {
    console.warn('The order was not saved because it has an invalid format:', order);
    return false;
  }

  orders.unshift(normalizedOrder);
  saveToStorage();
  return true;
}

export function getOrder(orderId) {
  return orders.find((order) => order.id === orderId);
}

export function resetOrders() {
  orders = [];
  saveToStorage();
}
