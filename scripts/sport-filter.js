// scripts/sport-filter.js

let sportFilterInitialized = false;

export function filterProductsBySport(sport, productsArray) {
  if (sport === 'all') {
    return productsArray;
  }

  return productsArray.filter((product) => {
    return product.getSportCategory() === sport;
  });
}

function handleSportFilterChange(event) {
  const selectedSport = event.target.value;
  const currentUrl = new URL(window.location.href);

  if (selectedSport === 'all') {
    currentUrl.searchParams.delete('sport');
  } else {
    currentUrl.searchParams.set('sport', selectedSport);
  }

  currentUrl.searchParams.delete('search');

  window.location.href = currentUrl.toString();
}

export function initializeSportFilter(selectedSport = 'all') {
  const sportFilter = document.querySelector('.js-sport-filter');

  if (!sportFilter) {
    return;
  }

  sportFilter.value = selectedSport;

  if (sportFilterInitialized) {
    return;
  }

  sportFilterInitialized = true;
  sportFilter.addEventListener('change', handleSportFilterChange);
}