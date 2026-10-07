import { SkiTour } from '../types';

/**
 * Tours live in the repo: public/tours/tours.json + public/tours/<id>.gpx.
 * - `npm run dev`: writes go through the dev-only Vite plugin straight into public/tours/.
 * - Hosted static site: writes go into a localStorage overlay that can be exported.
 */
const OVERLAY_KEY = 'skitour_tour_overlay_v1';
const IS_DEV = import.meta.env.DEV;
const BASE = import.meta.env.BASE_URL; // './' in this project

interface Overlay {
  upserts: Record<string, SkiTour>;
  gpx: Record<string, string>; // gpxFile -> GPX text (hosted mode only)
  deleted: string[];
}

export const canWriteToRepo = IS_DEV;

export async function loadTours(): Promise<SkiTour[]> {
  let base: SkiTour[] = [];
  try {
    const res = await fetch(`${BASE}tours/tours.json`, { cache: 'no-store' });
    if (res.ok) base = await res.json();
  } catch (err) {
    console.error('Could not load tours.json:', err);
  }
  if (IS_DEV) return base;

  const ov = loadOverlay();
  const map = new Map(base.map(t => [t.id, t]));
  for (const id of ov.deleted) map.delete(id);
  for (const t of Object.values(ov.upserts)) map.set(t.id, t);
  return Array.from(map.values());
}

/** Saves a tour (new or edited). gpxText is only required when the GPX is new/replaced. */
export async function saveTour(tour: SkiTour, gpxText?: string): Promise<void> {
  if (IS_DEV) {
    await post('/__tours/save', { tour, gpxText });
    return;
  }
  const ov = loadOverlay();
  ov.upserts[tour.id] = tour;
  ov.deleted = ov.deleted.filter(id => id !== tour.id);
  if (gpxText) ov.gpx[tour.gpxFile] = gpxText;
  saveOverlay(ov);
}

export async function deleteTour(tour: SkiTour): Promise<void> {
  if (IS_DEV) {
    await post('/__tours/delete', { id: tour.id });
    return;
  }
  const ov = loadOverlay();
  delete ov.upserts[tour.id];
  delete ov.gpx[tour.gpxFile];
  if (!ov.deleted.includes(tour.id)) ov.deleted.push(tour.id);
  saveOverlay(ov);
}

/** URL of the original GPX file (overlay GPX files become blob URLs on the hosted site). */
export function gpxUrl(tour: SkiTour): string {
  if (!IS_DEV) {
    const text = loadOverlay().gpx[tour.gpxFile];
    if (text) return URL.createObjectURL(new Blob([text], { type: 'application/gpx+xml' }));
  }
  return `${BASE}tours/${encodeURIComponent(tour.gpxFile)}`;
}

/** Hosted site only: download the merged tours.json plus any GPX files added in this browser. */
export async function exportOverlay(): Promise<void> {
  const tours = await loadTours();
  download('tours.json', JSON.stringify(tours, null, 2), 'application/json');
  const ov = loadOverlay();
  for (const [file, text] of Object.entries(ov.gpx)) download(file, text, 'application/gpx+xml');
}

export function hasOverlayChanges(): boolean {
  if (IS_DEV) return false;
  const ov = loadOverlay();
  return Object.keys(ov.upserts).length > 0 || ov.deleted.length > 0;
}

// ---------------------------------------------------------------------------

async function post(path: string, body: unknown): Promise<void> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Saving failed: ${await res.text()}`);
}

function loadOverlay(): Overlay {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { upserts: {}, gpx: {}, deleted: [] };
}

function saveOverlay(ov: Overlay): void {
  localStorage.setItem(OVERLAY_KEY, JSON.stringify(ov));
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

