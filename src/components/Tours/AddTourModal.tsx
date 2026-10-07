import React, { useRef, useState } from 'react';
import { SkiTour, SAC_GRADES, SACGrade } from '../../types';
import { parseGpxString, ParsedGpxResult, slugify } from '../../utils/gpxParser';
import { lookupPeak } from '../../services/peakLookup';
import { X, Upload, Loader2, AlertTriangle, CheckCircle2, Save } from 'lucide-react';

interface AddTourModalProps {
  isOpen: boolean;
  existingIds: string[];
  onClose: () => void;
  /** Persists the tour + original GPX; resolves when saved. */
  onSave: (tour: SkiTour, gpxText: string) => Promise<void>;
}

/**
 * Only the GPX is required. Metrics come from the GPX; peak name and Gebirgsgruppe
 * from OSM/Wikidata (editable, with warnings if missing); the rest is entered here.
 */
export const AddTourModal: React.FC<AddTourModalProps> = ({ isOpen, existingIds, onClose, onSave }) => {
  const [gpxText, setGpxText] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedGpxResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [peakName, setPeakName] = useState('');
  const [mountainRange, setMountainRange] = useState('');
  const [difficulty, setDifficulty] = useState<SACGrade>('WS');
  const [isPiste, setIsPiste] = useState(false);
  const [skitourenguruUrl, setSkitourenguruUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const reset = () => {
    setGpxText(null); setFileName(''); setParsed(null); setParseError(null); setWarnings([]);
    setPeakName(''); setMountainRange(''); setDifficulty('WS'); setIsPiste(false);
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

    setLookupBusy(true);
    const lookup = await lookupPeak(result.summit);
    setLookupBusy(false);
    const w = [...lookup.warnings];
    setPeakName(lookup.peakName ?? '');
    setMountainRange(lookup.mountainRange ?? '');
    if (!lookup.peakName) w.push(`Name in the GPX file: "${result.nameFromFile}" (not used automatically).`);
    if (lookup.peakEle !== undefined && Math.abs(lookup.peakEle - result.peakElevation) > 60) {
      w.push(
        `OSM gives ${lookup.peakEle} m for ${lookup.peakName}, the GPX's highest point is ${result.peakElevation} m. ` +
        `The track may not reach the summit, or its elevations are imprecise. The GPX value is used.`
      );
    }
    setWarnings(w);
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
                </div>
              </div>

              {lookupBusy ? (
                <div className="flex items-center space-x-1.5 text-alpine-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Looking up the peak (OpenStreetMap, Wikidata)…</span>
                </div>
              ) : warnings.length > 0 ? (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-start space-x-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{w}</span></div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /><span>Peak and Gebirgsgruppe found (OSM + Wikidata).</span>
                </div>
              )}

              <div className="space-y-2.5">
                <F label="Gipfel *">
                  <input className="input" value={peakName} onChange={e => setPeakName(e.target.value)} />
                </F>
                <F label="Gebirgsgruppe">
                  <input className="input" value={mountainRange} onChange={e => setMountainRange(e.target.value)} placeholder="z. B. Wettersteingebirge" />
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
            disabled={!parsed || lookupBusy || saving}
            className="px-4 py-2 rounded-xl bg-alpine-600 hover:bg-alpine-700 text-white text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Tour speichern</span>
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
