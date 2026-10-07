import { Journey, JourneyLeg, LegMode, Place, SkiTour, TourTransitResult, TransitParams } from '../types';
import { decodePolyline } from '../utils/polyline';

/**
 * The ONLY source of travel times: Transitous (MOTIS) routing from the origin
 * coordinates to the tour's trailhead coordinates (first GPX point).
 * The returned duration already includes every walk, including the final one
 * from the last stop to the trailhead. Nothing is added on top.
 *
 * Usage policy: https://transitous.org/api/ (open-source, non-commercial, light usage).
 */
const API = 'https://api.transitous.org/api/v1';

/** Deutschland-Ticket style: regional trains, S-Bahn, buses, trams, subway. No ICE/IC/EC, no Flixbus (COACH). */
const REGIONAL_MODES = 'REGIONAL_FAST_RAIL,REGIONAL_RAIL,SUBURBAN,BUS,TRAM,SUBWAY';

const MAX_WALK_SECONDS = 3600; // Q6: up to 60 min walking at both ends
const CONCURRENCY = 3;
const TIMEOUT_MS = 20000;

export const DEFAULT_ORIGIN: Place = {
  // Coordinates from the Transitous geocoder (type=STOP)
  name: 'Augsburg Haunstetterstraße',
  coordinates: [10.900985, 48.355286]
};

export const LONG_FINAL_WALK_MINUTES = 30;

/** Plans one journey origin -> trailhead and returns the earliest-arrival itinerary plus alternatives. */
export async function planTourJourney(
  tour: Pick<SkiTour, 'trailhead'>,
  params: TransitParams
): Promise<TourTransitResult> {
  const [oLng, oLat] = params.origin.coordinates;
  const [tLng, tLat] = tour.trailhead;
  const q = new URLSearchParams({
    fromPlace: `${oLat},${oLng}`,
    toPlace: `${tLat},${tLng}`,
    time: new Date(params.departureLocal).toISOString(),
    maxPreTransitTime: String(MAX_WALK_SECONDS),
    maxPostTransitTime: String(MAX_WALK_SECONDS)
  });
  if (params.onlyRegional) q.set('transitModes', REGIONAL_MODES);

  try {
    const data = await fetchJsonWithRetry(`${API}/plan?${q.toString()}`);
    const its: any[] = Array.isArray(data?.itineraries) ? data.itineraries : [];
    if (its.length === 0) {
      return { ok: false, error: 'No connection found (no stop within 60 min walk of the trailhead, or no service at that time).' };
    }
    const journeys = its.map(it => toJourney(it, params.origin.name));
    // Q4: earliest arrival at the trailhead, ties -> fewer transfers
    journeys.sort((a, b) => a.arrival.localeCompare(b.arrival) || a.transfers - b.transfers);
    return { ok: true, best: journeys[0], alternatives: journeys.slice(1) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Calculates journeys for many tours with limited concurrency.
 * onResult is called as soon as each tour finishes so the UI updates progressively.
 */
export async function planAllTours(
  tours: SkiTour[],
  params: TransitParams,
  onResult: (tourId: string, result: TourTransitResult) => void
): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < tours.length) {
      const tour = tours[next++];
      const result = await planTourJourney(tour, params);
      onResult(tour.id, result);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tours.length) }, worker));
}

/** Free-text place search (stops, addresses, places) via the Transitous geocoder. */
export async function geocode(text: string): Promise<(Place & { detail: string })[]> {
  const q = new URLSearchParams({ text, language: 'de' });
  const data = await fetchJsonWithRetry(`${API}/geocode?${q.toString()}`, 1);
  if (!Array.isArray(data)) return [];
  return data.slice(0, 8).map((item: any) => {
    const areas: any[] = Array.isArray(item.areas) ? item.areas : [];
    const city = areas.filter(a => a.adminLevel >= 6 && a.adminLevel <= 8).map(a => a.name)[0];
    const typeLabel = item.type === 'STOP' ? 'Stop' : item.type === 'ADDRESS' ? 'Address' : 'Place';
    return {
      name: item.type === 'ADDRESS' && city ? `${item.name}, ${city}` : item.name,
      coordinates: [item.lon, item.lat] as [number, number],
      detail: [typeLabel, city, item.country].filter(Boolean).join(' · ')
    };
  });
}

