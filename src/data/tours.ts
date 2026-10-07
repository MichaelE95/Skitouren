import { SkiTour } from '../types';

export const SKI_TOURS: SkiTour[] = [
  // ==========================================
  // KLEINWALSERTAL & OBERSTDORF (RE 17 / Walserbus 1)
  // ==========================================
  {
    id: 'kanzelwand',
    name: 'Kanzelwand',
    mountainRange: 'Allgäuer Alpen',
    valley: 'Kleinwalsertal',
    type: 'day',
    isPiste: true,
    startElevation: 1086,
    peakElevation: 2058,
    elevationGain: 972,
    distanceKm: 5.5,
    estimatedTourDurationHours: 2.5,
    difficulty: 'L+',
    difficultyCategory: 'L',
    maxSafeAvalancheLevel: 4,
    exposition: 'N, NO',
    coordinates: {
      trailhead: [10.1855, 47.3562], // Riezlern Kanzelwandbahn
      summit: [10.2014, 47.3503]     // Kanzelwand Gipfel
    },
    gpxTrackCoordinates: [
      [10.1855, 47.3562], [10.1890, 47.3550], [10.1930, 47.3535],
      [10.1970, 47.3520], [10.2000, 47.3510], [10.2014, 47.3503]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Riezlern Kanzelwandbahn',
      cleanDbStationName: 'Riezlern Kanzelwandbahn',
      destinationIbnr: '8100654',
      destinationEva: '8100654',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
      webcamUrl: 'https://www.das-hoechste.de/winter/webcams/kanzelwand/'
    },
    rating: null,
    curatedComment: 'Perfekte Ausweichtour bei hoher Lawinenwarnstufe oder schlechter Sicht. Durch den Walserbus bequem und 100% im D-Ticket.'
    },
  {
    id: 'geisshorn',
    name: 'Geißhorn',
    mountainRange: 'Allgäuer Alpen',
    valley: 'Kleinwalsertal',
    type: 'day',
    isPiste: false,
    startElevation: 1180,
    peakElevation: 2366,
    elevationGain: 1186,
    distanceKm: 8.2,
    estimatedTourDurationHours: 4.0,
    difficulty: 'WS+',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, O',
    coordinates: {
      trailhead: [10.1620, 47.3180], // Mittelberg Bödmen
      summit: [10.1583, 47.2847]     // Geißhorn Gipfel
    },
    gpxTrackCoordinates: [
      [10.1620, 47.3180], [10.1610, 47.3080], [10.1605, 47.2990],
      [10.1595, 47.2910], [10.1583, 47.2847]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Mittelberg Bödmen',
      cleanDbStationName: 'Mittelberg Bödmen',
      destinationIbnr: '8100652',
      destinationEva: '8100652',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
      webcamUrl: 'https://www.kleinwalsertal.com/de/Aktuelles-Service/Webcams'
    },
    rating: null,
    curatedComment: 'Landschaftlich ein Traum durch das Gemsteltal. Erfordert sichere Verhältnisse im steilen Gipfelhang.'
    },
  {
    id: 'guentlespitze',
    name: 'Güntlespitze',
    mountainRange: 'Allgäuer Alpen',
    valley: 'Kleinwalsertal',
    type: 'day',
    isPiste: false,
    startElevation: 1244,
    peakElevation: 2092,
    elevationGain: 848,
    distanceKm: 6.0,
    estimatedTourDurationHours: 3.0,
    difficulty: 'WS',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'O, NO',
    coordinates: {
      trailhead: [10.1189, 47.3094], // Baad Endstation
      summit: [10.0967, 47.3006]     // Güntlespitze Gipfel
    },
    gpxTrackCoordinates: [
      [10.1189, 47.3094], [10.1130, 47.3060], [10.1080, 47.3035],
      [10.1020, 47.3015], [10.0967, 47.3006]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Baad (Kleinwalsertal)',
      cleanDbStationName: 'Baad',
      destinationIbnr: '8100650',
      destinationEva: '8100650',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Der Skitouren-Klassiker ab Baad. Schöne, mäßig steile Nordosthänge mit super Pulverschnee-Chancen.'
    },
  {
    id: 'grosser-widderstein',
    name: 'Großer Widderstein',
    mountainRange: 'Allgäuer Alpen',
    valley: 'Kleinwalsertal',
    type: 'day',
    isPiste: false,
    startElevation: 1244,
    peakElevation: 2533,
    elevationGain: 1289,
    distanceKm: 8.5,
    estimatedTourDurationHours: 4.5,
    difficulty: 'ZS+',
    difficultyCategory: 'ZS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, NW',
    coordinates: {
      trailhead: [10.1189, 47.3094], // Baad
      summit: [10.1264, 47.2847]     // Großer Widderstein
    },
    gpxTrackCoordinates: [
      [10.1189, 47.3094], [10.1210, 47.3010], [10.1235, 47.2930],
      [10.1250, 47.2880], [10.1264, 47.2847]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Baad (Kleinwalsertal)',
      cleanDbStationName: 'Baad',
      destinationIbnr: '8100650',
      destinationEva: '8100650',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Königstour im Kleinwalsertal! Gewaltige Kulisse. Skidepot am Einstieg zur Südrinne, Steigeisen & Helm obligatorisch.'
    },
  {
    id: 'uentschenspitze',
    name: 'Üntschenspitze',
    mountainRange: 'Allgäuer Alpen',
    valley: 'Kleinwalsertal',
    type: 'day',
    isPiste: false,
    startElevation: 1244,
    peakElevation: 2135,
    elevationGain: 891,
    distanceKm: 6.8,
    estimatedTourDurationHours: 3.5,
    difficulty: 'WS+',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, O',
    coordinates: {
      trailhead: [10.1189, 47.3094], // Baad
      summit: [10.0886, 47.3039]     // Üntschenspitze
    },
    gpxTrackCoordinates: [
      [10.1189, 47.3094], [10.1110, 47.3070], [10.1030, 47.3050],
      [10.0950, 47.3040], [10.0886, 47.3039]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Baad (Kleinwalsertal)',
      cleanDbStationName: 'Baad',
      destinationIbnr: '8100650',
      destinationEva: '8100650',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Sehr lohnend und oft ruhiger als die Güntlespitze gegenüber. Grandioser Blick in den Bregenzerwald.'
    },
  {
    id: 'nebelhorn-daumen',
    name: 'Nebelhorn / Großer Daumen',
    mountainRange: 'Allgäuer Alpen',
    valley: 'Oberstdorf',
    type: 'day',
    isPiste: false,
    startElevation: 815,
    peakElevation: 2280,
    elevationGain: 1465,
    distanceKm: 9.5,
    estimatedTourDurationHours: 4.5,
    difficulty: 'ZS-',
    difficultyCategory: 'ZS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, W',
    coordinates: {
      trailhead: [10.2847, 47.4083], // Oberstdorf Nebelhornbahn
      summit: [10.3756, 47.4525]     // Großer Daumen
    },
    gpxTrackCoordinates: [
      [10.2847, 47.4083], [10.3100, 47.4200], [10.3400, 47.4350],
      [10.3600, 47.4450], [10.3756, 47.4525]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Oberstdorf Bhf',
      cleanDbStationName: 'Oberstdorf',
      destinationIbnr: '8004593',
      destinationEva: '8004593',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Sehr schneesichere Region im Allgäuer Hauptkamm. Bei hoher Lawinenstufe kann auf das gesicherte Nebelhorn-Skigebiet ausgewichen werden.'
    },

  // ==========================================
  // PFRONTEN & TANNHEIMER TAL (RB 73 & Bus 120)
  // ==========================================
  {
    id: 'breitenberg-ostlerhuette',
    name: 'Breitenberg / Ostlerhütte',
    mountainRange: 'Allgäuer Alpen',
    valley: 'Pfronten',
    type: 'day',
    isPiste: true,
    startElevation: 850,
    peakElevation: 1838,
    elevationGain: 988,
    distanceKm: 5.2,
    estimatedTourDurationHours: 2.8,
    difficulty: 'L+',
    difficultyCategory: 'L',
    maxSafeAvalancheLevel: 3,
    exposition: 'N',
    coordinates: {
      trailhead: [10.5601, 47.5147], // Bahnhof Pfronten-Steinach
      summit: [10.5753, 47.5028]     // Ostlerhütte / Breitenberg
    },
    gpxTrackCoordinates: [
      [10.5601, 47.5147], [10.5650, 47.5110], [10.5700, 47.5070],
      [10.5730, 47.5045], [10.5753, 47.5028]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Pfronten-Steinach',
      cleanDbStationName: 'Pfronten-Steinach',
      destinationIbnr: '8004812',
      destinationEva: '8004812',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
      webcamUrl: 'https://www.breitenbergbahn.de/service/webcams/'
    },
    huts: [
      { name: 'Ostlerhütte', elevation: 1838, hasWinterRoom: false, davLink: 'https://www.ostlerhuette.de' }
    ],
    rating: null,
    curatedComment: 'Der unangefochtene Klassiker für Öffi-Touren: Null Fußweg vom Zuggleis zum Schnee! Schöne Hütteneinkehr auf der Ostlerhütte.'
    },
  {
    id: 'gaishorn',
    name: 'Gaishorn',
    mountainRange: 'Tannheimer Berge',
    valley: 'Tannheimer Tal',
    type: 'day',
    isPiste: false,
    startElevation: 1100,
    peakElevation: 2247,
    elevationGain: 1147,
    distanceKm: 7.2,
    estimatedTourDurationHours: 3.8,
    difficulty: 'WS+',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, NO',
    coordinates: {
      trailhead: [10.5170, 47.4988], // Tannheim Kreisverkehr
      summit: [10.4939, 47.4725]     // Gaishorn Gipfel
    },
    gpxTrackCoordinates: [
      [10.5170, 47.4988], [10.5110, 47.4910], [10.5050, 47.4830],
      [10.4990, 47.4770], [10.4939, 47.4725]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Tannheim Kreisverkehr',
      cleanDbStationName: 'Tannheim Kreisverkehr',
      destinationIbnr: '8101452',
      destinationEva: '8101452',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: 'Zusatzkosten nötig',
      extraCostEuro: 4
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Eine der besten Touren im Tannheimer Tal. Tolle Hänge im Vilsalpsee-Kessel und über das Gaiseck.'
    },
  {
    id: 'ponten',
    name: 'Ponten',
    mountainRange: 'Tannheimer Berge',
    valley: 'Tannheimer Tal',
    type: 'day',
    isPiste: false,
    startElevation: 1080,
    peakElevation: 2045,
    elevationGain: 965,
    distanceKm: 6.4,
    estimatedTourDurationHours: 3.2,
    difficulty: 'WS',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, NO',
    coordinates: {
      trailhead: [10.4533, 47.5140], // Schattwald Wannenjochbahn
      summit: [10.4678, 47.4878]     // Ponten Gipfel
    },
    gpxTrackCoordinates: [
      [10.4533, 47.5140], [10.4580, 47.5060], [10.4620, 47.4980],
      [10.4650, 47.4920], [10.4678, 47.4878]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Schattwald',
      cleanDbStationName: 'Schattwald',
      destinationIbnr: '8101450',
      destinationEva: '8101450',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: 'Zusatzkosten nötig',
      extraCostEuro: 4
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Sehr lohnende Hänge im Stuibental. Lässt sich ideal mit dem Bschießer zu einer Rundtour verbinden!'
    },
  {
    id: 'bschiesser',
    name: 'Bschießer',
    mountainRange: 'Tannheimer Berge',
    valley: 'Tannheimer Tal',
    type: 'day',
    isPiste: false,
    startElevation: 1080,
    peakElevation: 2000,
    elevationGain: 920,
    distanceKm: 5.8,
    estimatedTourDurationHours: 3.0,
    difficulty: 'WS-',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, NO',
    coordinates: {
      trailhead: [10.4533, 47.5140], // Schattwald Wannenjochbahn
      summit: [10.4553, 47.4878]     // Bschießer Gipfel
    },
    gpxTrackCoordinates: [
      [10.4533, 47.5140], [10.4540, 47.5050], [10.4545, 47.4970],
      [10.4550, 47.4910], [10.4553, 47.4878]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Schattwald',
      cleanDbStationName: 'Schattwald',
      destinationIbnr: '8101450',
      destinationEva: '8101450',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: 'Zusatzkosten nötig',
      extraCostEuro: 4
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Etwas sanfter als der Ponten, ideal bei mäßiger Lawinenlage und gutem Schnee.'
    },
  {
    id: 'litnisschrofen',
    name: 'Litnisschrofen',
    mountainRange: 'Tannheimer Berge',
    valley: 'Tannheimer Tal',
    type: 'day',
    isPiste: false,
    startElevation: 1130,
    peakElevation: 2068,
    elevationGain: 938,
    distanceKm: 6.2,
    estimatedTourDurationHours: 3.3,
    difficulty: 'ZS-',
    difficultyCategory: 'ZS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, NW',
    coordinates: {
      trailhead: [10.5700, 47.4880], // Nesselwängle Haller
      summit: [10.5592, 47.4642]     // Litnisschrofen Gipfel
    },
    gpxTrackCoordinates: [
      [10.5700, 47.4880], [10.5670, 47.4800], [10.5640, 47.4730],
      [10.5610, 47.4680], [10.5592, 47.4642]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Nesselwängle Abzw Krinnenalpe',
      cleanDbStationName: 'Nesselwängle',
      destinationIbnr: '8101458',
      destinationEva: '8101458',
      walkingDistanceMeters: 3668,
      walkingDurationMinutes: 52,
      dTicketValidity: 'Zusatzkosten nötig',
      extraCostEuro: 4
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Markanter Felszacken. Skidepot am Sattel, die letzten Meter zum Gipfelkreuz zu Fuß über leichten Grat.'
    },
  {
    id: 'schneidspitze',
    name: 'Schneidspitze',
    mountainRange: 'Tannheimer Berge',
    valley: 'Tannheimer Tal',
    type: 'day',
    isPiste: false,
    startElevation: 1140,
    peakElevation: 2009,
    elevationGain: 869,
    distanceKm: 5.5,
    estimatedTourDurationHours: 3.0,
    difficulty: 'ZS',
    difficultyCategory: 'ZS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, O',
    coordinates: {
      trailhead: [10.5850, 47.4850], // Nesselwängle Rauth
      summit: [10.6014, 47.4722]     // Schneidspitze Gipfel
    },
    gpxTrackCoordinates: [
      [10.5850, 47.4850], [10.5900, 47.4810], [10.5950, 47.4770],
      [10.6014, 47.4722]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Reutte in Tirol',
      cleanDbStationName: 'Reutte in Tirol',
      destinationIbnr: '8100155',
      destinationEva: '8100155',
      walkingDistanceMeters: 10004,
      walkingDurationMinutes: 143,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Steilere Wald- und Freihänge. Für fortgeschrittene Tourengeher mit sicherer Skitechnik.'
    },

  // ==========================================
  // OSTALLGÄU & FÜSSEN (RB 77 DIREKT)
  // ==========================================
  {
    id: 'tegelberg',
    name: 'Tegelberg',
    mountainRange: 'Ammergauer Alpen',
    valley: 'Ostallgäu',
    type: 'day',
    isPiste: true,
    startElevation: 830,
    peakElevation: 1720,
    elevationGain: 890,
    distanceKm: 5.0,
    estimatedTourDurationHours: 2.5,
    difficulty: 'L',
    difficultyCategory: 'L',
    maxSafeAvalancheLevel: 4,
    exposition: 'N, NW',
    coordinates: {
      trailhead: [10.7567, 47.5694], // Schwangau Tegelbergbahn
      summit: [10.7786, 47.5572]     // Tegelberghaus Gipfelstation
    },
    gpxTrackCoordinates: [
      [10.7567, 47.5694], [10.7620, 47.5660], [10.7680, 47.5620],
      [10.7740, 47.5590], [10.7786, 47.5572]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Füssen Bhf',
      cleanDbStationName: 'Füssen',
      destinationIbnr: '8000111',
      destinationEva: '8000111',
      walkingDistanceMeters: 4254,
      walkingDurationMinutes: 61,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
      webcamUrl: 'https://www.tegelbergbahn.de/webcams'
    },
    rating: null,
    curatedComment: 'DER Feierabend- und Schlechtwetter-Tipp! Direktzug RB 77 hält direkt vor der Haustür in Haunstetter Straße. 100% D-Ticket.'
    },

  // ==========================================
  // AUSSERFERNBAHN (RB 60 VIA PASING / GARMISCH / REUTTE)
  // ==========================================
  {
    id: 'grubigstein',
    name: 'Grubigstein',
    mountainRange: 'Wetterstein / Mieming',
    valley: 'Außerfern',
    type: 'day',
    isPiste: true,
    startElevation: 1004,
    peakElevation: 2233,
    elevationGain: 1229,
    distanceKm: 6.5,
    estimatedTourDurationHours: 3.5,
    difficulty: 'L+',
    difficultyCategory: 'L',
    maxSafeAvalancheLevel: 4,
    exposition: 'O',
    coordinates: {
      trailhead: [10.8872, 47.4019], // Bahnhof Lermoos
      summit: [10.8522, 47.3878]     // Grubigstein Gipfel
    },
    gpxTrackCoordinates: [
      [10.8872, 47.4019], [10.8790, 47.3990], [10.8710, 47.3950],
      [10.8620, 47.3910], [10.8522, 47.3878]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Bahnhof Lermoos',
      cleanDbStationName: 'Lermoos',
      destinationIbnr: '8100085',
      destinationEva: '8100085',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
      webcamUrl: 'https://bergbahnen-langes.at/webcams/'
    },
    rating: null,
    curatedComment: 'Unglaublicher Ausblick auf das Zugspitz-Massiv. Sichere Pistentour bei Neuschnee oder heiklen Lawinenstufen.'
    },
  {
    id: 'plattberg-pfuitjoechl',
    name: 'Kleines Pfuitjöchl / Plattberg',
    mountainRange: 'Ammergauer Alpen',
    valley: 'Außerfern',
    type: 'day',
    isPiste: false,
    startElevation: 1112,
    peakElevation: 2247,
    elevationGain: 1135,
    distanceKm: 6.8,
    estimatedTourDurationHours: 3.8,
    difficulty: 'WS+',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'S, SO',
    coordinates: {
      trailhead: [10.8169, 47.4144], // Bahnhof Lähn
      summit: [10.8122, 47.4417]     // Plattberg Gipfel
    },
    gpxTrackCoordinates: [
      [10.8169, 47.4144], [10.8160, 47.4220], [10.8150, 47.4300],
      [10.8140, 47.4360], [10.8122, 47.4417]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Bahnhof Lähn',
      cleanDbStationName: 'Lähn',
      destinationIbnr: '8100108',
      destinationEva: '8100108',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Eines der Juwele der Außerfernbahn! Traumhafte Skihänge über die Wiesmad-Mähder hinauf zum Pfuitjöchl.'
    },
  {
    id: 'thaneller',
    name: 'Thaneller',
    mountainRange: 'Lechtaler Alpen',
    valley: 'Außerfern',
    type: 'day',
    isPiste: false,
    startElevation: 1336,
    peakElevation: 2341,
    elevationGain: 1005,
    distanceKm: 5.8,
    estimatedTourDurationHours: 3.5,
    difficulty: 'ZS-',
    difficultyCategory: 'ZS',
    maxSafeAvalancheLevel: 2,
    exposition: 'S, SW',
    coordinates: {
      trailhead: [10.7483, 47.4097], // Berwang / Bus 152
      summit: [10.7300, 47.4267]     // Thaneller Gipfel
    },
    gpxTrackCoordinates: [
      [10.7483, 47.4097], [10.7430, 47.4140], [10.7380, 47.4190],
      [10.7340, 47.4230], [10.7300, 47.4267]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Bichlbach-Berwang',
      cleanDbStationName: 'Bichlbach-Berwang',
      destinationIbnr: '8100146',
      destinationEva: '8100146',
      walkingDistanceMeters: 3270,
      walkingDurationMinutes: 47,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Der Thaneller ist von weitem erkennbar. Gewaltiger Tiefblick ins Inntal und Zugspitzbecken.'
    },
  {
    id: 'bleispitze',
    name: 'Bleispitze',
    mountainRange: 'Lechtaler Alpen',
    valley: 'Außerfern',
    type: 'day',
    isPiste: false,
    startElevation: 1275,
    peakElevation: 2469,
    elevationGain: 1194,
    distanceKm: 7.2,
    estimatedTourDurationHours: 4.0,
    difficulty: 'WS+',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'O, SO',
    coordinates: {
      trailhead: [10.7600, 47.3900], // Bichlbächle
      summit: [10.7639, 47.3686]     // Bleispitze Gipfel
    },
    gpxTrackCoordinates: [
      [10.7600, 47.3900], [10.7610, 47.3830], [10.7620, 47.3770],
      [10.7630, 47.3720], [10.7639, 47.3686]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Bahnhof Lähn',
      cleanDbStationName: 'Lähn',
      destinationIbnr: '8100108',
      destinationEva: '8100108',
      walkingDistanceMeters: 5070,
      walkingDurationMinutes: 72,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Traumhafte Hänge über das Bichlbächler Jöchl. Wesentlich einsamer als die Nachbargipfel.'
    },
  {
    id: 'zugspitzplatt-gatterl',
    name: 'Zugspitzplatt / Gatterl',
    mountainRange: 'Wetterstein',
    valley: 'Ehrwald',
    type: 'day',
    isPiste: false,
    startElevation: 1112,
    peakElevation: 2600,
    elevationGain: 1488,
    distanceKm: 11.0,
    estimatedTourDurationHours: 5.0,
    difficulty: 'WS',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'S, W',
    coordinates: {
      trailhead: [10.9333, 47.3972], // Ehrwalder Alm Talstation
      summit: [10.9850, 47.4100]     // Zugspitzplatt
    },
    gpxTrackCoordinates: [
      [10.9333, 47.3972], [10.9450, 47.3980], [10.9600, 47.4010],
      [10.9750, 47.4060], [10.9850, 47.4100]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Ehrwald Zugspitzbahn',
      cleanDbStationName: 'Ehrwald Zugspitzbahn',
      destinationIbnr: '8100148',
      destinationEva: '8100148',
      walkingDistanceMeters: 1412,
      walkingDurationMinutes: 20,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Ein Monumental-Klassiker! Vom Tiroler Außerfern durchs schmale Gatterl ins hochalpine Karstplateau der Zugspitze.'
    },

  // ==========================================
  // WERDENFELS & KARWENDEL (RB 6 VIA PASING)
  // ==========================================
  {
    id: 'osterfelderkopf',
    name: 'Osterfelderkopf',
    mountainRange: 'Wetterstein',
    valley: 'Garmisch-Partenkirchen',
    type: 'day',
    isPiste: true,
    startElevation: 750,
    peakElevation: 2050,
    elevationGain: 1300,
    distanceKm: 6.2,
    estimatedTourDurationHours: 3.5,
    difficulty: 'L',
    difficultyCategory: 'L',
    maxSafeAvalancheLevel: 4,
    exposition: 'N',
    coordinates: {
      trailhead: [11.0625, 47.4717], // Kreuzeckbahn Talstation
      summit: [11.0544, 47.4372]     // Osterfelderkopf
    },
    gpxTrackCoordinates: [
      [11.0625, 47.4717], [11.0600, 47.4610], [11.0580, 47.4520],
      [11.0560, 47.4440], [11.0544, 47.4372]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Garmisch-Partenkirchen',
      cleanDbStationName: 'Garmisch-Partenkirchen',
      destinationIbnr: '8002220',
      destinationEva: '8002220',
      walkingDistanceMeters: 3421,
      walkingDurationMinutes: 49,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
      webcamUrl: 'https://zugspitze.de/de/Service-Informationen/Webcams'
    },
    rating: null,
    curatedComment: 'Atemberaubende Kulisse direkt unter der Alpspitz-Nordwand. Top lawinensichere Pistentour mit knackigen Höhenmetern.'
    },
  {
    id: 'dammkar',
    name: 'Dammkar',
    mountainRange: 'Karwendel',
    valley: 'Mittenwald',
    type: 'day',
    isPiste: false,
    startElevation: 930,
    peakElevation: 2244,
    elevationGain: 1314,
    distanceKm: 7.0,
    estimatedTourDurationHours: 4.2,
    difficulty: 'ZS-',
    difficultyCategory: 'ZS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, NW',
    coordinates: {
      trailhead: [11.2650, 47.4419], // Bahnhof Mittenwald
      summit: [11.2889, 47.4261]     // Karwendelgrube / Dammkar
    },
    gpxTrackCoordinates: [
      [11.2650, 47.4419], [11.2720, 47.4370], [11.2780, 47.4320],
      [11.2840, 47.4280], [11.2889, 47.4261]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Mittenwald Bhf',
      cleanDbStationName: 'Mittenwald',
      destinationIbnr: '8000257',
      destinationEva: '8000257',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
      webcamUrl: 'https://www.karwendelbahn.de/webcams/'
    },
    huts: [
      { name: 'Dammkarhütte', elevation: 1667, hasWinterRoom: true, davLink: 'https://www.dammkarhuette.de' }
    ],
    rating: null,
    curatedComment: 'Der Inbegriff einer alpinen Skitour! Gewaltige Felswände rechts und links im Dammkar. Nur bei sicheren Firn-/Schneeverhältnissen!'
    },
  {
    id: 'pleisenspitze',
    name: 'Pleisenspitze',
    mountainRange: 'Karwendel',
    valley: 'Scharnitz',
    type: 'day',
    isPiste: false,
    startElevation: 964,
    peakElevation: 2569,
    elevationGain: 1605,
    distanceKm: 8.5,
    estimatedTourDurationHours: 5.0,
    difficulty: 'WS+',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'S, SW',
    coordinates: {
      trailhead: [11.2642, 47.3889], // Bahnhof Scharnitz
      summit: [11.3314, 47.4117]     // Pleisenspitze Gipfel
    },
    gpxTrackCoordinates: [
      [11.2642, 47.3889], [11.2800, 47.3950], [11.2990, 47.4010],
      [11.3150, 47.4070], [11.3314, 47.4117]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Bahnhof Scharnitz',
      cleanDbStationName: 'Scharnitz',
      destinationIbnr: '8100088',
      destinationEva: '8100088',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
    },
    huts: [
      { name: 'Pleisenhütte', elevation: 1757, hasWinterRoom: true, davLink: 'https://www.pleisenhuette.at' }
    ],
    rating: null,
    curatedComment: '1600 Höhenmeter Konditionstest direkt vom Bahnsteig Scharnitz. Gewaltiges Panorama über das gesamte Karwendel.'
    },
  {
    id: 'seefelder-joch',
    name: 'Seefelder Joch',
    mountainRange: 'Karwendel',
    valley: 'Seefeld in Tirol',
    type: 'day',
    isPiste: true,
    startElevation: 1230,
    peakElevation: 2064,
    elevationGain: 834,
    distanceKm: 4.8,
    estimatedTourDurationHours: 2.3,
    difficulty: 'L',
    difficultyCategory: 'L',
    maxSafeAvalancheLevel: 4,
    exposition: 'W',
    coordinates: {
      trailhead: [11.1969, 47.3325], // Bahnhof Seefeld
      summit: [11.2333, 47.3400]     // Seefelder Joch
    },
    gpxTrackCoordinates: [
      [11.1969, 47.3325], [11.2080, 47.3340], [11.2180, 47.3365],
      [11.2260, 47.3385], [11.2333, 47.3400]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Bahnhof Seefeld in Tirol',
      cleanDbStationName: 'Seefeld in Tirol',
      destinationIbnr: '8100062',
      destinationEva: '8100062',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: 'Zusatzkosten nötig',
      extraCostEuro: 3.8
    },
    links: {
      
      webcamUrl: 'https://www.rosshuette.at/webcams/'
    },
    rating: null,
    curatedComment: 'Sehr beliebte, schneesichere Pistentour auf das Seefelder Joch. Ideal für Einsteiger und bei kritischer Lawinenlage.'
    },
  {
    id: 'seefelder-spitze',
    name: 'Seefelder Spitze',
    mountainRange: 'Karwendel',
    valley: 'Seefeld in Tirol',
    type: 'day',
    isPiste: false,
    startElevation: 1230,
    peakElevation: 2221,
    elevationGain: 991,
    distanceKm: 5.6,
    estimatedTourDurationHours: 3.2,
    difficulty: 'WS-',
    difficultyCategory: 'WS',
    maxSafeAvalancheLevel: 2,
    exposition: 'W, SW',
    coordinates: {
      trailhead: [11.1969, 47.3325], // Bahnhof Seefeld
      summit: [11.2403, 47.3333]     // Seefelder Spitze
    },
    gpxTrackCoordinates: [
      [11.1969, 47.3325], [11.2150, 47.3355], [11.2333, 47.3400],
      [11.2403, 47.3333]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Bahnhof Seefeld in Tirol',
      cleanDbStationName: 'Seefeld in Tirol',
      destinationIbnr: '8100062',
      destinationEva: '8100062',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: 'Zusatzkosten nötig',
      extraCostEuro: 3.8
    },
    links: {
      
    },
    rating: null,
    curatedComment: 'Vom Joch über den luftigen Grat zur Spitze. Wunderbarer Blick auf die Wettersteinwand und ins Inntal.'
    },
  {
    id: 'hohe-munde',
    name: 'Hohe Munde',
    mountainRange: 'Mieminger Kette',
    valley: 'Seefeld in Tirol / Leutasch',
    type: 'day',
    isPiste: false,
    startElevation: 1180,
    peakElevation: 2592,
    elevationGain: 1412,
    distanceKm: 7.5,
    estimatedTourDurationHours: 4.5,
    difficulty: 'ZS+',
    difficultyCategory: 'ZS',
    maxSafeAvalancheLevel: 1,
    exposition: 'O, SO',
    coordinates: {
      trailhead: [11.1083, 47.3317], // Leutasch Buchen
      summit: [11.0711, 47.3478]     // Hohe Munde Ostgipfel
    },
    gpxTrackCoordinates: [
      [11.1083, 47.3317], [11.0980, 47.3350], [11.0880, 47.3400],
      [11.0780, 47.3440], [11.0711, 47.3478]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Leutasch Buchen',
      cleanDbStationName: 'Leutasch Buchen',
      destinationIbnr: '8100220',
      destinationEva: '8100220',
      walkingDistanceMeters: 3268,
      walkingDurationMinutes: 47,
      dTicketValidity: 'Zusatzkosten nötig',
      extraCostEuro: 3.8
    },
    links: {
      
    },
    huts: [
      { name: 'Rauthhütte', elevation: 1605, hasWinterRoom: false, davLink: 'https://www.rauthhuette.at' }
    ],
    rating: null,
    curatedComment: 'Eine der spektakulärsten Skitouren der Nordalpen! Die steile Ostflanke ist nur bei absolut bombenfesten Verhältnissen machbar.'
    },

  // ==========================================
  // MEHRTAGESOUREN & DAV-HÜTTEN (FUTURE-PROOF EXTENSION)
  // ==========================================
  {
    id: 'mindelheimer-rundtour',
    name: 'Mindelheimer Hütte Rundtour',
    mountainRange: 'Allgäuer Alpen',
    valley: 'Kleinwalsertal',
    type: 'multiday',
    isPiste: false,
    startElevation: 1244,
    peakElevation: 2320,
    elevationGain: 1850,
    distanceKm: 16.5,
    estimatedTourDurationHours: 8.0,
    difficulty: 'ZS',
    difficultyCategory: 'ZS',
    maxSafeAvalancheLevel: 2,
    exposition: 'N, S, W',
    coordinates: {
      trailhead: [10.1189, 47.3094], // Baad
      summit: [10.1980, 47.2880]     // Schafalpenköpfe
    },
    gpxTrackCoordinates: [
      [10.1189, 47.3094], [10.1350, 47.3020], [10.1600, 47.2950],
      [10.1800, 47.2910], [10.1980, 47.2880]
    ],
    transit: {
      origin: 'Augsburg Haunstetter Str.',
      destinationStation: 'Baad (Kleinwalsertal)',
      cleanDbStationName: 'Baad',
      destinationIbnr: '8100650',
      destinationEva: '8100650',
      walkingDistanceMeters: 0,
      walkingDurationMinutes: 0,
      dTicketValidity: '100% gültig',
      extraCostEuro: 0
    },
    links: {
      
      alpenvereinUrl: 'https://www.alpenvereinaktiv.com/de/bewirtschaftete-huette/mindelheimer-huette/7027581/'
    },
    huts: [
      { 
        name: 'Mindelheimer Hütte (DAV Sektion Mindelheim)', 
        elevation: 2013, 
        hasWinterRoom: true, 
        davLink: 'https://www.mindelheimer-huette.de',
        notes: 'Großer, gemütlicher Winterraum mit Holzofen und AV-Schloss.'
      }
    ],
    rating: null,
    curatedComment: 'Perfekter Einstieg in Mehrtages-Skitouren. Toller Stützpunkt mit grandiosen Überschreitungsmöglichkeiten.'
    }
];
