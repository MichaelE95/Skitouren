import React from 'react';
import { SkiTour, AvalancheRegion, SACCategory } from '../../types';
import { getTourAvalancheRisk } from '../../services/avalancheService';
import { EAWS_COLORS } from '../../data/avalancheData';
import { Clock, Train, TrendingUp, Mountain, Star, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface TourCardProps {
  tour: SkiTour;
  isSelected: boolean;
  onSelect: (tour: SkiTour) => void;
  avalancheRegions: AvalancheRegion[];
}

export const TourCard: React.FC<TourCardProps> = ({
  tour,
  isSelected,
  onSelect,
  avalancheRegions
}) => {
  const currentRisk = getTourAvalancheRisk(tour, avalancheRegions);
  const eaws = EAWS_COLORS[currentRisk.dangerLevel] || EAWS_COLORS[2];

  // Helper for formatting minutes into "Xh Ym"
  const hours = Math.floor(tour.transit.approxTotalMinutes / 60);
  const minutes = tour.transit.approxTotalMinutes % 60;
  const transitTimeStr = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;

  // Difficulty badge colors
  const diffBadgeColor = {
    'L': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'WS': 'bg-blue-50 text-blue-700 border-blue-200',
    'ZS': 'bg-amber-50 text-amber-700 border-amber-200',
    'S': 'bg-rose-50 text-rose-700 border-rose-200'
  }[tour.difficultyCategory] || 'bg-slate-50 text-slate-700 border-slate-200';

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
                Mehrtagestour
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
      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2 rounded-xl mb-3 text-center border border-slate-100">
        <div>
          <div className="text-[10px] text-slate-500 font-medium">Gipfel</div>
          <div className="text-xs font-bold text-slate-800">{tour.peakElevation} m</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium">Aufstieg</div>
          <div className="text-xs font-bold text-slate-800">+{tour.elevationGain} hm</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium">Tourdauer</div>
          <div className="text-xs font-bold text-slate-800">ca. {tour.estimatedTourDurationHours} h</div>
        </div>
      </div>

      {/* Transit & Avalanche Info */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        {/* Transit from Haunstetter Str. */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-slate-700 font-medium truncate">
            <Train className="w-3.5 h-3.5 text-alpine-600 shrink-0" />
            <span className="truncate">{tour.transit.lines.join(' → ')}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-900 font-bold shrink-0">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{transitTimeStr}</span>
          </div>
        </div>

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

          {/* Avalanche Indicator */}
          <span
            className="inline-flex items-center space-x-1 font-bold px-2 py-0.5 rounded-full border text-[11px]"
            style={{
              backgroundColor: eaws.bg,
              color: eaws.text,
              borderColor: eaws.border
            }}
            title={`Aktuelle Lawinenstufe: ${currentRisk.name}`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Stufe {currentRisk.dangerLevel} ({currentRisk.dangerLevelLabel})</span>
          </span>
        </div>
      </div>

      {/* Card Footer: Rating & Open CTA */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1 text-amber-500 font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span className="text-slate-800">{tour.rating.toFixed(1)}</span>
        </div>
        <div className="text-alpine-600 font-semibold flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform text-xs">
          <span>Details & GPX</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

