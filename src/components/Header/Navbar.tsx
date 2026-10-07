import React from 'react';
import { Mountain, Train, MapPin, SlidersHorizontal, List, Map as MapIcon, Compass } from 'lucide-react';

interface NavbarProps {
  toursCount: number;
  mobileView: 'map' | 'list';
  setMobileView: (view: 'map' | 'list') => void;
  toggleFilterDrawer: () => void;
  isFilterDrawerOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  toursCount,
  mobileView,
  setMobileView,
  toggleFilterDrawer,
  isFilterDrawerOpen
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between text-white shrink-0 z-30 select-none">
      {/* Brand & Origin Badge */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-alpine-600 to-sky-400 flex items-center justify-center shadow-md">
          <Mountain className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-black text-base sm:text-lg tracking-tight leading-none text-white">
              Skitour-Planer
            </h1>
            <span className="hidden md:inline-block bg-alpine-600/30 text-alpine-300 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full border border-alpine-500/40">
              D-Ticket Öffi-Touren
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="font-semibold text-slate-200">Start: Augsburg Haunstetter Straße</span>
          </div>
        </div>
      </div>

      {/* Center Origin Info (Desktop) */}
      <div className="hidden lg:flex items-center space-x-4 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/80 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Train className="w-4 h-4 text-alpine-400" />
          <span>Direktanbindung: Allgäu, Außerfernbahn, Werdenfels & Füssen</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
          <span>✓ Deutschland-Ticket Fokus</span>
        </div>
      </div>

      {/* Right Controls & Mobile Switcher */}
      <div className="flex items-center space-x-2">
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

        {/* Filter Drawer Toggle Button */}
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

