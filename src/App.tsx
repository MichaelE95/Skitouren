import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SkiTour, AvalancheRegion, MasterStation, FilterState, LiveJourneyResult } from './types';
import { SKI_TOURS } from './data/tours';
import { DEFAULT_ORIGIN_STATION } from './data/trainLines';
import { fetchAvalancheRegions, getTourAvalancheRisk } from './services/avalancheService';
import { FALLBACK_AVALANCHE_REGIONS } from './data/avalancheData';
import { fetchBatchTourTimetables } from './services/transitService';
import { loadUserMeta, saveUserTourMeta, loadCustomTours, loadDeletedTourIds, deleteTour, downloadUserMetaJson } from './data/userMeta';

import { Navbar } from './components/Header/Navbar';
import { AlpineMap } from './components/Map/AlpineMap';
import { FilterSidebar } from './components/Filters/FilterSidebar';
import { TourCard } from './components/Tours/TourCard';
import { TourDetailModal } from './components/Tours/TourDetailModal';
import { AddTourModal } from './components/Tours/AddTourModal';
import { Mountain, Loader2 } from 'lucide-react';

const ORIGIN_STORAGE_KEY = 'skitour_active_origin_v2';

/**
 * Helper to compute next Saturday at 06:30 for early morning departures.
 */
