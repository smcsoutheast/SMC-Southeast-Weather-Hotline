# SMC Southeast Weather Hotline

This is a self-contained GitHub Pages starter kit for a Southeast weather hotline.

## Files

- index.html, public page and admin command center
- style.css, visual styling
- script.js, venue data, admin tools, status updates, and local storage

## Default admin password

southeast2026

Change this in script.js:

const ADMIN_PASSWORD = "southeast2026";

## How to publish on GitHub Pages

1. Create a new GitHub repository named SMC-Southeast-Weather-Hotline.
2. Upload index.html, style.css, script.js, and README.md.
3. Go to Settings.
4. Click Pages.
5. Under Source, choose Deploy from a branch.
6. Select main branch and root folder.
7. Click Save.
8. Open the GitHub Pages URL after deployment finishes.

## Important

This version stores updates in browser localStorage. It is best for testing or use from one admin device.

For multiple admins and live shared updates, upgrade to Firebase.
