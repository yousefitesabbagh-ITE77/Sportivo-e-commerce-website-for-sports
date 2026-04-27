// scripts/shared/footer.js

export function renderFooter() {
  const footerContainer = document.getElementById('footer-container');

  if (!footerContainer) {
    return;
  }

  const currentYear = new Date().getFullYear();

  footerContainer.innerHTML = `
    <footer class="sportivo-footer">
      <div class="back-to-top">
        <button class="back-to-top-btn js-back-to-top" type="button">
          Back to top
        </button>
      </div>

      <div class="footer-content">
        <div class="footer-sections">
          <div class="footer-section newsletter-section">
            <a href="index.html" class="footer-logo-link" aria-label="Go to Sportivo homepage">
              <img src="images/logo/sportivo-logo-white.svg" alt="Sportivo" class="footer-logo">
            </a>

            <p>
              Sports equipment, footwear, and training essentials selected for match days, workouts, and everyday active routines.
            </p>

            <form class="newsletter-form js-newsletter-form">
              <label for="newsletter-email" class="newsletter-label">Get gear drops and training picks</label>

              <div class="newsletter-row">
                <input
                  id="newsletter-email"
                  type="email"
                  class="newsletter-input js-newsletter-input"
                  placeholder="name@email.com"
                  aria-label="Email address"
                  required
                >

                <button type="submit" class="newsletter-btn">
                  Join
                </button>
              </div>

              <p class="newsletter-message js-newsletter-message" aria-live="polite"></p>
            </form>
          </div>

          <div class="footer-section">
            <h4>Shop</h4>
            <ul class="footer-links">
              <li><a href="index.html">All products</a></li>
              <li><a href="index.html?category=shoes">Footwear</a></li>
              <li><a href="index.html?category=balls">Balls</a></li>
              <li><a href="index.html?category=training">Training</a></li>
              <li><a href="wishlist.html">Wishlist</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Sports</h4>
            <ul class="footer-links">
              <li><a href="index.html?sport=football">Football</a></li>
              <li><a href="index.html?sport=basketball">Basketball</a></li>
              <li><a href="index.html?sport=tabletennis">Table Tennis</a></li>
              <li><a href="index.html?sport=volleyball">Volleyball</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Support</h4>
            <ul class="footer-links">
              <li><a href="orders.html">Order history</a></li>
              <li><a href="tracking.html">Track an order</a></li>
              <li><a href="checkout.html">Cart and checkout</a></li>
              <li><a href="accessibility.html">Accessibility</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Company</h4>
            <ul class="footer-links">
              <li><a href="terms.html">Terms</a></li>
              <li><a href="privacy.html">Privacy</a></li>
              <li><a href="login.html">Account</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <div class="footer-copyright">
              <p>&copy; ${currentYear} Sportivo. All rights reserved.</p>
            </div>

            <div class="footer-links-bottom">
              <a href="terms.html">Terms</a>
              <a href="privacy.html">Privacy</a>
              <a href="accessibility.html">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;

  initializeFooterScripts();
}

function initializeFooterScripts() {
  const backToTopButton = document.querySelector('.js-back-to-top');

  if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  const newsletterForm = document.querySelector('.js-newsletter-form');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const newsletterInput = document.querySelector('.js-newsletter-input');
      const newsletterMessage = document.querySelector('.js-newsletter-message');
      const email = newsletterInput?.value.trim();

      if (!email) {
        if (newsletterMessage) {
          newsletterMessage.textContent = 'Please enter a valid email address.';
        }

        return;
      }

      if (newsletterMessage) {
        newsletterMessage.textContent = 'Thanks for joining the Sportivo list.';
      }

      newsletterForm.reset();
    });
  }
}
