import { getAllMasterStations, MasterStation } from '../data/trainLines';
import { DTicketStatus } from '../types';

export interface StationMatchResult {
  station: MasterStation;
  walkingDistanceMeters: number;
  walkingDurationMinutes: number;
  cleanDbStationName: string;
  dTicketValidity: DTicketStatus;
  extraCostEuro: number;
}

/**
 * Calculates distance between two WGS-84 coordinates in meters using the Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Finds the closest transit station / bus stop to a given trailhead coordinate [lng, lat].
 * Strictly calculates walking distance and time from station coordinates to trailhead coordinates.
 */
export function findClosestStation(
  trailheadCoords: [number, number]
): StationMatchResult {
  const [lng, lat] = trailheadCoords;
  const allStations = getAllMasterStations();

  // Exclude primary northern hub origins that are far in the plains
  const candidateStations = allStations.filter(s =>
    !['augsburg-haunstetter-str', 'augsburg-hbf', 'muenchen-hbf', 'muenchen-pasing', 'buchloe', 'kaufering'].includes(s.id)
  );

  let bestStation = candidateStations[0] || allStations[0];
  let minDistanceMeters = Infinity;

  for (const st of candidateStations) {
    const dist = calculateDistanceMeters(lat, lng, st.coordinates[1], st.coordinates[0]);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      bestStation = st;
    }
  }

  return buildStationTransitResult(bestStation, minDistanceMeters);
}

/**
 * Builds transit parameters for a chosen station and walking distance.
 */
export function buildStationTransitResult(
  station: MasterStation,
  walkingDistanceMeters: number
): StationMatchResult {
  // Walking time at ~4.2 km/h (70 m/min)
  const walkingDurationMinutes = Math.round(walkingDistanceMeters / 70);

  // Clean DB station name recognized by bahn.de routing
  const cleanDbStationName = station.cleanDbName || station.name;

  // D-Ticket validity based on station location
  let dTicketValidity: DTicketStatus = '100% gültig';
  let extraCostEuro = 0;

  if (station.id === 'seefeld' || station.name.toLowerCase().includes('seefeld')) {
    dTicketValidity = 'Zusatzkosten nötig';
    extraCostEuro = 3.80;
  } else if (station.id.includes('tannheim') || station.id.includes('nesselwaengle')) {
    dTicketValidity = 'Zusatzkosten nötig';
    extraCostEuro = 4.00;
  }

  return {
    station,
    walkingDistanceMeters,
    walkingDurationMinutes,
    cleanDbStationName,
    dTicketValidity,
    extraCostEuro
  };
}
