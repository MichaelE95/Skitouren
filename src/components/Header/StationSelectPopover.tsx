import React, { useState, useEffect, useRef } from 'react';
import { OriginStation } from '../../types';
import { ALL_PRESET_ORIGIN_STATIONS, POPULAR_ORIGIN_STATIONS } from '../../data/trainLines';
import { searchStations } from '../../services/transitService';
import { MapPin, Search, ChevronDown, Check, Loader2, Sparkles } from 'lucide-react';

interface StationSelectPopoverProps {
  currentStation: OriginStation;
  onSelectStation: (station: OriginStation) => void;
}

export const StationSelectPopover: React.FC<StationSelectPopoverProps> = ({
  currentStation,
  onSelectStation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<OriginStation[]>(ALL_PRESET_ORIGIN_STATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(ALL_PRESET_ORIGIN_STATIONS);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const matches = await searchStations(searchQuery);
        setResults(matches);
      } catch (err) {
        console.error('Station search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (station: OriginStation) => {
    onSelectStation(station);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-750 text-white font-bold text-xs py-1 px-2.5 rounded-xl border border-slate-700 hover:border-slate-500 transition-all cursor-pointer shadow-xs"
        title="Startbahnhof auswählen oder suchen"
      >
        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-[200px] text-left">
          {currentStation.name}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-900/90">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Bahnhof suchen (z. B. Augsburg, Kempten, Scharnitz)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 text-white text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-700 focus:border-alpine-500 focus:outline-none"
              />
              {isLoading && (
                <Loader2 className="w-3.5 h-3.5 text-alpine-400 animate-spin absolute right-2.5 top-2.5" />
              )}
            </div>
          </div>

          {/* Quick presets (when not searching) */}
          {!searchQuery && (
            <div className="px-3 pt-2 pb-1 border-b border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Beliebte Startbahnhöfe
              </span>
              <div className="flex flex-wrap gap-1 mb-1">
                {POPULAR_ORIGIN_STATIONS.slice(0, 4).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleSelect(st)}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                      currentStation.id === st.id
                        ? 'bg-alpine-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {st.name.replace('Augsburg ', 'Aux ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Station Results List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50 p-1">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Kein passender Bahnhof gefunden.
              </div>
            ) : (
              results.map((st) => {
                const isSelected = currentStation.id === st.id || currentStation.name === st.name;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelect(st)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-alpine-600/20 text-alpine-300 font-bold'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
                        <span>{st.name}</span>
                        {st.note && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({st.note})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {st.coordinates[1].toFixed(2)}°N, {st.coordinates[0].toFixed(2)}°E
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-alpine-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
