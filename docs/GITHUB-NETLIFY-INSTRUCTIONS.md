# GitHub and Netlify Publishing Instructions

This project is ready to publish as a static frontend website.

## What was cleaned before publishing

- Removed `CHANGES_PHASE_*.md` files from the public project root.
- Removed `PORTFOLIO-CV-COPY.md` from the public project package.
- Added `LICENSE`.
- Added a clean `CHANGELOG.md` instead of many phase notes.
- Moved documentation files into the `docs/` folder.
- Kept `netlify.toml` in the project root because Netlify needs it there.

## Files that should stay in GitHub

Keep these root files:

```txt
index.html
product.html
checkout.html
order-confirmation.html
orders.html
tracking.html
wishlist.html
login.html
terms.html
privacy.html
accessibility.html
404.html
sportivo.html
robots.txt
README.md
CHANGELOG.md
LICENSE
.gitignore
netlify.toml
```

Keep these folders:

```txt
data/
images/
scripts/
styles/
docs/
```

## Files that should not be committed

Do not commit:

```txt
*.zip
node_modules/
.env
.env.*
dist/
build/
.netlify/
.vscode/
.idea/
.DS_Store
Thumbs.db
```

These are already covered by `.gitignore`.

## Recommended GitHub steps

From the project folder, run:

```bash
git init
git add .
git commit -m "Prepare Sportivo for GitHub and Netlify deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

If the repository already exists locally, use:

```bash
git status
git add .
git commit -m "Prepare Sportivo for GitHub and Netlify deployment"
git push
```

## Recommended Netlify settings

When importing from GitHub into Netlify, use:

```txt
Build command: leave empty
Publish directory: .
```

Important: do not use `dist`, `build`, or `public` as the publish directory for this version.

## After Netlify publishes the site

1. Open the live website URL.
2. Test the pages in `docs/FINAL-QA-CHECKLIST.md`.
3. Copy the live Netlify URL.
4. Replace the placeholder URL in `README.md`.
5. Commit and push the README update.
