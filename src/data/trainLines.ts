import { OriginStation } from '../types';

export interface TrainStation {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  ibnr?: string;
  isOrigin?: boolean;
  isKeyHub?: boolean;
  dTicketNotice?: string;
}

export interface TransitLine {
  id: string;
  name: string;
  color: string;
  textColor: string;
  category: 'rail' | 'bus';
  dTicketStatus: '100% gültig' | 'Zusatzkosten nötig';
  coordinates: [number, number][]; // LineString points [lng, lat]
  description: string;
}

export const DEFAULT_ORIGIN_STATION: OriginStation = {
  id: 'augsburg-haunstetter-str',
  name: 'Augsburg Haunstetter Straße',
  ibnr: '8000713',
  coordinates: [10.9023, 48.3512],
  note: 'Heimat-Bahnhof direkt vor der Haustür. Startpunkt aller Touren!'
};

export const POPULAR_ORIGIN_STATIONS: OriginStation[] = [
  DEFAULT_ORIGIN_STATION,
  {
    id: 'augsburg-hbf',
    name: 'Augsburg Hbf',
    ibnr: '8000013',
    coordinates: [10.8856, 48.3654],
    note: 'Hauptbahnhof Augsburg'
  },
  {
    id: 'muenchen-hbf',
    name: 'München Hbf',
    ibnr: '8000261',
    coordinates: [11.5583, 48.1402],
    note: 'München Hauptbahnhof'
  },
  {
    id: 'buchloe',
    name: 'Buchloe',
    ibnr: '8000057',
    coordinates: [10.7250, 48.0381],
    note: 'Umsteigeknoten Allgäu & Außerfern'
  }
];

export const KEY_STATIONS: TrainStation[] = [
  {
    id: DEFAULT_ORIGIN_STATION.id,
    name: DEFAULT_ORIGIN_STATION.name,
    coordinates: DEFAULT_ORIGIN_STATION.coordinates,
    ibnr: DEFAULT_ORIGIN_STATION.ibnr,
    isOrigin: true,
    dTicketNotice: 'Startbahnhof'
  },
  { id: 'buchloe', name: 'Buchloe', coordinates: [10.7250, 48.0381], isKeyHub: true, ibnr: '8000057', dTicketNotice: 'Umsteigeknoten ins Allgäu & Außerfern' },
  { id: 'kempten', name: 'Kempten (Allgäu) Hbf', coordinates: [10.3167, 47.7200], isKeyHub: true, ibnr: '8000199' },
  { id: 'oberstdorf', name: 'Oberstdorf Bhf', coordinates: [10.2847, 47.4083], ibnr: '8004593', isKeyHub: true, dTicketNotice: '100% D-Ticket' },
  { id: 'pfronten-steinach', name: 'Pfronten-Steinach', coordinates: [10.5601, 47.5147], ibnr: '8004812', isKeyHub: true, dTicketNotice: '100% D-Ticket' },
  { id: 'fuessen', name: 'Füssen Bhf', coordinates: [10.7000, 47.5700], ibnr: '8000111', isKeyHub: true, dTicketNotice: 'Direktzug RB 77 ab Haunstetter Str.' },
  { id: 'reutte', name: 'Reutte in Tirol', coordinates: [10.7180, 47.4890], isKeyHub: true, dTicketNotice: '100% D-Ticket (Außerfernbahn)' },
  { id: 'laehn', name: 'Bahnhof Lähn', coordinates: [10.8169, 47.4144], ibnr: '8100108', isKeyHub: true, dTicketNotice: '100% D-Ticket' },
  { id: 'lermoos', name: 'Bahnhof Lermoos', coordinates: [10.8872, 47.4019], ibnr: '8100085', isKeyHub: true, dTicketNotice: '100% D-Ticket' },
  { id: 'ehrwald', name: 'Ehrwald Zugspitzbahn', coordinates: [10.9150, 47.4000], ibnr: '8100148', isKeyHub: true, dTicketNotice: '100% D-Ticket' },
  { id: 'bichlbach', name: 'Bichlbach-Berwang', coordinates: [10.7890, 47.4200], ibnr: '8100146', isKeyHub: true, dTicketNotice: '100% D-Ticket' },
  { id: 'garmisch', name: 'Garmisch-Partenkirchen', coordinates: [11.0967, 47.4920], ibnr: '8002220', isKeyHub: true, dTicketNotice: '100% D-Ticket' },
  { id: 'mittenwald', name: 'Mittenwald Bhf', coordinates: [11.2650, 47.4419], ibnr: '8000257', isKeyHub: true, dTicketNotice: '100% D-Ticket' },
  { id: 'scharnitz', name: 'Bahnhof Scharnitz', coordinates: [11.2642, 47.3889], ibnr: '8100063', isKeyHub: true, dTicketNotice: '100% D-Ticket (Grenzbahnhof nach Anlage 2 inkludiert!)' },
  { id: 'seefeld', name: 'Bahnhof Seefeld in Tirol', coordinates: [11.1969, 47.3325], ibnr: '8100062', isKeyHub: true, dTicketNotice: 'Kleiner ÖBB-Aufpreis ab Scharnitz (~3,80 €)' }
];

