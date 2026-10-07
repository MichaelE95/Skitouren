import { UserTourMeta } from '../types';

const STORAGE_KEY = 'skitour_user_meta_v1';
const CUSTOM_TOURS_KEY = 'skitour_custom_tours_v1';
const ORIGIN_STATION_KEY = 'skitour_origin_station_v1';

/**
 * Baseline user metadata (only manual data: ratings, comments, Skitourenguru links).
 * All ratings start as null ("noch nicht gemacht"), waiting for the user to rate!
 */
export const BASELINE_USER_META: Record<string, UserTourMeta> = {
  'kanzelwand': {
    tourId: 'kanzelwand',
    peakName: 'Kanzelwand',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Kanzelwand',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Pistenskitour im Zweiländer-Skigebiet Fellhorn-Kanzelwand. Gute Schlechtwetteroption.'
  },
  'geisshorn': {
    tourId: 'geisshorn',
    peakName: 'Geißhorn',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Geisshorn',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Klassische Skitour im Gemsteltal ab Mittelberg Bödmen.'
  },
  'guentlespitze': {
    tourId: 'guentlespitze',
    peakName: 'Güntlespitze',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Guentlespitze',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Beliebter Aussichtsberg über dem Derrenbachtal ab Baad.'
  },
  'grosser-widderstein': {
    tourId: 'grosser-widderstein',
    peakName: 'Großer Widderstein',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Grosser+Widderstein',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Alpine Hochtour mit Skidepot und anspruchsvollem Gipfelaufbau.'
  },
  'uentschenspitze': {
    tourId: 'uentschenspitze',
    peakName: 'Üntschenspitze',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Uentschenspitze',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Einsame Tour über das Bärgunttal auf einen rassigen Gipfel.'
  },
  'nebelhorn-daumen': {
    tourId: 'nebelhorn-daumen',
    peakName: 'Nebelhorn / Großer Daumen',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Grosser+Daumen',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Klassiker im Oberstdorfer Hauptkamm ab Talstation Nebelhorn.'
  },
  'breitenberg-ostlerhuette': {
    tourId: 'breitenberg-ostlerhuette',
    peakName: 'Breitenberg / Ostlerhütte',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Breitenberg',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Direkt ab Bahnhof Pfronten-Steinach – Top Tagestour und Einkehrmöglichkeit auf der Ostlerhütte.'
  },
  'gaishorn': {
    tourId: 'gaishorn',
    peakName: 'Gaishorn',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Gaishorn',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Höchster Skitourenberg im Tannheimer Tal ab Tannheim Kreisverkehr.'
  },
  'ponten': {
    tourId: 'ponten',
    peakName: 'Ponten',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Ponten',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Sehr beliebte Tour über das Stuibental ab Schattwald.'
  },
  'bschiesser': {
    tourId: 'bschiesser',
    peakName: 'Bschießer',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Bschiesser',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Schöner Nachbargipfel des Ponten mit mäßiger Steilheit.'
  },
  'litnisschrofen': {
    tourId: 'litnisschrofen',
    peakName: 'Litnisschrofen',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Litnisschrofen',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Spannende Tour ab Nesselwängle Haller ins Strindental mit leichtem Gipfelgrat.'
  },
  'schneidspitze': {
    tourId: 'schneidspitze',
    peakName: 'Schneidspitze',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Schneidspitze',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Abwechslungsreiche Skitour ab Nesselwängle Rauth.'
  },
  'tegelberg': {
    tourId: 'tegelberg',
    peakName: 'Tegelberg',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Tegelberg',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Pistenskitour mit königlichem Blick auf Schloss Neuschwanstein ab Schwangau.'
  },
  'grubigstein': {
    tourId: 'grubigstein',
    peakName: 'Grubigstein',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Grubigstein',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Pistenskitour ab Bahnhof Lermoos mit Panoramablick zur Zugspitze.'
  },
  'plattberg-pfuitjoechl': {
    tourId: 'plattberg-pfuitjoechl',
    peakName: 'Kleines Pfuitjöchl / Plattberg',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Plattberg',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Direkt ab Bergbahnhof Lähn. Traumhafte Hänge über die Wiesmad-Mähder.'
  },
  'thaneller': {
    tourId: 'thaneller',
    peakName: 'Thaneller',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Thaneller',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Markante Pyramide mit Steilhang ab Berwang.'
  },
  'bleispitze': {
    tourId: 'bleispitze',
    peakName: 'Bleispitze',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Bleispitze',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Ruhige, panoramareiche Tour ab Bichlbächle.'
  },
  'zugspitzplatt-gatterl': {
    tourId: 'zugspitzplatt-gatterl',
    peakName: 'Zugspitzplatt / Gatterl',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Zugspitzplatt',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Große Durchquerung von der Ehrwalder Alm übers Gatterl aufs Zugspitzplatt.'
  },
  'osterfelderkopf': {
    tourId: 'osterfelderkopf',
    peakName: 'Osterfelderkopf',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Osterfelderkopf',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Pistenskitour unter der Alpspitz-Nordwand ab Kreuzeckbahn.'
  },
  'dammkar': {
    tourId: 'dammkar',
    peakName: 'Dammkar',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Dammkar',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Deutschlands legendärste Freeride- und Skitourenrinne im Karwendel ab Mittenwald.'
  },
  'pleisenspitze': {
    tourId: 'pleisenspitze',
    peakName: 'Pleisenspitze',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Pleisenspitze',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Große Karwendel-Tour direkt ab Grenzbahnhof Scharnitz (1600 hm).'
  },
  'seefelder-joch': {
    tourId: 'seefelder-joch',
    peakName: 'Seefelder Joch',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Seefelder+Joch',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Pistenskitour ab Bahnhof Seefeld im sonnigen Hochtal.'
  },
  'seefelder-spitze': {
    tourId: 'seefelder-spitze',
    peakName: 'Seefelder Spitze',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Seefelder+Spitze',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Weiterführung vom Seefelder Joch auf die schrofige Spitze.'
  },
  'hohe-munde': {
    tourId: 'hohe-munde',
    peakName: 'Hohe Munde',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Hohe+Munde',
    isVerifiedUrl: false,
    rating: null,
    comment: 'Monumentale Skitour über die steile Ostflanke ab Leutasch Buchen.'
  },
  'mindelheimer-rundtour': {
    tourId: 'mindelheimer-rundtour',
    peakName: 'Mindelheimer Hütte Rundtour',
    skitourenguruUrl: 'https://www.skitourenguru.ch/?search=Mindelheimer+Huette',
    isVerifiedUrl: false,
    rating: null,
    comment: '2-tägige Hochtour im Allgäuer Hauptkamm mit Winterraum-Übernachtung.'
  }
};

