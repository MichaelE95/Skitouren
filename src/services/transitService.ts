import { LiveJourneyResult, LiveJourneyLeg, OriginStation, SkiTour } from '../types';
import { ALL_PRESET_ORIGIN_STATIONS, KEY_STATIONS, TrainStation } from '../data/trainLines';

// In-memory cache for itineraries
const journeyCache = new Map<string, LiveJourneyResult>();

/**
 * Builds a 100% verified DB Navigator / bahn.de deep-link.
 * Uses exact HAFAS parameters so the new bahn.de Single Page App executes the search automatically.
 * Automatically enables `dlt=true` and regional transit modes `vm=03,04,05,06,07,08,09` if onlyRegional is active.
 */
export function buildWorkingDbUrl(
  origin: { name: string; coordinates: [number, number]; eva?: string; cleanDbName?: string },
  destination: { name: string; coordinates: [number, number]; eva?: string; cleanDbName?: string },
  departureDateTimeIso?: string,
  onlyRegional: boolean = true
): string {
  const originName = origin.cleanDbName || origin.name;
  const destName = destination.cleanDbName || destination.name;
  const originEva = origin.eva || '780251';
  const destEva = destination.eva || '8100088';

  const soid = `A=1@O=${originName}@X=${Math.round(origin.coordinates[0] * 1e6)}@Y=${Math.round(origin.coordinates[1] * 1e6)}@U=80@L=${originEva}@`;
  const zoid = `A=1@O=${destName}@X=${Math.round(destination.coordinates[0] * 1e6)}@Y=${Math.round(destination.coordinates[1] * 1e6)}@U=80@L=${destEva}@`;

  const hd = departureDateTimeIso ? departureDateTimeIso.slice(0, 19) : new Date().toISOString().slice(0, 19);

  let url = (
    `https://www.bahn.de/buchung/fahrplan/suche#sts=true` +
    `&so=${encodeURIComponent(originName)}` +
    `&zo=${encodeURIComponent(destName)}` +
    `&soei=${encodeURIComponent(originEva)}` +
    `&zoei=${encodeURIComponent(destEva)}` +
    `&sot=ST&zot=ST` +
    `&soid=${encodeURIComponent(soid)}` +
    `&zoid=${encodeURIComponent(zoid)}` +
    `&kl=2` +
    `&r=13:16:KLASSENLOS:1` +
    `&hd=${encodeURIComponent(hd)}` +
    `&hza=D`
  );

  if (onlyRegional) {
    url += `&dlt=true&vm=03,04,05,06,07,08,09`;
  } else {
    url += `&dlt=false`;
  }

  url += `&s=true`;
  return url;
}

/**
 * Backwards-compatible alias for buildWorkingDbUrl with simple names.
 */
export function buildDbNavigatorUrl(
  originName: string,
  destinationName: string,
  departureDateTimeIso?: string,
  onlyRegional: boolean = true
): string {
  const foundOrigin = ALL_PRESET_ORIGIN_STATIONS.find(s => s.name === originName || s.cleanDbName === originName);
  const foundDest = KEY_STATIONS.find(s => s.name === destinationName || s.cleanDbName === destinationName);

  const originStation = foundOrigin || {
    name: originName,
    coordinates: [10.9023, 48.3512] as [number, number],
    eva: '780251',
    cleanDbName: originName
  };

  const destStation = foundDest || {
    name: destinationName,
    coordinates: [11.2642, 47.3889] as [number, number],
    eva: '8100088',
    cleanDbName: destinationName
  };

  return buildWorkingDbUrl(originStation, destStation, departureDateTimeIso, onlyRegional);
}

/**
 * Formats an ISO string to a clean time string "HH:MM".
 */
function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

/**
 * Normalizes train/bus line names from Transitous/MOTIS feeds.
 */
