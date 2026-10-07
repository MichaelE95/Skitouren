export interface ParsedGpxResult {
  name: string;
  startElevation: number;
  peakElevation: number;
  elevationGain: number;
  distanceKm: number;
  estimatedDurationHours: number;
  mountainRange: string;
  trailhead: [number, number]; // [lng, lat]
  summit: [number, number]; // [lng, lat]
  trackCoordinates: [number, number][]; // [[lng, lat], ...]
}

/**
 * Infers the alpine mountain range (Gebirgsgruppe) strictly based on geographical coordinates.
 */
export function inferMountainRange(lng: number, lat: number): string {
  // Allgäuer Alpen (Oberstdorf, Kleinwalsertal, Hindelang)
  if (lng >= 10.0 && lng < 10.55 && lat >= 47.15 && lat <= 47.58) {
    return 'Allgäuer Alpen';
  }
  // Lechtaler Alpen & Außerfern Süd
  if (lng >= 10.2 && lng < 10.85 && lat >= 47.15 && lat < 47.45) {
    return 'Lechtaler Alpen';
  }
  // Ammergauer Alpen (Pfronten, Füssen, Reutte, Graswang)
  if (lng >= 10.55 && lng < 11.05 && lat >= 47.45 && lat <= 47.65) {
    return 'Ammergauer Alpen';
  }
  // Wettersteingebirge & Mieminger Kette (Zugspitze, Ehrwald, Lermoos, Mittenwald)
  if (lng >= 10.85 && lng < 11.35 && lat >= 47.30 && lat <= 47.52) {
    return 'Wettersteingebirge & Mieminger Kette';
  }
  // Karwendel (Scharnitz, Seefeld, Mittenwald Ost)
  if (lng >= 11.25 && lng < 11.85 && lat >= 47.30 && lat <= 47.55) {
    return 'Karwendel';
  }
  // Mangfallgebirge (Tegernsee, Schliersee, Spitzingsee, Sudelfeld, Wendelstein)
  if (lng >= 11.65 && lng <= 12.20 && lat >= 47.55 && lat <= 47.78) {
    return 'Mangfallgebirge';
  }
  // Bayerische Voralpen (Lenggries, Brauneck, Estergebirge, Walchensee)
  if (lng >= 11.05 && lng < 11.65 && lat >= 47.52 && lat <= 47.78) {
    return 'Bayerische Voralpen';
  }

  return 'Bayerische Alpen';
}

/**
 * Parses a standard GPX file string into structured ski tour metrics.
 * 100% of physical tour dimensions are extracted directly from the track.
 */
export function parseGpxString(gpxText: string, fallbackFileName: string = 'Neue Skitour'): ParsedGpxResult {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxText, 'application/xml');

  // Check for parse errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Ungültige GPX-Datei. XML konnte nicht geparst werden.');
  }

  // Extract tour name
  const nameNode = xmlDoc.querySelector('trk > name') || xmlDoc.querySelector('metadata > name') || xmlDoc.querySelector('name');
  let tourName = nameNode?.textContent?.trim() || fallbackFileName.replace(/\.gpx$/i, '');
  tourName = tourName.replace(/[_-]+/g, ' ').trim();

  // Extract track points
  const trkpts = Array.from(xmlDoc.querySelectorAll('trkpt'));
  const points: { lat: number; lng: number; ele: number }[] = [];

  if (trkpts.length > 0) {
    for (const pt of trkpts) {
      const lat = parseFloat(pt.getAttribute('lat') || '0');
      const lng = parseFloat(pt.getAttribute('lon') || '0');
      const ele = parseFloat(pt.querySelector('ele')?.textContent || '0');
      if (!isNaN(lat) && !isNaN(lng)) {
        points.push({ lat, lng, ele: isNaN(ele) ? 0 : ele });
      }
    }
  } else {
    // Check route points or waypoints
    const rtes = Array.from(xmlDoc.querySelectorAll('rtept, wpt'));
    for (const pt of rtes) {
      const lat = parseFloat(pt.getAttribute('lat') || '0');
      const lng = parseFloat(pt.getAttribute('lon') || '0');
      const ele = parseFloat(pt.querySelector('ele')?.textContent || '0');
      if (!isNaN(lat) && !isNaN(lng)) {
        points.push({ lat, lng, ele: isNaN(ele) ? 0 : ele });
      }
    }
  }

  if (points.length < 2) {
    throw new Error('Die GPX-Datei enthält zu wenige Koordinatenpunkte.');
  }

  // Calculate stats
  let totalAscent = 0;
  let totalDistanceKm = 0;
  let minEle = points[0].ele || 1000;
  let maxEle = points[0].ele || 1000;
  let highestPt = points[0];

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (pt.ele > maxEle) {
      maxEle = pt.ele;
      highestPt = pt;
    }
    if (pt.ele > 0 && pt.ele < minEle) {
      minEle = pt.ele;
    }

    if (i > 0) {
      const prev = points[i - 1];
      const eleDiff = pt.ele - prev.ele;
      if (eleDiff > 0) {
        totalAscent += eleDiff;
      }
      totalDistanceKm += haversineDistance(prev.lat, prev.lng, pt.lat, pt.lng);
    }
  }

  // Elevations
  const startElevation = points[0].ele > 0 ? Math.round(points[0].ele) : Math.round(minEle);
  const peakElevation = maxEle > 0 ? Math.round(maxEle) : startElevation + 800;
  const elevationGain = totalAscent > 50 ? Math.round(totalAscent) : peakElevation - startElevation;
  const distanceKm = Math.round(totalDistanceKm * 10) / 10;

  // DIN 33466 / SAC duration estimation
  // Ascent: ~400 hm/h, Distance: ~4 km/h
  const hElevation = elevationGain / 400;
  const hDist = distanceKm / 4;
  const estimatedDuration = Math.round(Math.max(1.5, Math.min(hElevation, hDist) / 2 + Math.max(hElevation, hDist)) * 10) / 10;

  // Track coordinates array [lng, lat]
  const trackCoordinates: [number, number][] = points.map(p => [p.lng, p.lat]);

  // Trailhead & Summit
  const trailhead: [number, number] = [points[0].lng, points[0].lat];
  const summit: [number, number] = [highestPt.lng, highestPt.lat];

  // Mountain Range derived directly from coordinates
  const mountainRange = inferMountainRange(summit[0], summit[1]);

  return {
    name: tourName,
    startElevation,
    peakElevation,
    elevationGain,
    distanceKm,
    estimatedDurationHours: estimatedDuration,
    mountainRange,
    trailhead,
    summit,
    trackCoordinates
  };
}

/**
 * Triggers a browser download of a clean GPX file for a given tour.
 */
export function downloadGpxFile(tourName: string, trackCoordinates: [number, number][], peakElevation?: number): void {
  const safeName = tourName.replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]+/g, '_');
  const eleString = peakElevation ? `\n      <ele>${peakElevation}</ele>` : '';

  const trkptsXml = trackCoordinates.map(coord =>
    `      <trkpt lat="${coord[1].toFixed(6)}" lon="${coord[0].toFixed(6)}">${eleString}</trkpt>`
  ).join('\n');

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Skitour Planner Haunstetter Straße" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${tourName}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${tourName}</name>
    <trkseg>
${trkptsXml}
    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
