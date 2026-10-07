import React from 'react';
import { OriginStation } from '../../types';
import { StationSelectPopover } from './StationSelectPopover';
import { Mountain, Calendar, Clock, RefreshCw, SlidersHorizontal, List, Map as MapIcon, Plus, Download } from 'lucide-react';

interface NavbarProps {
  toursCount: number;
  mobileView: 'map' | 'list';
  setMobileView: (view: 'map' | 'list') => void;
  toggleFilterDrawer: () => void;
  isFilterDrawerOpen: boolean;
  originStation: OriginStation;
  onChangeOrigin: (origin: OriginStation) => void;
  departureDateTime: string;
  onChangeDepartureDateTime: (val: string) => void;
  onRefreshTimetables: () => void;
  isTimetableLoading: boolean;
  onOpenAddTour: () => void;
  onExportJson: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  toursCount,
  mobileView,
  setMobileView,
  toggleFilterDrawer,
  isFilterDrawerOpen,
  originStation,
  onChangeOrigin,
  departureDateTime,
  onChangeDepartureDateTime,
  onRefreshTimetables,
  isTimetableLoading,
  onOpenAddTour,
  onExportJson
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between text-white shrink-0 z-30 select-none">
      {/* Brand & Origin & Timing Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Logo / App Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-alpine-600 to-sky-400 flex items-center justify-center shadow-md shrink-0">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-base tracking-tight leading-none text-white">
                Skitour-Planer
              </h1>
              <span className="bg-alpine-600/30 text-alpine-300 font-bold text-[10px] uppercase px-1.5 py-0.5 rounded-md border border-alpine-500/40">
                D-Ticket
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Alpen-Touren per Bahn
            </div>
          </div>
        </div>

        {/* Origin Station Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Start:
          </span>
          <StationSelectPopover
            currentStation={originStation}
            onSelectStation={onChangeOrigin}
          />
        </div>

        {/* Departure Date & Time Picker */}
        <div className="hidden md:flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/80 text-xs">
          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-400">Abfahrt:</span>
          <input
            type="datetime-local"
            value={departureDateTime}
            onChange={(e) => onChangeDepartureDateTime(e.target.value)}
            className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
            title="Gewünschtes Abfahrtsdatum und Uhrzeit"
          />
          <button
            onClick={onRefreshTimetables}
            disabled={isTimetableLoading}
            title="Fahrplan für diese Zeit neu laden"
            className="p-1 hover:text-white text-slate-400 transition-colors ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTimetableLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Right Controls: Add Tour, Export, Filter, View Toggles */}
      <div className="flex items-center space-x-2">
        {/* Mobile-only compact refresh / date indicator */}
        <button
          onClick={onRefreshTimetables}
          disabled={isTimetableLoading}
          className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
          title="Fahrplan aktualisieren"
        >
          <RefreshCw className={`w-4 h-4 ${isTimetableLoading ? 'animate-spin text-sky-400' : ''}`} />
        </button>

        {/* Add Tour Button */}
        <button
          onClick={onOpenAddTour}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-alpine-600 hover:bg-alpine-500 text-white shadow-xs transition-colors"
          title="Neue Tour importieren (GPX + Skitourenguru Link)"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tour hinzufügen</span>
        </button>

        {/* Export Metadata Button */}
        <button
          onClick={onExportJson}
          className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="Bewertungen & Notizen als JSON exportieren (zum Commit in git)"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Exportieren</span>
        </button>

        {/* Mobile View Toggle (Map vs List) */}
        <div className="md:hidden flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          <button
            onClick={() => setMobileView('map')}
            className={`p-1.5 rounded-md text-xs font-semibold flex items-center space-x-1 ${
              mobileView === 'map' ? 'bg-alpine-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileView('list')}
            className={`p-1.5 rounded-md text-xs font-semibold flex items-center space-x-1 ${
              mobileView === 'list' ? 'bg-alpine-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={toggleFilterDrawer}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
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
