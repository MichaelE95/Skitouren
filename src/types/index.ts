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
  action: 'departure' | 'transfer' | 'arrival' | 'bus' | 'walk';
  line?: string;
  timeHint?: string;
  note?: string;
}

export interface LiveJourneyLeg {
  lineName: string;
  mode: string;
  originName: string;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  headsign?: string;
}

export interface LiveJourneyResult {
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  transfers: number;
  legs: LiveJourneyLeg[];
  dbNavigatorUrl: string;
  source: 'transitous' | 'estimate';
}

export interface OriginStation {
  id: string;
  name: string;
  ibnr: string;
  eva?: string;
  cleanDbName?: string;
  coordinates: [number, number]; // [lng, lat]
  note?: string;
}

export interface TransitInfo {
  origin: string; // e.g. "Augsburg Haunstetter Str."
  destinationStation: string; // Display destination (e.g. "Baad", "Riezlern Kanzelwandbahn")
  cleanDbStationName: string; // Sanitized station name recognized by bahn.de (e.g. "Oberstdorf", "Pfronten-Steinach")
  destinationIbnr: string; // DB Station IBNR
  destinationEva?: string; // DB EVA ID
  lines: string[]; // e.g. ["BRB RB 69", "RE 17", "Walserbus 1"]
  transfers: number;
  approxTotalMinutes: number;
  walkingDistanceMeters: number;
  walkingDurationMinutes: number;
  dTicketValidity: DTicketStatus;
  extraCostEuro: number;
  transitDescription: string;
  steps: TransitStep[];
  liveJourney?: LiveJourneyResult;
}

export interface DavHut {
  name: string;
  elevation: number;
  davLink?: string;
  hasWinterRoom: boolean;
  notes?: string;
}

export interface UserTourMeta {
  tourId: string;
  peakName: string;
  skitourenguruUrl: string;
  isVerifiedUrl: boolean;
  rating: number | null; // null = noch nicht gemacht / unrated; 1 to 5
  comment: string;
  manualStationOverride?: string;
  lastModified?: string;
}

export interface SkiTour {
  id: string;
  name: string;
  subheading: string;
  mountainRange: string;
  valley: string;
  type: 'day' | 'multiday';
  isPiste: boolean;
  
  // Elevation & distance
  startElevation: number; // m
  peakElevation: number; // m
  elevationGain: number; // hm
  distanceKm: number; // km
  estimatedTourDurationHours: number;

  // Technical ratings
  difficulty: SACGrade;
  difficultyCategory: SACCategory;
  maxSafeAvalancheLevel: number;
  exposition: string;

  // Geolocation [longitude, latitude]
  coordinates: {
    trailhead: [number, number];
    summit: [number, number];
  };
  gpxTrackCoordinates: [number, number][];

  // Public transit from origin station
  transit: TransitInfo;

  // External links & resources
  links: {
    skitourenguruUrl: string;
    isVerifiedUrl: boolean; // false triggers a yellow verification warning badge
    gpxDownloadUrl?: string;
    alpenvereinUrl?: string;
    webcamUrl?: string;
  };

  // Multi-day & DAV huts
  huts?: DavHut[];

  // User metadata (rating, comment)
  rating: number | null; // null = not yet done
  curatedComment: string;
  tips: string[];
  isCustomTour?: boolean; // true if added by user
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
  onlyDTicket: boolean;
  onlyPiste: boolean;
  maxTransitDurationMinutes: number;
  maxAvalancheLevel: number;
  minElevationGain: number;
  maxElevationGain: number;
  selectedDifficulties: SACCategory[];
  selectedRanges: string[];
  tourType: 'all' | 'day' | 'multiday';
  ratingFilter: 'all' | 'unrated' | 'rated_only' | 'min_4_stars';
  sortBy: 'transitTime' | 'elevationGain' | 'rating' | 'difficulty';
}
