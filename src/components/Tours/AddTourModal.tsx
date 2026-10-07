import React, { useState } from 'react';
import { parseGpxString, ParsedGpxResult } from '../../utils/gpxParser';
import { findClosestStation, buildStationTransitResult, calculateDistanceMeters, StationMatchResult } from '../../utils/stationMatcher';
import { getAllMasterStations, searchPublicTransitStops, saveCustomStation, MasterStation } from '../../data/trainLines';
import { SkiTour, SACGrade, SACCategory } from '../../types';
import { saveCustomTour, saveUserTourMeta } from '../../data/userMeta';
import {
  X,
  Upload,
  FileCheck,
  Mountain,
  Train,
  Star,
  CheckCircle,
  AlertCircle,
  Footprints,
  Search,
  Plus
} from 'lucide-react';

interface AddTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  originStation: MasterStation;
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
  const [difficulty, setDifficulty] = useState<SACGrade>('WS');
  const [isPiste, setIsPiste] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<MasterStation | null>(null);
  const [matchedTransit, setMatchedTransit] = useState<StationMatchResult | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Station search / filter
  const [stationSearchQuery, setStationSearchQuery] = useState<string>('');
  const [stationSearchResults, setStationSearchResults] = useState<MasterStation[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState<boolean>(false);

  if (!isOpen) return null;

  const allStations = getAllMasterStations();

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

        // Auto-match nearest station purely based on coordinates
        const match = findClosestStation(parsed.trailhead);
        setSelectedStation(match.station);
        setMatchedTransit(match);
      } catch (err: any) {
        setErrorMsg(err.message || 'Fehler beim Parsen der GPX-Datei.');
      }
    };

    reader.readAsText(file);
  };

  // Station selection changed
  const handleSelectStation = (station: MasterStation) => {
    setSelectedStation(station);
    if (!gpxResult) return;
    const dist = calculateDistanceMeters(
      gpxResult.trailhead[1],
      gpxResult.trailhead[0],
      station.coordinates[1],
      station.coordinates[0]
    );
    const transit = buildStationTransitResult(station, dist);
    setMatchedTransit(transit);
  };

  // Online stop search for bus or train stops
  const handleSearchStops = async (q: string) => {
    setStationSearchQuery(q);
    if (q.trim().length < 2) {
      setStationSearchResults([]);
      return;
    }
    setIsSearchingOnline(true);
    try {
      const results = await searchPublicTransitStops(q);
      setStationSearchResults(results);
    } catch {
      setStationSearchResults([]);
    } finally {
      setIsSearchingOnline(false);
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

    const station = selectedStation || findClosestStation(gpxResult.trailhead).station;
    const walkDist = calculateDistanceMeters(
      gpxResult.trailhead[1],
      gpxResult.trailhead[0],
      station.coordinates[1],
      station.coordinates[0]
    );
    const transitResult = matchedTransit || buildStationTransitResult(station, walkDist);

    const tourId = 'custom-' + customName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    const cat: SACCategory = difficulty.startsWith('L') ? 'L' : difficulty.startsWith('WS') ? 'WS' : difficulty.startsWith('ZS') ? 'ZS' : 'S';

    // If new custom station, persist it to station catalog
    if (station.isCustom) {
      saveCustomStation(station);
    }

    const cleanGuruUrl = skitourenguruUrl.trim();

    const newTour: SkiTour = {
      id: tourId,
      name: customName.trim(),
      mountainRange: gpxResult.mountainRange,
      valley: transitResult.station.name,
      type: 'day',
      isPiste,
      startElevation: gpxResult.startElevation,
      peakElevation: gpxResult.peakElevation,
      elevationGain: gpxResult.elevationGain,
      distanceKm: gpxResult.distanceKm,
      estimatedTourDurationHours: gpxResult.estimatedDurationHours,
      difficulty,
      difficultyCategory: cat,
      coordinates: {
        trailhead: gpxResult.trailhead,
        summit: gpxResult.summit
      },
      gpxTrackCoordinates: gpxResult.trackCoordinates,
      transit: {
        origin: originStation.name,
        destinationStation: transitResult.station.name,
        cleanDbStationName: transitResult.cleanDbStationName,
        destinationIbnr: transitResult.station.ibnr || '8000000',
        destinationEva: transitResult.station.eva || transitResult.station.ibnr || '8000000',
        walkingDistanceMeters: transitResult.walkingDistanceMeters,
        walkingDurationMinutes: transitResult.walkingDurationMinutes,
        dTicketValidity: transitResult.dTicketValidity,
        extraCostEuro: transitResult.extraCostEuro
      },
      links: {
        skitourenguruUrl: cleanGuruUrl || undefined
      },
      rating: userRating,
      curatedComment: userComment.trim(),
      isCustomTour: true
    };

    // Save metadata
    saveUserTourMeta(tourId, {
      tourId,
      peakName: customName.trim(),
      skitourenguruUrl: cleanGuruUrl || undefined,
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

          {/* Step 1: GPX Upload */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">1. GPX-Datei hochladen (Single Source of Truth):</label>
            <label className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
              gpxResult ? 'border-emerald-400 bg-emerald-50/40' : 'border-slate-300 hover:border-alpine-400 bg-slate-50'
            }`}>
              <input
                type="file"
                accept=".gpx"
                onChange={handleFileUpload}
                className="hidden"
              />
              {gpxResult ? (
                <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span>{gpxFileName} erfolgreich geladen!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1 text-slate-500">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="font-semibold text-slate-700">GPX-Datei auswählen oder hierher ziehen</span>
                  <span className="text-[10px] text-slate-400">Extrahiert automatisch Höhenprofil, Gehzeit & Distanz</span>
                </div>
              )}
            </label>
          </div>

          {/* Extracted Metrics Preview */}
          {gpxResult && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>Automatisch aus GPX ermittelt:</span>
                <span className="text-alpine-700 font-bold bg-alpine-50 px-2 py-0.5 rounded text-[11px] border border-alpine-200">
                  {gpxResult.mountainRange}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">Gipfel</div>
                  <div className="font-bold text-slate-800">{gpxResult.peakElevation} m</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">Aufstieg</div>
                  <div className="font-bold text-emerald-700">+{gpxResult.elevationGain} hm</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">Strecke</div>
                  <div className="font-bold text-slate-800">{gpxResult.distanceKm} km</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">Tourdauer</div>
                  <div className="font-bold text-slate-800">{gpxResult.estimatedDurationHours} h</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tour Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">2. Gipfel / Tourenname:</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="z.B. Bleispitze"
              className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>

          {/* Step 3: Difficulty & Piste */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">SAC-Schwierigkeit:</label>
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

          {/* Step 4: Nearest Public Transit Destination (Unified Station Catalog) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Train className="w-4 h-4 text-alpine-600" />
                <span>ÖPNV-Zielbahnhof / Haltestelle:</span>
              </span>
              {selectedStation && (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedStation.name}
                </span>
              )}
            </div>

            {/* Station Picker Dropdown from Unified Database */}
            <select
              value={selectedStation?.id || ''}
              onChange={(e) => {
                const found = allStations.find(s => s.id === e.target.value);
                if (found) handleSelectStation(found);
              }}
              className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold"
            >
              {allStations.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} {st.type === 'bus' ? '(Bus)' : '(Bahn)'}
                </option>
              ))}
            </select>

            {/* Optional Online Search for any bus or train stop */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] text-slate-500 font-medium">Andere Haltestelle / Busstation online suchen:</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={stationSearchQuery}
                  onChange={(e) => handleSearchStops(e.target.value)}
                  placeholder="z.B. Baad, Tannheim, Oberjoch..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                />
              </div>

              {stationSearchResults.length > 0 && (
                <div className="max-h-28 overflow-y-auto bg-white rounded-lg border border-slate-200 shadow-sm mt-1 divide-y divide-slate-100">
                  {stationSearchResults.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        handleSelectStation(st);
                        setStationSearchResults([]);
                        setStationSearchQuery('');
                      }}
                      className="w-full text-left p-1.5 hover:bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">{st.name}</span>
                      <span className="text-[10px] text-slate-400">{st.type === 'bus' ? 'Bus' : 'Bahn'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Calculated walking connection */}
            {matchedTransit && (
              <div className="flex items-center space-x-2 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                <Footprints className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Berechneter Fußweg zum Startpunkt: <strong>ca. {matchedTransit.walkingDurationMinutes} min</strong> ({matchedTransit.walkingDistanceMeters} m)
                </span>
              </div>
            )}
          </div>

          {/* Step 5: Optional Skitourenguru URL */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Skitourenguru URL (optional):</span>
              <span className="text-[10px] text-slate-400">Kann freigelassen werden</span>
            </label>
            <input
              type="url"
              value={skitourenguruUrl}
              onChange={(e) => setSkitourenguruUrl(e.target.value)}
              placeholder="https://www.skitourenguru.ch/?id=..."
              className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {/* Step 6: User Rating & Comment */}
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
