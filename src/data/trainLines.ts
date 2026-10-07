import { MasterStation } from '../types';

export type { MasterStation };
export type TrainStation = MasterStation;

export const DEFAULT_ORIGIN_STATION: MasterStation = {
  id: 'augsburg-haunstetter-str',
  name: 'Augsburg Haunstetter Straße',
  ibnr: '8000713',
  eva: '780251',
  cleanDbName: 'Haunstetter Straße Bahnhof, Augsburg (Bayern)',
  coordinates: [10.9023, 48.3512],
  type: 'rail',
  dTicketNotice: 'Startbahnhof direkt vor der Haustür',
  note: 'Heimat-Bahnhof direkt vor der Haustür. Startpunkt aller Touren!'
};

/**
 * Master catalog of railway stations & key ski bus terminals in Bavaria and Tyrol.
 * Shared seamlessly across both Origin and Tour Destination pickers.
 */
export const UNIFIED_STATION_CATALOG: MasterStation[] = [
  DEFAULT_ORIGIN_STATION,
  // Bavarian Origin & Junction Hubs
  {
    id: 'augsburg-hbf',
    name: 'Augsburg Hbf',
    ibnr: '8000013',
    eva: '8000013',
    cleanDbName: 'Augsburg Hbf',
    coordinates: [10.8856, 48.3654],
    type: 'rail',
    dTicketNotice: 'Hauptbahnhof'
  },
  {
    id: 'muenchen-hbf',
    name: 'München Hbf',
    ibnr: '8000261',
    eva: '8000261',
    cleanDbName: 'München Hbf',
    coordinates: [11.5583, 48.1402],
    type: 'rail',
    dTicketNotice: 'Hauptbahnhof'
  },
  {
    id: 'muenchen-pasing',
    name: 'München-Pasing',
    ibnr: '8004158',
    eva: '8004158',
    cleanDbName: 'München-Pasing',
    coordinates: [11.4619, 48.1500],
    type: 'rail',
    dTicketNotice: 'Knoten Werdenfels & Allgäu'
  },
  {
    id: 'buchloe',
    name: 'Buchloe',
    ibnr: '8000057',
    eva: '8000057',
    cleanDbName: 'Buchloe',
    coordinates: [10.7250, 48.0381],
    type: 'rail',
    dTicketNotice: 'Umsteigeknoten Allgäu & Außerfern'
  },
  {
    id: 'kaufering',
    name: 'Kaufering',
    ibnr: '8003222',
    eva: '8003222',
    cleanDbName: 'Kaufering',
    coordinates: [10.8653, 48.0872],
    type: 'rail',
    dTicketNotice: 'Lechfeld'
  },
  {
    id: 'kempten',
    name: 'Kempten (Allgäu) Hbf',
    ibnr: '8000199',
    eva: '8000199',
    cleanDbName: 'Kempten(Allgäu)Hbf',
    coordinates: [10.3167, 47.7200],
    type: 'rail',
    dTicketNotice: 'Drehscheibe Allgäu'
  },
  {
    id: 'immenstadt',
    name: 'Immenstadt',
    ibnr: '8000185',
    eva: '8000185',
    cleanDbName: 'Immenstadt',
    coordinates: [10.2200, 47.5600],
    type: 'rail',
    dTicketNotice: 'Oberallgäu'
  },
  {
    id: 'weilheim',
    name: 'Weilheim (Oberbay)',
    ibnr: '8006306',
    eva: '8006306',
    cleanDbName: 'Weilheim(Oberbay)',
    coordinates: [11.1400, 47.8400],
    type: 'rail',
    dTicketNotice: 'Werdenfelsbahn'
  },
  {
    id: 'tutzing',
    name: 'Tutzing',
    ibnr: '8005929',
    eva: '8005929',
    cleanDbName: 'Tutzing',
    coordinates: [11.2750, 47.9080],
    type: 'rail',
    dTicketNotice: 'Starnberger See'
  },
  {
    id: 'murnau',
    name: 'Murnau',
    ibnr: '8004183',
    eva: '8004183',
    cleanDbName: 'Murnau',
    coordinates: [11.2000, 47.6800],
    type: 'rail',
    dTicketNotice: 'Werdenfels'
  },

  // Alpine Rail Hubs
  {
    id: 'oberstdorf',
    name: 'Oberstdorf Bhf',
    ibnr: '8004593',
    eva: '8004593',
    cleanDbName: 'Oberstdorf',
    coordinates: [10.2847, 47.4083],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'pfronten-steinach',
    name: 'Pfronten-Steinach',
    ibnr: '8004812',
    eva: '8004812',
    cleanDbName: 'Pfronten-Steinach',
    coordinates: [10.5601, 47.5147],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'fuessen',
    name: 'Füssen Bhf',
    ibnr: '8000111',
    eva: '8000111',
    cleanDbName: 'Füssen',
    coordinates: [10.7000, 47.5700],
    type: 'rail',
    dTicketNotice: 'Direktzug RB 77 ab Haunstetter Str.'
  },
  {
    id: 'reutte',
    name: 'Reutte in Tirol',
    ibnr: '8100155',
    eva: '8100155',
    cleanDbName: 'Reutte in Tirol',
    coordinates: [10.7180, 47.4890],
    type: 'rail',
    dTicketNotice: '100% D-Ticket (Außerfernbahn)'
  },
  {
    id: 'heiterwang',
    name: 'Heiterwang-Plansee',
    ibnr: '8100150',
    eva: '8100150',
    cleanDbName: 'Heiterwang-Plansee',
    coordinates: [10.7483, 47.4528],
    type: 'rail',
    dTicketNotice: '100% D-Ticket (Außerfern)'
  },
  {
    id: 'bichlbach',
    name: 'Bichlbach-Berwang',
    ibnr: '8100146',
    eva: '8100146',
    cleanDbName: 'Bichlbach-Berwang',
    coordinates: [10.7890, 47.4200],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'laehn',
    name: 'Bahnhof Lähn',
    ibnr: '8100108',
    eva: '8100108',
    cleanDbName: 'Lähn',
    coordinates: [10.8169, 47.4144],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'lermoos',
    name: 'Bahnhof Lermoos',
    ibnr: '8100085',
    eva: '8100085',
    cleanDbName: 'Lermoos',
    coordinates: [10.8872, 47.4019],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'ehrwald',
    name: 'Ehrwald Zugspitzbahn',
    ibnr: '8100148',
    eva: '8100148',
    cleanDbName: 'Ehrwald Zugspitzbahn',
    coordinates: [10.9150, 47.4000],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'garmisch',
    name: 'Garmisch-Partenkirchen',
    ibnr: '8002220',
    eva: '8002220',
    cleanDbName: 'Garmisch-Partenkirchen',
    coordinates: [11.0967, 47.4920],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'klais',
    name: 'Klais',
    ibnr: '8003306',
    eva: '8003306',
    cleanDbName: 'Klais',
    coordinates: [11.2333, 47.4833],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'mittenwald',
    name: 'Mittenwald Bhf',
    ibnr: '8000257',
    eva: '8000257',
    cleanDbName: 'Mittenwald',
    coordinates: [11.2650, 47.4419],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'scharnitz',
    name: 'Bahnhof Scharnitz',
    ibnr: '8100088',
    eva: '8100088',
    cleanDbName: 'Scharnitz',
    coordinates: [11.2642, 47.3889],
    type: 'rail',
    dTicketNotice: '100% D-Ticket (Grenzbahnhof inkludiert)'
  },
  {
    id: 'seefeld',
    name: 'Bahnhof Seefeld in Tirol',
    ibnr: '8100062',
    eva: '8100062',
    cleanDbName: 'Seefeld in Tirol',
    coordinates: [11.1969, 47.3325],
    type: 'rail',
    dTicketNotice: 'ÖBB-Aufpreis ab Scharnitz (~3,80 €)'
  },
  {
    id: 'lenggries',
    name: 'Lenggries',
    ibnr: '8003666',
    eva: '8003666',
    cleanDbName: 'Lenggries',
    coordinates: [11.5731, 47.6811],
    type: 'rail',
    dTicketNotice: '100% D-Ticket (Brauneck)'
  },
  {
    id: 'tegernsee',
    name: 'Tegernsee',
    ibnr: '8005834',
    eva: '8005834',
    cleanDbName: 'Tegernsee',
    coordinates: [11.7583, 47.7125],
    type: 'rail',
    dTicketNotice: '100% D-Ticket'
  },
  {
    id: 'fischhausen',
    name: 'Fischhausen-Neuhaus',
    ibnr: '8002013',
    eva: '8002013',
    cleanDbName: 'Fischhausen-Neuhaus',
    coordinates: [11.8744, 47.7011],
    type: 'rail',
    dTicketNotice: '100% D-Ticket (Spitzingsee Bus)'
  },
  {
    id: 'bayrischzell',
    name: 'Bayrischzell',
    ibnr: '8000845',
    eva: '8000845',
    cleanDbName: 'Bayrischzell',
    coordinates: [12.0125, 47.6742],
    type: 'rail',
    dTicketNotice: '100% D-Ticket (Sudelfeld)'
  },

  // Alpine Bus Hubs & Key Trailhead Stops
  {
    id: 'riezlern-kanzelwand',
    name: 'Riezlern Kanzelwandbahn',
    ibnr: '8100654',
    eva: '8100654',
    cleanDbName: 'Riezlern Kanzelwandbahn',
    coordinates: [10.1855, 47.3562],
    type: 'bus',
    dTicketNotice: '100% D-Ticket (Walserbus 1 ab Oberstdorf)'
  },
  {
    id: 'mittelberg-boedmen',
    name: 'Mittelberg Bödmen',
    ibnr: '8100652',
    eva: '8100652',
    cleanDbName: 'Mittelberg Bödmen',
    coordinates: [10.1620, 47.3180],
    type: 'bus',
    dTicketNotice: '100% D-Ticket (Walserbus 1 ab Oberstdorf)'
  },
  {
    id: 'baad',
    name: 'Baad (Kleinwalsertal)',
    ibnr: '8100650',
    eva: '8100650',
    cleanDbName: 'Baad',
    coordinates: [10.1189, 47.3094],
    type: 'bus',
    dTicketNotice: '100% D-Ticket (Walserbus 1 Talschluss)'
  },
  {
    id: 'tannheim-kreisverkehr',
    name: 'Tannheim Kreisverkehr',
    ibnr: '8101452',
    eva: '8101452',
    cleanDbName: 'Tannheim Kreisverkehr',
    coordinates: [10.5170, 47.4988],
    type: 'bus',
    dTicketNotice: 'VVT Bus 120 ab Pfronten / Sonthofen'
  },
  {
    id: 'nesselwaengle',
    name: 'Nesselwängle Abzw Krinnenalpe',
    ibnr: '8101458',
    eva: '8101458',
    cleanDbName: 'Nesselwängle',
    coordinates: [10.6180, 47.4820],
    type: 'bus',
    dTicketNotice: 'VVT Bus 120'
  },
  {
    id: 'oberjoch',
    name: 'Oberjoch Moorhütte',
    ibnr: '8071060',
    eva: '8071060',
    cleanDbName: 'Oberjoch',
    coordinates: [10.4100, 47.5140],
    type: 'bus',
    dTicketNotice: '100% D-Ticket (Bus ab Sonthofen)'
  },
  {
    id: 'spitzingsee-kirche',
    name: 'Spitzingsee Kirche',
    ibnr: '8072040',
    eva: '8072040',
    cleanDbName: 'Spitzingsee',
    coordinates: [11.8880, 47.6620],
    type: 'bus',
    dTicketNotice: 'RVO Bus 9562 ab Fischhausen-Neuhaus'
  }
];

