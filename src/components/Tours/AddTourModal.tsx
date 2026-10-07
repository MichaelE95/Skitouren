import React, { useState } from 'react';
import { parseGpxString, ParsedGpxResult } from '../../utils/gpxParser';
import { findClosestStation, buildStationTransitInfo, StationMatchResult } from '../../utils/stationMatcher';
import { KEY_STATIONS } from '../../data/trainLines';
import { SkiTour, OriginStation, SACGrade, SACCategory } from '../../types';
import { saveCustomTour, saveUserTourMeta } from '../../data/userMeta';
import {
  X,
  Upload,
  FileCheck,
  Mountain,
  Train,
  Clock,
  TrendingUp,
  Link as LinkIcon,
  Star,
  CheckCircle,
  AlertCircle,
  Footprints
} from 'lucide-react';

interface AddTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  originStation: OriginStation;
  onTourAdded: (tour: SkiTour) => void;
}

export const AddTourModal: React.FC<AddTourModalProps> = ({
  isOpen,
  onClose,
  originStation,
  onTourAdded
}) => {
  const [gpxResult, setGpxResult] = useState<ParsedGpxResult | null>(null);
  const [gpxFileName, setGpxFileName] = useState<string>('');
  const [skitourenguruUrl, setSkitourenguruUrl] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [mountainRange, setMountainRange] = useState<string>('Allgäuer Alpen');
  const [valley, setValley] = useState<string>('');
  const [difficulty, setDifficulty] = useState<SACGrade>('WS');
  const [isPiste, setIsPiste] = useState<boolean>(false);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [matchedStation, setMatchedStation] = useState<StationMatchResult | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle GPX file drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setGpxFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGpxString(text, file.name);
        setGpxResult(parsed);
        setCustomName(parsed.name);

        // Auto-match nearest station
        const match = findClosestStation(parsed.trailhead, originStation);
        setMatchedStation(match);
        setSelectedStationId(match.station.id);

        // Pre-fill Skitourenguru search if empty
        if (!skitourenguruUrl) {
          setSkitourenguruUrl(`https://www.skitourenguru.ch/?search=${encodeURIComponent(parsed.name)}`);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Fehler beim Parsen der GPX-Datei.');
      }
    };

    reader.readAsText(file);
  };

  // Station override changed
  const handleStationChange = (stationId: string) => {
    setSelectedStationId(stationId);
    if (!gpxResult) return;
    const st = KEY_STATIONS.find(s => s.id === stationId);
    if (st) {
      const match = buildStationTransitInfo(st, 500, originStation);
      setMatchedStation(match);
    }
  };

  const handleSave = () => {
    if (!gpxResult) {
      setErrorMsg('Bitte zuerst eine GPX-Datei hochladen.');
      return;
    }
    if (!customName.trim()) {
      setErrorMsg('Bitte einen Namen für die Tour eingeben.');
      return;
    }

    const tourId = 'custom-' + customName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    const cat: SACCategory = difficulty.startsWith('L') ? 'L' : difficulty.startsWith('WS') ? 'WS' : difficulty.startsWith('ZS') ? 'ZS' : 'S';

    const transit = matchedStation || findClosestStation(gpxResult.trailhead, originStation);

    const isVerified = skitourenguruUrl.includes('?id=') || skitourenguruUrl.includes('/routes/');

    const newTour: SkiTour = {
      id: tourId,
      name: customName.trim(),
      subheading: `Skitour ab ${transit.station.name}`,
      mountainRange: mountainRange.trim() || 'Nordalpen',
      valley: valley.trim() || transit.station.name,
      type: 'day',
      isPiste,
      startElevation: gpxResult.startElevation,
      peakElevation: gpxResult.peakElevation,
      elevationGain: gpxResult.elevationGain,
      distanceKm: gpxResult.distanceKm,
      estimatedTourDurationHours: gpxResult.estimatedDurationHours,
      difficulty,
      difficultyCategory: cat,
      maxSafeAvalancheLevel: isPiste ? 4 : 2,
      exposition: 'N, O',
      coordinates: {
        trailhead: gpxResult.trailhead,
        summit: gpxResult.summit
      },
      gpxTrackCoordinates: gpxResult.trackCoordinates,
      transit: {
        origin: originStation.name,
        destinationStation: transit.station.name,
        cleanDbStationName: transit.cleanDbStationName,
        destinationIbnr: transit.station.ibnr || '8004593',
        destinationEva: transit.station.eva || transit.station.ibnr || '8100088',
        lines: transit.suggestedLines,
        transfers: 2,
        approxTotalMinutes: transit.approxTotalMinutes,
        walkingDistanceMeters: transit.walkingDistanceMeters,
        walkingDurationMinutes: transit.walkingDurationMinutes,
        dTicketValidity: transit.dTicketValidity,
        extraCostEuro: transit.extraCostEuro,
        transitDescription: transit.description,
        steps: [
          { station: originStation.name, action: 'departure', line: transit.suggestedLines[0] },
          { station: transit.station.name, action: 'arrival', note: `ca. ${transit.walkingDurationMinutes} min Fußweg zum Einstieg` }
        ]
      },
      links: {
        skitourenguruUrl: skitourenguruUrl.trim() || `https://www.skitourenguru.ch/?search=${encodeURIComponent(customName)}`,
        isVerifiedUrl: isVerified
      },
      rating: userRating,
      curatedComment: userComment.trim(),
      tips: [],
      isCustomTour: true
    };

    // Save metadata
    saveUserTourMeta(tourId, {
      tourId,
      peakName: customName.trim(),
      skitourenguruUrl: newTour.links.skitourenguruUrl,
      isVerifiedUrl: isVerified,
      rating: userRating,
      comment: userComment.trim()
    });

    // Save custom tour
    saveCustomTour(newTour);
    onTourAdded(newTour);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8 text-slate-800">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Mountain className="w-5 h-5 text-alpine-400" />
            <h3 className="font-bold text-base">Neue Skitour importieren</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: GPX File Upload */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              1. GPX-Datei hochladen (von Skitourenguru heruntergeladen)
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-alpine-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-alpine-50/50 transition-colors">
              <input
                type="file"
                accept=".gpx"
                onChange={handleFileUpload}
                className="hidden"
              />
              {gpxResult ? (
                <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                  <FileCheck className="w-5 h-5" />
                  <span>{gpxFileName} erfolgreich geladen!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500 space-y-1">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="font-semibold text-slate-700">GPX-Datei auswählen oder hierher ziehen</span>
                  <span className="text-[11px] text-slate-400">Automatische Höhen-, Distanz- und Track-Erkennung</span>
                </div>
              )}
            </label>
          </div>

          {/* Auto-extracted stats preview */}
          {gpxResult && (
            <div className="grid grid-cols-4 gap-2 bg-alpine-50 p-3 rounded-xl border border-alpine-200 text-center">
              <div>
                <div className="text-[10px] text-slate-500">Gipfel</div>
                <div className="font-bold text-slate-800">{gpxResult.peakElevation} m</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Aufstieg</div>
                <div className="font-bold text-emerald-700">+{gpxResult.elevationGain} hm</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Distanz</div>
                <div className="font-bold text-slate-800">{gpxResult.distanceKm} km</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Dauer</div>
                <div className="font-bold text-slate-800">{gpxResult.estimatedDurationHours} h</div>
              </div>
            </div>
          )}

          {/* Step 2: Skitourenguru URL */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>2. Skitourenguru Link (SSOT)</span>
              <span className="text-[10px] font-normal text-slate-400">z.B. https://www.skitourenguru.ch/?id=1482</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                value={skitourenguruUrl}
                onChange={(e) => setSkitourenguruUrl(e.target.value)}
                placeholder="https://www.skitourenguru.ch/?id=..."
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-alpine-500/30 focus:border-alpine-500 text-xs"
              />
            </div>
          </div>

          {/* Step 3: Tour Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Tourname / Gipfel</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="z.B. Thaneller"
                className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Gebirgsgruppe</label>
              <input
                type="text"
                value={mountainRange}
                onChange={(e) => setMountainRange(e.target.value)}
                placeholder="z.B. Lechtaler Alpen"
                className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Difficulty & Piste Toggle */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">SAC-Schwierigkeit</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as SACGrade)}
                className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
              >
                <option value="L">L (Leicht)</option>
                <option value="L+">L+</option>
                <option value="WS-">WS-</option>
                <option value="WS">WS (Wenig schwierig)</option>
                <option value="WS+">WS+</option>
                <option value="ZS-">ZS-</option>
                <option value="ZS">ZS (Ziemlich schwierig)</option>
                <option value="ZS+">ZS+</option>
                <option value="S-">S-</option>
                <option value="S">S (Schwierig)</option>
              </select>
            </div>
            <div className="pt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPiste}
                  onChange={(e) => setIsPiste(e.target.checked)}
                  className="rounded text-alpine-600 focus:ring-alpine-500 w-4 h-4"
                />
                <span className="font-bold text-slate-700">Pistenskitour (Skigebiet)</span>
              </label>
            </div>
          </div>

          {/* Step 4: Nearest Public Transit Matcher */}
          {matchedStation && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Train className="w-4 h-4 text-alpine-600" />
                  <span>ÖPNV-Zielbahnhof (ab {originStation.name}):</span>
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ca. {matchedStation.approxTotalMinutes} min Anreise
                </span>
              </div>

              {/* Station Selection Dropdown */}
              <select
                value={selectedStationId}
                onChange={(e) => handleStationChange(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold"
              >
                {KEY_STATIONS.filter(s => !s.isOrigin).map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.dTicketNotice || 'D-Ticket'})
                  </option>
                ))}
              </select>

              {/* Walking connection */}
              <div className="flex items-center space-x-2 text-slate-600 text-[11px] pt-1">
                <Footprints className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Fußweg vom Bahnhof zum Startpunkt: <strong>ca. {matchedStation.walkingDurationMinutes} min</strong> ({matchedStation.walkingDistanceMeters} m)
                </span>
              </div>
            </div>
          )}

          {/* Step 5: User Rating & Comment */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Deine Bewertung (optional):</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(userRating === star ? null : star)}
                    className="p-0.5 text-amber-400 hover:scale-125 transition-transform"
                    title={`${star} Sterne`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        userRating && userRating >= star ? 'fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                {userRating && (
                  <button
                    type="button"
                    onClick={() => setUserRating(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 ml-1"
                  >
                    Löschen
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Persönliche Notizen & Tipps:</label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Eigene Eindrücke, Schneeverhältnisse, Ausrüstungstipps..."
                rows={2}
                className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-300"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!gpxResult}
            className="px-5 py-2 bg-alpine-600 hover:bg-alpine-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Tour speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
};

