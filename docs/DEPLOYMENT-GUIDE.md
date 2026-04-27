# Sportivo Deployment Guide

This project is a static storefront. It does not require a backend server, database, or build step for the current portfolio version.

## Recommended hosting

Netlify is the easiest option for this project.

## Option 1 — Deploy from GitHub

1. Push the final project to GitHub.
2. Open Netlify and create a new site from Git.
3. Choose the Sportivo repository.
4. Use these settings:

```txt
Build command: leave empty
Publish directory: .
```

5. Deploy the site.
6. Open the deployed URL and test the pages listed in `FINAL-QA-CHECKLIST.md`.
7. Add the live URL to `README.md`.
8. Add the live URL to your portfolio project card.

## Option 2 — Drag and drop deploy

1. Open Netlify.
2. Choose manual deploy / drag and drop.
3. Drag the project folder, not only one HTML file.
4. Wait for Netlify to publish it.
5. Test all important pages.

## Important deployment notes

- The publish directory should be the project root because `index.html` is in the root.
- Do not set `dist`, `build`, or `public` as the publish directory for this version.
- Do not use `my-products-backend`; the current storefront is frontend-only.
- Keep `netlify.toml` in the root.
- After deployment, update the live demo link in `README.md`.

## Netlify configuration included

The project includes `netlify.toml` with:

- root static publishing
- redirect from the old `sportivo.html` entry page to `index.html`
- redirect from `/home` to `index.html`
- fallback 404 page for unmatched routes

## Post-deployment smoke test

Open the live site and test:

1. Homepage loads correctly.
2. Search and filters work.
3. Product details pages open.
4. Add to cart works.
5. Wishlist works.
6. Checkout form validation works.
7. Placing an order opens the confirmation page.
8. Orders page shows the placed order.
9. Tracking page shows the order timeline.
10. Header, footer, logo, and product cards look consistent.