function getDefaultDepartureDateTime(): string {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 6 is Saturday
  let daysUntilSaturday = (6 - day + 7) % 7;
  if (daysUntilSaturday === 0 && now.getHours() >= 10) {
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

  // Regional transit filter (D-Ticket: no ICE/IC/Flixbus)
  const [onlyRegional, setOnlyRegional] = useState<boolean>(true);

  // Active Origin Station (Default: Augsburg Haunstetter Straße)
  const [originStation, setOriginStation] = useState<MasterStation>(() => {
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

  // Deleted tours set
  const [deletedTourIds, setDeletedTourIds] = useState<string[]>(() => loadDeletedTourIds());

  // Live journey timetables mapped by tourId
  const [liveJourneysMap, setLiveJourneysMap] = useState<Record<string, LiveJourneyResult>>({});
  const [isTimetableLoading, setIsTimetableLoading] = useState(false);
  const [isStaleTimetable, setIsStaleTimetable] = useState(false);

  // Load live avalanche bulletins on mount
  useEffect(() => {
    fetchAvalancheRegions().then(regions => {
      setAvalancheRegions(regions);
    });
  }, []);

  const handleChangeOrigin = (newOrigin: MasterStation) => {
    setOriginStation(newOrigin);
    setIsStaleTimetable(true);
    try {
      localStorage.setItem(ORIGIN_STORAGE_KEY, JSON.stringify(newOrigin));
    } catch {}
  };

  const handleChangeDepartureDateTime = (newTime: string) => {
    setDepartureDateTime(newTime);
    setIsStaleTimetable(true);
  };

  const handleChangeOnlyRegional = (regional: boolean) => {
    setOnlyRegional(regional);
    setIsStaleTimetable(true);
  };

  // Base combined tours without deleted tours
  const baseTours = useMemo(() => {
    const combined = [...SKI_TOURS, ...customTours].filter(t => !deletedTourIds.includes(t.id));

    return combined.map(tour => {
      const meta = userMetaMap[tour.id];
      const rating = meta && meta.rating !== undefined ? meta.rating : tour.rating;
      const comment = meta && meta.comment !== undefined ? meta.comment : tour.curatedComment;
      const guruUrl = meta && meta.skitourenguruUrl !== undefined ? meta.skitourenguruUrl : tour.links.skitourenguruUrl;

      return {
        ...tour,
        rating,
        curatedComment: comment,
        links: {
          ...tour.links,
          skitourenguruUrl: guruUrl
        },
        transit: {
          ...tour.transit,
          origin: originStation.name
        }
      };
    });
  }, [userMetaMap, customTours, deletedTourIds, originStation.name]);

  // Batch fetch live timetables from Transitous (triggered on mount and on explicit refresh)
  const handleFetchTimetables = useCallback(async () => {
    setIsTimetableLoading(true);
    try {
      const results = await fetchBatchTourTimetables(baseTours, originStation, departureDateTime, onlyRegional);
      setLiveJourneysMap(results);
      setIsStaleTimetable(false);
    } catch (err) {
      console.error('Error fetching batch timetables:', err);
    } finally {
      setIsTimetableLoading(false);
    }
  }, [baseTours, originStation, departureDateTime, onlyRegional]);

  // Initial fetch once on application start
  useEffect(() => {
    handleFetchTimetables();
  }, []);

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
    maxTransitDurationMinutes: 300,
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
          tour.mountainRange.toLowerCase().includes(q) ||
          (tour.valley && tour.valley.toLowerCase().includes(q)) ||
          tour.transit.destinationStation.toLowerCase().includes(q) ||
          tour.transit.cleanDbStationName.toLowerCase().includes(q);
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

      // Transit duration (only filter once live transit is computed so tours are not hidden on start)
      if (tour.transit.liveJourney) {
        const effectiveTransitDuration =
          tour.transit.liveJourney.durationMinutes + tour.transit.walkingDurationMinutes;
        if (effectiveTransitDuration > filters.maxTransitDurationMinutes) {
          return false;
        }
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
            : 999999;
          const durB = b.transit.liveJourney
            ? b.transit.liveJourney.durationMinutes + b.transit.walkingDurationMinutes
            : 999999;
          return durA - durB;
        }
        case 'elevationGain':
          return b.elevationGain - a.elevationGain;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'difficulty': {
          const order = { 'L': 1, 'WS': 2, 'ZS': 3, 'S': 4 };
          return (order[a.difficultyCategory] || 0) - (order[b.difficultyCategory] || 0);
        }
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
    const updated = saveUserTourMeta(tourId, {
      rating,
      comment,
      skitourenguruUrl
    });
    setUserMetaMap(updated);
  };

  const handleTourAdded = (newTour: SkiTour) => {
    setCustomTours(prev => [...prev, newTour]);
    setSelectedTour(newTour);
  };

  const handleDeleteTour = (tourId: string) => {
    deleteTour(tourId);
    setDeletedTourIds(prev => [...prev, tourId]);
    if (selectedTour?.id === tourId) {
      setSelectedTour(null);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Top Navigation */}
      <Navbar
        toursCount={filteredTours.length}
        mobileView={mobileView}
        setMobileView={setMobileView}
        isFilterDrawerOpen={isFilterDrawerOpen}
        toggleFilterDrawer={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
        onOpenAddTour={() => setIsAddTourModalOpen(true)}
        originStation={originStation}
        onChangeOrigin={handleChangeOrigin}
        departureDateTime={departureDateTime}
        onChangeDepartureDateTime={handleChangeDepartureDateTime}
        onRefreshTimetables={handleFetchTimetables}
        isTimetableLoading={isTimetableLoading}
        onlyRegional={onlyRegional}
        onChangeOnlyRegional={handleChangeOnlyRegional}
        isStaleTimetable={isStaleTimetable}
        onExportJson={downloadUserMetaJson}
      />

      {/* Main Container: Sidebar Filters + Tour List + Map */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Filter Sidebar (Desktop) */}
        <div className="hidden lg:block w-72 h-full shrink-0 border-r border-slate-200/80 bg-white z-20">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            availableRanges={availableRanges}
            totalToursCount={allTours.length}
            filteredToursCount={filteredTours.length}
            originStation={originStation}
          />
        </div>

        {/* Filter Drawer (Mobile & Tablet) */}
        {isFilterDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsFilterDrawerOpen(false)}
            />
            <div className="relative w-80 max-w-full h-full bg-white shadow-2xl z-50 flex flex-col">
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                availableRanges={availableRanges}
                totalToursCount={allTours.length}
                filteredToursCount={filteredTours.length}
                originStation={originStation}
                onCloseMobile={() => setIsFilterDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Left Area: Tour Cards List */}
        <div
          className={`w-full md:w-96 lg:w-[410px] h-full shrink-0 flex flex-col bg-white border-r border-slate-200/80 z-10 ${
            mobileView === 'list' ? 'block' : 'hidden md:flex'
          }`}
        >
          {isTimetableLoading && (
            <div className="bg-sky-50 border-b border-sky-100 px-3 py-1.5 flex items-center justify-between text-xs text-sky-800">
              <span className="flex items-center space-x-1.5 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                <span>Echtzeit-Fahrpläne werden geladen...</span>
              </span>
            </div>
          )}

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
                    maxTransitDurationMinutes: 300,
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
            onlyRegional={onlyRegional}
            onUpdateTourMeta={handleUpdateTourMeta}
            onDeleteTour={handleDeleteTour}
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
