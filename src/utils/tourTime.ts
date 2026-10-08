import { SkiTour } from '../types';

/**
 * Approximate pure moving time (no breaks), DAV/Alpenverein rule of thumb for ski tours:
 * ascent  = larger of (elevation gain / 300 m/h, distance / 4 km/h) + half of the smaller one
 * descent = elevation gain / 1200 m/h
 * The GPX files describe the ascent, so distance + gain are the ascent values.
 */
export const ASCENT_M_PER_H = 300;
export const FLAT_KM_PER_H = 4;
export const DESCENT_M_PER_H = 1200;

export interface TourTime {
  ascentMinutes: number;
  descentMinutes: number;
  totalMinutes: number;
}

export function estimateTourTime(tour: Pick<SkiTour, 'elevationGain' | 'distanceKm'>): TourTime {
  const vertical = tour.elevationGain / ASCENT_M_PER_H;
  const horizontal = tour.distanceKm / FLAT_KM_PER_H;
  const ascentH = Math.max(vertical, horizontal) + Math.min(vertical, horizontal) / 2;
  const descentH = tour.elevationGain / DESCENT_M_PER_H;
  // round to 5 minutes – it is an estimate
  const r5 = (h: number) => Math.max(5, Math.round((h * 60) / 5) * 5);
  const ascentMinutes = r5(ascentH);
  const descentMinutes = r5(descentH);
  return { ascentMinutes, descentMinutes, totalMinutes: ascentMinutes + descentMinutes };
}

/** 210 -> "3:30" */
export function formatHM(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

export const TOUR_TIME_HINT =
  `Approximate moving time without breaks (DAV rule: ${ASCENT_M_PER_H} Hm/h up, ${FLAT_KM_PER_H} km/h, ` +
  `larger value + half the smaller; descent ${DESCENT_M_PER_H} Hm/h).`;