export const TRANSIT_LINES: TransitLine[] = [
  {
    id: 'allgaeu-re17',
    name: 'RE 17 / RB 69 Allgäu-Express',
    color: '#0284c7',
    textColor: '#ffffff',
    category: 'rail',
    dTicketStatus: '100% gültig',
    description: 'Augsburg Haunstetter Str. → Buchloe → Kaufbeuren → Kempten → Immenstadt → Oberstdorf',
    coordinates: [
      [10.9023, 48.3512],
      [10.8400, 48.2700],
      [10.7250, 48.0381],
      [10.6300, 47.8830],
      [10.3167, 47.7200],
      [10.2200, 47.5600],
      [10.2800, 47.5100],
      [10.2847, 47.4083]
    ]
  },
  {
    id: 'ausserfernbahn-rb60',
    name: 'RB 60 Außerfernbahn',
    color: '#16a34a',
    textColor: '#ffffff',
    category: 'rail',
    dTicketStatus: '100% gültig',
    description: 'Kempten → Pfronten-Steinach → Reutte i.T. → Lähn → Lermoos → Ehrwald → Garmisch (100% im D-Ticket!)',
    coordinates: [
      [10.3167, 47.7200],
      [10.5601, 47.5147],
      [10.6300, 47.5450],
      [10.7180, 47.4890],
      [10.7890, 47.4200],
      [10.8169, 47.4144],
      [10.8872, 47.4019],
      [10.9150, 47.4000],
      [11.0967, 47.4920]
    ]
  },
  {
    id: 'werdenfelsbahn-rb6',
    name: 'RB 6 / S6 Werdenfelsbahn',
    color: '#8b5cf6',
    textColor: '#ffffff',
    category: 'rail',
    dTicketStatus: '100% gültig',
    description: 'Augsburg → München-Pasing → Tutzing → Murnau → Garmisch → Mittenwald → Scharnitz → Seefeld',
    coordinates: [
      [10.9023, 48.3512],
      [11.4619, 48.1500],
      [11.2750, 47.9080],
      [11.1400, 47.8400],
      [11.2000, 47.6800],
      [11.0967, 47.4920],
      [11.2333, 47.4833],
      [11.2650, 47.4419],
      [11.2642, 47.3889],
      [11.1969, 47.3325]
    ]
  },
  {
    id: 'fuessen-rb77',
    name: 'BRB RB 77 Direkt nach Füssen',
    color: '#f59e0b',
    textColor: '#ffffff',
    category: 'rail',
    dTicketStatus: '100% gültig',
    description: 'Direktzug ab Haunstetter Str. über Buchloe & Marktoberdorf nach Füssen (Tegelberg)',
    coordinates: [
      [10.9023, 48.3512],
      [10.7250, 48.0381],
      [10.6100, 47.7800],
      [10.7000, 47.5700]
    ]
  },
  {
    id: 'walserbus-1',
    name: 'Walserbus Linie 1',
    color: '#06b6d4',
    textColor: '#ffffff',
    category: 'bus',
    dTicketStatus: '100% gültig',
    description: 'Oberstdorf Bhf → Riezlern → Hirschegg → Mittelberg Bödmen → Baad (100% D-Ticket gültig!)',
    coordinates: [
      [10.2847, 47.4083],
      [10.1855, 47.3562],
      [10.1680, 47.3450],
      [10.1620, 47.3180],
      [10.1189, 47.3094]
    ]
  },
  {
    id: 'tannheimer-bus-120',
    name: 'VVT Bus 120 Tannheimer Tal',
    color: '#ec4899',
    textColor: '#ffffff',
    category: 'bus',
    dTicketStatus: 'Zusatzkosten nötig',
    description: 'Pfronten-Steinach / Oberjoch → Schattwald → Zöblen → Tannheim → Nesselwängle (VVT Ticket ca. 4 €)',
    coordinates: [
      [10.5601, 47.5147],
      [10.4533, 47.5140],
      [10.5170, 47.4988],
      [10.5700, 47.4880],
      [10.6700, 47.4600]
    ]
  }
];
