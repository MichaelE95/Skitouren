import { KEY_STATIONS, TrainStation } from '../data/trainLines';
import { TransitInfo, OriginStation, DTicketStatus } from '../types';

export interface StationMatchResult {
  station: TrainStation;
  walkingDistanceMeters: number;
  walkingDurationMinutes: number;
  cleanDbStationName: string;
  approxTotalMinutes: number;
  dTicketValidity: DTicketStatus;
  extraCostEuro: number;
  suggestedLines: string[];
  description: string;
}

/**
 * Finds the closest transit station to a given coordinate [lng, lat],
 * and computes walking duration and approximate transit time.
 */
export function findClosestStation(
  coords: [number, number],
  origin: OriginStation
): StationMatchResult {
  const [lng, lat] = coords;
  let bestStation = KEY_STATIONS[1];
  let minDistanceMeters = Infinity;

  // Check all alpine stations (excluding origin)
  for (const st of KEY_STATIONS) {
    if (st.isOrigin) continue;
    const dist = calculateDistanceMeters(lat, lng, st.coordinates[1], st.coordinates[0]);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      bestStation = st;
    }
  }

  return buildStationTransitInfo(bestStation, minDistanceMeters, origin);
}

/**
 * Builds transit information for a specific chosen station.
 */
export function buildStationTransitInfo(
  station: TrainStation,
  walkingDistanceMeters: number,
  origin: OriginStation
): StationMatchResult {
  // Walking time at ~4.2 km/h (70 m/min)
  const walkingDurationMinutes = Math.round(walkingDistanceMeters / 70);

  // Sanitize clean DB station name for bahn.de routing
  let cleanDbStationName = station.name
    .replace(/^Bahnhof\s+/i, '')
    .replace(/\s+Bhf$/i, '')
    .replace(/\s*\(.*\)$/g, '')
    .trim();

  // Determine transit lines and duration based on station
  let suggestedLines: string[] = ['BRB RB 69', 'RE 17'];
  let approxTransitMinutes = 120;
  let dTicketValidity: DTicketStatus = '100% gültig';
  let extraCostEuro = 0;

  if (station.id.includes('oberstdorf') || station.id.includes('baad') || station.id.includes('riezlern')) {
    suggestedLines = ['BRB RB 69', 'RE 17', 'Walserbus 1'];
    approxTransitMinutes = 135;
    cleanDbStationName = 'Oberstdorf';
  } else if (station.id.includes('pfronten')) {
    suggestedLines = ['BRB RB 69', 'RE 17', 'RB 73'];
    approxTransitMinutes = 120;
    cleanDbStationName = 'Pfronten-Steinach';
  } else if (station.id.includes('fuessen')) {
    suggestedLines = ['BRB RB 77'];
    approxTransitMinutes = 110;
    cleanDbStationName = 'Füssen';
  } else if (station.id.includes('lermoos') || station.id.includes('laehn') || station.id.includes('bichlbach') || station.id.includes('ehrwald')) {
    suggestedLines = ['MEX 16', 'RB 60 Außerfernbahn'];
    approxTransitMinutes = 140;
    cleanDbStationName = station.name.replace(/^Bahnhof\s+/i, '').trim();
  } else if (station.id.includes('garmisch')) {
    suggestedLines = ['MEX 16', 'RB 6 Werdenfelsbahn'];
    approxTransitMinutes = 115;
    cleanDbStationName = 'Garmisch-Partenkirchen';
  } else if (station.id.includes('mittenwald')) {
    suggestedLines = ['MEX 16', 'RB 6 Werdenfelsbahn'];
    approxTransitMinutes = 130;
    cleanDbStationName = 'Mittenwald';
  } else if (station.id.includes('scharnitz')) {
    suggestedLines = ['MEX 16', 'RB 6 / S6'];
    approxTransitMinutes = 140;
    cleanDbStationName = 'Scharnitz';
  } else if (station.id.includes('seefeld')) {
    suggestedLines = ['MEX 16', 'S6'];
    approxTransitMinutes = 150;
    dTicketValidity = 'Zusatzkosten nötig';
    extraCostEuro = 3.80;
    cleanDbStationName = 'Seefeld in Tirol';
  }

  const approxTotalMinutes = approxTransitMinutes + walkingDurationMinutes;

  return {
    station,
    walkingDistanceMeters: Math.round(walkingDistanceMeters),
    walkingDurationMinutes,
    cleanDbStationName,
    approxTotalMinutes,
    dTicketValidity,
    extraCostEuro,
    suggestedLines,
    description: `Ab ${origin.name} mit ${suggestedLines.join(' → ')} bis ${station.name}. Anschließend ca. ${walkingDurationMinutes} min Fußweg (${Math.round(walkingDistanceMeters)} m) zum Tour-Startpunkt.`
  };
}

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
