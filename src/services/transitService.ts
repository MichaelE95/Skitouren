export interface LiveJourneyLeg {
  lineName: string;
  originName: string;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  plannedDepartureTime: string;
  departureDelayMinutes: number;
  departurePlatform?: string;
}

export interface LiveJourneyResult {
  departure: string;
  arrival: string;
  durationMinutes: number;
  transfers: number;
  legs: LiveJourneyLeg[];
  dbNavigatorUrl: string;
}

/**
 * Queries DB HAFAS via transport.rest proxy for regional train connections
 * starting from any selected origin station (default: Augsburg Haunstetter Str. 8000713).
 */
export async function fetchLiveJourneys(
  destinationIbnr: string,
  destinationName: string,
  cleanDbStationName: string,
  originIbnr: string = '8000713',
  originName: string = 'Augsburg Haunstetter Straße',
  departureDateTime?: string
): Promise<LiveJourneyResult[]> {
  try {
    let url = `https://v6.db.transport.rest/journeys?from=${originIbnr}&to=${destinationIbnr}&onlyRegional=true&results=3`;
    
    if (departureDateTime) {
      url += `&departure=${encodeURIComponent(departureDateTime)}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`DB timetable API error: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.journeys) || data.journeys.length === 0) {
      return [];
    }

    const searchTarget = cleanDbStationName || destinationName;
    const dbUrl = buildDbNavigatorUrl(originName, searchTarget);

    return data.journeys.map((j: any) => {
      const depDate = new Date(j.legs[0]?.departure || j.plannedDeparture);
      const arrDate = new Date(j.legs[j.legs.length - 1]?.arrival || j.plannedArrival);
      const durationMs = arrDate.getTime() - depDate.getTime();
      const durationMinutes = Math.round(durationMs / 60000);

      const legs: LiveJourneyLeg[] = (j.legs || []).map((leg: any) => {
        const dep = new Date(leg.departure);
        const planDep = new Date(leg.plannedDeparture || leg.departure);
        const arr = new Date(leg.arrival);
        const delayMin = Math.round((dep.getTime() - planDep.getTime()) / 60000);

        return {
          lineName: leg.line?.name || (leg.walking ? 'Fußweg' : 'Regionalzug'),
          originName: leg.origin?.name || '',
          destinationName: leg.destination?.name || '',
          departureTime: dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          plannedDepartureTime: planDep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          arrivalTime: arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          departureDelayMinutes: delayMin > 0 ? delayMin : 0,
          departurePlatform: leg.departurePlatform || leg.plannedDeparturePlatform
        };
      });

      return {
        departure: depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        arrival: arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMinutes,
        transfers: Math.max(0, legs.length - 1),
        legs,
        dbNavigatorUrl: dbUrl
      };
    });
  } catch (err) {
    console.warn('Could not fetch real-time transit journeys:', err);
    return [];
  }
}

/**
 * Generates an official working search link to bahn.de / DB Navigator.
 */
export function buildDbNavigatorUrl(originStationName: string, destinationStationName: string): string {
  return `https://www.bahn.de/buchung/fahrplan/suche#sts=true&so=${encodeURIComponent(originStationName)}&zo=${encodeURIComponent(destinationStationName)}`;
}
