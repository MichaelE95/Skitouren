import { SkiTour } from '../types';

/** Likely duplicate = same summit (≤ 200 m) AND same trailhead (≤ 500 m). Linear scan, trivial even for thousands of tours. */
export const DUP_SUMMIT_M = 200;
export const DUP_TRAILHEAD_M = 500;

export interface DuplicateMatch {
  tour: SkiTour;
  summitDistanceM: number;
  trailheadDistanceM: number;
}

export function findLikelyDuplicates(
  candidate: { summit: [number, number]; trailhead: [number, number] },
  tours: SkiTour[]
): DuplicateMatch[] {
  return tours
    .map(tour => ({
      tour,
      summitDistanceM: Math.round(distanceMeters(candidate.summit, tour.summit)),
      trailheadDistanceM: Math.round(distanceMeters(candidate.trailhead, tour.trailhead))
    }))
    .filter(m => m.summitDistanceM <= DUP_SUMMIT_M && m.trailheadDistanceM <= DUP_TRAILHEAD_M);
}

/** Haversine distance between two [lng, lat] points. */
export function distanceMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

