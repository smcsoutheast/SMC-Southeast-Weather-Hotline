# GitHub Pages Deployment Checklist

Use this package when the GitHub Pages site does not load.

## Correct upload method

Upload the files inside this ZIP to the repository root.

The repository root should show:

- index.html
- style.css
- script.js
- README.md
- assets/
- .nojekyll

Do not upload a folder named `smc-southeast-weather-hotline` into the repository root. If `index.html` sits inside that folder, GitHub Pages may show a 404 page.

## GitHub Pages settings

1. Open the GitHub repository.
2. Go to Settings.
3. Go to Pages.
4. Set Source to Deploy from a branch.
5. Set Branch to main.
6. Set folder to /root.
7. Click Save.
8. Wait 1 to 3 minutes.
9. Open the GitHub Pages URL.

## Common cause of failure

The prior ZIP placed all files inside a top-level folder. GitHub Pages needs `index.html` at the root of the publishing branch.

## Local file check

Open `index.html` directly from this package to preview the page.

## Admin logins

- Justin, Tournament Director: justin2026$
- Ashley, Tournament Operations: ashley2026$
