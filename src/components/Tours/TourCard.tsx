import React from 'react';
import { SkiTour, AvalancheRegion, TourTransitResult, sacCategory } from '../../types';
import { getTourAvalancheRisk } from '../../services/avalancheService';
import { LONG_FINAL_WALK_MINUTES } from '../../services/transitService';
import { EAWS_COLORS } from '../../data/avalancheData';
import { formatClock, formatDuration } from '../../utils/format';
import { Clock, Train, Star, AlertTriangle, ArrowRight, ShieldCheck, Footprints, Loader2, CircleSlash } from 'lucide-react';

interface TourCardProps {
  tour: SkiTour;
  result?: TourTransitResult; // from the snapshot
  isCalculating: boolean;
  onSelect: (tour: SkiTour) => void;
  avalancheRegions: AvalancheRegion[];
  onRatingChange: (tour: SkiTour, rating: number | null) => void;
  onRetry: (tour: SkiTour) => void;
}

export const DIFF_BADGE: Record<string, string> = {
  L: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WS: 'bg-blue-50 text-blue-700 border-blue-200',
  ZS: 'bg-amber-50 text-amber-700 border-amber-200',
  S: 'bg-rose-50 text-rose-700 border-rose-200'
};

export const TourCard: React.FC<TourCardProps> = ({
  tour,
  result,
  isCalculating,
  onSelect,
  avalancheRegions,
  onRatingChange,
  onRetry
}) => {
  const risk = getTourAvalancheRisk(tour, avalancheRegions);

  const handleStarClick = (e: React.MouseEvent, star: number) => {
    e.stopPropagation();
    onRatingChange(tour, tour.rating === star ? null : star);
  };

  return (
    <div
      onClick={() => onSelect(tour)}
      className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border text-left bg-white border-slate-200/90 hover:border-alpine-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <div className="text-xs text-slate-500 font-medium mb-0.5 truncate">
            {tour.mountainRange ?? <span className="text-amber-600">Gebirgsgruppe unbekannt</span>}
          </div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-alpine-700 transition-colors truncate">
            {tour.peakName}
          </h3>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-lg border ${DIFF_BADGE[sacCategory(tour.difficulty)]}`}>
            SAC {tour.difficulty}
          </span>
          {tour.isPiste && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 rounded mt-1 border border-emerald-200 flex items-center space-x-0.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Pistentour</span>
            </span>
          )}
        </div>
      </div>

      {/* GPX metrics */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-50/80 p-2 rounded-xl mb-3 text-center border border-slate-100">
        <Metric label="Start" value={`${tour.startElevation} m`} />
        <Metric label="Gipfel" value={`${tour.peakElevation} m`} />
        <Metric label="Aufstieg" value={`+${tour.elevationGain} hm`} accent />
        <Metric label="Distanz" value={`${tour.distanceKm} km`} />
      </div>

      {/* Transit (Transitous snapshot only) */}
      <div className="pt-1 border-t border-slate-100 text-xs">
        <TransitSummary result={result} isCalculating={isCalculating} onRetry={() => onRetry(tour)} />
      </div>

      {/* Avalanche (only shown when a bulletin region contains the summit) */}
      {risk && (
        <div className="flex justify-end text-[11px] pt-2">
          {!risk.isSeasonActive ? (
            <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300 text-[10px]">
              ❄️ Lawinenbericht: Saisonpause
            </span>
          ) : (
            <span
              className="inline-flex items-center space-x-1 font-bold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: EAWS_COLORS[risk.dangerLevel].bg,
                color: EAWS_COLORS[risk.dangerLevel].text,
                borderColor: EAWS_COLORS[risk.dangerLevel].border
              }}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Stufe {risk.dangerLevel} ({risk.dangerLevelLabel})</span>
            </span>
          )}
        </div>
      )}

      {/* Footer: rating */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={e => handleStarClick(e, star)}
              className="p-0.5 hover:scale-125 transition-transform"
              title={tour.rating === star ? 'Bewertung löschen' : `${star} Sterne`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  tour.rating && tour.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
          <span className="text-[11px] text-slate-500 ml-1">
            {tour.rating ? `${tour.rating}/5` : 'Noch nicht gemacht'}
          </span>
        </div>
        <div className="text-alpine-600 font-semibold flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div>
    <div className="text-[10px] text-slate-500 font-medium">{label}</div>
    <div className={`text-xs font-bold ${accent ? 'text-emerald-700' : 'text-slate-800'}`}>{value}</div>
  </div>
);

export const TransitSummary: React.FC<{
  result?: TourTransitResult;
  isCalculating: boolean;
  onRetry: () => void;
}> = ({ result, isCalculating, onRetry }) => {
  if (isCalculating) {
    return (
      <div className="flex items-center space-x-1.5 text-alpine-600 py-1">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Verbindung wird abgefragt…</span>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="flex items-center space-x-1.5 text-slate-400 py-1">
        <Clock className="w-3.5 h-3.5" />
        <span>Noch nicht berechnet. „Fahrplan laden“ drücken.</span>
      </div>
    );
  }
  if (!result.ok) {
    return (
      <div className="flex items-start justify-between gap-2 text-rose-700 py-1">
        <span className="flex items-start space-x-1.5">
          <CircleSlash className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{result.error}</span>
        </span>
        <button
          onClick={e => { e.stopPropagation(); onRetry(); }}
          className="shrink-0 px-2 py-0.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 font-semibold"
        >
          Erneut
        </button>
      </div>
    );
  }

  const j = result.best;
  const lines = j.legs.filter(l => l.mode !== 'walk').map(l => l.lineName);
  const longWalk = j.finalWalkMinutes > LONG_FINAL_WALK_MINUTES;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center space-x-1.5 text-slate-700 font-semibold truncate">
          <Train className="w-3.5 h-3.5 text-alpine-600 shrink-0" />
          <span className="truncate">{lines.length ? lines.join(' → ') : 'Nur Fußweg'}</span>
        </span>
        <span className="flex items-center space-x-1 text-slate-900 font-bold shrink-0">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{formatDuration(j.durationMinutes)}</span>
        </span>
      </div>
      <div className="flex items-center justify-between text-[11px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
        <span>Ab <strong>{formatClock(j.departure)}</strong></span>
        <span>Einstieg an <strong>{formatClock(j.arrival)}</strong></span>
        <span className="text-sky-600">{j.transfers === 0 ? 'ohne Umstieg' : `${j.transfers}× Umstieg`}</span>
      </div>
      {j.lastStopName && (
        <div className={`flex items-center space-x-1 text-[11px] ${longWalk ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
          {longWalk ? <AlertTriangle className="w-3 h-3" /> : <Footprints className="w-3 h-3 text-slate-400" />}
          <span className="truncate">
            Ausstieg {j.lastStopName} + {j.finalWalkMinutes} min Fußweg ({j.finalWalkMeters} m)
          </span>
        </div>
      )}
    </div>
  );
};
