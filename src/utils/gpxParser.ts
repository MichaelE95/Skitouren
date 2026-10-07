export interface ParsedGpxResult {
  name: string;
  startElevation: number;
  peakElevation: number;
  elevationGain: number;
  distanceKm: number;
  estimatedDurationHours: number;
  trailhead: [number, number]; // [lng, lat]
  summit: [number, number]; // [lng, lat]
  trackCoordinates: [number, number][]; // [[lng, lat], ...]
}

/**
 * Parses a standard GPX file string into structured ski tour metrics.
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
  const tourName = nameNode?.textContent?.trim() || fallbackFileName.replace(/\.gpx$/i, '');

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

  // Fallback if elevation was missing in GPX
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

  return {
    name: tourName,
    startElevation,
    peakElevation,
    elevationGain,
    distanceKm,
    estimatedDurationHours: estimatedDuration,
    trailhead: [points[0].lng, points[0].lat],
    summit: [highestPt.lng, highestPt.lat],
    trackCoordinates
  };
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