// ---------------------------------------------------------------------------

function toJourney(it: any, originName: string): Journey {
  const legs: JourneyLeg[] = (it.legs || []).map((leg: any) => toLeg(leg, originName));
  const vehicleLegs = legs.filter(l => l.mode !== 'walk');
  const lastLeg = legs[legs.length - 1];
  const finalWalk = lastLeg && lastLeg.mode === 'walk' ? lastLeg : null;
  return {
    departure: it.startTime,
    arrival: it.endTime,
    durationMinutes: Math.round(it.duration / 60),
    transfers: typeof it.transfers === 'number' ? it.transfers : Math.max(0, vehicleLegs.length - 1),
    legs,
    lastStopName: vehicleLegs.length ? vehicleLegs[vehicleLegs.length - 1].toName : null,
    finalWalkMinutes: finalWalk ? finalWalk.durationMinutes : 0,
    finalWalkMeters: finalWalk ? Math.round(finalWalk.distanceMeters || 0) : 0
  };
}

function toLeg(leg: any, originName: string): JourneyLeg {
  const mode = classifyMode(leg.mode);
  const fromName = leg.from?.name === 'START' ? originName : leg.from?.name || '';
  const toName = leg.to?.name === 'END' ? 'Trailhead (GPX start)' : leg.to?.name || '';
  const out: JourneyLeg = {
    mode,
    rawMode: leg.mode,
    lineName: mode === 'walk' ? 'Walk' : lineName(leg),
    headsign: leg.headsign || undefined,
    fromName,
    toName,
    departure: leg.startTime,
    arrival: leg.endTime,
    durationMinutes: Math.round((leg.duration || 0) / 60)
  };
  if (mode === 'walk') {
    out.distanceMeters = typeof leg.distance === 'number' ? leg.distance : undefined;
    if (leg.legGeometry?.points) {
      out.geometry = decodePolyline(leg.legGeometry.points, leg.legGeometry.precision ?? 7)
        .map(([x, y]) => [Math.round(x * 1e5) / 1e5, Math.round(y * 1e5) / 1e5] as [number, number]);
    }
  }
  return out;
}

function classifyMode(m: string): LegMode {
  if (m === 'WALK') return 'walk';
  if (m === 'BUS' || m === 'COACH') return 'bus';
  if (/RAIL|SUBURBAN|SUBWAY|METRO|TRAM/.test(m)) return 'rail';
  return 'other';
}

/** "RE9 (57015)" -> "RE9"; falls back to displayName / mode. */
function lineName(leg: any): string {
  const raw: string = leg.routeShortName || leg.displayName || leg.tripShortName || '';
  const cleaned = raw.replace(/\s*\(\d+\)\s*$/, '').trim();
  return cleaned || leg.mode;
}

async function fetchJsonWithRetry(url: string, retries = 2): Promise<any> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (res.ok) return await res.json();
      // Client errors (except rate limiting) won't get better with a retry
      if (res.status !== 429 && res.status < 500) {
        throw Object.assign(new Error(`Transitous returned HTTP ${res.status}`), { fatal: true });
      }
      lastErr = new Error(`Transitous returned HTTP ${res.status}`);
    } catch (err: any) {
      if (err?.fatal) throw err;
      lastErr = err?.name === 'AbortError' ? new Error('Transitous request timed out') : err;
    } finally {
      clearTimeout(timer);
    }
    if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * 2 ** attempt));
  }
  throw lastErr instanceof Error ? lastErr : new Error('Transitous request failed');
}
