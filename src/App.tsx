import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SKI_TOURS } from './data/tours';
import { FALLBACK_AVALANCHE_REGIONS } from './data/avalancheData';
import { DEFAULT_ORIGIN_STATION, POPULAR_ORIGIN_STATIONS } from './data/trainLines';
import { fetchAvalancheRegions, getTourAvalancheRisk } from './services/avalancheService';
import { fetchBatchTourTimetables } from './services/transitService';
import {
  loadUserMeta,
  saveUserTourMeta,
  downloadUserMetaJson,
  loadCustomTours
} from './data/userMeta';
import { SkiTour, FilterState, AvalancheRegion, OriginStation, LiveJourneyResult } from './types';
import { Navbar } from './components/Header/Navbar';
import { AlpineMap } from './components/Map/AlpineMap';
import { FilterSidebar } from './components/Filters/FilterSidebar';
import { TourCard } from './components/Tours/TourCard';
import { TourDetailModal } from './components/Tours/TourDetailModal';
import { AddTourModal } from './components/Tours/AddTourModal';
import { SlidersHorizontal, Mountain, Train } from 'lucide-react';

const ORIGIN_STORAGE_KEY = 'skitour_active_origin_v1';

function getDefaultDepartureDateTime(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  let daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  if (daysUntilSaturday === 0 && now.getHours() >= 12) {
    daysUntilSaturday = 7;
  }
  const sat = new Date(now);
  sat.setDate(now.getDate() + daysUntilSaturday);
  sat.setHours(6, 30, 0, 0);

  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = sat.getFullYear();
  const mm = pad(sat.getMonth() + 1);
  const dd = pad(sat.getDate());
  const hh = pad(sat.getHours());
  const min = pad(sat.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export const App: React.FC = () => {
  const [selectedTour, setSelectedTour] = useState<SkiTour | null>(null);
  const [avalancheRegions, setAvalancheRegions] = useState<AvalancheRegion[]>(FALLBACK_AVALANCHE_REGIONS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isAddTourModalOpen, setIsAddTourModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  // Departure date and time for timetable queries (defaults to upcoming Saturday 06:30)
  const [departureDateTime, setDepartureDateTime] = useState<string>(() => getDefaultDepartureDateTime());

  // Active Origin Station
  const [originStation, setOriginStation] = useState<OriginStation>(() => {
    try {
      const saved = localStorage.getItem(ORIGIN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ORIGIN_STATION;
  });

  // User metadata (ratings & notes)
  const [userMetaMap, setUserMetaMap] = useState(() => loadUserMeta());

  // Custom user-created tours
  const [customTours, setCustomTours] = useState<SkiTour[]>(() => loadCustomTours());

  // Live journey timetables mapped by tourId
  const [liveJourneysMap, setLiveJourneysMap] = useState<Record<string, LiveJourneyResult>>({});
  const [isTimetableLoading, setIsTimetableLoading] = useState(false);

  // Load live avalanche bulletins on mount
  useEffect(() => {
    fetchAvalancheRegions().then(regions => {
      setAvalancheRegions(regions);
    });
  }, []);

  const handleChangeOrigin = (newOrigin: OriginStation) => {
    setOriginStation(newOrigin);
    try {
      localStorage.setItem(ORIGIN_STORAGE_KEY, JSON.stringify(newOrigin));
    } catch {}
  };

  // Base combined tours without live timetable override
  const baseTours = useMemo(() => {
    const combined = [...SKI_TOURS, ...customTours];

    return combined.map(tour => {
      const meta = userMetaMap[tour.id];
      const rating = meta && meta.rating !== undefined ? meta.rating : tour.rating;
      const comment = meta && meta.comment !== undefined ? meta.comment : tour.curatedComment;
      const guruUrl = meta && meta.skitourenguruUrl ? meta.skitourenguruUrl : tour.links.skitourenguruUrl;
      const isVerified = meta && meta.isVerifiedUrl !== undefined ? meta.isVerifiedUrl : tour.links.isVerifiedUrl;

      return {
        ...tour,
        rating,
        curatedComment: comment,
        links: {
          ...tour.links,
          skitourenguruUrl: guruUrl,
          isVerifiedUrl: isVerified
        },
        transit: {
          ...tour.transit,
          origin: originStation.name
        }
      };
    });
  }, [userMetaMap, customTours, originStation.name]);

  // Batch fetch live timetables from Transitous
  const handleFetchTimetables = useCallback(async () => {
    setIsTimetableLoading(true);
    try {
      const results = await fetchBatchTourTimetables(baseTours, originStation, departureDateTime);
      setLiveJourneysMap(results);
    } catch (err) {
      console.error('Error fetching batch timetables:', err);
    } finally {
      setIsTimetableLoading(false);
    }
  }, [baseTours, originStation, departureDateTime]);

  // Debounced auto-fetch whenever origin or departure time changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchTimetables();
    }, 350);
    return () => clearTimeout(timer);
  }, [originStation.id, departureDateTime, baseTours.length]);

  // Merge live timetable data into each tour
  const allTours: SkiTour[] = useMemo(() => {
    return baseTours.map(tour => {
      const live = liveJourneysMap[tour.id];
      if (!live) return tour;

      return {
        ...tour,
        transit: {
          ...tour.transit,
          liveJourney: live
        }
      };
    });
  }, [baseTours, liveJourneysMap]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    onlyDTicket: false,
    onlyPiste: false,
    maxTransitDurationMinutes: 240,
    maxAvalancheLevel: 4,
    minElevationGain: 0,
    maxElevationGain: 2000,
    selectedDifficulties: [],
    selectedRanges: [],
    tourType: 'all',
    ratingFilter: 'all',
    sortBy: 'transitTime'
  });

  // Unique mountain ranges
  const availableRanges = useMemo(() => {
    return Array.from(new Set(allTours.map(t => t.mountainRange))).sort();
  }, [allTours]);

  // Filter and Sort Tours
  const filteredTours = useMemo(() => {
    return allTours.filter(tour => {
      // Text search
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        const textMatch =
          tour.name.toLowerCase().includes(q) ||
          tour.subheading.toLowerCase().includes(q) ||
          tour.mountainRange.toLowerCase().includes(q) ||
          tour.valley.toLowerCase().includes(q) ||
          tour.transit.lines.some(l => l.toLowerCase().includes(q)) ||
          tour.transit.destinationStation.toLowerCase().includes(q);
        if (!textMatch) return false;
      }

      // Rating filter
      if (filters.ratingFilter === 'unrated') {
        if (tour.rating !== null) return false;
      } else if (filters.ratingFilter === 'rated_only') {
        if (tour.rating === null) return false;
      } else if (filters.ratingFilter === 'min_4_stars') {
        if (tour.rating === null || tour.rating < 4) return false;
      }

      // 100% Deutschland-Ticket
      if (filters.onlyDTicket && tour.transit.dTicketValidity !== '100% gültig') {
        return false;
      }

      // Pistenskitour only
      if (filters.onlyPiste && !tour.isPiste) {
        return false;
      }

      // Transit duration (uses live journey duration if fetched, plus walking duration)
      const effectiveTransitDuration = tour.transit.liveJourney
        ? tour.transit.liveJourney.durationMinutes + tour.transit.walkingDurationMinutes
        : tour.transit.approxTotalMinutes;

      if (effectiveTransitDuration > filters.maxTransitDurationMinutes) {
        return false;
      }

      // Avalanche risk level (only filter if winter season is active)
      const risk = getTourAvalancheRisk(tour, avalancheRegions);
      if (risk.isSeasonActive && risk.dangerLevel > filters.maxAvalancheLevel) {
        return false;
      }

      // Elevation gain
      if (tour.elevationGain > filters.maxElevationGain) {
        return false;
      }

      // SAC Difficulty
      if (
        filters.selectedDifficulties.length > 0 &&
        !filters.selectedDifficulties.includes(tour.difficultyCategory)
      ) {
        return false;
      }

      // Mountain ranges
      if (
        filters.selectedRanges.length > 0 &&
        !filters.selectedRanges.includes(tour.mountainRange)
      ) {
        return false;
      }

      // Tour type (day vs multiday)
      if (filters.tourType !== 'all' && tour.type !== filters.tourType) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'transitTime': {
          const durA = a.transit.liveJourney
            ? a.transit.liveJourney.durationMinutes + a.transit.walkingDurationMinutes
            : a.transit.approxTotalMinutes;
          const durB = b.transit.liveJourney
            ? b.transit.liveJourney.durationMinutes + b.transit.walkingDurationMinutes
            : b.transit.approxTotalMinutes;
          return durA - durB;
        }
        case 'elevationGain':
          return b.elevationGain - a.elevationGain;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'difficulty':
          const order = { 'L': 1, 'WS': 2, 'ZS': 3, 'S': 4 };
          return (order[a.difficultyCategory] || 0) - (order[b.difficultyCategory] || 0);
        default:
          return 0;
      }
    });
  }, [allTours, filters, avalancheRegions]);

  const handleSelectTour = (tour: SkiTour) => {
    setSelectedTour(tour);
    if (window.innerWidth < 768) {
      setMobileView('map');
    }
  };

  const handleRatingChange = (tourId: string, newRating: number | null) => {
    const updated = saveUserTourMeta(tourId, { rating: newRating });
    setUserMetaMap(updated);
  };

  const handleUpdateTourMeta = (
    tourId: string,
    rating: number | null,
    comment: string,
    skitourenguruUrl?: string
  ) => {
    const isVerified = skitourenguruUrl
      ? skitourenguruUrl.includes('?id=') || skitourenguruUrl.includes('/routes/')
      : undefined;

    const updated = saveUserTourMeta(tourId, {
      rating,
      comment,
      skitourenguruUrl,
      isVerifiedUrl: isVerified
    });
    setUserMetaMap(updated);
  };

  const handleTourAdded = (newTour: SkiTour) => {
    setCustomTours(prev => [...prev, newTour]);
    setSelectedTour(newTour);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Top Navigation */}
      <Navbar
        toursCount={filteredTours.length}
        mobileView={mobileView}
        setMobileView={setMobileView}
        toggleFilterDrawer={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
        isFilterDrawerOpen={isFilterDrawerOpen}
        originStation={originStation}
        onChangeOrigin={handleChangeOrigin}
        departureDateTime={departureDateTime}
        onChangeDepartureDateTime={setDepartureDateTime}
        onRefreshTimetables={handleFetchTimetables}
        isTimetableLoading={isTimetableLoading}
        onOpenAddTour={() => setIsAddTourModalOpen(true)}
        onExportJson={downloadUserMetaJson}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Tour List & Filters Panel */}
        <div
          className={`w-full md:w-[420px] lg:w-[460px] flex flex-col bg-white border-r border-slate-200 z-20 shrink-0 transition-transform md:translate-x-0 ${
            mobileView === 'list' ? 'block' : 'hidden md:flex'
          }`}
        >
          {/* Filter Header Banner */}
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs border-b border-slate-800">
            <div className="flex items-center space-x-2 truncate">
              <Train className="w-4 h-4 text-alpine-400 shrink-0" />
              <span className="font-bold truncate">Öffi-Touren ab {originStation.name}</span>
            </div>
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="text-[11px] font-bold text-alpine-300 hover:text-white flex items-center space-x-1 shrink-0 ml-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isFilterDrawerOpen ? 'Liste anzeigen' : 'Filter'}</span>
            </button>
          </div>

          {/* Conditional View: Filter Sidebar or Tour List */}
          {isFilterDrawerOpen ? (
            <div className="flex-1 overflow-hidden">
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                totalToursCount={allTours.length}
                filteredToursCount={filteredTours.length}
                availableRanges={availableRanges}
                originStation={originStation}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
              {/* Tour List Header */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-semibold">
                <span>{filteredTours.length} Touren gefunden</span>
                <span className="text-[11px] text-slate-400">
                  {filters.ratingFilter === 'unrated' ? 'Nur unbewertete' : ''}
                </span>
              </div>

              {/* Tour Cards */}
              {filteredTours.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                    <Mountain className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Keine passenden Touren gefunden</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Passe deine Filterkriterien an oder importiere eine neue Tour über den Button oben!
                  </p>
                  <button
                    onClick={() => setFilters({
                      searchQuery: '',
                      onlyDTicket: false,
                      onlyPiste: false,
                      maxTransitDurationMinutes: 240,
                      maxAvalancheLevel: 4,
                      minElevationGain: 0,
                      maxElevationGain: 2000,
                      selectedDifficulties: [],
                      selectedRanges: [],
                      tourType: 'all',
                      ratingFilter: 'all',
                      sortBy: 'transitTime'
                    })}
                    className="px-4 py-2 bg-alpine-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-alpine-700 transition-colors"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              ) : (
                filteredTours.map(tour => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    isSelected={selectedTour?.id === tour.id}
                    onSelect={handleSelectTour}
                    avalancheRegions={avalancheRegions}
                    onRatingChange={handleRatingChange}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Area: Interactive MapLibre GL Alpine Map (2D) */}
        <div
          className={`flex-1 h-full relative ${
            mobileView === 'map' ? 'block' : 'hidden md:block'
          }`}
        >
          <AlpineMap
            tours={filteredTours}
            selectedTour={selectedTour}
            onSelectTour={handleSelectTour}
            avalancheRegions={avalancheRegions}
            originStation={originStation}
          />
        </div>

        {/* Selected Tour Detail Drawer */}
        {selectedTour && (
          <TourDetailModal
            tour={selectedTour}
            onClose={() => setSelectedTour(null)}
            avalancheRegions={avalancheRegions}
            originStation={originStation}
            departureDateTime={departureDateTime}
            onUpdateTourMeta={handleUpdateTourMeta}
          />
        )}

        {/* Add Tour Modal */}
        <AddTourModal
          isOpen={isAddTourModalOpen}
          onClose={() => setIsAddTourModalOpen(false)}
          originStation={originStation}
          onTourAdded={handleTourAdded}
        />
      </div>
    </div>
  );
};
