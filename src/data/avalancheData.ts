import { AvalancheRegion } from '../types';

// In October/autumn, avalanche warning services (LWD Bayern, Lawine Tirol) are officially in off-season pause.
export const IS_AVALANCHE_SEASON_ACTIVE = false;

export const FALLBACK_AVALANCHE_REGIONS: AvalancheRegion[] = [
  {
    id: 'allgaeu-alps',
    name: 'Allgäuer Alpen (Bayern & Kleinwalsertal)',
    dangerLevel: 1,
    dangerLevelLabel: 'Gering',
    elevationThreshold: 2000,
    dangerLevelAbove: 1,
    dangerLevelBelow: 1,
    aspects: ['N', 'NE'],
    avalancheProblems: ['Off-Season: Keine flächendeckende Schneedecke'],
    lastUpdated: 'Off-Season: Tägliche Lageberichte starten im Winter (ca. Dezember)',
    isSeasonActive: IS_AVALANCHE_SEASON_ACTIVE,
    polygonCoordinates: [
      [
        [10.05, 47.50],
        [10.45, 47.50],
        [10.40, 47.25],
        [10.05, 47.25],
        [10.05, 47.50]
      ]
    ]
  },
  {
    id: 'tannheimer-berge',
    name: 'Tannheimer Berge & Pfronten',
    dangerLevel: 1,
    dangerLevelLabel: 'Gering',
    elevationThreshold: 2000,
    dangerLevelAbove: 1,
    dangerLevelBelow: 1,
    aspects: ['N', 'NE'],
    avalancheProblems: ['Off-Season'],
    lastUpdated: 'Off-Season: Start ca. Dezember',
    isSeasonActive: IS_AVALANCHE_SEASON_ACTIVE,
    polygonCoordinates: [
      [
        [10.45, 47.56],
        [10.70, 47.56],
        [10.70, 47.45],
        [10.45, 47.45],
        [10.45, 47.56]
      ]
    ]
  },
  {
    id: 'ammergau-ausserfern',
    name: 'Ammergauer Alpen & Außerfern',
    dangerLevel: 1,
    dangerLevelLabel: 'Gering',
    elevationThreshold: 2000,
    dangerLevelAbove: 1,
    dangerLevelBelow: 1,
    aspects: ['N', 'NW'],
    avalancheProblems: ['Off-Season'],
    lastUpdated: 'Off-Season: Start ca. Dezember',
    isSeasonActive: IS_AVALANCHE_SEASON_ACTIVE,
    polygonCoordinates: [
      [
        [10.70, 47.60],
        [11.02, 47.60],
        [11.02, 47.38],
        [10.70, 47.38],
        [10.70, 47.60]
      ]
    ]
  },
  {
    id: 'wetterstein-mieming',
    name: 'Wetterstein & Mieminger Kette',
    dangerLevel: 1,
    dangerLevelLabel: 'Gering',
    elevationThreshold: 2000,
    dangerLevelAbove: 1,
    dangerLevelBelow: 1,
    aspects: ['N', 'NE'],
    avalancheProblems: ['Off-Season'],
    lastUpdated: 'Off-Season: Start ca. Dezember',
    isSeasonActive: IS_AVALANCHE_SEASON_ACTIVE,
    polygonCoordinates: [
      [
        [10.90, 47.48],
        [11.22, 47.48],
        [11.22, 47.30],
        [10.90, 47.30],
        [10.90, 47.48]
      ]
    ]
  },
  {
    id: 'karwendel',
    name: 'Karwendelgebirge',
    dangerLevel: 1,
    dangerLevelLabel: 'Gering',
    elevationThreshold: 2000,
    dangerLevelAbove: 1,
    dangerLevelBelow: 1,
    aspects: ['N', 'NE'],
    avalancheProblems: ['Off-Season'],
    lastUpdated: 'Off-Season: Start ca. Dezember',
    isSeasonActive: IS_AVALANCHE_SEASON_ACTIVE,
    polygonCoordinates: [
      [
        [11.20, 47.50],
        [11.50, 47.50],
        [11.50, 47.30],
        [11.20, 47.30],
        [11.20, 47.50]
      ]
    ]
  }
];

export const EAWS_COLORS: Record<number, { bg: string; text: string; label: string; border: string }> = {
  1: { bg: '#ccff66', text: '#1f2937', label: '1 - Gering', border: '#a3e635' },
  2: { bg: '#ffff00', text: '#1f2937', label: '2 - Mäßig', border: '#eab308' },
  3: { bg: '#ff9900', text: '#ffffff', label: '3 - Erheblich', border: '#ea580c' },
  4: { bg: '#ff0000', text: '#ffffff', label: '4 - Groß', border: '#dc2626' },
  5: { bg: '#800000', text: '#ffffff', label: '5 - Sehr groß', border: '#450a0a' }
};
