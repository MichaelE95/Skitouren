/**
 * Q10: peak name + Gebirgsgruppe, looked up once when a tour is added.
 * 1) OSM Overpass: nearest natural=peak within 300 m of the GPX's highest point
 * 2) Wikidata: that peak's "mountain range" (P4552), German label
 * Anything missing -> a warning; the user types it in.
 */
export interface PeakLookupResult {
  peakName?: string;
  peakEle?: number;
  mountainRange?: string;
  warnings: string[];
}

const OVERPASS = 'https://overpass-api.de/api/interpreter';
const WIKIDATA = 'https://www.wikidata.org/w/api.php';

export async function lookupPeak(summit: [number, number]): Promise<PeakLookupResult> {
  const [lng, lat] = summit;
  const warnings: string[] = [];
  const result: PeakLookupResult = { warnings };

  let wikidataId: string | undefined;
  try {
    const query = `[out:json][timeout:20];node(around:300,${lat},${lng})[natural=peak][name];out tags center;`;
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });
    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
    const data = await res.json();
    const peaks: any[] = data.elements || [];
    if (peaks.length === 0) {
      warnings.push('No named OSM peak within 300 m of the highest GPX point. Please enter the peak name.');
    } else {
      const dist = (p: any) => (p.lat - lat) ** 2 + ((p.lon - lng) * Math.cos((lat * Math.PI) / 180)) ** 2;
      const nearest = peaks.sort((a, b) => dist(a) - dist(b))[0];
      result.peakName = nearest.tags['name:de'] || nearest.tags.name;
      const ele = parseFloat(nearest.tags.ele);
      if (!isNaN(ele)) result.peakEle = Math.round(ele);
      wikidataId = nearest.tags.wikidata;
    }
  } catch (err) {
    warnings.push(`Peak lookup (OpenStreetMap) failed: ${err instanceof Error ? err.message : err}. Please enter the peak name.`);
  }

  if (result.peakName) {
    if (!wikidataId) {
      warnings.push(`"${result.peakName}" has no Wikidata link in OSM, so the Gebirgsgruppe is unknown. Please enter it.`);
    } else {
      try {
        const range = await wikidataRange(wikidataId);
        if (range) result.mountainRange = range;
        else warnings.push(`Wikidata has no mountain range for "${result.peakName}". Please enter the Gebirgsgruppe.`);
      } catch (err) {
        warnings.push(`Wikidata lookup failed: ${err instanceof Error ? err.message : err}. Please enter the Gebirgsgruppe.`);
      }
    }
  } else {
    warnings.push('Gebirgsgruppe unknown (no peak found). Please enter it.');
  }

  return result;
}

async function wikidataRange(id: string): Promise<string | undefined> {
  const entity = await wbget(id, 'claims');
  const claims: any[] = entity?.claims?.P4552 || [];
  const rangeIds = claims.map(c => c.mainsnak?.datavalue?.value?.id).filter(Boolean) as string[];
  if (rangeIds.length === 0) return undefined;
  const labels = await wbget(rangeIds.join('|'), 'labels', true);
  const names = rangeIds
    .map(rid => labels?.[rid]?.labels?.de?.value || labels?.[rid]?.labels?.en?.value)
    .filter(Boolean);
  return names.join(' / ') || undefined;
}

async function wbget(ids: string, props: string, multi = false): Promise<any> {
  const q = new URLSearchParams({
    action: 'wbgetentities', ids, props, languages: 'de|en', format: 'json', origin: '*'
  });
  const res = await fetch(`${WIKIDATA}?${q.toString()}`);
  if (!res.ok) throw new Error(`Wikidata HTTP ${res.status}`);
  const data = await res.json();
  return multi ? data.entities : data.entities?.[ids];
}
