import React, { useState, useMemo, useEffect } from 'react';
import { SKI_TOURS } from './data/tours';
import { FALLBACK_AVALANCHE_REGIONS } from './data/avalancheData';
import { fetchAvalancheRegions, getTourAvalancheRisk } from './services/avalancheService';
import { SkiTour, FilterState, AvalancheRegion } from './types';
import { Navbar } from './components/Header/Navbar';
import { AlpineMap } from './components/Map/AlpineMap';
import { FilterSidebar } from './components/Filters/FilterSidebar';
import { TourCard } from './components/Tours/TourCard';
import { TourDetailModal } from './components/Tours/TourDetailModal';
import { SlidersHorizontal, Mountain, Train, MapPin, X } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedTour, setSelectedTour] = useState<SkiTour | null>(null);
  const [avalancheRegions, setAvalancheRegions] = useState<AvalancheRegion[]>(FALLBACK_AVALANCHE_REGIONS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  // Load live avalanche bulletins on mount
  useEffect(() => {
    fetchAvalancheRegions().then(regions => {
      setAvalancheRegions(regions);
    });
  }, []);

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
    sortBy: 'transitTime'
  });

  // Unique mountain ranges for filter chips
  const availableRanges = useMemo(() => {
    return Array.from(new Set(SKI_TOURS.map(t => t.mountainRange))).sort();
  }, []);

  // Filter and Sort Tours
  const filteredTours = useMemo(() => {
    return SKI_TOURS.filter(tour => {
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

      // 100% Deutschland-Ticket
      if (filters.onlyDTicket && tour.transit.dTicketValidity !== '100% gültig') {
        return false;
      }

      // Pistenskitour only
      if (filters.onlyPiste && !tour.isPiste) {
        return false;
      }

      // Transit duration
      if (tour.transit.approxTotalMinutes > filters.maxTransitDurationMinutes) {
        return false;
      }

      // Avalanche risk level
      const risk = getTourAvalancheRisk(tour, avalancheRegions);
      if (risk.dangerLevel > filters.maxAvalancheLevel) {
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
        case 'transitTime':
          return a.transit.approxTotalMinutes - b.transit.approxTotalMinutes;
        case 'elevationGain':
          return b.elevationGain - a.elevationGain;
        case 'rating':
          return b.rating - a.rating;
        case 'difficulty':
          const order = { 'L': 1, 'WS': 2, 'ZS': 3, 'S': 4 };
          return (order[a.difficultyCategory] || 0) - (order[b.difficultyCategory] || 0);
        default:
          return 0;
      }
    });
  }, [filters, avalancheRegions]);

  const handleSelectTour = (tour: SkiTour) => {
    setSelectedTour(tour);
    if (window.innerWidth < 768) {
      setMobileView('map');
    }
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
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Column: Tour List & Filters Panel */}
        <div
          className={`w-full md:w-[420px] lg:w-[460px] flex flex-col bg-white border-r border-slate-200 z-20 shrink-0 transition-transform md:translate-x-0 ${
            mobileView === 'list' ? 'block' : 'hidden md:flex'
          }`}
        >
          {/* Filter Header Banner */}
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Train className="w-4 h-4 text-alpine-400" />
              <span className="font-bold">Öffi-Touren ab Augsburg Haunstetter Str.</span>
            </div>
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="text-[11px] font-bold text-alpine-300 hover:text-white flex items-center space-x-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isFilterDrawerOpen ? 'Liste anzeigen' : 'Filter anpassen'}</span>
            </button>
          </div>

          {/* Conditional View: Filter Sidebar or Tour List */}
          {isFilterDrawerOpen ? (
            <div className="flex-1 overflow-hidden">
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                totalToursCount={SKI_TOURS.length}
                filteredToursCount={filteredTours.length}
                availableRanges={availableRanges}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
              {/* Tour List Header */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-semibold">
                <span>{filteredTours.length} Touren gefunden</span>
                <span className="text-[11px] text-slate-400">Sortiert nach {filters.sortBy === 'transitTime' ? 'Fahrzeit' : filters.sortBy}</span>
              </div>

              {/* Tour Cards */}
              {filteredTours.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                    <Mountain className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Keine passenden Touren gefunden</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Versuche, die Filterkriterien zu lockern (z.B. Fahrzeit erhöhen oder Lawinenstufe erweitern).
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
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Area: Interactive MapLibre GL Alpine Map */}
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
          />
        </div>

        {/* Selected Tour Detail Drawer (slides in from right) */}
        {selectedTour && (
          <TourDetailModal
            tour={selectedTour}
            onClose={() => setSelectedTour(null)}
            avalancheRegions={avalancheRegions}
          />
        )}
      </div>
    </div>
  );
};

