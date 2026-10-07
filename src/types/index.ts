export type SACGrade = 
  | 'L-' | 'L' | 'L+' 
  | 'WS-' | 'WS' | 'WS+' 
  | 'ZS-' | 'ZS' | 'ZS+' 
  | 'S-' | 'S' | 'S+'
  | 'SS';

export type SACCategory = 'L' | 'WS' | 'ZS' | 'S';

export type DTicketStatus = '100% gültig' | 'Zusatzkosten nötig';

export interface TransitStep {
  station: string;
  action: 'departure' | 'transfer' | 'arrival' | 'bus';
  line?: string;
  timeHint?: string;
  note?: string;
}

export interface TransitInfo {
  origin: string; // "Augsburg Haunstetter Str."
  destinationStation: string;
  destinationIbnr: string; // DB Station IBNR (e.g. 8004593 for Oberstdorf)
  lines: string[]; // e.g. ["RB 69", "RE 17", "Walserbus 1"]
  transfers: number;
  approxTotalMinutes: number;
  dTicketValidity: DTicketStatus;
  extraCostEuro: number;
  transitDescription: string;
  steps: TransitStep[];
}

export interface DavHut {
  name: string;
  elevation: number;
  davLink?: string;
  hasWinterRoom: boolean;
  notes?: string;
}

export interface SkiTour {
  id: string;
  name: string;
  subheading: string;
  mountainRange: string; // e.g. "Allgäuer Alpen", "Außerfern / Ammergau", "Wetterstein / Mieming", "Karwendel", "Tannheimer Berge"
  valley: string; // e.g. "Kleinwalsertal", "Tannheimer Tal", "Garmisch-Partenkirchen", "Außerfern", "Ostallgäu"
  type: 'day' | 'multiday';
  isPiste: boolean;
  
  // Elevation & distance
  startElevation: number; // m
  peakElevation: number; // m
  elevationGain: number; // hm
  distanceKm: number; // km
  estimatedTourDurationHours: number;

  // Technical ratings
  difficulty: SACGrade; // e.g. "WS+", "ZS-"
  difficultyCategory: SACCategory; // "WS", "ZS" for quick filter
  maxSafeAvalancheLevel: number; // typical limit for standard route (e.g. 2 for open terrain, 3/4 for piste)
  exposition: string; // e.g. "N, NO", "O, SO", "W"

  // Geolocation [longitude, latitude]
  coordinates: {
    trailhead: [number, number];
    summit: [number, number];
  };
  gpxTrackCoordinates: [number, number][]; // Array of [lng, lat] coordinate pairs for route polyline

  // Public transit from Augsburg Haunstetter Straße
  transit: TransitInfo;

  // External links & resources
  links: {
    skitourenguruUrl: string;
    gpxDownloadUrl?: string;
    alpenvereinUrl?: string;
    webcamUrl?: string;
  };

  // Multi-day & DAV huts
  huts?: DavHut[];

  // Curated community & friend ratings/tips
  rating: number; // 1 to 5
  curatedComment: string;
  tips: string[];
}

export interface AvalancheRegion {
  id: string;
  name: string;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  dangerLevelLabel: 'Gering' | 'Mäßig' | 'Erheblich' | 'Groß' | 'Sehr groß';
  elevationThreshold?: number; // e.g. 1800m
  dangerLevelAbove?: number;
  dangerLevelBelow?: number;
  aspects: string[]; // ["N", "NE", "NW", ...]
  avalancheProblems: string[]; // e.g. ["Triebschnee", "Altschneeproblem"]
  lastUpdated: string;
  polygonCoordinates: [number, number][][]; // [[[lng, lat], ...]]
}

export interface FilterState {
  searchQuery: string;
  onlyDTicket: boolean;
  onlyPiste: boolean;
  maxTransitDurationMinutes: number; // e.g. 90, 120, 150, 180, 240
  maxAvalancheLevel: number; // 1, 2, 3, 4, 5
  minElevationGain: number;
  maxElevationGain: number;
  selectedDifficulties: SACCategory[]; // ['L', 'WS', 'ZS', 'S']
  selectedRanges: string[];
  tourType: 'all' | 'day' | 'multiday';
  sortBy: 'transitTime' | 'elevationGain' | 'rating' | 'difficulty';
}

