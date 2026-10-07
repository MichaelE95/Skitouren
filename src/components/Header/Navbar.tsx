import React from 'react';
import { OriginStation } from '../../types';
import { StationSelectPopover } from './StationSelectPopover';
import { Mountain, Calendar, RefreshCw, SlidersHorizontal, List, Map as MapIcon, Plus, Download, Train } from 'lucide-react';

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
  onlyRegional: boolean;
  onChangeOnlyRegional: (val: boolean) => void;
  onRefreshTimetables: () => void;
  isTimetableLoading: boolean;
  isStaleTimetable: boolean;
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
  onlyRegional,
  onChangeOnlyRegional,
  onRefreshTimetables,
  isTimetableLoading,
  isStaleTimetable,
  onOpenAddTour,
  onExportJson
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between text-white shrink-0 z-30 select-none">
      {/* Brand & Origin & Timing Controls */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Logo / App Name */}
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-alpine-600 to-sky-400 flex items-center justify-center shadow-md shrink-0">
            <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="hidden xl:block">
            <div className="flex items-center space-x-1.5">
              <h1 className="font-black text-base tracking-tight leading-none text-white">
                Skitour-Planer
              </h1>
              <span className="bg-alpine-600/30 text-alpine-300 font-bold text-[10px] uppercase px-1.5 py-0.5 rounded-md border border-alpine-500/40">
                D-Ticket
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Alpen per Bahn & Bus
            </div>
          </div>
        </div>

        {/* Origin Station Selector */}
        <div className="flex items-center space-x-1">
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
        </div>

        {/* Regional / D-Ticket only toggle (No ICE/Flixbus) */}
        <button
          onClick={() => onChangeOnlyRegional(!onlyRegional)}
          className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            onlyRegional
              ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Schließt Fernverkehr (ICE, IC, Flixbus) aus und zeigt nur Deutschland-Ticket-fähigen Nahverkehr an"
        >
          <Train className={`w-3.5 h-3.5 ${onlyRegional ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>{onlyRegional ? 'Nur D-Ticket (Nahverkehr)' : 'Alle Züge (inkl. ICE)'}</span>
        </button>

        {/* Refresh / Load Timetable Button */}
        {isStaleTimetable ? (
          <button
            onClick={onRefreshTimetables}
            disabled={isTimetableLoading}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md animate-pulse cursor-pointer shrink-0"
            title="Klicken, um den Fahrplan für die geänderten Einstellungen abzufragen"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTimetableLoading ? 'animate-spin' : ''}`} />
            <span>Fahrplan laden</span>
          </button>
        ) : (
          <button
            onClick={onRefreshTimetables}
            disabled={isTimetableLoading}
            className="hidden md:flex items-center space-x-1 p-1.5 px-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
            title="Fahrplan aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTimetableLoading ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
            <span className="text-[11px] text-slate-400 hidden xl:inline">Aktualisieren</span>
          </button>
        )}
      </div>

      {/* Right Controls: Add Tour, Export, Filter, View Toggles */}
      <div className="flex items-center space-x-2">
        {/* Mobile-only compact refresh indicator */}
        <button
          onClick={onRefreshTimetables}
          disabled={isTimetableLoading}
          className={`md:hidden p-2 rounded-xl border transition-colors ${
            isStaleTimetable
              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-bold'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
          title="Fahrplan abfragen"
        >
          <RefreshCw className={`w-4 h-4 ${isTimetableLoading ? 'animate-spin text-sky-400' : ''}`} />
        </button>

        {/* Add Tour Button */}
        <button
          onClick={onOpenAddTour}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-alpine-600 hover:bg-alpine-500 text-white shadow-xs transition-colors cursor-pointer"
          title="Neue Tour importieren (GPX + Skitourenguru Link)"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tour hinzufügen</span>
        </button>

        {/* Export Metadata Button */}
        <button
          onClick={onExportJson}
          className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
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
