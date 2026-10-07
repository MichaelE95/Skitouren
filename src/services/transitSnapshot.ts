import { Place, TourTransitResult, TransitParams, TransitSnapshot } from '../types';

/**
 * Q2/Q3: one snapshot of the last calculation, persisted in localStorage.
 * Loaded on page open (no network calls); only replaced by "Fahrplan laden".
 */
const SNAPSHOT_KEY = 'skitour_transit_snapshot_v1';
const FAVOURITES_KEY = 'skitour_origin_favourites_v1';

export function loadSnapshot(): TransitSnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as TransitSnapshot) : null;
  } catch {
    return null;
  }
}

export function saveSnapshot(snapshot: TransitSnapshot): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.error('Could not persist transit snapshot:', err);
  }
}

export function withTourResult(snapshot: TransitSnapshot, tourId: string, result: TourTransitResult): TransitSnapshot {
  return { ...snapshot, results: { ...snapshot.results, [tourId]: result } };
}

export function withoutTour(snapshot: TransitSnapshot, tourId: string): TransitSnapshot {
  const results = { ...snapshot.results };
  delete results[tourId];
  return { ...snapshot, results };
}

/** True if the snapshot was calculated for different inputs than the current ones. */
export function isStale(snapshot: TransitSnapshot | null, current: TransitParams): boolean {
  if (!snapshot) return true;
  const p = snapshot.params;
  return (
    p.departureLocal !== current.departureLocal ||
    p.onlyRegional !== current.onlyRegional ||
    p.origin.coordinates[0] !== current.origin.coordinates[0] ||
    p.origin.coordinates[1] !== current.origin.coordinates[1]
  );
}

// --- Origin favourites (Q5) ---

export function loadFavourites(): Place[] {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    return raw ? (JSON.parse(raw) as Place[]) : [];
  } catch {
    return [];
  }
}

export function saveFavourites(list: Place[]): void {
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(list));
  } catch {}
}

/** Next Saturday 06:30 local time, as "YYYY-MM-DDTHH:mm". */
export function defaultDepartureLocal(): string {
  const now = new Date();
  let days = (6 - now.getDay() + 7) % 7;
  if (days === 0 && now.getHours() >= 6) days = 7;
  const d = new Date(now);
  d.setDate(now.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T06:30`;
}

