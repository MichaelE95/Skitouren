import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  SkiTour, AvalancheRegion, FilterState, Place, TransitParams, TransitSnapshot, TourTransitResult,
  DEFAULT_FILTERS, sacCategory
} from './types';
import { fetchAvalancheRegions } from './services/avalancheService';
import { FALLBACK_AVALANCHE_REGIONS } from './data/avalancheData';
import { planAllTours, planTourJourney, DEFAULT_ORIGIN } from './services/transitService';
import {
  loadSnapshot, saveSnapshot, withTourResult, withoutTour, isStale as snapshotIsStale, defaultDepartureLocal
} from './services/transitSnapshot';
import { loadTours, saveTour, deleteTour, exportOverlay, canWriteToRepo, hasOverlayChanges } from './services/tourStore';
import { formatDateTime } from './utils/format';

import { Navbar } from './components/Header/Navbar';
import { AlpineMap } from './components/Map/AlpineMap';
import { FilterSidebar } from './components/Filters/FilterSidebar';
import { TourCard } from './components/Tours/TourCard';
import { TourDetailPanel } from './components/Tours/TourDetailPanel';
import { AddTourModal } from './components/Tours/AddTourModal';
import { Mountain, Loader2, SlidersHorizontal, List, AlertTriangle, Plus } from 'lucide-react';

