import React, { useEffect, useState } from 'react';
import { SkiTour, AvalancheRegion, TourTransitResult, Journey, SAC_GRADES, SACGrade, sacCategory, Place } from '../../types';
import { getTourAvalancheRisk } from '../../services/avalancheService';
import { gpxUrl } from '../../services/tourStore';
import { EAWS_COLORS } from '../../data/avalancheData';
import { formatClock, formatDuration, formatDateTime } from '../../utils/format';
import { TransitSummary, DIFF_BADGE } from './TourCard';
import {
  ArrowLeft, Download, ExternalLink, Star, Trash2, Save, Footprints, Train, Bus, ChevronDown, ChevronRight,
  Pencil, X, AlertTriangle, MapPin
} from 'lucide-react';

interface TourDetailPanelProps {
  tour: SkiTour;
  result?: TourTransitResult;
  isCalculating: boolean;
  origin: Place;
  calculatedAt?: string;
  isStale: boolean;
  avalancheRegions: AvalancheRegion[];
  onClose: () => void;
  onSave: (tour: SkiTour) => Promise<void>;
  onDelete: (tour: SkiTour) => Promise<void>;
  onRetry: (tour: SkiTour) => void;
}

export const TourDetailPanel: React.FC<TourDetailPanelProps> = ({
  tour,
  result,
  isCalculating,
  origin,
  calculatedAt,
  isStale,
  avalancheRegions,
  onClose,
  onSave,
  onDelete,
  onRetry
}) => {
  const [notes, setNotes] = useState(tour.notes);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(tour);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    setNotes(tour.notes);
    setDraft(tour);
    setIsEditing(false);
    setError(null);
  }, [tour]);

  const risk = getTourAvalancheRisk(tour, avalancheRegions);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const setRating = (star: number) => run(() => onSave({ ...tour, rating: tour.rating === star ? null : star }));
  const saveNotes = () => run(() => onSave({ ...tour, notes }));
  const saveDraft = () =>
    run(async () => {
      if (!draft.peakName.trim()) throw new Error('Peak name must not be empty.');
      await onSave({
        ...draft,
        peakName: draft.peakName.trim(),
        mountainRange: draft.mountainRange?.trim() || null,
        skitourenguruUrl: draft.skitourenguruUrl?.trim() || undefined
      });
      setIsEditing(false);
    });
  const handleDelete = () => {
    if (window.confirm(`Delete "${tour.peakName}" including its GPX file?`)) run(() => onDelete(tour));
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-alpine-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          {isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          <span>{isEditing ? 'Abbrechen' : 'Bearbeiten'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {error && <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">{error}</div>}

        {/* Title / edit form */}
        {isEditing ? (
          <div className="space-y-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50">
            <Field label="Gipfel">
              <input className="input" value={draft.peakName} onChange={e => setDraft({ ...draft, peakName: e.target.value })} />
            </Field>
            <Field label="Gebirgsgruppe">
              <input className="input" value={draft.mountainRange ?? ''} onChange={e => setDraft({ ...draft, mountainRange: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="SAC-Schwierigkeit">
                <select className="input" value={draft.difficulty} onChange={e => setDraft({ ...draft, difficulty: e.target.value as SACGrade })}>
                  {SAC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Pistenskitour">
                <label className="flex items-center space-x-2 h-[34px]">
                  <input type="checkbox" checked={draft.isPiste} onChange={e => setDraft({ ...draft, isPiste: e.target.checked })} />
                  <span>Ja</span>
                </label>
              </Field>
            </div>
            <Field label="Skitourenguru-Link (optional)">
              <input className="input" placeholder="https://www.skitourenguru.ch/…" value={draft.skitourenguruUrl ?? ''} onChange={e => setDraft({ ...draft, skitourenguruUrl: e.target.value })} />
            </Field>
            <button
              onClick={saveDraft}
              disabled={busy}
              className="w-full py-2 rounded-xl bg-alpine-600 hover:bg-alpine-700 text-white font-bold flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Speichern</span>
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-slate-500 font-medium">
                {tour.mountainRange ?? <span className="text-amber-600">Gebirgsgruppe unbekannt</span>}
              </div>
              <h2 className="text-xl font-black text-slate-900">{tour.peakName}</h2>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className={`px-2 py-0.5 font-bold rounded-lg border ${DIFF_BADGE[sacCategory(tour.difficulty)]}`}>
                SAC {tour.difficulty}
              </span>
              {tour.isPiste && <span className="text-[10px] font-semibold text-emerald-700">Pistentour</span>}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
          <Metric label="Start" value={`${tour.startElevation} m`} />
          <Metric label="Gipfel" value={`${tour.peakElevation} m`} />
          <Metric label="Aufstieg" value={`+${tour.elevationGain} hm`} />
          <Metric label="Distanz" value={`${tour.distanceKm} km`} />
        </div>

        {/* Rating */}
        <Section title="Bewertung">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} disabled={busy} onClick={() => setRating(star)} className="p-0.5 hover:scale-125 transition-transform">
                <Star className={`w-5 h-5 ${tour.rating && tour.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              </button>
            ))}
            <span className="ml-2 text-slate-500">{tour.rating ? `${tour.rating}/5` : 'Noch nicht gemacht'}</span>
          </div>
        </Section>

        {/* Transit */}
        <Section title={`Anreise ab ${origin.name}`}>
          {isStale && result && (
            <div className="mb-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Berechnet für andere Einstellungen. „Fahrplan laden“ drücken.</span>
            </div>
          )}
          <TransitSummary result={result} isCalculating={isCalculating} onRetry={() => onRetry(tour)} />
          {result?.ok && (
            <div className="mt-3 space-y-3">
              <LegList journey={result.best} />
              {result.alternatives.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="flex items-center space-x-1 font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {showAlternatives ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span>{result.alternatives.length} weitere Verbindungen</span>
                  </button>
                  {showAlternatives && (
                    <div className="mt-2 space-y-3">
                      {result.alternatives.map((alt, i) => (
                        <div key={i} className="p-2 rounded-xl border border-slate-200">
                          <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                            <span>{formatClock(alt.departure)} → {formatClock(alt.arrival)}</span>
                            <span>{formatDuration(alt.durationMinutes)} · {alt.transfers}× Umstieg</span>
                          </div>
                          <LegList journey={alt} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {calculatedAt && (
            <div className="mt-2 text-[10px] text-slate-400">Quelle: Transitous · abgefragt {formatDateTime(calculatedAt)}</div>
          )}
        </Section>

        {/* Avalanche */}
        {risk && (
          <Section title="Lawinenlage">
            {!risk.isSeasonActive ? (
              <div className="text-slate-600">❄️ {risk.name}: Saisonpause, Lageberichte starten im Winter.</div>
            ) : (
              <span
                className="inline-flex items-center space-x-1 font-bold px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: EAWS_COLORS[risk.dangerLevel].bg, color: EAWS_COLORS[risk.dangerLevel].text, borderColor: EAWS_COLORS[risk.dangerLevel].border }}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>{risk.name}: Stufe {risk.dangerLevel} ({risk.dangerLevelLabel})</span>
              </span>
            )}
          </Section>
        )}

        {/* Notes */}
        <Section title="Notizen">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Eigene Erfahrungen, Tipps, Bedingungen…"
            className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-alpine-500/30"
          />
          {notes !== tour.notes && (
            <button
              onClick={saveNotes}
              disabled={busy}
              className="mt-1.5 px-3 py-1.5 rounded-lg bg-alpine-600 text-white font-bold flex items-center space-x-1 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Notizen speichern</span>
            </button>
          )}
        </Section>

        {/* Links & actions */}
        <div className="grid grid-cols-2 gap-2">
          {tour.skitourenguruUrl ? (
            <a
              href={tour.skitourenguruUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold flex items-center justify-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Skitourenguru</span>
            </a>
          ) : (
            <span
              className="py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-semibold flex items-center justify-center space-x-1.5 cursor-not-allowed"
              title="No Skitourenguru link entered (edit the tour to add one)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Skitourenguru</span>
            </span>
          )}
          <a
            href={gpxUrl(tour)}
            download={tour.gpxFile}
            className="py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GPX (Original)</span>
          </a>
        </div>

        <button
          onClick={handleDelete}
          disabled={busy}
          className="w-full py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold flex items-center justify-center space-x-1.5 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Tour löschen</span>
        </button>
      </div>
    </div>
  );
};

const LegList: React.FC<{ journey: Journey }> = ({ journey }) => (
  <ol className="space-y-1.5">
    {journey.legs
      .filter(l => !(l.mode === 'walk' && l.durationMinutes === 0))
      .map((leg, i) => {
        const Icon = leg.mode === 'walk' ? Footprints : leg.mode === 'bus' ? Bus : leg.mode === 'rail' ? Train : MapPin;
        return (
          <li key={i} className="flex items-start space-x-2">
            <span className="w-10 shrink-0 text-slate-500 font-mono">{formatClock(leg.departure)}</span>
            <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${leg.mode === 'walk' ? 'text-emerald-600' : 'text-alpine-600'}`} />
            <span className="min-w-0">
              <span className="font-semibold text-slate-800">
                {leg.mode === 'walk' ? `Fußweg ${leg.durationMinutes} min${leg.distanceMeters ? ` (${Math.round(leg.distanceMeters)} m)` : ''}` : leg.lineName}
              </span>
              {leg.headsign && leg.mode !== 'walk' && <span className="text-slate-500"> Richtung {leg.headsign}</span>}
              <span className="block text-slate-500 truncate">
                {leg.fromName} → {leg.toName} · an {formatClock(leg.arrival)}
              </span>
            </span>
          </li>
        );
      })}
  </ol>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{title}</div>
    {children}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-[11px] font-semibold text-slate-600 mb-0.5">{label}</span>
    {children}
  </label>
);

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] text-slate-500 font-medium">{label}</div>
    <div className="text-xs font-bold text-slate-800">{value}</div>
  </div>
);

