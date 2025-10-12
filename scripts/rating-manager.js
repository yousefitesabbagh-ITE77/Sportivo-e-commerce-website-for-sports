export function initializeRatingToggles() {
  document.querySelectorAll('.js-rating-summary').forEach(summary => {
    summary.addEventListener('click', (event) => {
      event.stopPropagation();
      const container = summary.closest('.js-rating-container');
      container.classList.toggle('rating-container-expanded');
    });
  });

  // Close rating details when clicking elsewhere
  document.addEventListener('click', () => {
    document.querySelectorAll('.js-rating-container').forEach(container => {
      container.classList.remove('rating-container-expanded');
    });
  });
}