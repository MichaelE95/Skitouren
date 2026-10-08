import React, { useRef, useState } from 'react';
import { SkiTour, SAC_GRADES, SACGrade } from '../../types';
import { parseGpxString, ParsedGpxResult, slugify } from '../../utils/gpxParser';
import { lookupMountainRange } from '../../services/peakLookup';
import { findLikelyDuplicates, DuplicateMatch } from '../../utils/duplicates';
import { estimateTourTime, formatHM } from '../../utils/tourTime';
import { ExposurePicker } from './AvalancheExposure';
import { X, Upload, Loader2, AlertTriangle, CheckCircle2, Save } from 'lucide-react';

interface AddTourModalProps {
  isOpen: boolean;
  existingTours: SkiTour[];
  onClose: () => void;
  /** Persists the tour + original GPX; resolves when saved. */
  onSave: (tour: SkiTour, gpxText: string) => Promise<void>;
}

/**
 * Only the GPX is required. Metrics and the name come from the GPX (name editable);
 * the Gebirgsgruppe is looked up on Wikidata in the background (optional).
 */
export const AddTourModal: React.FC<AddTourModalProps> = ({ isOpen, existingTours, onClose, onSave }) => {
  const [gpxText, setGpxText] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedGpxResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [rangeSource, setRangeSource] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);

  const [peakName, setPeakName] = useState('');
  const [mountainRange, setMountainRange] = useState('');
  const [difficulty, setDifficulty] = useState<SACGrade>('WS');
  const [isPiste, setIsPiste] = useState(false);
  const [avalancheExposure, setAvalancheExposure] = useState<number | null>(null);
  const [skitourenguruUrl, setSkitourenguruUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lookupIdRef = useRef(0);

  if (!isOpen) return null;
  const existingIds = existingTours.map(t => t.id);

  const reset = () => {
    lookupIdRef.current++;
    setGpxText(null); setFileName(''); setParsed(null); setParseError(null); setWarnings([]); setRangeSource(null);
    setLookupBusy(false); setDuplicates([]);
    setPeakName(''); setMountainRange(''); setDifficulty('WS'); setIsPiste(false); setAvalancheExposure(null);
    setSkitourenguruUrl(''); setNotes(''); setSaveError(null);
  };

  const close = () => { reset(); onClose(); };

  const handleFile = async (file: File) => {
    reset();
    setFileName(file.name);
    const text = await file.text();
    let result: ParsedGpxResult;
    try {
      result = parseGpxString(text, file.name);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err));
      return;
    }
    setGpxText(text);
    setParsed(result);
    setPeakName(result.nameFromFile);
    setDuplicates(findLikelyDuplicates(result, existingTours));

    // Optional, non-blocking Gebirgsgruppe lookup
    const id = ++lookupIdRef.current;
    setLookupBusy(true);
    const lookup = await lookupMountainRange(result.summit);
    if (lookupIdRef.current !== id) return; // another file was chosen meanwhile
    setLookupBusy(false);
    if (lookup.mountainRange) {
      setMountainRange(prev => prev || lookup.mountainRange!);
      setRangeSource(lookup.matchedItem ?? null);
    }
    if (lookup.warning) setWarnings([lookup.warning]);
  };

  const handleSave = async () => {
    if (!parsed || !gpxText) return;
    if (!peakName.trim()) { setSaveError('Please enter the peak name.'); return; }
    let id = slugify(peakName);
    for (let n = 2; existingIds.includes(id); n++) id = `${slugify(peakName)}-${n}`;
    const tour: SkiTour = {
      id,
      gpxFile: `${id}.gpx`,
      peakName: peakName.trim(),
      mountainRange: mountainRange.trim() || null,
      startElevation: parsed.startElevation,
      peakElevation: parsed.peakElevation,
      elevationGain: parsed.elevationGain,
      distanceKm: parsed.distanceKm,
      trailhead: parsed.trailhead,
      summit: parsed.summit,
      track: parsed.track,
      difficulty,
      isPiste,
      skitourenguruUrl: skitourenguruUrl.trim() || undefined,
      rating: null,
      avalancheExposure,
      notes: notes.trim()
    };
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(tour, gpxText);
      close();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Neue Tour aus GPX</h2>
          <button onClick={close} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* GPX drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className="border-2 border-dashed border-slate-300 hover:border-alpine-500 rounded-xl p-5 text-center cursor-pointer transition-colors"
          >
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <div className="font-semibold text-slate-700">{fileName || 'GPX-Datei hierher ziehen oder klicken'}</div>
            <div className="text-slate-400 mt-0.5">Required. The first track point is the trailhead.</div>
            <input ref={fileRef} type="file" accept=".gpx,application/gpx+xml" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
          </div>

          {parseError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" /><span>{parseError}</span>
            </div>
          )}

          {parsed && (
            <>
              {duplicates.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Diese Tour gibt es wahrscheinlich schon:</span>
                  </div>
                  <ul className="list-disc pl-6">
                    {duplicates.map(d => (
                      <li key={d.tour.id}>
                        <strong>{d.tour.peakName}</strong> (Gipfel {d.summitDistanceM} m, Einstieg {d.trailheadDistanceM} m entfernt)
                      </li>
                    ))}
                  </ul>
                  <div className="text-[10px]">You can still save it, e.g. if it's a different route.</div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aus dem GPX</div>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
                  <M label="Start" value={`${parsed.startElevation} m`} />
                  <M label="Gipfel" value={`${parsed.peakElevation} m`} />
                  <M label="Aufstieg" value={`+${parsed.elevationGain} hm`} />
                  <M label="Distanz" value={`${parsed.distanceKm} km`} />
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  Trailhead {parsed.trailhead[1].toFixed(5)}, {parsed.trailhead[0].toFixed(5)}
                  {' · '}Tour ca. ↑ {formatHM(estimateTourTime(parsed).ascentMinutes)} · ↓ {formatHM(estimateTourTime(parsed).descentMinutes)} h
                </div>
              </div>

              <div className="space-y-2.5">
                <F label="Name * (from the GPX, editable)">
                  <input className="input" value={peakName} onChange={e => setPeakName(e.target.value)} />
                </F>
                <F label="Gebirgsgruppe (optional)">
                  <input className="input" value={mountainRange} onChange={e => setMountainRange(e.target.value)} placeholder="z. B. Allgäuer Alpen" />
                  {lookupBusy && (
                    <span className="mt-1 flex items-center space-x-1 text-[10px] text-alpine-600">
                      <Loader2 className="w-3 h-3 animate-spin" /><span>Looking it up on Wikidata… (you can save anyway)</span>
                    </span>
                  )}
                  {!lookupBusy && rangeSource && (
                    <span className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /><span>Wikidata: {rangeSource}</span>
                    </span>
                  )}
                  {!lookupBusy && warnings.map((w, i) => (
                    <span key={i} className="mt-1 flex items-start space-x-1 text-[10px] text-amber-700">
                      <AlertTriangle className="w-3 h-3 shrink-0" /><span>{w}</span>
                    </span>
                  ))}
                </F>
                <div className="grid grid-cols-2 gap-2">
                  <F label="SAC-Schwierigkeit *">
                    <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value as SACGrade)}>
                      {SAC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </F>
                  <F label="Pistenskitour">
                    <label className="flex items-center space-x-2 h-[30px]">
                      <input type="checkbox" checked={isPiste} onChange={e => setIsPiste(e.target.checked)} />
                      <span>Ja</span>
                    </label>
                  </F>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-slate-600 mb-0.5">Lawinenexposition (optional, ATES-basiert)</span>
                  <ExposurePicker value={avalancheExposure} onChange={setAvalancheExposure} />
                </div>
                <F label="Skitourenguru-Link (optional)">
                  <input className="input" value={skitourenguruUrl} onChange={e => setSkitourenguruUrl(e.target.value)} placeholder="https://www.skitourenguru.ch/…" />
                </F>
                <F label="Notizen (optional)">
                  <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
                </F>
              </div>
            </>
          )}

          {saveError && <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">{saveError}</div>}
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end space-x-2">
          <button onClick={close} className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold">Abbrechen</button>
          <button
            onClick={handleSave}
            disabled={!parsed || saving}
            className="px-4 py-2 rounded-xl bg-alpine-600 hover:bg-alpine-700 text-white text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{duplicates.length > 0 ? 'Trotzdem speichern' : 'Tour speichern'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const F: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-[11px] font-semibold text-slate-600 mb-0.5">{label}</span>
    {children}
  </label>
);

const M: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] text-slate-500 font-medium">{label}</div>
    <div className="text-xs font-bold text-slate-800">{value}</div>
  </div>
);
