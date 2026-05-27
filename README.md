# SMC Southeast Weather Hotline

A GitHub Pages weather hotline for Southeast SMC Soccer events.

## Phase 1 updates included

- Mobile-first sticky status banner
- Region filter
- Event filter
- Larger venue cards
- Fast action guidance for teams
- Admin command center
- Status templates
- Emergency Red button
- Full-screen command mode
- Auto timestamps
- Status history
- Map links per venue
- Admin history clear button
- Red status alert tone

## Admin password

Default password:

southeast2026

Change this in `script.js`:

```js
const ADMIN_PASSWORD = "southeast2026";
```

## GitHub Pages setup

1. Create a GitHub repository named `SMC-Southeast-Weather-Hotline`.
2. Upload these files to the repository root:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
3. Go to Settings.
4. Click Pages.
5. Select Deploy from branch.
6. Choose `main` and `/root`.
7. Save.
8. Open the published GitHub Pages link.

## Important

This starter version stores updates in each browser using localStorage. For multiple admins and live shared updates, upgrade to Firebase in Phase 2.


## Latest requested changes

- Updated main title to WEATHER UPDATES.
- Updated brand line to Soccer Management Company.
- Updated region title to Southeast Tournaments.
- Added North Carolina as a region.
- Added the full tournament list as a multi-select tournament filter.
