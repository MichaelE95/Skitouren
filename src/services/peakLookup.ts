/**
 * Gebirgsgruppe lookup, done once when a tour is added (optional, never blocking).
 * One Wikidata SPARQL request: the nearest Wikidata item within 1 km of the GPX's
 * highest point that has a "mountain range" (P4552). No Overpass: its public servers
 * were too unreliable (504s / timeouts) in testing.
 */
export interface RangeLookupResult {
  mountainRange?: string;
  matchedItem?: string; // e.g. "Hoher Ifen (280 m entfernt)"
  warning?: string;
}

const SPARQL = 'https://query.wikidata.org/sparql';
const TIMEOUT_MS = 15000;

export async function lookupMountainRange(summit: [number, number]): Promise<RangeLookupResult> {
  const [lng, lat] = summit;
  const query = `
SELECT ?itemLabel ?rangeLabel ?dist WHERE {
  SERVICE wikibase:around {
    ?item wdt:P625 ?loc .
    bd:serviceParam wikibase:center "Point(${lng} ${lat})"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "1" .
    bd:serviceParam wikibase:distance ?dist .
  }
  ?item wdt:P4552 ?range .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
} ORDER BY ?dist LIMIT 1`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${SPARQL}?format=json&query=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/sparql-results+json' }
    });
    if (!res.ok) throw new Error(`Wikidata HTTP ${res.status}`);
    const data = await res.json();
    const row = data?.results?.bindings?.[0];
    if (!row) {
      return { warning: 'No Wikidata entry with a mountain range within 1 km of the summit. Enter the Gebirgsgruppe if you like.' };
    }
    const distM = Math.round(parseFloat(row.dist.value) * 1000);
    return {
      mountainRange: row.rangeLabel.value,
      matchedItem: `${row.itemLabel.value} (${distM} m from the GPX summit)`
    };
  } catch (err: any) {
    const msg = err?.name === 'AbortError' ? 'timed out' : err instanceof Error ? err.message : String(err);
    return { warning: `Gebirgsgruppe lookup failed (${msg}). Enter it manually if you like.` };
  } finally {
    clearTimeout(timer);
  }
}
