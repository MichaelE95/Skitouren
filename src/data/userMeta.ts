import { UserTourMeta } from '../types';

const STORAGE_KEY = 'skitour_user_meta_v2';
const CUSTOM_TOURS_KEY = 'skitour_custom_tours_v2';
const DELETED_TOURS_KEY = 'skitour_deleted_tours_v2';

/**
 * Baseline user metadata (ratings and notes).
 * Skitourenguru URLs are omitted unless explicitly entered by the user.
 */
export const BASELINE_USER_META: Record<string, UserTourMeta> = {
  'kanzelwand': {
    tourId: 'kanzelwand',
    peakName: 'Kanzelwand',
    rating: null,
    comment: 'Pistenskitour im Zweiländer-Skigebiet Fellhorn-Kanzelwand. Gute Schlechtwetteroption.'
  },
  'geisshorn': {
    tourId: 'geisshorn',
    peakName: 'Geißhorn',
    rating: null,
    comment: 'Klassische Skitour im Gemsteltal ab Mittelberg Bödmen.'
  },
  'guentlespitze': {
    tourId: 'guentlespitze',
    peakName: 'Güntlespitze',
    rating: null,
    comment: 'Beliebter Aussichtsberg über dem Derrenbachtal ab Baad.'
  },
  'grosser-widderstein': {
    tourId: 'grosser-widderstein',
    peakName: 'Großer Widderstein',
    rating: null,
    comment: 'Alpine Hochtour mit Skidepot und anspruchsvollem Gipfelaufbau.'
  },
  'uentschenspitze': {
    tourId: 'uentschenspitze',
    peakName: 'Üntschenspitze',
    rating: null,
    comment: 'Einsame Tour über das Bärgunttal auf einen rassigen Gipfel.'
  },
  'nebelhorn-daumen': {
    tourId: 'nebelhorn-daumen',
    peakName: 'Nebelhorn / Großer Daumen',
    rating: null,
    comment: 'Klassiker im Oberstdorfer Hauptkamm ab Talstation Nebelhorn.'
  },
  'breitenberg-ostlerhuette': {
    tourId: 'breitenberg-ostlerhuette',
    peakName: 'Breitenberg / Ostlerhütte',
    rating: null,
    comment: 'Direkt ab Bahnhof Pfronten-Steinach – Top Tagestour und Einkehrmöglichkeit auf der Ostlerhütte.'
  },
  'gaishorn': {
    tourId: 'gaishorn',
    peakName: 'Gaishorn',
    rating: null,
    comment: 'Höchster Skitourenberg im Tannheimer Tal ab Tannheim Kreisverkehr.'
  },
  'ponten': {
    tourId: 'ponten',
    peakName: 'Ponten',
    rating: null,
    comment: 'Sehr beliebte Tour über das Stuibental ab Schattwald.'
  },
  'bschiesser': {
    tourId: 'bschiesser',
    peakName: 'Bschießer',
    rating: null,
    comment: 'Schöner Nachbargipfel des Ponten mit mäßiger Steilheit.'
  },
  'litnisschrofen': {
    tourId: 'litnisschrofen',
    peakName: 'Litnisschrofen',
    rating: null,
    comment: 'Spannende Tour ab Nesselwängle Haller ins Strindental mit leichtem Gipfelgrat.'
  },
  'schneidspitze': {
    tourId: 'schneidspitze',
    peakName: 'Schneidspitze',
    rating: null,
    comment: 'Aussichtsreiche Skitour ab Höfen / Hahnenkammbahn ins Gehrenbachtal.'
  },
  'thaneller': {
    tourId: 'thaneller',
    peakName: 'Thaneller',
    rating: null,
    comment: 'Markante Pyramide über dem Zwischentoren-Tal ab Bahnhof Bichlbach.'
  },
  'bleispitze': {
    tourId: 'bleispitze',
    peakName: 'Bleispitze',
    rating: null,
    comment: 'Traumhafte Süd- und Osthänge ab Bahnhof Lähn mit grandioser Zugspitzkulisse.'
  },
  'grubigstein': {
    tourId: 'grubigstein',
    peakName: 'Grubigstein',
    rating: null,
    comment: 'Beliebte Pistenskitour im Skigebiet Lermoos ab Talstation Grubigsteinbahn.'
  },
  'sonnenspitze': {
    tourId: 'sonnenspitze',
    peakName: 'Ehrwalder Sonnenspitze',
    rating: null,
    comment: 'Alpine Frühjahrstour über den Seebensee zum Skidepot unter dem Westgrat.'
  },
  'wank': {
    tourId: 'wank',
    peakName: 'Wank',
    rating: null,
    comment: 'Sonnige Pistentour auf der alten Wank-Abfahrt ab Garmisch-Partenkirchen.'
  },
  'kramerspitz': {
    tourId: 'kramerspitz',
    peakName: 'Kramerspitz',
    rating: null,
    comment: 'Aussichtsreicher Logenplatz gegenüber dem Zugspitzmassiv ab Garmisch.'
  },
  'hoher-kranzberg': {
    tourId: 'hoher-kranzberg',
    peakName: 'Hoher Kranzberg',
    rating: null,
    comment: 'Ideale Einsteigertour ab Bahnhof Mittenwald über den Luttensee.'
  },
  'pleisenpitze': {
    tourId: 'pleisenpitze',
    peakName: 'Pleisenspitze',
    rating: null,
    comment: 'Der 100% D-Ticket Karwendel-Klassiker direkt ab Bahnhof Scharnitz.'
  },
  'hohe-muende': {
    tourId: 'hohe-muende',
    peakName: 'Hohe Munde',
    rating: null,
    comment: 'Monumentale Skitour über die steile Ostflanke ab Leutasch Buchen.'
  },
  'mindelheimer-rundtour': {
    tourId: 'mindelheimer-rundtour',
    peakName: 'Mindelheimer Hütte Rundtour',
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

/**
 * Loads list of tour IDs that the user has explicitly deleted.
 */
export function loadDeletedTourIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_TOURS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Deletes any tour (custom or bundled).
 */
export function deleteTour(tourId: string): void {
  // If it's a custom tour, remove it from custom tours storage
  const customList = loadCustomTours().filter(t => t.id !== tourId);
  try {
    localStorage.setItem(CUSTOM_TOURS_KEY, JSON.stringify(customList));
  } catch {}

  // Add to deleted tour IDs set
  const deleted = loadDeletedTourIds().filter(id => id !== tourId);
  deleted.push(tourId);
  try {
    localStorage.setItem(DELETED_TOURS_KEY, JSON.stringify(deleted));
  } catch {}

  // Clean up user metadata
  const currentMeta = loadUserMeta();
  delete currentMeta[tourId];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMeta));
  } catch {}
}

/**
 * Resets all deleted tours (restores pre-bundled tours).
 */
export function resetDeletedTours(): void {
  try {
    localStorage.removeItem(DELETED_TOURS_KEY);
  } catch {}
}
