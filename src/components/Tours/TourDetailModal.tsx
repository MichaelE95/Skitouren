import React, { useState, useEffect } from 'react';
import { SkiTour, AvalancheRegion, MasterStation, LiveJourneyResult } from '../../types';
import { getTourAvalancheRisk } from '../../services/avalancheService';
import { fetchLiveTransitPlan, buildWorkingDbUrl } from '../../services/transitService';
import { downloadGpxFile } from '../../utils/gpxParser';
import { EAWS_COLORS } from '../../data/avalancheData';
import {
  X,
  ArrowLeft,
  Download,
  ExternalLink,
  Train,
  AlertTriangle,
  Star,
  RefreshCw,
  Home,
  ShieldCheck,
  Footprints,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface TourDetailModalProps {
  tour: SkiTour | null;
  onClose: () => void;
  avalancheRegions: AvalancheRegion[];
  originStation: MasterStation;
  departureDateTime?: string;
  onlyRegional?: boolean;
  onUpdateTourMeta: (tourId: string, rating: number | null, comment: string, skitourenguruUrl?: string) => void;
  onDeleteTour: (tourId: string) => void;
}

export const TourDetailModal: React.FC<TourDetailModalProps> = ({
  tour,
  onClose,
  avalancheRegions,
  originStation,
  departureDateTime,
  onlyRegional = true,
  onUpdateTourMeta,
  onDeleteTour
}) => {
  const [liveJourney, setLiveJourney] = useState<LiveJourneyResult | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Editable comment & rating state
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (tour) {
      setCurrentRating(tour.rating);
      setCurrentComment(tour.curatedComment || '');
      setCurrentUrl(tour.links.skitourenguruUrl || '');
      setLiveJourney(tour.transit.liveJourney || null);
    }
  }, [tour]);

  if (!tour) return null;

  const currentRisk = getTourAvalancheRisk(tour, avalancheRegions);
  const eaws = EAWS_COLORS[currentRisk.dangerLevel] || EAWS_COLORS[2];

  const effectiveTotalMinutes = liveJourney
    ? liveJourney.durationMinutes + tour.transit.walkingDurationMinutes
    : null;

  const transitTimeStr = effectiveTotalMinutes !== null
    ? `${Math.floor(effectiveTotalMinutes / 60)}h ${effectiveTotalMinutes % 60 > 0 ? `${effectiveTotalMinutes % 60}m` : ''}`
    : 'Wird geladen...';

  const handleSaveNotes = () => {
    onUpdateTourMeta(tour.id, currentRating, currentComment, currentUrl);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleFetchLiveTimetable = async () => {
    setIsLoadingLive(true);
    setLiveError(null);
    try {
      const result = await fetchLiveTransitPlan(
        originStation,
        tour.coordinates.trailhead,
        tour.transit.destinationStation,
        tour.transit.destinationEva,
        tour.transit.cleanDbStationName,
        departureDateTime,
        onlyRegional
      );
      if (!result) {
        setLiveError(`Keine Verbindung ab ${originStation.name} gefunden. Nutze den direkten DB Navigator Link.`);
      } else {
        setLiveJourney(result);
      }
    } catch {
      setLiveError('Verbindung konnte nicht geladen werden.');
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Generate 100% verified DB Navigator search deep link to the tour's exact station
  const workingDbUrl = buildWorkingDbUrl(
    originStation,
    {
      name: tour.transit.destinationStation,
      cleanDbName: tour.transit.cleanDbStationName,
      coordinates: tour.coordinates.trailhead,
      eva: tour.transit.destinationEva
    },
    departureDateTime,
    onlyRegional
  );

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden text-slate-800 border-r border-slate-200">
      {/* Top Header Bar with Back Button */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Schließen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tour Title Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium mb-0.5">
          <span>{tour.mountainRange}</span>
          {tour.valley && (
            <>
              <span>•</span>
              <span>{tour.valley}</span>
            </>
          )}
          {tour.isPiste && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold border border-emerald-200">
              Pistentour
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 leading-tight">{tour.name}</h2>
          <span className="text-xs bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-md border border-slate-300 shrink-0 ml-2">
            SAC {tour.difficulty}
          </span>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800 text-xs">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Gipfel</div>
            <div className="text-xs font-black text-slate-800">{tour.peakElevation} m</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Start</div>
            <div className="text-xs font-black text-slate-800">{tour.startElevation} m</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Aufstieg</div>
            <div className="text-xs font-black text-emerald-700">+{tour.elevationGain} hm</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Tourdauer</div>
            <div className="text-xs font-black text-slate-800">{tour.estimatedTourDurationHours} Std</div>
          </div>
        </div>

        {/* Action Buttons: GPX Download & Optional Skitourenguru */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => downloadGpxFile(tour.name, tour.gpxTrackCoordinates, tour.peakElevation)}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-alpine-600 hover:bg-alpine-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GPX Track</span>
          </button>

          {tour.links.skitourenguruUrl ? (
            <a
              href={tour.links.skitourenguruUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-300 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Skitourenguru ↗</span>
            </a>
          ) : (
            <button
              disabled
              className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-100 text-slate-400 rounded-xl font-medium text-xs border border-slate-200 cursor-not-allowed opacity-60"
              title="Kein Skitourenguru-Link hinterlegt"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Kein Guru-Link</span>
            </button>
          )}
        </div>

        {/* Public Transit Section */}
        <div className="bg-sky-50/50 rounded-2xl p-3.5 border border-sky-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Train className="w-4 h-4 text-sky-700" />
              <h4 className="font-bold text-slate-900 text-xs">Öffentliche Anreise</h4>
            </div>
            <span className="font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded-full text-[11px] border border-sky-200">
              {transitTimeStr} Gesamtzeit
            </span>
          </div>

          {/* Origin -> Destination Station Summary */}
          <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
            <div className="font-semibold text-slate-800 truncate pr-2">
              <span>{originStation.name}</span>
              <span className="mx-1.5 text-slate-400">→</span>
              <span className="text-sky-950 font-bold">{tour.transit.cleanDbStationName}</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
              {tour.transit.dTicketValidity}
            </div>
          </div>

          {/* Walking connection from station to trailhead */}
          {tour.transit.walkingDistanceMeters > 50 ? (
            <div className="flex items-center space-x-2 text-slate-700 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
              <Footprints className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Fußweg ab Haltestelle <strong>{tour.transit.cleanDbStationName}</strong>: <strong>ca. {tour.transit.walkingDurationMinutes} min</strong> ({tour.transit.walkingDistanceMeters} m)
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-emerald-800 text-[11px] bg-emerald-50/70 p-2 rounded-xl border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Startpunkt liegt direkt an der Haltestelle ({tour.transit.cleanDbStationName})</span>
            </div>
          )}

          {/* Live Journey Display */}
          {liveJourney ? (
            <div className="space-y-1.5 pt-0.5">
              <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-sky-950 text-xs">
                    {liveJourney.departureTime} → {liveJourney.arrivalTime} Uhr
                  </div>
                  <div className="text-[10px] text-sky-700 mt-0.5">
                    Fahrt: {Math.floor(liveJourney.durationMinutes / 60)}h {liveJourney.durationMinutes % 60}m | {liveJourney.transfers === 0 ? 'Direkt' : `${liveJourney.transfers}x Umstieg`}
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded shadow-2xs">
                  {liveJourney.legs.filter(l => l.mode !== 'walk').map(l => l.lineName).join(' + ') || 'Regional'}
                </span>
              </div>

              {/* Step-by-step real transit legs */}
              <div className="space-y-1">
                {liveJourney.legs.map((leg, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 text-[11px]">
                    <div className="flex items-center space-x-1.5 truncate pr-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                        leg.mode === 'walk' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-alpine-100 text-alpine-800 border border-alpine-200'
                      }`}>
                        {leg.lineName}
                      </span>
                      <span className="text-slate-800 truncate text-[11px]">
                        {leg.originName} → {leg.destinationName}
                      </span>
                    </div>
                    <div className="text-right shrink-0 font-medium text-slate-600 text-[10px]">
                      {leg.departureTime} - {leg.arrivalTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center space-y-1.5">
              <p className="text-[11px] text-slate-600">
                Fahrplan ab {originStation.name} abfragen:
              </p>
              <button
                onClick={handleFetchLiveTimetable}
                disabled={isLoadingLive}
                className="px-3 py-1 bg-alpine-600 hover:bg-alpine-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 shadow-2xs transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingLive ? 'animate-spin' : ''}`} />
                <span>Verbindung abfragen</span>
              </button>
            </div>
          )}

          {liveError && (
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              {liveError}
            </p>
          )}

          {/* Action Buttons: Refresh & DB Navigator */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
            <button
              onClick={handleFetchLiveTimetable}
              disabled={isLoadingLive}
              className="flex items-center justify-center space-x-1.5 py-2 px-2.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-300 font-semibold text-xs shadow-2xs transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingLive ? 'animate-spin text-alpine-600' : 'text-slate-500'}`} />
              <span>Neu laden</span>
            </button>

            <a
              href={workingDbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 py-2 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>In DB Navigator</span>
            </a>
          </div>
        </div>

        {/* Avalanche Safety Section */}
        <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-slate-900 text-xs">Lawinenlagebericht</h4>
            </div>
            {!currentRisk.isSeasonActive ? (
              <span className="px-2 py-0.2 rounded-full font-bold text-[10px] bg-slate-200 text-slate-700 border border-slate-300">
                ❄️ Saisonpause
              </span>
            ) : (
              <span
                className="px-2 py-0.2 rounded-full font-black text-[10px] border"
                style={{
                  backgroundColor: eaws.bg,
                  color: eaws.text,
                  borderColor: eaws.border
                }}
              >
                Stufe {currentRisk.dangerLevel} ({currentRisk.dangerLevelLabel})
              </span>
            )}
          </div>

          <p className="text-[11px] text-amber-900 leading-relaxed mb-1.5">
            {!currentRisk.isSeasonActive
              ? `Aktuell besteht für ${currentRisk.name} eine Saisonpause. Der offizielle Lawinenwarndienst veröffentlicht ab den ersten ergiebigen Schneefällen im Frühwinter tägliche Lageberichte.`
              : `Aktuelle Gefahrenstufe ${currentRisk.dangerLevel} für Region ${currentRisk.name}. Gefahrenstellen: ${currentRisk.avalancheProblems.join(', ') || 'Triebschnee & Altschnee'}.`}
          </p>

          {tour.isPiste && (
            <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center space-x-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Pistenskitour im gesicherten Skiraum – auch bei Lawinenstufe 3/4 sicher begehbar.</span>
            </div>
          )}
        </div>

        {/* User Ratings & Custom Notes */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h4 className="font-bold text-slate-900 text-xs">Deine Erfahrung & Notizen</h4>
            </div>
            {isSavedNotice && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded text-[10px] font-bold border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Gespeichert!</span>
              </span>
            )}
          </div>

          {/* Star Rating Selector */}
          <div className="flex items-center space-x-2 pt-0.5">
            <span className="font-bold text-slate-700 text-[11px]">Bewertung:</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCurrentRating(currentRating === star ? null : star)}
                  className="p-0.5 hover:scale-125 transition-transform"
                  title={currentRating === star ? 'Bewertung löschen' : `${star} Sterne`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      currentRating && currentRating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-[11px] text-slate-500 ml-1 font-bold">
                {currentRating ? `${currentRating}/5` : 'Noch nicht gemacht'}
              </span>
            </div>
          </div>

          {/* Editable Comment Textarea */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 text-[11px]">Notizen, Tipps & Erfahrungen:</label>
            <textarea
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              placeholder="Eigene Eindrücke, Schneeverhältnisse, Ausrüstungstipps..."
              rows={2}
              className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-alpine-500/30"
            />
          </div>

          {/* Edit Skitourenguru URL */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 text-[11px] flex items-center justify-between">
              <span>Skitourenguru URL (optional):</span>
              <span className="text-[10px] text-slate-400">Direktlink mit ID einfügen</span>
            </label>
            <input
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="https://www.skitourenguru.ch/?id=..."
              className="w-full p-1.5 bg-white rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <button
            onClick={handleSaveNotes}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs"
          >
            Bewertung & Notizen speichern
          </button>
        </div>

        {/* Delete Tour Action Button */}
        <div className="pt-2 border-t border-slate-200 flex justify-end items-center">
          <button
            onClick={() => {
              if (window.confirm(`Möchtest du die Tour "${tour.name}" wirklich löschen?`)) {
                onDeleteTour(tour.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tour löschen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