export const App: React.FC = () => {
  // --- Tours (public/tours/tours.json) ---
  const [tours, setTours] = useState<SkiTour[]>([]);
  const [toursLoaded, setToursLoaded] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  // --- Transit snapshot (localStorage) and current inputs ---
  const [snapshot, setSnapshot] = useState<TransitSnapshot | null>(() => loadSnapshot());
  const [origin, setOrigin] = useState<Place>(() => loadSnapshot()?.params.origin ?? DEFAULT_ORIGIN);
  const [departureLocal, setDepartureLocal] = useState<string>(
    () => loadSnapshot()?.params.departureLocal ?? defaultDepartureLocal()
  );
  const [onlyRegional, setOnlyRegional] = useState<boolean>(() => loadSnapshot()?.params.onlyRegional ?? true);
  const [calculating, setCalculating] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const runIdRef = useRef(0);

  // --- UI ---
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [leftPanelView, setLeftPanelView] = useState<'list' | 'filters'>('list');
  const [isAddTourModalOpen, setIsAddTourModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [avalancheRegions, setAvalancheRegions] = useState<AvalancheRegion[]>(FALLBACK_AVALANCHE_REGIONS);

  useEffect(() => {
    loadTours()
      .then(setTours)
      .catch(err => setStoreError(String(err)))
      .finally(() => setToursLoaded(true));
    fetchAvalancheRegions().then(setAvalancheRegions);
  }, []);

  const currentParams: TransitParams = useMemo(
    () => ({ origin, departureLocal, onlyRegional }),
    [origin, departureLocal, onlyRegional]
  );
  const stale = snapshot !== null && snapshotIsStale(snapshot, currentParams);

  // Persist every snapshot change
  useEffect(() => {
    if (snapshot) saveSnapshot(snapshot);
  }, [snapshot]);

  const markCalculating = (ids: string[], on: boolean) =>
    setCalculating(prev => {
      const next = new Set(prev);
      ids.forEach(id => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  /** "Fahrplan laden": the only place where all connections are (re)queried. */
  const handleLoadTimetable = useCallback(async () => {
    if (tours.length === 0) return;
    const runId = ++runIdRef.current;
    const params = currentParams;
    setSnapshot({ params, calculatedAt: new Date().toISOString(), results: {} });
    setProgress({ done: 0, total: tours.length });
    markCalculating(tours.map(t => t.id), true);

    let done = 0;
    await planAllTours(tours, params, (tourId, result) => {
      if (runIdRef.current !== runId) return; // a newer run started
      done++;
      setSnapshot(prev => (prev ? withTourResult(prev, tourId, result) : prev));
      markCalculating([tourId], false);
      setProgress({ done, total: tours.length });
    });
    if (runIdRef.current === runId) {
      setProgress(null);
      setCalculating(new Set());
    }
  }, [tours, currentParams]);

  /** Single tour (new tour, changed GPX, or retry): uses the snapshot's parameters so all results stay comparable. */
  const calculateOne = useCallback(
    async (tour: SkiTour) => {
      const params = snapshot?.params ?? currentParams;
      if (!snapshot) setSnapshot({ params, calculatedAt: new Date().toISOString(), results: {} });
      markCalculating([tour.id], true);
      const result: TourTransitResult = await planTourJourney(tour, params);
      setSnapshot(prev => withTourResult(prev ?? { params, calculatedAt: new Date().toISOString(), results: {} }, tour.id, result));
      markCalculating([tour.id], false);
    },
    [snapshot, currentParams]
  );

  // --- Tour mutations (dev: written to public/tours via the Vite plugin) ---
  const handleAddTour = async (tour: SkiTour, gpxText: string) => {
    await saveTour(tour, gpxText);
    setTours(prev => [...prev.filter(t => t.id !== tour.id), tour]);
    setSelectedTourId(tour.id);
    calculateOne(tour);
  };

  const handleSaveTour = async (tour: SkiTour) => {
    await saveTour(tour);
    setTours(prev => prev.map(t => (t.id === tour.id ? tour : t)));
  };

  const handleRatingChange = (tour: SkiTour, rating: number | null) => {
    handleSaveTour({ ...tour, rating }).catch(err => setStoreError(String(err)));
  };

  const handleDeleteTour = async (tour: SkiTour) => {
    await deleteTour(tour);
    setTours(prev => prev.filter(t => t.id !== tour.id));
    setSnapshot(prev => (prev ? withoutTour(prev, tour.id) : prev));
    setSelectedTourId(null);
  };

  // --- Filtering: travel time comes ONLY from the snapshot's Transitous result ---
  const durationOf = (tour: SkiTour): number | null => {
    const r = snapshot?.results[tour.id];
    return r && r.ok ? r.best.durationMinutes : null;
  };

  const availableRanges = useMemo(
    () => Array.from(new Set(tours.map(t => t.mountainRange).filter((r): r is string => !!r))).sort(),
    [tours]
  );

  const filteredTours = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    return tours
      .filter(tour => {
        if (q) {
          const r = snapshot?.results[tour.id];
          const hay = [tour.peakName, tour.mountainRange ?? '', r && r.ok ? r.best.lastStopName ?? '' : '']
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (filters.ratingFilter === 'unrated' && tour.rating !== null) return false;
        if (filters.ratingFilter === 'rated_only' && tour.rating === null) return false;
        if (filters.ratingFilter === 'min_4_stars' && (tour.rating === null || tour.rating < 4)) return false;
        if (filters.onlyPiste && !tour.isPiste) return false;
        const dur = durationOf(tour);
        if (dur !== null && dur > filters.maxTransitDurationMinutes) return false; // unknown -> stays visible
        if (tour.elevationGain > filters.maxElevationGain) return false;
        if (filters.selectedDifficulties.length && !filters.selectedDifficulties.includes(sacCategory(tour.difficulty))) return false;
        if (filters.selectedRanges.length && (!tour.mountainRange || !filters.selectedRanges.includes(tour.mountainRange))) return false;
        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'transitTime':
            return (durationOf(a) ?? Infinity) - (durationOf(b) ?? Infinity);
          case 'elevationGain':
            return b.elevationGain - a.elevationGain;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'difficulty': {
            const order = { L: 1, WS: 2, ZS: 3, S: 4 };
            return order[sacCategory(a.difficulty)] - order[sacCategory(b.difficulty)];
          }
          default:
            return 0;
        }
      });
  }, [tours, filters, snapshot]);

  // Hosted site only: edits that live in this browser and are not in the repo yet
  const exportPending = useMemo(() => !canWriteToRepo && hasOverlayChanges(), [tours]);

  const selectedTour = tours.find(t => t.id === selectedTourId) ?? null;
  const selectedResult = selectedTour ? snapshot?.results[selectedTour.id] : undefined;
  const selectedJourney = selectedResult && selectedResult.ok ? selectedResult.best : undefined;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      <Navbar
        mobileView={mobileView}
        setMobileView={setMobileView}
        isFilterDrawerOpen={leftPanelView === 'filters' && !selectedTour}
        toggleFilterDrawer={() => {
          setSelectedTourId(null);
          setLeftPanelView(prev => (prev === 'filters' ? 'list' : 'filters'));
        }}
        onOpenAddTour={() => setIsAddTourModalOpen(true)}
        origin={origin}
        onChangeOrigin={setOrigin}
        departureLocal={departureLocal}
        onChangeDepartureLocal={setDepartureLocal}
        onlyRegional={onlyRegional}
        onChangeOnlyRegional={setOnlyRegional}
        onLoadTimetable={handleLoadTimetable}
        progress={progress}
        isStale={stale || (snapshot === null && tours.length > 0)}
        onExport={canWriteToRepo ? undefined : () => exportOverlay()}
        exportPending={exportPending}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Single left panel: tour details OR filters OR tour list */}
        <div
          className={`w-full md:w-96 lg:w-[420px] h-full shrink-0 flex flex-col bg-white border-r border-slate-200/80 z-20 shadow-md ${
            mobileView === 'list' ? 'block' : 'hidden md:flex'
          }`}
        >
          {selectedTour ? (
            <TourDetailPanel
              tour={selectedTour}
              result={selectedResult}
              isCalculating={calculating.has(selectedTour.id)}
              origin={snapshot?.params.origin ?? origin}
              calculatedAt={snapshot?.calculatedAt}
              isStale={stale}
              avalancheRegions={avalancheRegions}
              onClose={() => setSelectedTourId(null)}
              onSave={handleSaveTour}
              onDelete={handleDeleteTour}
              onRetry={calculateOne}
            />
          ) : leftPanelView === 'filters' ? (
            <div className="flex flex-col h-full">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-alpine-600" />
                  <span>Suchkriterien &amp; Filter</span>
                </span>
                <button
                  onClick={() => setLeftPanelView('list')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300"
                >
                  Zu den Touren ({filteredTours.length})
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={setFilters}
                  availableRanges={availableRanges}
                  totalToursCount={tours.length}
                  filteredToursCount={filteredTours.length}
                  origin={snapshot?.params.origin ?? origin}
                  onCloseMobile={() => setLeftPanelView('list')}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex bg-slate-200/80 p-0.5 rounded-xl space-x-0.5 text-xs font-bold">
                  <button className="px-3 py-1 bg-white text-slate-900 rounded-lg shadow-2xs flex items-center space-x-1.5">
                    <List className="w-3.5 h-3.5 text-alpine-600" />
                    <span>Touren ({filteredTours.length})</span>
                  </button>
                  <button
                    onClick={() => setLeftPanelView('filters')}
                    className="px-3 py-1 text-slate-600 hover:text-slate-900 rounded-lg flex items-center space-x-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filter</span>
                  </button>
                </div>
                {snapshot && (
                  <div className="text-[10px] text-slate-400 text-right leading-tight">
                    Fahrplan vom<br />{formatDateTime(snapshot.calculatedAt)}
                  </div>
                )}
              </div>

              {stale && !progress && (
                <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center space-x-1.5 text-xs text-amber-800 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Times below are for {snapshot!.params.origin.name}, {snapshot!.params.departureLocal.replace('T', ' ')}
                    {snapshot!.params.onlyRegional ? ', Nahverkehr' : ''}. Press „Fahrplan laden“ to update.
                  </span>
                </div>
              )}
              {progress && (
                <div className="bg-sky-50 border-b border-sky-100 px-3 py-1.5 flex items-center space-x-1.5 text-xs text-sky-800 shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  <span>Verbindungen werden abgefragt… {progress.done}/{progress.total}</span>
                </div>
              )}
              {storeError && (
                <div className="bg-rose-50 border-b border-rose-200 px-3 py-1.5 text-xs text-rose-700 shrink-0">{storeError}</div>
              )}

              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                {!toursLoaded ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                ) : tours.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                      <Mountain className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Noch keine Touren</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Add your first tour from a GPX file. Everything else is derived from it.
                    </p>
                    <button
                      onClick={() => setIsAddTourModalOpen(true)}
                      className="px-4 py-2 bg-alpine-600 text-white rounded-xl text-xs font-bold hover:bg-alpine-700 inline-flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tour hinzufügen</span>
                    </button>
                  </div>
                ) : filteredTours.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm">Keine passenden Touren gefunden</h4>
                    <button
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="px-4 py-2 bg-alpine-600 text-white rounded-xl text-xs font-bold hover:bg-alpine-700"
                    >
                      Filter zurücksetzen
                    </button>
                  </div>
                ) : (
                  filteredTours.map(tour => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      result={snapshot?.results[tour.id]}
                      isCalculating={calculating.has(tour.id)}
                      onSelect={t => setSelectedTourId(t.id)}
                      avalancheRegions={avalancheRegions}
                      onRatingChange={handleRatingChange}
                      onRetry={calculateOne}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map takes all remaining width */}
        <div className={`flex-1 h-full relative ${mobileView === 'map' ? 'block' : 'hidden md:block'}`}>
          <AlpineMap
            tours={filteredTours}
            selectedTour={selectedTour}
            selectedJourney={selectedJourney}
            onSelectTour={t => setSelectedTourId(t.id)}
            avalancheRegions={avalancheRegions}
            origin={origin}
          />
        </div>

        <AddTourModal
          isOpen={isAddTourModalOpen}
          existingIds={tours.map(t => t.id)}
          onClose={() => setIsAddTourModalOpen(false)}
          onSave={handleAddTour}
        />
      </div>
    </div>
  );
};
