// scripts/rating-manager.js

let ratingTogglesInitialized = false;

function closeAllRatingDetails(exceptContainer = null) {
  document.querySelectorAll('.js-rating-container').forEach((container) => {
    if (container !== exceptContainer) {
      container.classList.remove('rating-container-expanded');
    }
  });
}

function handleRatingClick(event) {
  const ratingSummary = event.target.closest('.js-rating-summary');

  if (ratingSummary) {
    const ratingContainer = ratingSummary.closest('.js-rating-container');

    if (!ratingContainer) {
      return;
    }

    const isExpanded = ratingContainer.classList.contains('rating-container-expanded');

    closeAllRatingDetails(ratingContainer);
    ratingContainer.classList.toggle('rating-container-expanded', !isExpanded);

    return;
  }

  const clickedInsideRatingDetails = event.target.closest('.js-rating-container');

  if (!clickedInsideRatingDetails) {
    closeAllRatingDetails();
  }
}

function handleRatingKeyboard(event) {
  if (event.key === 'Escape') {
    closeAllRatingDetails();
  }
}

export function initializeRatingToggles() {
  if (ratingTogglesInitialized) {
    return;
  }

  ratingTogglesInitialized = true;

  document.addEventListener('click', handleRatingClick);
  document.addEventListener('keydown', handleRatingKeyboard);
}