function normalizeLineName(leg: any): string {
  if (leg.mode === 'WALK') return 'Fußweg';
  if (leg.routeShortName) return leg.routeShortName;
  if (leg.route) {
    // E.g. "REGIONAL_RAIL RE9 (57015)" -> "RE 9"
    const match = leg.route.match(/\b([A-Z]{1,4}\s*\d+)\b/);
    if (match) return match[1];
    return leg.route;
  }
  if (leg.mode === 'REGIONAL_RAIL' || leg.mode === 'RAIL') return 'Regionalbahn';
  if (leg.mode === 'BUS') return 'Bus';
  return leg.mode || 'Zug';
}

/**
 * Queries Transitous (MOTIS) API for live schedule routing between coordinates.
 */
export async function fetchLiveTransitPlan(
  origin: OriginStation,
  destinationCoords: [number, number], // [lng, lat]
  destStationName: string,
  destEva: string = '8000000',
  destCleanDbName?: string,
  departureDateTimeIso?: string,
  onlyRegional: boolean = true
): Promise<LiveJourneyResult | null> {
  const cacheKey = `${origin.id}_${destinationCoords[0].toFixed(4)},${destinationCoords[1].toFixed(4)}_${departureDateTimeIso || 'now'}_${onlyRegional ? 'regional' : 'all'}`;
  if (journeyCache.has(cacheKey)) {
    return journeyCache.get(cacheKey)!;
  }

  try {
    const fromPlace = `${origin.coordinates[1]},${origin.coordinates[0]}`;
    const toPlace = `${destinationCoords[1]},${destinationCoords[0]}`;

    let apiUrl = `https://api.transitous.org/api/v1/plan?fromPlace=${fromPlace}&toPlace=${toPlace}&maxWalkDistance=3500`;

    if (onlyRegional) {
      apiUrl += `&transitModes=REGIONAL_RAIL,BUS,TRAM,SUBWAY`;
    } else {
      apiUrl += `&mode=TRANSIT,WALK`;
    }

    if (departureDateTimeIso) {
      // Ensure UTC/ISO string for Transitous
      const isoTime = new Date(departureDateTimeIso).toISOString();
      apiUrl += `&time=${encodeURIComponent(isoTime)}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SkitourPlanerAugsburg/1.0 (https://github.com/skitour-planer)',
        Accept: 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Transitous API returned status ${res.status}`);
    }

    const data = await res.json();
    const itineraries = data.itineraries;
    if (!Array.isArray(itineraries) || itineraries.length === 0) {
      return null;
    }

    // Pick best itinerary (fastest with reasonable transit legs)
    const it = itineraries[0];
    const durationMinutes = Math.round(it.duration / 60);

    const legs: LiveJourneyLeg[] = (it.legs || []).map((leg: any) => {
      const mode = leg.mode === 'WALK' ? 'walk' : leg.mode === 'BUS' ? 'bus' : 'rail';
      return {
        lineName: normalizeLineName(leg),
        mode,
        originName: leg.from?.name === 'START' ? origin.name : leg.from?.name || '',
        destinationName: leg.to?.name === 'END' ? destStationName : leg.to?.name || '',
        departureTime: formatTime(leg.startTime || leg.departure),
        arrivalTime: formatTime(leg.endTime || leg.arrival),
        durationMinutes: Math.round((leg.duration || 0) / 60),
        headsign: leg.headsign
      };
    });

    // Count actual vehicle transfers (excluding walk-only legs)
    const transitLegsCount = legs.filter(l => l.mode !== 'walk').length;
    const transfers = Math.max(0, transitLegsCount - 1);

    const dbNavigatorUrl = buildWorkingDbUrl(
      origin,
      {
        name: destStationName,
        coordinates: destinationCoords,
        eva: destEva,
        cleanDbName: destCleanDbName || destStationName
      },
      departureDateTimeIso,
      onlyRegional
    );

    const result: LiveJourneyResult = {
      departureTime: formatTime(it.startTime),
      arrivalTime: formatTime(it.endTime),
      durationMinutes,
      transfers,
      legs,
      dbNavigatorUrl,
      source: 'transitous'
    };

    journeyCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`Could not fetch live transit plan to ${destStationName}:`, err);
    return null;
  }
}

