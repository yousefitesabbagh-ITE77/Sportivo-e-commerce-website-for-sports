// scripts/shared/region-modal.js

import { updateAllPrices } from './currency-manager.js';

const regions = [
  { name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { name: 'Europe', currency: 'EUR', flag: '🇪🇺' },
  { name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  { name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
  { name: 'Japan', currency: 'JPY', flag: '🇯🇵' }
];

export function showModal() {
  // Create the modal overlay and content
  const modalHTML = `
    <div class="region-modal-overlay js-region-modal-overlay">
      <div class="region-modal">
        <div class="region-modal-header">
          <h3>Select your region</h3>
          <button class="region-modal-close-button js-region-modal-close">&times;</button>
        </div>
        <div class="region-modal-content">
          ${regions.map((region, index) => `
            <div class="region-option js-region-option" data-currency="${region.currency}" data-flag="${region.flag}" data-name="${region.name}">
              <span class="region-flag">${region.flag}</span>
              <div class="region-details">
                <div class="region-name">${region.name}</div>
                <div class="region-currency">Currency: ${region.currency}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Add the modal to the page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add event listeners
  initializeModalListeners();
}

function initializeModalListeners() {
  // Close modal when clicking the overlay or the close button
  document.querySelector('.js-region-modal-overlay').addEventListener('click', (event) => {
    if (event.target.classList.contains('js-region-modal-overlay') || event.target.classList.contains('js-region-modal-close')) {
      hideModal();
    }
  });

  // Handle region selection
  document.querySelectorAll('.js-region-option').forEach(option => {
    option.addEventListener('click', () => {
      const { currency, flag, name } = option.dataset;

      // Update the display in the footer
      const regionElement = document.querySelector('.footer-region span:first-child');
      if (regionElement) {
        regionElement.textContent = `${flag} ${name} / ${currency}`;
      }

      // Save to localStorage
      localStorage.setItem('userRegion', name);
      localStorage.setItem('userCurrency', currency);
      localStorage.setItem('userFlag', flag);

      // Update all prices on the page
      updateAllPrices();

      // Hide the modal
      hideModal();
    });
  });
}

export function hideModal() {
  const modal = document.querySelector('.js-region-modal-overlay');
  if (modal) {
    modal.remove();
  }
}