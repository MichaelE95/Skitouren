import React, { useState, useEffect } from 'react';
import { SkiTour, AvalancheRegion, OriginStation } from '../../types';
import { getTourAvalancheRisk } from '../../services/avalancheService';
import { fetchLiveJourneys, buildDbNavigatorUrl, LiveJourneyResult } from '../../services/transitService';
import { downloadTourGpx } from '../../utils/gpxGenerator';
import { EAWS_COLORS } from '../../data/avalancheData';
import {
  X,
  Download,
  ExternalLink,
  Train,
  Clock,
  Euro,
  AlertTriangle,
  Star,
  RefreshCw,
  Home,
  MessageSquare,
  ShieldCheck,
  Footprints,
  AlertCircle,
  CheckCircle2,
  Edit3
} from 'lucide-react';

interface TourDetailModalProps {
  tour: SkiTour | null;
  onClose: () => void;
  avalancheRegions: AvalancheRegion[];
  originStation: OriginStation;
  onUpdateTourMeta: (tourId: string, rating: number | null, comment: string, skitourenguruUrl?: string) => void;
}

export const TourDetailModal: React.FC<TourDetailModalProps> = ({
  tour,
  onClose,
  avalancheRegions,
  originStation,
  onUpdateTourMeta
}) => {
  const [liveJourneys, setLiveJourneys] = useState<LiveJourneyResult[] | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [showLivePanel, setShowLivePanel] = useState(false);

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
      setShowLivePanel(false);
      setLiveJourneys(null);
    }
  }, [tour]);

  if (!tour) return null;

  const currentRisk = getTourAvalancheRisk(tour, avalancheRegions);
  const eaws = EAWS_COLORS[currentRisk.dangerLevel] || EAWS_COLORS[2];

  const hours = Math.floor(tour.transit.approxTotalMinutes / 60);
  const minutes = tour.transit.approxTotalMinutes % 60;
  const transitTimeStr = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;

  const handleSaveNotes = () => {
    onUpdateTourMeta(tour.id, currentRating, currentComment, currentUrl);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleFetchLiveTimetable = async () => {
    setIsLoadingLive(true);
    setLiveError(null);
    setShowLivePanel(true);
    try {
      const results = await fetchLiveJourneys(
        tour.transit.destinationIbnr,
        tour.transit.destinationStation,
        tour.transit.cleanDbStationName,
        originStation.ibnr,
        originStation.name
      );
      if (results.length === 0) {
        setLiveError(`Keine Fahrten ab ${originStation.name} gefunden. Probiere den direkten DB Navigator Link unten.`);
      } else {
        setLiveJourneys(results);
      }
    } catch {
      setLiveError('Verbindung zum DB Fahrplan-Dienst nicht möglich.');
    } finally {
      setIsLoadingLive(false);
    }
  };

  const workingDbUrl = buildDbNavigatorUrl(originStation.name, tour.transit.cleanDbStationName);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[540px] bg-white shadow-2xl z-40 flex flex-col border-l border-slate-200 transform transition-transform duration-300 overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div>
          <span className="text-xs uppercase tracking-wider text-alpine-300 font-bold">
            {tour.mountainRange} • {tour.valley}
          </span>
          <h2 className="text-xl font-black text-white leading-tight flex items-center space-x-2">
            <span>{tour.name}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-alpine-600 text-white">
              SAC {tour.difficulty}
            </span>
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Schließen"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-800 text-xs">
        {/* Subtitle & Key Stats */}
        <div>
          <p className="text-sm text-slate-600 mb-4">{tour.subheading}</p>

          <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Gipfel</div>
              <div className="text-sm font-black text-slate-800">{tour.peakElevation} m</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Start</div>
              <div className="text-sm font-black text-slate-800">{tour.startElevation} m</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Aufstieg</div>
              <div className="text-sm font-black text-emerald-700">+{tour.elevationGain} hm</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Dauer</div>
              <div className="text-sm font-black text-slate-800">{tour.estimatedTourDurationHours} Std</div>
            </div>
          </div>
        </div>

        {/* Quick Action CTA Buttons (GPX & Skitourenguru) */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => downloadTourGpx(tour)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-alpine-600 hover:bg-alpine-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all hover:shadow"
            >
              <Download className="w-4 h-4" />
              <span>GPX Herunterladen</span>
            </button>

            <a
              href={tour.links.skitourenguruUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm border border-slate-300 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-slate-600" />
              <span>Auf Skitourenguru ↗</span>
            </a>
          </div>

          {!tour.links.isVerifiedUrl && (
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Skitourenguru-Link unbestätigt:</strong> Der Button öffnet aktuell die Suche auf Skitourenguru nach <em>"{tour.name}"</em>. Du kannst den exakten Link unten jederzeit einfügen und speichern!
              </div>
            </div>
          )}
        </div>

        {/* Avalanche Safety Section (Seasonal Awareness) */}
        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-slate-900 text-sm">Lawinenlagebericht</h4>
            </div>
            {!currentRisk.isSeasonActive ? (
              <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-slate-200 text-slate-700 border border-slate-300">
                ❄️ Saisonpause
              </span>
            ) : (
              <span
                className="px-2.5 py-0.5 rounded-full font-black text-xs border"
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

          {!currentRisk.isSeasonActive ? (
            <div className="text-xs text-slate-600 space-y-1">
              <p>Aktuell liegt kein winterlicher Lawinenlagebericht für <strong>{currentRisk.name}</strong> vor (Saisonpause bis ca. Dezember).</p>
              <p className="text-[11px] text-slate-500">Sobald der LWD Bayern & Lawine Tirol die täglichen Bulletins aktivieren, erscheinen hier automatisch die Gefahrenstufen, Expositionen und Lawinenprobleme.</p>
            </div>
          ) : (
            <div className="text-xs text-slate-700 space-y-1">
              <p><strong>Warnregion:</strong> {currentRisk.name}</p>
              <p><strong>Kritische Hangexpositionen:</strong> {currentRisk.aspects.join(', ')}</p>
              <p><strong>Hauptprobleme:</strong> {currentRisk.avalancheProblems.join(', ')}</p>
            </div>
          )}

          {tour.isPiste && (
            <div className="mt-2.5 flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/70 p-2 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Pistentour: Im gesicherten Skiraum auch bei hoher Lawinenstufe oder Nebel machbar!</span>
            </div>
          )}
        </div>

        {/* Public Transit Section (From Active Origin Station) */}
        <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Train className="w-4 h-4 text-alpine-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                Anreise ab {originStation.name}
              </h4>
            </div>
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>ca. {transitTimeStr}</span>
            </span>
          </div>

          {/* D-Ticket & Extra Cost Note */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center space-x-1.5">
              <Euro className="w-3.5 h-3.5 text-slate-500" />
              <span>Deutschland-Ticket:</span>
            </div>
            {tour.transit.dTicketValidity === '100% gültig' ? (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Gültig (0,00 €)
              </span>
            ) : (
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Zusatzkosten: ca. {tour.transit.extraCostEuro.toFixed(2)} €
              </span>
            )}
          </div>

          {/* Walking connection from station */}
          {tour.transit.walkingDurationMinutes > 0 && (
            <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center space-x-2 text-[11px] text-slate-700">
              <Footprints className="w-4 h-4 text-alpine-600 shrink-0" />
              <span>
                Zielbahnhof: <strong>{tour.transit.cleanDbStationName}</strong> → ca. <strong>{tour.transit.walkingDurationMinutes} min Fußweg</strong> ({tour.transit.walkingDistanceMeters} m) zum Einstieg.
              </span>
            </div>
          )}

          {/* Step-by-step route itinerary */}
          <div className="space-y-2 pt-1 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Fahrtverlauf:</div>
            {tour.transit.steps.map((st, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-alpine-100 text-alpine-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">
                    {st.station} {st.line && <span className="text-alpine-600 font-bold">({st.line})</span>}
                  </div>
                  {st.note && <div className="text-[11px] text-slate-500">{st.note}</div>}
                </div>
                {st.timeHint && (
                  <span className="text-[11px] font-mono text-slate-500">{st.timeHint}</span>
                )}
              </div>
            ))}
          </div>

          {/* Working DB Navigator Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleFetchLiveTimetable}
              disabled={isLoadingLive}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-300 font-semibold text-xs shadow-2xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin text-alpine-600' : 'text-slate-500'}`} />
              <span>Live-Fahrplan</span>
            </button>

            <a
              href={workingDbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>In DB Navigator</span>
            </a>
          </div>

          {/* Live DB Results Box */}
          {showLivePanel && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-700 border-b pb-1">
                Echtzeit-Verbindungen ab {originStation.name}:
              </div>

              {liveError && <p className="text-xs text-amber-700">{liveError}</p>}

              {liveJourneys && liveJourneys.length > 0 && (
                <div className="space-y-2">
                  {liveJourneys.map((j, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">
                          {j.departure} → {j.arrival}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Dauer: {Math.floor(j.durationMinutes / 60)}h {j.durationMinutes % 60}m | {j.transfers} Umstiege
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        Regionalzug
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Ratings & Custom Notes (Editable) */}
        <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-alpine-600" />
              <h4 className="font-bold text-slate-900 text-sm">Deine Bewertung & Notizen</h4>
            </div>
            {isSavedNotice && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Gespeichert!</span>
              </span>
            )}
          </div>

          {/* Interactive Rating Scale 1-5 */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-700">Persönliche Bewertung:</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCurrentRating(currentRating === star ? null : star)}
                  className="p-1 hover:scale-125 transition-transform"
                  title={currentRating === star ? 'Bewertung löschen' : `${star} Sterne`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      currentRating && currentRating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-slate-500 ml-1 font-bold">
                {currentRating ? `${currentRating}/5` : 'Noch nicht gemacht'}
              </span>
            </div>
          </div>

          {/* Editable Comment Textarea */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Notizen, Tipps & Erfahrungen:</label>
            <textarea
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              placeholder="Schreibe eigene Tipps, Parkmöglichkeiten, Schneeverhältnisse..."
              rows={3}
              className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-alpine-500/30"
            />
          </div>

          {/* Edit Skitourenguru URL if unverified */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Skitourenguru URL:</span>
              <span className="text-[10px] text-slate-400">Direktlink mit ID einfügen</span>
            </label>
            <input
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="https://www.skitourenguru.ch/?id=..."
              className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <button
            onClick={handleSaveNotes}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-2xs"
          >
            Bewertung & Notizen speichern
          </button>
        </div>

        {/* DAV Huts / Accommodation (for multi-day extension) */}
        {tour.huts && tour.huts.length > 0 && (
          <div className="rounded-2xl p-4 border border-purple-200 bg-purple-50/50 space-y-2">
            <div className="flex items-center space-x-2">
              <Home className="w-4 h-4 text-purple-700" />
              <h4 className="font-bold text-slate-900 text-sm">DAV-Hütten & Stützpunkte</h4>
            </div>
            {tour.huts.map((hut, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-purple-100 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{hut.name} ({hut.elevation} m)</span>
                  {hut.hasWinterRoom && (
                    <span className="bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                      Winterraum vorhanden
                    </span>
                  )}
                </div>
                {hut.notes && <p className="text-slate-600 text-[11px]">{hut.notes}</p>}
                {hut.davLink && (
                  <a
                    href={hut.davLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-alpine-600 hover:underline text-[11px] font-semibold pt-1"
                  >
                    <span>Hütten-Infos & Reservierung ↗</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
