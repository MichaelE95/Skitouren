import React, { useEffect, useRef, useState } from 'react';
import { Place } from '../../types';
import { geocode, DEFAULT_ORIGIN } from '../../services/transitService';
import { loadFavourites, saveFavourites } from '../../services/transitSnapshot';
import { MapPin, Search, ChevronDown, Check, Loader2, Star, X } from 'lucide-react';

interface OriginPickerProps {
  current: Place;
  onSelect: (place: Place) => void;
}

const samePlace = (a: Place, b: Place) =>
  a.coordinates[0] === b.coordinates[0] && a.coordinates[1] === b.coordinates[1];

/** Q5: free search (stops, addresses, places) via the Transitous geocoder + favourites. */
export const OriginPicker: React.FC<OriginPickerProps> = ({ current, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(Place & { detail: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<Place[]>(() => {
    const favs = loadFavourites();
    return favs.length ? favs : [DEFAULT_ORIGIN];
  });
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        setResults(await geocode(query.trim()));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const persistFavourites = (list: Place[]) => {
    setFavourites(list);
    saveFavourites(list);
  };

  const choose = (place: Place) => {
    const clean: Place = { name: place.name, coordinates: place.coordinates };
    if (!favourites.some(f => samePlace(f, clean))) persistFavourites([clean, ...favourites].slice(0, 12));
    onSelect(clean);
    setIsOpen(false);
    setQuery('');
  };

  const removeFavourite = (e: React.MouseEvent, place: Place) => {
    e.stopPropagation();
    persistFavourites(favourites.filter(f => !samePlace(f, place)));
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 bg-slate-800/90 text-white font-bold text-xs py-1 px-2.5 rounded-xl border border-slate-700 hover:border-slate-500 transition-all cursor-pointer"
        title="Choose the origin (any stop or address)"
      >
        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span className="truncate max-w-[110px] sm:max-w-[220px] text-left">{current.name}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="fixed left-3 right-3 top-14 sm:absolute sm:left-0 sm:right-auto sm:top-auto sm:mt-2 sm:w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2.5 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search a stop or address…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-slate-800/90 text-white text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-700 focus:border-alpine-500 focus:outline-none"
              />
              {isLoading && <Loader2 className="w-3.5 h-3.5 text-alpine-400 animate-spin absolute right-2.5 top-2.5" />}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1">
            {query.trim().length >= 3 ? (
              <>
                {error && <div className="p-3 text-xs text-rose-300">{error}</div>}
                {!error && !isLoading && results.length === 0 && (
                  <div className="p-3 text-center text-xs text-slate-400">No results.</div>
                )}
                {results.map((r, i) => (
                  <button
                    key={`${r.coordinates.join(',')}-${i}`}
                    onClick={() => choose(r)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/80 text-xs"
                  >
                    <div className="font-semibold text-slate-100 truncate">{r.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{r.detail}</div>
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="px-3 pt-1.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Favourites
                </div>
                {favourites.map(f => {
                  const selected = samePlace(f, current);
                  return (
                    <div
                      key={f.coordinates.join(',')}
                      onClick={() => choose(f)}
                      className={`group w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs cursor-pointer ${
                        selected ? 'bg-alpine-600/20 text-alpine-300' : 'hover:bg-slate-800/80 text-slate-200'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5 truncate">
                        <Star className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate font-semibold">{f.name}</span>
                      </span>
                      <span className="flex items-center space-x-1 shrink-0">
                        {selected && <Check className="w-3.5 h-3.5 text-alpine-400" />}
                        <button
                          onClick={e => removeFavourite(e, f)}
                          className="sm:opacity-0 sm:group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400"
                          title="Remove favourite"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                  );
                })}
                <div className="px-3 py-2 text-[10px] text-slate-500">Type at least 3 characters to search.</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

