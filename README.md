# SMC Southeast Weather Hotline

Admin password:

southeast2026

## What this version includes

- Public weather update page
- Admin-protected command center
- Green, Yellow, and Red status levels
- Venue card color changes based on status
- Automatic global status based on venue status
- Red overrides Yellow. Yellow overrides Green.
- Editable venue name, region, tournaments, map link, status, and note
- Venues can be assigned to multiple tournaments
- Command center region and tournament filters
- Public filters removed from public view
- Public view setting to show only current tournaments
- Status templates
- Emergency Red action
- Full-screen command mode
- Status history

## GitHub Pages setup

1. Create a GitHub repository.
2. Upload these files to the root of the repository:
   - index.html
   - style.css
   - script.js
   - README.md
3. Go to Settings.
4. Go to Pages.
5. Select Deploy from branch.
6. Select main branch and root folder.
7. Save.
8. Open the GitHub Pages link.

## Command center workflow

1. Open the hotline page.
2. Scroll to Admin Access.
3. Enter the admin password.
4. Use Command Center filters to find venues.
5. Edit venue details.
6. Select one or more tournaments per venue.
7. Save the venue.
8. Use Public Tournament View to choose which tournaments appear publicly.
9. Turn on Show only current tournaments when needed.
10. Save Public View.

## Status logic

- If any venue is Red, global status becomes Red.
- If no venue is Red and at least one venue is Yellow, global status becomes Yellow.
- If all venues are Green, global status becomes Green.

## Storage

This version uses browser localStorage. Updates are saved on the device and browser used to make changes.

For live multi-admin use, upgrade to Firebase.
