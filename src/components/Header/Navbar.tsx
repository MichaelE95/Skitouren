import React from 'react';
import { Place } from '../../types';
import { OriginPicker } from './OriginPicker';
import { Mountain, Calendar, RefreshCw, SlidersHorizontal, Plus, Download, Train } from 'lucide-react';

interface NavbarProps {
  toggleFilterDrawer: () => void;
  isFilterDrawerOpen: boolean;
  origin: Place;
  onChangeOrigin: (origin: Place) => void;
  departureLocal: string;
  onChangeDepartureLocal: (val: string) => void;
  onlyRegional: boolean;
  onChangeOnlyRegional: (val: boolean) => void;
  onLoadTimetable: () => void;
  progress: { done: number; total: number } | null; // null = not loading
  isStale: boolean;
  onOpenAddTour: () => void;
  onExport?: () => void; // hosted: download files; dev: push to GitHub
  exportPending?: boolean; // local edits not yet in the repo / on GitHub (colour only)
  exportBusy?: boolean;
  exportLabel?: string;
  exportTitle?: string;
}

/**
 * Laptop: everything in one bar.
 * Phone (< md): logo, start picker, "Fahrplan laden" and Export only. Departure time and the
 * Nahverkehr toggle live in the filter panel; Filter / + are in the bottom tab bar (see App).
 */
export const Navbar: React.FC<NavbarProps> = ({
  toggleFilterDrawer,
  isFilterDrawerOpen,
  origin,
  onChangeOrigin,
  departureLocal,
  onChangeDepartureLocal,
  onlyRegional,
  onChangeOnlyRegional,
  onLoadTimetable,
  progress,
  isStale,
  onOpenAddTour,
  onExport,
  exportPending,
  exportBusy,
  exportLabel,
  exportTitle
}) => {
  const isLoading = progress !== null;

  return (
    <header className="h-14 md:h-16 bg-slate-900 border-b border-slate-800 px-2 sm:px-6 flex items-center justify-between gap-2 text-white shrink-0 z-30 select-none">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-alpine-600 to-sky-400 flex items-center justify-center shadow-md shrink-0">
            <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="hidden xl:block">
            <h1 className="font-black text-base tracking-tight leading-none text-white">Skitour-Planer</h1>
            <div className="text-[10px] text-slate-400 mt-0.5">Alpen per Bahn &amp; Bus</div>
          </div>
        </div>

        <div className="flex items-center space-x-1 min-w-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Start:</span>
          <OriginPicker current={origin} onSelect={onChangeOrigin} />
        </div>

        <div className="hidden md:block">
          <DepartureInput value={departureLocal} onChange={onChangeDepartureLocal} />
        </div>

        <div className="hidden md:block">
          <RegionalToggle value={onlyRegional} onChange={onChangeOnlyRegional} />
        </div>

        <button
          onClick={onLoadTimetable}
          disabled={isLoading}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:cursor-wait ${
            isStale && !isLoading
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
          title="Query Transitous for all tours with the current origin, time and filter"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isLoading ? `Lädt ${progress!.done}/${progress!.total}` : 'Fahrplan laden'}
          </span>
          {isLoading && <span className="sm:hidden">{progress!.done}/{progress!.total}</span>}
        </button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenAddTour}
          className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-alpine-600 hover:bg-alpine-500 text-white shadow-xs transition-colors cursor-pointer"
          title="Add a tour from a GPX file"
        >
          <Plus className="w-4 h-4" />
          <span>Tour hinzufügen</span>
        </button>

        {onExport && (
          <button
            onClick={onExport}
            disabled={exportBusy}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer disabled:cursor-wait transition-colors ${
              exportPending
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title={exportTitle ?? 'Download tours.json and new GPX files to commit them to the repo'}
          >
            {exportBusy
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Download className={`w-3.5 h-3.5 ${exportPending ? 'text-slate-900' : 'text-slate-400'}`} />}
            <span className="hidden lg:inline">{exportLabel ?? 'Export'}</span>
          </button>
        )}

        <button
          onClick={toggleFilterDrawer}
          className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isFilterDrawerOpen
              ? 'bg-alpine-600 border-alpine-500 text-white shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>
    </header>
  );
};

/** Departure date/time input (top bar on laptops, filter panel on phones). */
export const DepartureInput: React.FC<{ value: string; onChange: (v: string) => void; light?: boolean }> = ({
  value,
  onChange,
  light
}) => (
  <div
    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs ${
      light ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800/80 border-slate-700/80'
    }`}
  >
    <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
    <span className={`text-[11px] font-semibold ${light ? 'text-slate-500' : 'text-slate-400'}`}>Abfahrt:</span>
    <input
      type="datetime-local"
      value={value}
      onChange={e => e.target.value && onChange(e.target.value)}
      className={`bg-transparent font-semibold text-xs focus:outline-none cursor-pointer ${
        light ? 'text-slate-900' : 'text-white [color-scheme:dark]'
      }`}
    />
  </div>
);

/** "Nur Nahverkehr" toggle (top bar on laptops, filter panel on phones). */
export const RegionalToggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; light?: boolean }> = ({
  value,
  onChange,
  light
}) => (
  <button
    onClick={() => onChange(!value)}
    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
      value
        ? light
          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
          : 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300'
        : light
          ? 'bg-white border-slate-300 text-slate-600'
          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
    }`}
    title="Regional only: RB/RE, S-Bahn, buses, trams. Excludes ICE/IC/EC and long-distance coaches (Flixbus)."
  >
    <Train className="w-3.5 h-3.5" />
    <span>{value ? 'Nur Nahverkehr' : 'Alle Verkehrsmittel'}</span>
  </button>
);
