// scripts/shared/footer.js

import { showModal } from './region-modal.js'; // <-- NEW IMPORT

export function renderFooter() {
  const footerHTML = `
    <footer class="sportivo-footer">
      <div class="footer-content">
        <!-- Back to Top -->
        <div class="back-to-top">
          <button class="back-to-top-btn" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
            Back to top
          </button>
        </div>

        <!-- Main Footer Sections -->
        <div class="footer-sections">
          <!-- Newsletter Section -->
          <div class="footer-section newsletter-section">
            <h3>JOIN SPORTIVO SPORTS CLUB</h3>
            <p>Discover all Sportivo Sports stories – and be the first to hear about new products, promotions and events.</p>
            <form class="newsletter-form">
              <input type="email" class="newsletter-input" placeholder="name@email.com" required>
              <div class="newsletter-checkbox">
                <input type="checkbox" id="privacy-policy" required>
                <label for="privacy-policy">I agree to the privacy policy of Sportivo Sports.</label>
              </div>
              <button type="submit" class="newsletter-btn">SUBSCRIBE</button>
            </form>
          </div>

          <!-- Service Section -->
          <div class="footer-section">
            <h4>SERVICE</h4>
            <ul class="footer-links">
              <li><a href="faq.html">FAQ</a></li>
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="size-guide.html">Size Guide</a></li>
              <li><a href="orders.html">Order Tracking</a></li>
              <li><a href="shipping.html">Shipping & Delivery</a></li>
              <li><a href="returns.html">Returns & Complaints</a></li>
              <li><a href="showroom.html">Showroom/Store</a></li>
            </ul>
          </div>

          <!-- About Us Section -->
          <div class="footer-section">
            <h4>ABOUT US</h4>
            <ul class="footer-links">
              <li><a href="about.html">All About Sportivo</a></li>
              <li><a href="press.html">Press & News</a></li>
              <li><a href="explore.html">Explore Sportivo Sports</a></li>
              <li><a href="players.html">Players & Teams</a></li>
              <li><a href="b2b.html">B2B Store & Showroom</a></li>
              <li><a href="terms.html">Ts&Cs - B2B</a></li>
              <li><a href="careers.html">Careers</a></li>
            </ul>
          </div>

          <!-- Categories Section -->
          <div class="footer-section">
            <h4>CATEGORIES</h4>
            <ul class="footer-links">
              <li><a href="sportivo.html?sport=tabletennis">Table Tennis</a></li>
              <li><a href="Sportivo.html?sport=football">Football Equipment</a></li>
              <li><a href="Sportivo.html?sport=basketball">Basketball Gear</a></li>
              <li><a href="Sportivo.html?sport=vollyball">Volleyball</a></li>
              <li><a href="training.html">Training Equipment</a></li>
              <li><a href="apparel.html">Sports Apparel</a></li>
              <li><a href="accessories.html">Accessories</a></li>
            </ul>
          </div>

          <!-- Follow Us Section -->
          <div class="footer-section">
            <h4>FOLLOW US</h4>
            <div class="social-links">
              <a href="https://facebook.com" target="_blank" class="social-link">📘 Facebook</a>
              <a href="https://instagram.com" target="_blank" class="social-link">📷 Instagram</a>
              <a href="https://twitter.com" target="_blank" class="social-link">🐦 Twitter</a>
              <a href="https://youtube.com" target="_blank" class="social-link">📺 YouTube</a>
            </div>
            
            <div class="footer-address">
              <p><strong>Visitor Address:</strong></p>
              <p>410 Terry Ave North</p>
              <p>Seattle, WA 98109</p>
              <p>United States</p>
            </div>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <div class="footer-links-bottom">
              <a href="terms.html">Terms & Conditions</a>
              <a href="privacy.html">Privacy Policy</a>
              <a href="consent.html">Consent</a>
              <a href="accessibility.html">European Accessibility Act</a>
              <a href="imprint.html">Imprint</a>
            </div>
            
            <div class="footer-copyright">
              <p>&copy; 2025 Sportivo Sports. All rights reserved.</p>
            </div>
            
            <div class="footer-region">
              <span>🌍 United States / USD</span>
              <span class="region-change js-region-change">Change Region</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;

  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }

  // Re-attach event listeners for the new footer content
  initializeFooterScripts();
}

function initializeFooterScripts() {
  // Newsletter Form Script
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('.newsletter-input').value;
      const privacyChecked = this.querySelector('#privacy-policy').checked;
      
      if (!email) {
        alert('Please enter your email address.');
        return;
      }
      
      if (!privacyChecked) {
        alert('Please agree to the privacy policy.');
        return;
      }
      
      console.log('Newsletter signup:', email);
      alert('Thank you for subscribing to Sportivo Sports Club!');
      this.reset();
    });
  }

  // Region Selector Script - NOW USES THE MODAL
  const regionChange = document.querySelector('.js-region-change');
  if (regionChange) {
    regionChange.addEventListener('click', () => {
      showModal();
    });
  }

  // Load saved region on page load
  const savedRegion = localStorage.getItem('userRegion');
  const savedCurrency = localStorage.getItem('userCurrency');
  const savedFlag = localStorage.getItem('userFlag');
  if (savedRegion && savedCurrency && savedFlag) {
    const regionElement = document.querySelector('.footer-region span:first-child');
    if (regionElement) {
      regionElement.textContent = `${savedFlag} ${savedRegion} / ${savedCurrency}`;
    }
  }

  // Handle "Coming Soon" links
  const links = document.querySelectorAll('.sportivo-footer a[href$=".html"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const existingPages = [
        'sportivo.html', 'orders.html', 'wishlist.html', 'checkout.html', 
        'tracking.html', 'terms.html', 'privacy.html', 'accessibility.html'
      ];
      const href = this.getAttribute('href');
      
      if (!existingPages.includes(href)) {
        e.preventDefault();
        alert('This page is coming soon! 🚀\n\n' + this.textContent + ' page is under development.');
      }
    });
  });
}