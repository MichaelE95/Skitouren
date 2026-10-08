# Skitour-Planer

A small single-page web app for planning ski tours in the Northern Alps **by public transport**.
Every tour is defined by a GPX file. The app computes real connections from your start location
to each tour's trailhead and lets you filter by total travel time, difficulty, elevation gain and more.

Live site: <https://michaele95.github.io/Skitouren/>

---

## Features

- **Map** (MapLibre, OpenStreetMap/OpenTopoMap tiles) with every tour's GPX track, trailhead and summit.
- **Real connections** from any start (station or address) to the trailhead (the first GPX point),
  including the walk from the last stop. Queried from [Transitous](https://transitous.org).
- **"Nur Nahverkehr"** switch: regional trains, S-Bahn, buses and trams only (no ICE/IC/EC, no Flixbus) – roughly Deutschlandticket-style.
- **Filters & sorting** by total travel time, elevation gain, SAC grade, Gebirgsgruppe, piste tours, rating,
  avalanche exposure and tour duration.
- **Approximate tour time** per tour (DAV rule of thumb, pure moving time without breaks):
  ascent = larger of (elevation gain ÷ 300 Hm/h, distance ÷ 4 km/h) + half of the smaller one; descent = elevation gain ÷ 1200 Hm/h.
- **Avalanche exposure ("Lawinenexposition") 1–5**, rated by you per tour, based on the
  [ATES v2](https://avalanche.ca) terrain scale (1 = hardly any avalanche terrain … 5 = extreme). It describes the terrain, not the
  daily bulletin. The filter slider "Max. Lawinenexposition" lets you, for example, show only tours ≤ 2 at danger level 3 and then
  check the rest on Skitourenguru. Tours you haven't rated yet always stay visible and show a grey "Lawine ?" badge.
- **Duplicate warning** when adding a GPX: if an existing tour has its summit within 200 m **and** its trailhead within 500 m,
  the dialog shows it and the button changes to "Trotzdem speichern" (a different route to the same peak is still possible).
- **Add, edit and delete tours** from a GPX file, directly in the browser.
- Results are **cached** in the browser and only recalculated when you click **"Fahrplan laden"**.
- **Works on phones**: compact top bar, bottom tabs *Karte | Touren | Filter | + Tour*; departure time and the Nahverkehr switch
  are in the Filter tab. On a tour's detail page, "Karte" shows its track.

> [!NOTE]
> The avalanche layer is still a placeholder (rough regions with fixed levels). Don't use it for decisions.

## Where the data comes from

| Data | Source |
| --- | --- |
| Peak name, start/peak elevation, elevation gain, distance, trailhead, summit, track | **GPX file** (parsed in the browser) |
| Approximate tour time | Calculated from elevation gain + distance (not stored) |
| Gebirgsgruppe | Wikidata lookup around the summit (optional, editable) |
| SAC grade, piste tour yes/no, avalanche exposure, Skitourenguru link (optional), rating, notes | Entered by you |
| Connections and travel time | Transitous API, from your start coordinates to the trailhead coordinates |

Nothing else is hard-coded. A GPX file with elevation data is the only requirement.

## Project structure

```
public/tours/            ← THE tour database (committed to git)
  tours.json             ← metadata for all tours
  <id>.gpx               ← original GPX file per tour
src/
  App.tsx                ← state, filtering, layout
  components/            ← Navbar, filter sidebar, tour cards/detail panel, add-tour modal, map
  services/
    transitService.ts    ← Transitous queries (origin → trailhead)
    transitSnapshot.ts   ← cached results in localStorage
    tourStore.ts         ← load/save/delete tours, Export, Push to GitHub
    peakLookup.ts        ← Wikidata Gebirgsgruppe lookup
  utils/gpxParser.ts     ← GPX parsing
vite-plugin-tour-store.ts ← local-only API that writes public/tours and runs git
start.bat                ← one-click local start (Windows)
```

## Running locally

Requirements: [Node.js](https://nodejs.org/) 20+ and git.

**Windows:** double-click **`start.bat`**. It installs the dependencies on first run, starts the
dev server and opens <http://localhost:3000>. Close the console window to stop it.

**Manually:**

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build into dist/
```

## Adding and saving tours

There are two modes, depending on where you open the app.

### 1. Local (`start.bat` / `npm run dev`) – recommended

1. Click **"Tour hinzufügen"**, pick a GPX file and fill in SAC grade, etc.
2. The tour is written straight into `public/tours/` (the GPX file plus an entry in `tours.json`).
   Edits, ratings, notes and deletions are saved there too.
3. Click **"Export → GitHub"** (amber = unpublished changes). This commits **only** `public/tours/`
   and runs `git push`. GitHub Actions then rebuilds the live site within 1–2 minutes.

Push uses your normal git credentials (Git Credential Manager on Windows). If the push fails,
the error from git is shown in the app.

### 2. Hosted site (GitHub Pages)

The live site is static and can't write to the repository. Changes made there are kept in
**your browser only** (localStorage) and are marked with an amber **"Export"** button.
Clicking it downloads `tours.json` and any new GPX files. Copy them into `public/tours/` and commit,
or simply redo the change locally. Once the deployed `tours.json` contains a change, the browser copy is cleaned up automatically.

## Deployment (GitHub Pages)

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
`npm ci` → `npm run build` → upload `dist/` → deploy to Pages.

One-time setup: in the GitHub repository, open **Settings → Pages → Build and deployment → Source**
and select **"GitHub Actions"**. Without this, the "Setup Pages" step fails with *"Get Pages site failed – Not Found"*.

The app uses relative paths (`base: './'`), so it works under any sub-path.

## Limits and fair use

- Transitous is a free, community-run service. The app requests one connection per tour (3 at a time) and only when you click "Fahrplan laden". Please keep it that way.
- The "earliest arrival" connection can include a long final walk. Cards flag walks over 30 minutes.
- Wikidata doesn't know the Gebirgsgruppe for every peak. In that case you can enter it yourself or leave it empty.


## Open ToDos
- ~~Prevent adding the same tour / GPX twice~~ → duplicate warning (summit ≤ 200 m and trailhead ≤ 500 m)
- ~~Export button grows and disturbs the layout~~ → constant size, only turns amber
- ~~Approximate time per route~~ → DAV formula, shown on cards/details, sortable
- ~~Avalanche pre-filter~~ → "Lawinenexposition" 1–5 (ATES v2) + filter slider
- ~~Optimize for smartphones~~ → phone layout with bottom tabs
- Real avalanche bulletin data instead of the placeholder layer

