import React from 'react';
import { SkiTour, AvalancheRegion, SACCategory } from '../../types';
import { getTourAvalancheRisk } from '../../services/avalancheService';
import { EAWS_COLORS } from '../../data/avalancheData';
import { Clock, Train, Star, AlertTriangle, ArrowRight, ShieldCheck, Footprints, AlertCircle } from 'lucide-react';

interface TourCardProps {
  tour: SkiTour;
  isSelected: boolean;
  onSelect: (tour: SkiTour) => void;
  avalancheRegions: AvalancheRegion[];
  onRatingChange?: (tourId: string, rating: number | null) => void;
}

export const TourCard: React.FC<TourCardProps> = ({
  tour,
  isSelected,
  onSelect,
  avalancheRegions,
  onRatingChange
}) => {
  const currentRisk = getTourAvalancheRisk(tour, avalancheRegions);
  const eaws = EAWS_COLORS[currentRisk.dangerLevel] || EAWS_COLORS[2];

  const hours = Math.floor(tour.transit.approxTotalMinutes / 60);
  const minutes = tour.transit.approxTotalMinutes % 60;
  const transitTimeStr = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;

  const diffBadgeColor = {
    'L': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'WS': 'bg-blue-50 text-blue-700 border-blue-200',
    'ZS': 'bg-amber-50 text-amber-700 border-amber-200',
    'S': 'bg-rose-50 text-rose-700 border-rose-200'
  }[tour.difficultyCategory] || 'bg-slate-50 text-slate-700 border-slate-200';

  const handleStarClick = (e: React.MouseEvent, star: number) => {
    e.stopPropagation();
    if (onRatingChange) {
      const next = tour.rating === star ? null : star;
      onRatingChange(tour.id, next);
    }
  };

  return (
    <div
      onClick={() => onSelect(tour)}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border text-left ${
        isSelected
          ? 'bg-alpine-50/70 border-alpine-500 shadow-md ring-2 ring-alpine-500/30'
          : 'bg-white border-slate-200/90 hover:border-alpine-300 hover:shadow-md'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-0.5">
            <span>{tour.mountainRange}</span>
            <span>•</span>
            <span>{tour.valley}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-alpine-700 transition-colors flex items-center space-x-1.5">
            <span>{tour.name}</span>
            {tour.type === 'multiday' && (
              <span className="text-[10px] uppercase font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                Mehrtag
              </span>
            )}
            {tour.isCustomTour && (
              <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                Neu
              </span>
            )}
          </h3>
        </div>

        {/* SAC Difficulty Badge */}
        <div className="flex flex-col items-end shrink-0">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-lg border shadow-2xs ${diffBadgeColor}`}>
            SAC {tour.difficulty}
          </span>
          {tour.isPiste && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 border border-emerald-200 flex items-center space-x-0.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Pistentour</span>
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
        {tour.subheading}
      </p>

      {/* Stats Badges Grid */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-50/80 p-2 rounded-xl mb-3 text-center border border-slate-100">
        <div>
          <div className="text-[10px] text-slate-500 font-medium">Gipfel</div>
          <div className="text-xs font-bold text-slate-800">{tour.peakElevation} m</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium">Aufstieg</div>
          <div className="text-xs font-bold text-emerald-700">+{tour.elevationGain} hm</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium">Distanz</div>
          <div className="text-xs font-bold text-slate-800">{tour.distanceKm} km</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium">Dauer</div>
          <div className="text-xs font-bold text-slate-800">{tour.estimatedTourDurationHours} h</div>
        </div>
      </div>

      {/* Transit & Walking Connection */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-slate-700 font-medium truncate">
            <Train className="w-3.5 h-3.5 text-alpine-600 shrink-0" />
            <span className="truncate font-semibold">
              {tour.transit.liveJourney
                ? tour.transit.liveJourney.legs
                    .filter(l => l.mode !== 'walk')
                    .map(l => l.lineName)
                    .join(' → ') || tour.transit.lines.join(' → ')
                : tour.transit.lines.join(' → ')}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-slate-900 font-bold shrink-0">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>
              {tour.transit.liveJourney
                ? `${Math.floor((tour.transit.liveJourney.durationMinutes + tour.transit.walkingDurationMinutes) / 60)}h ${(tour.transit.liveJourney.durationMinutes + tour.transit.walkingDurationMinutes) % 60}m`
                : transitTimeStr}
            </span>
          </div>
        </div>

        {/* Live departure time badge */}
        {tour.transit.liveJourney && (
          <div className="flex items-center justify-between text-[11px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
            <span className="font-semibold">Abfahrt: <strong>{tour.transit.liveJourney.departureTime}</strong></span>
            <span>Ankunft: <strong>{tour.transit.liveJourney.arrivalTime}</strong></span>
            <span className="text-[10px] text-sky-600 font-medium">
              {tour.transit.liveJourney.transfers === 0 ? 'Direktzug' : `${tour.transit.liveJourney.transfers}x Umstieg`}
            </span>
          </div>
        )}

        {/* Footprints walking connection */}
        {tour.transit.walkingDurationMinutes > 0 && (
          <div className="flex items-center space-x-1 text-[11px] text-slate-500">
            <Footprints className="w-3 h-3 text-slate-400" />
            <span>ca. {tour.transit.walkingDurationMinutes} min Fußweg ab {tour.transit.cleanDbStationName}</span>
          </div>
        )}

        {/* D-Ticket Validity & Avalanche Risk Pill */}
        <div className="flex items-center justify-between text-[11px] pt-1">
          {/* D-Ticket Badge */}
          {tour.transit.dTicketValidity === '100% gültig' ? (
            <span className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-100/70 font-semibold px-2 py-0.5 rounded-full border border-emerald-300/60">
              <span>✓ 100% D-Ticket</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-amber-800 bg-amber-100/70 font-semibold px-2 py-0.5 rounded-full border border-amber-300/60" title={`Aufpreis ca. ${tour.transit.extraCostEuro.toFixed(2)} €`}>
              <span>+ ca. {tour.transit.extraCostEuro.toFixed(2)} €</span>
            </span>
          )}

          {/* Avalanche Indicator (Handles Off-Season gracefully!) */}
          {!currentRisk.isSeasonActive ? (
            <span className="inline-flex items-center space-x-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300 text-[10px]">
              <span>❄️ Saisonpause</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center space-x-1 font-bold px-2 py-0.5 rounded-full border text-[11px]"
              style={{
                backgroundColor: eaws.bg,
                color: eaws.text,
                borderColor: eaws.border
              }}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Stufe {currentRisk.dangerLevel} ({currentRisk.dangerLevelLabel})</span>
            </span>
          )}
        </div>

        {/* Unverified Skitourenguru warning if applicable */}
        {!tour.links.isVerifiedUrl && (
          <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center space-x-1 mt-1">
            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">Skitourenguru-Link unbestätigt (Suche aktiv)</span>
          </div>
        )}
      </div>

      {/* Card Footer: Interactive Rating & Open CTA */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
        {/* Clickable 1-5 Star Rating */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={(e) => handleStarClick(e, star)}
              className="p-0.5 hover:scale-125 transition-transform"
              title={tour.rating === star ? 'Bewertung löschen' : `${star} Sterne`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  tour.rating && tour.rating >= star
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
          <span className="text-[11px] text-slate-500 ml-1">
            {tour.rating ? `${tour.rating}/5` : 'Noch nicht gemacht'}
          </span>
        </div>

        <div className="text-alpine-600 font-semibold flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform text-xs">
          <span>Details & GPX</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
