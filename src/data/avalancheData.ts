import { AvalancheRegion } from '../types';

export const FALLBACK_AVALANCHE_REGIONS: AvalancheRegion[] = [
  {
    id: 'allgaeu-alps',
    name: 'Allgäuer Alpen (Bayern & Kleinwalsertal)',
    dangerLevel: 2,
    dangerLevelLabel: 'Mäßig',
    elevationThreshold: 1800,
    dangerLevelAbove: 2,
    dangerLevelBelow: 1,
    aspects: ['N', 'NE', 'NW', 'E'],
    avalancheProblems: ['Triebschnee', 'Altschneeproblem in schattigen Steilhängen'],
    lastUpdated: 'Heute, 07:30 Uhr (LWD Bayern & Vorarlberg)',
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
    dangerLevel: 2,
    dangerLevelLabel: 'Mäßig',
    elevationThreshold: 1700,
    dangerLevelAbove: 2,
    dangerLevelBelow: 1,
    aspects: ['N', 'NE', 'E'],
    avalancheProblems: ['Triebschnee in Rinnen und Mulden'],
    lastUpdated: 'Heute, 07:30 Uhr (Lawine Tirol)',
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
    name: 'Ammergauer Alpen & Außerfern (Lähn, Lermoos)',
    dangerLevel: 2,
    dangerLevelLabel: 'Mäßig',
    elevationThreshold: 1800,
    dangerLevelAbove: 2,
    dangerLevelBelow: 1,
    aspects: ['N', 'NW', 'NE'],
    avalancheProblems: ['Frischer Triebschnee', 'Gleitschneerutsche an steilen Grashängen'],
    lastUpdated: 'Heute, 07:30 Uhr (Lawine Tirol & LfU Bayern)',
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
    name: 'Wetterstein, Mieminger Kette & Zugspitzplatt',
    dangerLevel: 2,
    dangerLevelLabel: 'Mäßig',
    elevationThreshold: 2000,
    dangerLevelAbove: 2,
    dangerLevelBelow: 1,
    aspects: ['N', 'NE', 'NW', 'E', 'SE'],
    avalancheProblems: ['Windverfrachteter Schnee im Hochgebirge', 'Kammnahe Einwehungen'],
    lastUpdated: 'Heute, 07:30 Uhr (LWD Bayern & Tirol)',
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
    name: 'Karwendelgebirge (Mittenwald, Scharnitz, Seefeld)',
    dangerLevel: 2,
    dangerLevelLabel: 'Mäßig',
    elevationThreshold: 1900,
    dangerLevelAbove: 2,
    dangerLevelBelow: 1,
    aspects: ['N', 'NE', 'NW'],
    avalancheProblems: ['Altschneeproblem in Rinnen', 'Triebschnee oberhalb der Waldgrenze'],
    lastUpdated: 'Heute, 07:30 Uhr (Lawine Tirol & LfU Bayern)',
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

