import React from 'react';
import { Place } from '../../types';
import { OriginPicker } from './OriginPicker';
import { Mountain, Calendar, RefreshCw, SlidersHorizontal, List, Map as MapIcon, Plus, Download, Train } from 'lucide-react';

interface NavbarProps {
  mobileView: 'map' | 'list';
  setMobileView: (view: 'map' | 'list') => void;
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
  onExport?: () => void; // hosted site only
}

export const Navbar: React.FC<NavbarProps> = ({
  mobileView,
  setMobileView,
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
  onExport
}) => {
  const isLoading = progress !== null;

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between text-white shrink-0 z-30 select-none">
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-alpine-600 to-sky-400 flex items-center justify-center shadow-md shrink-0">
            <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="hidden xl:block">
            <h1 className="font-black text-base tracking-tight leading-none text-white">Skitour-Planer</h1>
            <div className="text-[10px] text-slate-400 mt-0.5">Alpen per Bahn &amp; Bus</div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Start:</span>
          <OriginPicker current={origin} onSelect={onChangeOrigin} />
        </div>

        <div className="hidden md:flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/80 text-xs">
          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-400">Abfahrt:</span>
          <input
            type="datetime-local"
            value={departureLocal}
            onChange={e => e.target.value && onChangeDepartureLocal(e.target.value)}
            className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
          />
        </div>

        <button
          onClick={() => onChangeOnlyRegional(!onlyRegional)}
          className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            onlyRegional
              ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Regional only: RB/RE, S-Bahn, buses, trams. Excludes ICE/IC/EC and long-distance coaches (Flixbus)."
        >
          <Train className="w-3.5 h-3.5" />
          <span>{onlyRegional ? 'Nur Nahverkehr' : 'Alle Verkehrsmittel'}</span>
        </button>

        <button
          onClick={onLoadTimetable}
          disabled={isLoading}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:cursor-wait ${
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
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenAddTour}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-alpine-600 hover:bg-alpine-500 text-white shadow-xs transition-colors cursor-pointer"
          title="Add a tour from a GPX file"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tour hinzufügen</span>
        </button>

        {onExport && (
          <button
            onClick={onExport}
            className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            title="Download tours.json and new GPX files to commit them to the repo"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>
        )}

        <div className="md:hidden flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          <button
            onClick={() => setMobileView('map')}
            className={`p-1.5 rounded-md ${mobileView === 'map' ? 'bg-alpine-600 text-white' : 'text-slate-400'}`}
          >
            <MapIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileView('list')}
            className={`p-1.5 rounded-md ${mobileView === 'list' ? 'bg-alpine-600 text-white' : 'text-slate-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={toggleFilterDrawer}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isFilterDrawerOpen
              ? 'bg-alpine-600 border-alpine-500 text-white shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>
    </header>
  );
};
