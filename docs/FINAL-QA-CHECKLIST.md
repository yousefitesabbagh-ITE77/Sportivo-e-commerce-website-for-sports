# Sportivo Final QA Checklist

Use this checklist before committing, pushing, or publishing the project.

## Core pages

- [ ] `index.html` loads without console errors.
- [ ] `product.html` opens correctly from product cards.
- [ ] `wishlist.html` shows saved products.
- [ ] `checkout.html` shows cart items and payment summary.
- [ ] `order-confirmation.html` shows the latest order after checkout.
- [ ] `orders.html` shows order history and filters.
- [ ] `tracking.html` shows package tracking timeline.
- [ ] `login.html` matches the Sportivo brand style.
- [ ] `terms.html`, `privacy.html`, and `accessibility.html` use consistent layout.
- [ ] `404.html` displays correctly for missing pages.

## Shopping flow

- [ ] Add a product to the cart from the catalog.
- [ ] Add a product to the cart from the product details page.
- [ ] Change product quantity.
- [ ] Remove a product from the cart.
- [ ] Add and remove products from wishlist.
- [ ] Use the Buy now action from product details.
- [ ] Complete checkout with valid customer information.
- [ ] Confirm the order appears in order history.
- [ ] Open tracking from the confirmation page.
- [ ] Use Buy again from orders or tracking.

## Catalog and filters

- [ ] Header search returns relevant suggestions.
- [ ] Catalog search filters products correctly.
- [ ] Sport filter works.
- [ ] Category filter works.
- [ ] Price filter works.
- [ ] Sort options work.
- [ ] Active filter chips can be removed.
- [ ] Clear all resets the catalog.
- [ ] Empty search state looks polished.

## Visual consistency

- [ ] The new Sportivo logo appears where expected.
- [ ] Product cards use one consistent design system.
- [ ] Buttons have consistent colors, spacing, and hover states.
- [ ] Header variant matches the page type.
- [ ] Footer style is consistent.
- [ ] No storefront-facing text says “demo”, “portfolio”, “Vanilla JavaScript”, or “localStorage”.

## Responsive checks

Test at these widths:

- [ ] 1440px desktop
- [ ] 1024px laptop/tablet
- [ ] 768px tablet
- [ ] 390px mobile

Check:

- [ ] No horizontal scrolling.
- [ ] Header does not overlap content.
- [ ] Product cards remain readable.
- [ ] Filters are usable on mobile.
- [ ] Checkout form is easy to complete on mobile.

## Accessibility checks

- [ ] Keyboard `Tab` navigation works.
- [ ] Skip link appears on keyboard focus.
- [ ] Focus states are visible.
- [ ] Main content can be reached through the skip link.
- [ ] Buttons and links have understandable labels.
- [ ] Forms show clear validation messages.
- [ ] Reduced motion preference is respected.

## Deployment checks

- [ ] `netlify.toml` is in the root folder.
- [ ] Netlify publish directory is `.`.
- [ ] Build command is empty.
- [ ] Live site URL is added to `README.md`.
- [ ] Live site URL is added to the portfolio project card.