/**
 * Loads user metadata from LocalStorage merged with baseline.
 */
export function loadUserMeta(): Record<string, UserTourMeta> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...BASELINE_USER_META };
    const parsed = JSON.parse(raw);
    return { ...BASELINE_USER_META, ...parsed };
  } catch {
    return { ...BASELINE_USER_META };
  }
}

/**
 * Saves updated metadata for a tour into LocalStorage.
 */
export function saveUserTourMeta(tourId: string, meta: Partial<UserTourMeta>): Record<string, UserTourMeta> {
  const current = loadUserMeta();
  const existing = current[tourId] || {
    tourId,
    peakName: tourId,
    skitourenguruUrl: `https://www.skitourenguru.ch/?search=${encodeURIComponent(tourId)}`,
    isVerifiedUrl: false,
    rating: null,
    comment: ''
  };

  const updated: UserTourMeta = {
    ...existing,
    ...meta,
    lastModified: new Date().toISOString()
  };

  current[tourId] = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save user metadata to LocalStorage:', err);
  }
  return current;
}

/**
 * Exports user metadata file as a downloadable JSON document.
 */
export function downloadUserMetaJson(): void {
  const data = loadUserMeta();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'user_tours_meta.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Loads custom user-created tours from LocalStorage.
 */
export function loadCustomTours(): any[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TOURS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new custom tour into LocalStorage.
 */
export function saveCustomTour(tour: any): any[] {
  const list = loadCustomTours();
  const filtered = list.filter(t => t.id !== tour.id);
  const next = [...filtered, tour];
  try {
    localStorage.setItem(CUSTOM_TOURS_KEY, JSON.stringify(next));
  } catch (err) {
    console.error('Failed to save custom tour to LocalStorage:', err);
  }
  return next;
}

