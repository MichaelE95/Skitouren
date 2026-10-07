export type SACGrade =
  | 'L-' | 'L' | 'L+'
  | 'WS-' | 'WS' | 'WS+'
  | 'ZS-' | 'ZS' | 'ZS+'
  | 'S-' | 'S' | 'S+'
  | 'SS';

export type SACCategory = 'L' | 'WS' | 'ZS' | 'S';

export const SAC_GRADES: SACGrade[] = [
  'L-', 'L', 'L+', 'WS-', 'WS', 'WS+', 'ZS-', 'ZS', 'ZS+', 'S-', 'S', 'S+', 'SS'
];

/** Broad filter category of an SAC grade (WS+ -> WS, SS -> S). */
export function sacCategory(grade: SACGrade): SACCategory {
  if (grade.startsWith('WS')) return 'WS';
  if (grade.startsWith('ZS')) return 'ZS';
  if (grade.startsWith('S')) return 'S';
  return 'L';
}

/**
 * A ski tour. Stored in public/tours/tours.json; the GPX lives next to it.
 * Nothing here is guessed: metrics come from the GPX, peak/range from OSM+Wikidata
 * (or typed in), the rest is entered by the user.
 */
export interface SkiTour {
  id: string;
  gpxFile: string; // file name inside public/tours/

  // Looked up once on creation (OSM peak -> Wikidata P4552), editable
  peakName: string;
  mountainRange: string | null; // null = unknown

  // Derived strictly from the GPX
  startElevation: number;
  peakElevation: number;
  elevationGain: number;
  distanceKm: number;
  trailhead: [number, number]; // first GPX point [lng, lat]
  summit: [number, number]; // highest GPX point [lng, lat]
  track: [number, number][]; // simplified track for the map

  // Entered by the user
  difficulty: SACGrade;
  isPiste: boolean;
  skitourenguruUrl?: string;
  rating: number | null; // null = not done yet, 1..5
  notes: string;
}

export interface Place {
  name: string;
  coordinates: [number, number]; // [lng, lat]
}

export type LegMode = 'walk' | 'rail' | 'bus' | 'other';

export interface JourneyLeg {
  mode: LegMode;
  rawMode: string; // e.g. REGIONAL_RAIL
  lineName: string;
  headsign?: string;
  fromName: string;
  toName: string;
  departure: string; // ISO
  arrival: string; // ISO
  durationMinutes: number;
  distanceMeters?: number; // walk legs only
  geometry?: [number, number][]; // walk legs only, [lng, lat]
}

/** One Transitous itinerary from the origin to the trailhead. */
export interface Journey {
  departure: string; // ISO
  arrival: string; // ISO
  durationMinutes: number; // door to trailhead, all walks included
  transfers: number;
  legs: JourneyLeg[];
  lastStopName: string | null; // where the last vehicle leg ends (null = walk only)
  finalWalkMinutes: number;
  finalWalkMeters: number;
}

export type TourTransitResult =
  | { ok: true; best: Journey; alternatives: Journey[] }
  | { ok: false; error: string };

export interface TransitParams {
  origin: Place;
  departureLocal: string; // "YYYY-MM-DDTHH:mm" in local time
  onlyRegional: boolean;
}

export interface TransitSnapshot {
  params: TransitParams;
  calculatedAt: string; // ISO
  results: Record<string, TourTransitResult>;
}

export interface AvalancheRegion {
  id: string;
  name: string;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  dangerLevelLabel: 'Gering' | 'Mäßig' | 'Erheblich' | 'Groß' | 'Sehr groß';
  elevationThreshold?: number;
  dangerLevelAbove?: number;
  dangerLevelBelow?: number;
  aspects: string[];
  avalancheProblems: string[];
  lastUpdated: string;
  isSeasonActive: boolean; // false during off-season (e.g. October)
  polygonCoordinates: [number, number][][];
}

export interface FilterState {
  searchQuery: string;
  onlyPiste: boolean;
  maxTransitDurationMinutes: number;
  maxElevationGain: number;
  selectedDifficulties: SACCategory[];
  selectedRanges: string[];
  ratingFilter: 'all' | 'unrated' | 'rated_only' | 'min_4_stars';
  sortBy: 'transitTime' | 'elevationGain' | 'rating' | 'difficulty';
}

export const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  onlyPiste: false,
  maxTransitDurationMinutes: 300,
  maxElevationGain: 2000,
  selectedDifficulties: [],
  selectedRanges: [],
  ratingFilter: 'all',
  sortBy: 'transitTime'
};