const CUSTOM_STATIONS_STORAGE_KEY = 'skitour_custom_stations';

export function loadCustomStations(): MasterStation[] {
  try {
    const raw = localStorage.getItem(CUSTOM_STATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomStation(station: MasterStation): void {
  try {
    const list = loadCustomStations().filter(s => s.id !== station.id);
    list.push({ ...station, isCustom: true });
    localStorage.setItem(CUSTOM_STATIONS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function getAllMasterStations(): MasterStation[] {
  const custom = loadCustomStations();
  const map = new Map<string, MasterStation>();
  for (const st of UNIFIED_STATION_CATALOG) {
    map.set(st.id, st);
  }
  for (const st of custom) {
    map.set(st.id, st);
  }
  return Array.from(map.values());
}

/**
 * Searches for public transit stops (bus or train) across Germany and Austria using
 * OpenStreetMap Nominatim / Transitous location resolution.
 */
export async function searchPublicTransitStops(query: string): Promise<MasterStation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // First search local master catalog
  const allLocal = getAllMasterStations();
  const qLower = trimmed.toLowerCase();
  const localMatches = allLocal.filter(s =>
    s.name.toLowerCase().includes(qLower) ||
    (s.cleanDbName && s.cleanDbName.toLowerCase().includes(qLower))
  );

  // If sufficient local matches found, return them directly
  if (localMatches.length >= 5) {
    return localMatches;
  }

  // Geocode online via Nominatim (restricted to DE & AT transit stops)
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed + ' Bahnhof Haltestelle')}&countrycodes=de,at&limit=6&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) return localMatches;
    const data = await res.json();

    const onlineMatches: MasterStation[] = data.map((item: any, idx: number) => {
      const cleanName = (item.namedetails?.name || item.name || item.display_name.split(',')[0]).trim();
      const id = 'stop-' + cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + idx;
      const isBus = item.type === 'bus_stop' || item.class === 'highway';

      return {
        id,
        name: cleanName,
        cleanDbName: cleanName,
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)] as [number, number],
        type: isBus ? 'bus' : 'rail',
        dTicketNotice: 'Online ermittelte Haltestelle',
        isCustom: true
      };
    });

    // Merge and deduplicate by cleanDbName
    const combined = [...localMatches];
    for (const om of onlineMatches) {
      if (!combined.some(c => c.cleanDbName?.toLowerCase() === om.cleanDbName?.toLowerCase())) {
        combined.push(om);
      }
    }
    return combined;
  } catch (err) {
    console.warn('Could not query online stops:', err);
    return localMatches;
  }
}

// Backwards-compatible aliases
export const KEY_STATIONS = UNIFIED_STATION_CATALOG;
export const POPULAR_ORIGIN_STATIONS = UNIFIED_STATION_CATALOG.slice(0, 10);
export const ALL_PRESET_ORIGIN_STATIONS = UNIFIED_STATION_CATALOG;
