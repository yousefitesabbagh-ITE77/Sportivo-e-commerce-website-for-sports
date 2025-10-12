export function filterProductsBySport(sport, productsArray) {
  if (sport === 'all') {
    return productsArray;
  }
  
  return productsArray.filter(product => {
    return product.getSportCategory() === sport;
  });
}

export function initializeSportFilter(selectedSport = 'all') {
  const sportFilter = document.querySelector('.js-sport-filter');
  
  if (sportFilter) {
    // Set the selected value
    sportFilter.value = selectedSport;
    
    sportFilter.addEventListener('change', (event) => {
      const selectedSport = event.target.value;
      const currentUrl = new URL(window.location.href);
      
      if (selectedSport === 'all') {
        currentUrl.searchParams.delete('sport');
      } else {
        currentUrl.searchParams.set('sport', selectedSport);
      }
      
      // Remove search parameter when changing sport
      currentUrl.searchParams.delete('search');
      
      window.location.href = currentUrl.toString();
    });
  }
}