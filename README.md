# SMC Southeast Weather Hotline

This is a self-contained GitHub Pages weather hotline for Soccer Management Company Southeast tournaments.

## Included files

- index.html
- style.css
- script.js
- README.md

## Phase 2 updates included

- Multi-admin access
- Admin access minimized to shield icon
- Venue-level controls
- Venue details editing
- Multi-select events per venue
- Automatic global status from venue status
- Venue cards match status color
- Command Center-only filters
- Public current tournament visibility control
- Incident logging
- Live operations timeline
- File and photo uploads for incident records
- Public map and venue detail support
- Full-screen command mode
- Emergency Red button
- All Green and All Yellow buttons

## Admin access

Click the shield icon in the bottom right corner.

Admin users:

- Tournament Director, Justin: justin2026$
- Tournament Operations, Ashley: ashley2026$

These passwords are stored in the front-end JavaScript file. This is suitable for simple GitHub Pages use, but not secure for sensitive data. For stronger protection, move admin access and data storage to Firebase, Supabase, or another backend.

## GitHub Pages setup

1. Create a GitHub repository named `SMC-Southeast-Weather-Hotline`.
2. Upload all files from this folder.
3. Go to Settings.
4. Go to Pages.
5. Select Deploy from branch.
6. Choose the main branch.
7. Choose root folder.
8. Save.

Your site should publish at:

https://smcsoccer.github.io/SMC-Southeast-Weather-Hotline/

## How to use

1. Open the public hotline page.
2. Click the shield icon.
3. Enter an admin password.
4. Update venue status, notes, details, maps, and tournament assignments.
5. Add timeline updates for public operations notes.
6. Log private incidents with optional file uploads.
7. Use Public Tournament View to show only current tournaments.

## Status logic

The global status updates automatically.

- Any Red venue makes the global status Red.
- If no venues are Red, any Yellow venue makes the global status Yellow.
- If all venues are Green, the global status is Green.

## Data storage

This version uses browser localStorage.

This means:

- Updates stay in the same browser.
- Updates do not automatically sync across devices.
- Uploaded files are stored in the browser and count toward storage limits.

For live multi-device use, upgrade the storage layer to Firebase.

Latest display change:

The public venue cards now show only the venue name, status, and public note. Venue names display in uppercase. Card content is centered. Card color matches the venue status.


Latest changes

- Operations Timeline is now available only inside Admin Access.
- Status History entries are color coded by status.
