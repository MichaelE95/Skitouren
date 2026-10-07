import React from 'react';
import { FilterState, SACCategory, OriginStation } from '../../types';
import {
  Search,
  Train,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Star,
  CheckCircle,
  HelpCircle,
  MapPin
} from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalToursCount: number;
  filteredToursCount: number;
  availableRanges: string[];
  originStation: OriginStation;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  totalToursCount,
  filteredToursCount,
  availableRanges,
  originStation
}) => {
  const update = (partial: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...partial });
  };

  const handleDifficultyToggle = (cat: SACCategory) => {
    const exists = filters.selectedDifficulties.includes(cat);
    const next = exists
      ? filters.selectedDifficulties.filter(c => c !== cat)
      : [...filters.selectedDifficulties, cat];
    update({ selectedDifficulties: next });
  };

  const handleRangeToggle = (range: string) => {
    const exists = filters.selectedRanges.includes(range);
    const next = exists
      ? filters.selectedRanges.filter(r => r !== range)
      : [...filters.selectedRanges, range];
    update({ selectedRanges: next });
  };

  const handleReset = () => {
    onFilterChange({
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
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.onlyDTicket ||
    filters.onlyPiste ||
    filters.maxTransitDurationMinutes < 240 ||
    filters.maxElevationGain < 2000 ||
    filters.selectedDifficulties.length > 0 ||
    filters.selectedRanges.length > 0 ||
    filters.tourType !== 'all' ||
    filters.ratingFilter !== 'all';

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full text-slate-800">
      {/* Search & Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-alpine-600" />
            <h3 className="font-bold text-slate-900 text-sm">Filter & Suche</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Zurücksetzen</span>
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
            placeholder="Gipfel, Tal, Linie (z.B. Baad, RE17)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-alpine-500/30 focus:border-alpine-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Quick Result Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
          <span>Gefundene Touren:</span>
          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
            {filteredToursCount} von {totalToursCount}
          </span>
        </div>
      </div>

      {/* Filter Options List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Rating Filter: All, Unrated (Noch nicht gemacht), Rated Only, Min 4 Stars */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Erfahrungs-Status & Bewertung
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'all', label: 'Alle Touren', icon: null },
              { id: 'unrated', label: 'Noch nicht gemacht', icon: HelpCircle },
              { id: 'rated_only', label: 'Bereits gemacht', icon: CheckCircle },
              { id: 'min_4_stars', label: 'Top-Touren (★ 4.0+)', icon: Star }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => update({ ratingFilter: item.id as any })}
                className={`py-2 px-2 rounded-xl text-left border font-semibold text-[11px] transition-all flex items-center space-x-1.5 ${
                  filters.ratingFilter === item.id
                    ? 'bg-alpine-600 text-white border-alpine-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Toggles (D-Ticket & Piste) */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Schnellfilter
          </label>

          {/* Deutschland-Ticket 100% Switch */}
          <div
            onClick={() => update({ onlyDTicket: !filters.onlyDTicket })}
            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
              filters.onlyDTicket
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Train className={`w-4 h-4 ${filters.onlyDTicket ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <div className="font-bold text-xs">100% Deutschland-Ticket</div>
                <div className="text-[10px] text-slate-500">Ohne Bus- oder Auslandsaufpreise</div>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              filters.onlyDTicket ? 'border-emerald-600 bg-emerald-600 text-white text-[10px]' : 'border-slate-300'
            }`}>
              {filters.onlyDTicket && '✓'}
            </div>
          </div>

          {/* Pistenskitour Switch */}
          <div
            onClick={() => update({ onlyPiste: !filters.onlyPiste })}
            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
              filters.onlyPiste
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className={`w-4 h-4 ${filters.onlyPiste ? 'text-amber-600' : 'text-slate-400'}`} />
              <div>
                <div className="font-bold text-xs">Nur Pistenskitouren</div>
                <div className="text-[10px] text-slate-500">Ideal bei Lawinenstufe 3/4 & Nebel</div>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              filters.onlyPiste ? 'border-amber-600 bg-amber-600 text-white text-[10px]' : 'border-slate-300'
            }`}>
              {filters.onlyPiste && '✓'}
            </div>
          </div>
        </div>

        {/* Max Transit Time Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Max. Fahrzeit (ab {originStation.name})
            </label>
            <span className="font-bold text-alpine-700 bg-alpine-50 px-2 py-0.5 rounded border border-alpine-200">
              ≤ {Math.floor(filters.maxTransitDurationMinutes / 60)}h {filters.maxTransitDurationMinutes % 60 > 0 ? `${filters.maxTransitDurationMinutes % 60}m` : ''}
            </span>
          </div>
          <input
            type="range"
            min="90"
            max="180"
            step="10"
            value={filters.maxTransitDurationMinutes}
            onChange={(e) => update({ maxTransitDurationMinutes: Number(e.target.value) })}
            className="w-full accent-alpine-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>1h 30m</span>
            <span>2h 00m</span>
            <span>2h 30m</span>
            <span>3h 00m</span>
          </div>
        </div>

        {/* SAC Difficulty Filter (L, WS, ZS, S) */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            SAC-Schwierigkeit (Offizielle Skala)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'L', label: 'L', name: 'Leicht' },
              { id: 'WS', label: 'WS', name: 'Wenig schw.' },
              { id: 'ZS', label: 'ZS', name: 'Ziemlich schw.' },
              { id: 'S', label: 'S', name: 'Schwierig' }
            ].map(diff => {
              const active = filters.selectedDifficulties.includes(diff.id as SACCategory);
              return (
                <button
                  key={diff.id}
                  onClick={() => handleDifficultyToggle(diff.id as SACCategory)}
                  className={`py-1.5 px-1 rounded-xl text-center border font-bold text-xs transition-all ${
                    active
                      ? 'bg-alpine-600 text-white border-alpine-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={diff.name}
                >
                  <div>{diff.label}</div>
                  <div className={`text-[9px] font-normal truncate ${active ? 'text-alpine-100' : 'text-slate-400'}`}>
                    {diff.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Elevation Gain Range Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Aufstieg (Höhenmeter)
            </label>
            <span className="font-bold text-slate-800">
              ≤ {filters.maxElevationGain} hm
            </span>
          </div>
          <input
            type="range"
            min="600"
            max="1800"
            step="100"
            value={filters.maxElevationGain}
            onChange={(e) => update({ maxElevationGain: Number(e.target.value) })}
            className="w-full accent-alpine-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>600 hm</span>
            <span>1000 hm</span>
            <span>1400 hm</span>
            <span>1800 hm+</span>
          </div>
        </div>

        {/* Tour Type Toggle (Day vs Multi-Day DAV Huts) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Tour-Art & DAV-Hütten
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl">
            {[
              { id: 'all', label: 'Alle' },
              { id: 'day', label: 'Tagestour' },
              { id: 'multiday', label: 'Mehrtag' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => update({ tourType: t.id as any })}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filters.tourType === t.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mountain Ranges Multi-select */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Gebirgsgruppe
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableRanges.map(range => {
              const active = filters.selectedRanges.includes(range);
              return (
                <button
                  key={range}
                  onClick={() => handleRangeToggle(range)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Selector */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Sortieren nach
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => update({ sortBy: e.target.value as any })}
            className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-alpine-500/30"
          >
            <option value="transitTime">⏱️ Kürzeste Anreise ab {originStation.name}</option>
            <option value="elevationGain">🏔️ Höhenmeter (Aufstieg)</option>
            <option value="rating">★ Bewertung</option>
            <option value="difficulty">🧗 SAC-Schwierigkeit</option>
          </select>
        </div>
      </div>
    </div>
  );
};
