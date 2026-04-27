// scripts/shared/currency-manager.js

// Exchange rates are relative to USD.
// In a real app, you would fetch these from an API.
const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149.50
};

// Currency symbols for formatting
const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥'
};

// Get the user's preferred currency from localStorage, or default to USD
export function getCurrency() {
  return localStorage.getItem('userCurrency') || 'USD';
}

// Convert a price in cents to the selected currency and format it
export function formatPrice(priceCents) {
  const currency = getCurrency();
  const rate = exchangeRates[currency];
  const symbol = currencySymbols[currency];

  // Convert price from cents to dollars, then apply the exchange rate
  let priceInCurrency = (priceCents / 100) * rate;

  // Special handling for Yen, which doesn't use minor units
  if (currency === 'JPY') {
    return `${symbol}${Math.round(priceInCurrency).toLocaleString()}`;
  }

  // For other currencies, format to two decimal places
  return `${symbol}${priceInCurrency.toFixed(2).toLocaleString()}`;
}

// This is the master function that updates all prices on the page.
export function updateAllPrices() {
  console.log(`Updating all prices to ${getCurrency()}`);

  // Update prices in the main product grid and recommendations
  // by re-rendering them. This is the most reliable way.
  if (typeof renderProductsGrid === 'function') {
    renderProductsGrid();
  }
  if (typeof showMainPageRecommendations === 'function') {
    showMainPageRecommendations();
  }

  // Update prices in the checkout page
  if (typeof renderOrderSummary === 'function') {
    renderOrderSummary();
  }
  if (typeof renderPaymentSummary === 'function') {
    renderPaymentSummary();
  }
  
  // NEW: Update prices in the orders page
  if (typeof renderOrdersPage === 'function') {
    renderOrdersPage();
  }
  
  // We will add more render functions here if needed for other pages.
}