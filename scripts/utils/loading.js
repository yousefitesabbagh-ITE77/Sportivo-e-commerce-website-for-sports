// scripts/utils/loading.js

export function showLoading(container, message = 'Loading...') {
  const loadingHTML = `
    <div class="loading-container js-loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">${message}</div>
    </div>
  `;
  
  container.innerHTML = loadingHTML;
}

export function hideLoading(container) {
  const loadingContainer = container.querySelector('.js-loading-container');
  if (loadingContainer) {
    loadingContainer.remove();
  }
}

export function createLoadingOverlay(message = 'Loading...') {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay js-loading-overlay';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner-large"></div>
      <div class="loading-text">${message}</div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  return overlay;
}

export function removeLoadingOverlay() {
  const overlay = document.querySelector('.js-loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Skeleton loading for products grid
export function showSkeletonProducts(container, count = 8) {
  let skeletonHTML = '';
  
  for (let i = 0; i < count; i++) {
    skeletonHTML += `
      <div class="skeleton-product">
        <div class="skeleton-loading skeleton-image"></div>
        <div class="skeleton-loading skeleton-text skeleton-text-medium"></div>
        <div class="skeleton-loading skeleton-text skeleton-text-short"></div>
        <div class="skeleton-loading skeleton-text" style="height: 24px; margin-bottom: 12px;"></div>
        <div class="skeleton-loading skeleton-button"></div>
      </div>
    `;
  }
  
  container.innerHTML = skeletonHTML;
}