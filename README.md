# 🎿 Skitour-Planer | Augsburg Haunstetter Straße ↔ Nordalpen

Eine schlanke, interaktive Single Page Web-App zur schnellen und zuverlässigen Planung von Skitouren mit dem öffentlichen Nahverkehr (primär **Deutschland-Ticket**) direkt ab **Augsburg Haunstetter Straße**.

---

## 🏔️ Highlights & Funktionen

- **📍 Heimatbahnhof im Fokus:** Alle Touren berechnen Abfahrtszeiten, Umstiege und Fahrtdauer ab **Augsburg Haunstetter Straße (`8000713`)**.
- **🎫 Deutschland-Ticket Transparenz:** Sofortige Kennzeichnung, ob die Anreise zu 100% im D-Ticket inkludiert ist (z.B. Außerfernbahn, Walserbus) oder ob kleine Teilstrecken-Tickets anfallen (z.B. Tannheimer Tal Bus 120, ÖBB Scharnitz–Seefeld).
- **🗺️ Interaktive Alpine 3D-Karte (MapLibre GL):**
  - Topografische Relief- und Standard-Karten
  - **3D-Geländerelief (Pitch & Tilt):** Plastische Beurteilung von Steilheit und Hängen
  - Visualisierung der wichtigsten Bahnstrecken (Außerfernbahn, Werdenfelsbahn, Allgäu-Express, Füssen-Bahn, Walserbus)
  - Zoom & GPX-Routen-Highlighting bei Auswahl einer Tour
- **⚠️ Integrierter Lawinenwarndienst (EAWS):**
  - Farbcodierte Gefahrenstufen (Stufe 1 bis 5) direkt auf der Karte (Bayern & Tirol/Vorarlberg)
  - Live-Gefahrenbadge, kritische Hangexpositionen und Lawinenprobleme auf jeder Tourenkarte
- **🧗 Offizielle SAC-Skitourenskala:**
  - Exakte Einstufung (L-, L, L+, WS-, WS, WS+, ZS-, ZS, ZS+, S) mit Schnellfiltern für Hauptkategorien
- **📥 GPX-Download & Skitourenguru:**
  - 1-Klick GPX-Track Download für GPS-Geräte & Uhren (Garmin, Suunto, Outdooractive)
  - Deep-Link direkt zur automatisierten Risikoberechnung auf **Skitourenguru.ch**
- **🚆 Live DB Fahrplanabfrage:**
  - Echtzeit-Abfrage der heutigen Regionalzugverbindungen ab Haunstetter Straße mit Gleisangaben und eventuellen Verspätungen
- **🔍 Mächtige Filter:**
  - Filter nach Fahrzeit ab Haunstetter Str. (z.B. ≤ 2h)
  - Schnellfilter *Nur 100% Deutschland-Ticket*
  - Schnellfilter *Nur Pistenskitouren* (sichere Ausweichtour bei hoher Lawinenwarnstufe oder schlechter Sicht)
  - Filter nach Höhenmeter-Aufstieg, SAC-Schwierigkeit, Gebirgsgruppe und Lawinenstufe
- **🏠 Mehrtagestouren & DAV-Hütten:**
  - Vorbereitung für Mehrtages-Touren mit DAV-Hütten und Winterräumen (z.B. Mindelheimer Hütte)

---

## 🚀 Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Lokalen Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build
```

---

## 🌐 Kostenloses Hosting auf GitHub Pages

Die Anwendung ist zu 100% als statische Single Page Application konzipiert und enthält bereits einen fertigen GitHub Actions Workflow (`.github/workflows/deploy.yml`).

### In 2 Schritten aktivieren:
1. Projekt in ein GitHub-Repository pushen.
2. Im GitHub-Repository unter **Settings** → **Pages** die Option **Build and deployment > Source** auf **GitHub Actions** stellen.
3. Die App wird bei jedem Push auf `main` automatisch gebaut und kostenlos unter `https://<dein-nutzername>.github.io/<repo-name>/` veröffentlicht!

*(Alternativ: Auch auf Vercel oder Netlify mit einem Klick kostenlos importierbar).*

---

## 📝 Touren erweitern oder anpassen

Alle Touren, SAC-Schwierigkeiten, Fahrzeiten und persönlichen Freundes-Tipps sind in einer übersichtlichen Datei versioniert:
👉 [`src/data/tours.ts`](./src/data/tours.ts)

Neue Touren können dort einfach als JSON/TypeScript-Objekt eingetragen werden und stehen sofort auf der Website zur Verfügung.

