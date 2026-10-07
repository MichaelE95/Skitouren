import { SkiTour } from '../types';

/**
 * Generates and triggers download of a standardized GPX (v1.1) XML file
 * for any tour.
 */
export function downloadTourGpx(tour: SkiTour): void {
  const points = tour.gpxTrackCoordinates.length > 0 
    ? tour.gpxTrackCoordinates 
    : [tour.coordinates.trailhead, tour.coordinates.summit];

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Skitour Haunstetter Strasse Planner" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(tour.name)} - Skitour</name>
    <desc>${escapeXml(tour.subheading)} | Ausgangspunkt: Augsburg Haunstetter Str. | SAC: ${tour.difficulty}</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <wpt lat="${tour.coordinates.trailhead[1]}" lon="${tour.coordinates.trailhead[0]}">
    <ele>${tour.startElevation}</ele>
    <name>Start: ${escapeXml(tour.transit.destinationStation)}</name>
  </wpt>
  <wpt lat="${tour.coordinates.summit[1]}" lon="${tour.coordinates.summit[0]}">
    <ele>${tour.peakElevation}</ele>
    <name>Gipfel: ${escapeXml(tour.name)} (${tour.peakElevation} m)</name>
  </wpt>
  <trk>
    <name>${escapeXml(tour.name)}</name>
    <trkseg>
${points.map(([lon, lat], idx) => {
  const elevInterp = Math.round(
    tour.startElevation + (tour.peakElevation - tour.startElevation) * (idx / Math.max(1, points.length - 1))
  );
  return `      <trkpt lat="${lat}" lon="${lon}">\n        <ele>${elevInterp}</ele>\n      </trkpt>`;
}).join('\n')}
    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tour.id}-skitour.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

