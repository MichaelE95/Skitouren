/**
 * Parses a GPX file into tour metrics. Everything is derived from the track itself;
 * if the file lacks the data (e.g. no elevations), we throw instead of inventing values.
 */
export interface ParsedGpxResult {
  nameFromFile: string; // <trk><name> or file name, only used as a fallback suggestion
  startElevation: number;
  peakElevation: number;
  elevationGain: number;
  distanceKm: number;
  trailhead: [number, number]; // [lng, lat]
  summit: [number, number]; // [lng, lat]
  track: [number, number][]; // simplified [[lng, lat], ...]
}

interface Pt { lat: number; lng: number; ele: number | null }

export function parseGpxString(gpxText: string, fileName: string): ParsedGpxResult {
  const xmlDoc = new DOMParser().parseFromString(gpxText, 'application/xml');
  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('Invalid GPX file: the XML could not be parsed.');
  }

  const nameNode = xmlDoc.querySelector('trk > name') || xmlDoc.querySelector('metadata > name');
  const nameFromFile = (nameNode?.textContent?.trim() || fileName.replace(/\.gpx$/i, ''))
    .replace(/[_]+/g, ' ')
    .replace(/^\s*\d+\s*[-–:]\s*/, '') // "4757 - Hoher Ifen (Auenhütte)" -> "Hoher Ifen (Auenhütte)"
    .trim();

  let nodes = Array.from(xmlDoc.querySelectorAll('trkpt'));
  if (nodes.length === 0) nodes = Array.from(xmlDoc.querySelectorAll('rtept'));

  const points: Pt[] = [];
  for (const n of nodes) {
    const lat = parseFloat(n.getAttribute('lat') || '');
    const lng = parseFloat(n.getAttribute('lon') || '');
    const eleText = n.querySelector('ele')?.textContent;
    const ele = eleText != null && eleText.trim() !== '' ? parseFloat(eleText) : null;
    if (!isNaN(lat) && !isNaN(lng)) points.push({ lat, lng, ele: ele != null && !isNaN(ele) ? ele : null });
  }

  if (points.length < 2) {
    throw new Error('The GPX file contains fewer than 2 track points.');
  }
  const withEle = points.filter(p => p.ele !== null).length;
  if (withEle < points.length * 0.9) {
    throw new Error('The GPX file has no (or incomplete) elevation data. Please export it with elevations.');
  }

  // Fill single missing elevations with the previous value (only <10% allowed above)
  let last = points.find(p => p.ele !== null)!.ele!;
  for (const p of points) {
    if (p.ele === null) p.ele = last;
    else last = p.ele;
  }

  // Elevation gain with a small hysteresis (3 m) to suppress GPS noise
  let gain = 0;
  let ref = points[0].ele!;
  for (const p of points) {
    const d = p.ele! - ref;
    if (d >= 3) { gain += d; ref = p.ele!; }
    else if (d <= -3) { ref = p.ele!; }
  }

  let distKm = 0;
  let highest = points[0];
  for (let i = 1; i < points.length; i++) {
    distKm += haversineKm(points[i - 1], points[i]);
    if (points[i].ele! > highest.ele!) highest = points[i];
  }

  return {
    nameFromFile,
    startElevation: Math.round(points[0].ele!),
    peakElevation: Math.round(highest.ele!),
    elevationGain: Math.round(gain),
    distanceKm: Math.round(distKm * 10) / 10,
    trailhead: [round6(points[0].lng), round6(points[0].lat)],
    summit: [round6(highest.lng), round6(highest.lat)],
    track: simplify(points.map(p => [p.lng, p.lat] as [number, number]), 0.0001)
      .map(([x, y]) => [round6(x), round6(y)] as [number, number])
  };
}

/** Slugifies a name into a safe tour id (also used as the GPX file name). */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'tour';
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/** Douglas-Peucker simplification (tolerance in degrees; 0.0001 ≈ 10 m). */
function simplify(pts: [number, number][], tol: number): [number, number][] {
  if (pts.length <= 2) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    let maxD = 0;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = perpDist(pts[i], pts[s], pts[e]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (idx !== -1 && maxD > tol) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

function perpDist(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
