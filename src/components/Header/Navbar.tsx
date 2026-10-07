import React from 'react';
import { OriginStation } from '../../types';
import { POPULAR_ORIGIN_STATIONS } from '../../data/trainLines';
import { Mountain, Train, MapPin, SlidersHorizontal, List, Map as MapIcon, Plus, Download, ChevronDown } from 'lucide-react';

interface NavbarProps {
  toursCount: number;
  mobileView: 'map' | 'list';
  setMobileView: (view: 'map' | 'list') => void;
  toggleFilterDrawer: () => void;
  isFilterDrawerOpen: boolean;
  originStation: OriginStation;
  onChangeOrigin: (origin: OriginStation) => void;
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
  onOpenAddTour,
  onExportJson
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between text-white shrink-0 z-30 select-none">
      {/* Brand & Origin Selector */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-alpine-600 to-sky-400 flex items-center justify-center shadow-md shrink-0">
          <Mountain className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-black text-sm sm:text-lg tracking-tight leading-none text-white">
              Skitour-Planer
            </h1>
            <span className="hidden md:inline-block bg-alpine-600/30 text-alpine-300 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full border border-alpine-500/40">
              D-Ticket
            </span>
          </div>

          {/* Interactive Origin Station Dropdown */}
          <div className="flex items-center space-x-1 text-xs mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-slate-400 hidden sm:inline">Start:</span>
            <div className="relative inline-block">
              <select
                value={originStation.id}
                onChange={(e) => {
                  const found = POPULAR_ORIGIN_STATIONS.find(s => s.id === e.target.value);
                  if (found) onChangeOrigin(found);
                }}
                className="bg-slate-800/90 text-white font-bold text-xs py-0.5 pl-1.5 pr-5 rounded-md border border-slate-700 hover:border-slate-500 cursor-pointer focus:outline-none appearance-none"
              >
                {POPULAR_ORIGIN_STATIONS.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Add Tour, Export, Filter, View Toggles */}
      <div className="flex items-center space-x-2">
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