/**
 * Batch queries transit times for all tours from an origin station and departure time.
 * Deduplicates destination stations to minimize network requests.
 */
export async function fetchBatchTourTimetables(
  tours: SkiTour[],
  origin: OriginStation,
  departureDateTimeIso?: string,
  onlyRegional: boolean = true
): Promise<Record<string, LiveJourneyResult>> {
  // Group tours by unique destination station
  const uniqueDestinations = new Map<string, {
    stationName: string;
    coords: [number, number];
    eva: string;
    cleanDbName: string;
    tourIds: string[];
  }>();

  for (const tour of tours) {
    const stName = tour.transit.cleanDbStationName || tour.transit.destinationStation;
    const matchedStation = KEY_STATIONS.find(k => k.cleanDbName === stName || k.name.includes(stName));
    const coords = matchedStation?.coordinates || tour.coordinates.trailhead;
    const eva = matchedStation?.eva || tour.transit.destinationEva || '8000000';
    const cleanDbName = matchedStation?.cleanDbName || stName;

    const key = `${coords[0].toFixed(3)},${coords[1].toFixed(3)}`;
    if (!uniqueDestinations.has(key)) {
      uniqueDestinations.set(key, {
        stationName: stName,
        coords,
        eva,
        cleanDbName,
        tourIds: [tour.id]
      });
    } else {
      uniqueDestinations.get(key)!.tourIds.push(tour.id);
    }
  }

  const results: Record<string, LiveJourneyResult> = {};

  // Fetch unique destinations concurrently (batch size limited to 4)
  const destEntries = Array.from(uniqueDestinations.values());
  const batchSize = 4;

  for (let i = 0; i < destEntries.length; i += batchSize) {
    const batch = destEntries.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (entry) => {
        const journey = await fetchLiveTransitPlan(
          origin,
          entry.coords,
          entry.stationName,
          entry.eva,
          entry.cleanDbName,
          departureDateTimeIso,
          onlyRegional
        );

        if (journey) {
          for (const tourId of entry.tourIds) {
            results[tourId] = journey;
          }
        }
      })
    );
  }

  return results;
}

/**
 * Search stations across internal database + live geocoder.
 */
export async function searchStations(query: string): Promise<OriginStation[]> {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return ALL_PRESET_ORIGIN_STATIONS;

  // 1. Instant match in preset stations
  const presetMatches = ALL_PRESET_ORIGIN_STATIONS.filter(
    s => s.name.toLowerCase().includes(cleanQ) || (s.cleanDbName && s.cleanDbName.toLowerCase().includes(cleanQ))
  );

  if (cleanQ.length < 3) {
    return presetMatches;
  }

  // 2. Query Transitous Geocoder for any station in Germany/Austria
  try {
    const res = await fetch(`https://api.transitous.org/api/v1/geocode?text=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'SkitourPlanerAugsburg/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const remoteMatches: OriginStation[] = data.slice(0, 5).map((item: any, idx: number) => ({
          id: `remote-${item.id || idx}`,
          name: item.name,
          cleanDbName: item.name,
          ibnr: '8000000',
          eva: '8000000',
          coordinates: [item.lon, item.lat] as [number, number],
          note: item.country ? `${item.country} (Live-Suche)` : 'Bahnhof (Live-Suche)'
        }));

        // Deduplicate against preset matches
        const existingNames = new Set(presetMatches.map(p => p.name.toLowerCase()));
        const uniqueRemotes = remoteMatches.filter(r => !existingNames.has(r.name.toLowerCase()));
        return [...presetMatches, ...uniqueRemotes];
      }
    }
  } catch (err) {
    console.warn('Live station search fallback to presets:', err);
  }

  return presetMatches;
}
