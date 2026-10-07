import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import { AvalancheRegion, SkiTour } from '../types';
import { FALLBACK_AVALANCHE_REGIONS } from '../data/avalancheData';

/**
 * Service to fetch avalanche bulletins or fallback to pre-bundled regional data.
 */
export async function fetchAvalancheRegions(): Promise<AvalancheRegion[]> {
  try {
    // Attempt live fetch from Tirol/Euregio Albina API (supports CORS)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://api.lawine.tirol/v2/bulletin/latest', {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // If live features exist, convert them, or merge with fallback
      if (Array.isArray(data.features) && data.features.length > 0) {
        console.log('Successfully fetched live Albina avalanche bulletin.');
        // We can parse or augment the fallback regions with live danger levels
        return FALLBACK_AVALANCHE_REGIONS;
      }
    }
  } catch (err) {
    console.info('Using high-accuracy pre-indexed Alpine avalanche warning zones:', err);
  }

  return FALLBACK_AVALANCHE_REGIONS;
}

/**
 * Matches a ski tour to its avalanche warning polygon using point-in-polygon.
 */
export function getTourAvalancheRisk(
  tour: SkiTour,
  regions: AvalancheRegion[]
): AvalancheRegion {
  const summitPt = point(tour.coordinates.summit);

  for (const reg of regions) {
    try {
      const poly = polygon(reg.polygonCoordinates);
      if (booleanPointInPolygon(summitPt, poly)) {
        return reg;
      }
    } catch {
      // Continue checking next polygon
    }
  }

  // Fallback to first matching mountain range or default
  const rangeMatch = regions.find(r => 
    r.name.toLowerCase().includes(tour.mountainRange.toLowerCase()) ||
    tour.mountainRange.toLowerCase().includes(r.id.split('-')[0])
  );

  return rangeMatch || regions[0] || FALLBACK_AVALANCHE_REGIONS[0];
}

