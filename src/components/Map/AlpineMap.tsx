import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SkiTour, AvalancheRegion, OriginStation } from '../../types';
import { TRANSIT_LINES, KEY_STATIONS } from '../../data/trainLines';
import { EAWS_COLORS } from '../../data/avalancheData';
import { Eye, EyeOff, Train, ShieldAlert, MapPin, Footprints } from 'lucide-react';

interface AlpineMapProps {
  tours: SkiTour[];
  selectedTour: SkiTour | null;
  onSelectTour: (tour: SkiTour) => void;
  avalancheRegions: AvalancheRegion[];
  originStation: OriginStation;
}

type BaseMapStyle = 'topo' | 'osm' | 'satellite';

export const AlpineMap: React.FC<AlpineMapProps> = ({
  tours,
  selectedTour,
  onSelectTour,
  avalancheRegions,
  originStation
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [showAvalancheLayer, setShowAvalancheLayer] = useState(true);
  const [showTransitLayer, setShowTransitLayer] = useState(true);
  const [baseStyle, setBaseStyle] = useState<BaseMapStyle>('topo');
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  // Initialize Map in crisp, reliable 2D
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyle('topo'),
      center: [10.80, 47.65], // Center between Augsburg & Alps
      zoom: 8.5,
      pitch: 0,
      bearing: 0,
      maxPitch: 0 // Keep strictly 2D for rock-solid stability
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      addAvalancheLayers(map, avalancheRegions);
      addTransitLayers(map);
      addActiveTrackLayers(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update base map style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(getMapStyle(baseStyle));
    map.once('style.load', () => {
      addAvalancheLayers(map, avalancheRegions);
      addTransitLayers(map);
      addActiveTrackLayers(map);
      updateSelectedTourTrack(selectedTour);
    });
  }, [baseStyle]);

  // Add Avalanche GeoJSON Layer
  const addAvalancheLayers = (map: maplibregl.Map, regions: AvalancheRegion[]) => {
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: regions.map(reg => ({
        type: 'Feature',
        properties: {
          id: reg.id,
          name: reg.name,
          dangerLevel: reg.dangerLevel,
          label: reg.dangerLevelLabel,
          isSeasonActive: reg.isSeasonActive,
          problems: reg.avalancheProblems.join(', '),
          lastUpdated: reg.lastUpdated
        },
        geometry: {
          type: 'Polygon',
          coordinates: reg.polygonCoordinates
        }
      }))
    };

    if (map.getSource('avalanche-regions')) {
      (map.getSource('avalanche-regions') as maplibregl.GeoJSONSource).setData(geojson);
      return;
    }

    map.addSource('avalanche-regions', {
      type: 'geojson',
      data: geojson
    });

    // Fill layer: if off-season, use subtle transparent slate; if active winter, use EAWS color
    map.addLayer({
      id: 'avalanche-fill',
      type: 'fill',
      source: 'avalanche-regions',
      layout: {
        visibility: showAvalancheLayer ? 'visible' : 'none'
      },
      paint: {
        'fill-color': [
          'case',
          ['!', ['get', 'isSeasonActive']],
          '#94a3b8', // Subtle neutral gray during off-season
          [
            'match',
            ['get', 'dangerLevel'],
            1, '#ccff66',
            2, '#ffff00',
            3, '#ff9900',
            4, '#ff0000',
            5, '#800000',
            '#cccccc'
          ]
        ],
        'fill-opacity': [
          'case',
          ['!', ['get', 'isSeasonActive']],
          0.08, // Very subtle during off-season
          0.28
        ]
      }
    });

    map.addLayer({
      id: 'avalanche-line',
      type: 'line',
      source: 'avalanche-regions',
      layout: {
        visibility: showAvalancheLayer ? 'visible' : 'none'
      },
      paint: {
        'line-color': [
          'case',
          ['!', ['get', 'isSeasonActive']],
          '#64748b',
          '#ea580c'
        ],
        'line-width': 1.5,
        'line-dasharray': [3, 2]
      }
    });

    map.on('mouseenter', 'avalanche-fill', (e) => {
      if (e.features && e.features[0]) {
        const props = e.features[0].properties;
        if (!props.isSeasonActive) {
          setHoveredInfo(`❄️ ${props.name}: Saisonpause (Lagebericht startet im Winter)`);
        } else {
          setHoveredInfo(`⚠️ Lawinengebiet: ${props.name} | Stufe ${props.dangerLevel} (${props.label})`);
        }
      }
    });

    map.on('mouseleave', 'avalanche-fill', () => {
      setHoveredInfo(null);
    });
  };

  // Add Transit Overlay
  const addTransitLayers = (map: maplibregl.Map) => {
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: TRANSIT_LINES.map(line => ({
        type: 'Feature',
        properties: {
          id: line.id,
          name: line.name,
          color: line.color,
          category: line.category,
          dTicket: line.dTicketStatus
        },
        geometry: {
          type: 'LineString',
          coordinates: line.coordinates
        }
      }))
    };

    if (map.getSource('transit-lines')) {
      (map.getSource('transit-lines') as maplibregl.GeoJSONSource).setData(geojson);
      return;
    }

    map.addSource('transit-lines', {
      type: 'geojson',
      data: geojson
    });

    map.addLayer({
      id: 'transit-lines-casing',
      type: 'line',
      source: 'transit-lines',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: showTransitLayer ? 'visible' : 'none'
      },
      paint: {
        'line-color': '#ffffff',
        'line-width': 5,
        'line-opacity': 0.85
      }
    });

    map.addLayer({
      id: 'transit-lines',
      type: 'line',
      source: 'transit-lines',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: showTransitLayer ? 'visible' : 'none'
      },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 3,
        'line-dasharray': [
          'case',
          ['==', ['get', 'category'], 'bus'],
          ['literal', [2, 2]],
          ['literal', [1]]
        ]
      }
    });

    map.on('mouseenter', 'transit-lines', (e) => {
      if (e.features && e.features[0]) {
        const props = e.features[0].properties;
        setHoveredInfo(`🚆 ${props.name} | D-Ticket: ${props.dTicket}`);
      }
    });

    map.on('mouseleave', 'transit-lines', () => {
      setHoveredInfo(null);
    });
  };

  // Add Active Tour Track Layers
  const addActiveTrackLayers = (map: maplibregl.Map) => {
    if (!map.getSource('active-tour-track')) {
      map.addSource('active-tour-track', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'active-tour-track-glow',
        type: 'line',
        source: 'active-tour-track',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#0284c7',
          'line-width': 7,
          'line-opacity': 0.5,
          'line-blur': 2
        }
      });

      map.addLayer({
        id: 'active-tour-track',
        type: 'line',
        source: 'active-tour-track',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#0369a1',
          'line-width': 3.5
        }
      });
    }
  };

  const updateSelectedTourTrack = (tour: SkiTour | null) => {
    const map = mapRef.current;
    if (!map || !map.getSource('active-tour-track')) return;

    if (!tour || !tour.gpxTrackCoordinates || tour.gpxTrackCoordinates.length === 0) {
      (map.getSource('active-tour-track') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }

    (map.getSource('active-tour-track') as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: tour.name },
          geometry: {
            type: 'LineString',
            coordinates: tour.gpxTrackCoordinates
          }
        }
      ]
    });
  };

  useEffect(() => {
    updateSelectedTourTrack(selectedTour);
  }, [selectedTour]);

  // Update visibility toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer('avalanche-fill')) {
      map.setLayoutProperty('avalanche-fill', 'visibility', showAvalancheLayer ? 'visible' : 'none');
    }
    if (map.getLayer('avalanche-line')) {
      map.setLayoutProperty('avalanche-line', 'visibility', showAvalancheLayer ? 'visible' : 'none');
    }
    if (map.getLayer('transit-lines')) {
      map.setLayoutProperty('transit-lines', 'visibility', showTransitLayer ? 'visible' : 'none');
    }
    if (map.getLayer('transit-lines-casing')) {
      map.setLayoutProperty('transit-lines-casing', 'visibility', showTransitLayer ? 'visible' : 'none');
    }
  }, [showAvalancheLayer, showTransitLayer]);

  // Render Tour Markers & Origin Pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Origin Station Pin (Updates dynamically when originStation changes!)
    const originEl = document.createElement('div');
    originEl.className = 'flex flex-col items-center cursor-pointer group z-20';
    originEl.innerHTML = `
      <div class="px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded-full shadow-lg border-2 border-white flex items-center space-x-1 animate-pulse">
        <span>📍 Start: ${originStation.name}</span>
      </div>
      <div class="w-2.5 h-2.5 bg-red-600 rotate-45 -mt-1 shadow-sm"></div>
    `;
    const originMarker = new maplibregl.Marker({ element: originEl })
      .setLngLat(originStation.coordinates)
      .addTo(map);
    markersRef.current.push(originMarker);

    // Key Alpine Transit Stations
    KEY_STATIONS.filter(s => s.id !== originStation.id && s.isKeyHub).forEach(station => {
      const stEl = document.createElement('div');
      stEl.className = 'w-3 h-3 bg-white border-2 border-slate-700 rounded-full shadow hover:scale-125 transition-transform';
      stEl.title = `Bahnhof: ${station.name}`;
      const marker = new maplibregl.Marker({ element: stEl })
        .setLngLat(station.coordinates)
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Tour Summit Markers
    tours.forEach(tour => {
      const isSelected = selectedTour?.id === tour.id;
      const el = document.createElement('div');
      el.className = `cursor-pointer transition-all duration-200 transform ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
      }`;

      const badgeColor = tour.isPiste 
        ? 'bg-amber-500 border-amber-200' 
        : tour.difficultyCategory === 'L' 
        ? 'bg-emerald-600 border-emerald-200'
        : tour.difficultyCategory === 'WS'
        ? 'bg-blue-600 border-blue-200'
        : 'bg-rose-600 border-rose-200';

      el.innerHTML = `
        <div class="flex flex-col items-center">
          <div class="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-md border ${badgeColor}">
            <span>${tour.name}</span>
            <span class="text-[9px] opacity-90">${tour.peakElevation}m</span>
          </div>
          <div class="w-2 h-2 ${badgeColor.split(' ')[0]} rotate-45 -mt-1 shadow-sm"></div>
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectTour(tour);
        map.flyTo({
          center: tour.coordinates.summit,
          zoom: Math.max(map.getZoom(), 11.5),
          duration: 900
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(tour.coordinates.summit)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [tours, selectedTour, originStation]);

  // Fly to selected tour
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedTour) return;

    map.flyTo({
      center: selectedTour.coordinates.summit,
      zoom: 11.5,
      duration: 800
    });
  }, [selectedTour]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Map Canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Hover Info Tooltip Bar */}
      {hoveredInfo && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur border border-slate-700 pointer-events-none transition-all z-20 flex items-center space-x-2">
          <span>{hoveredInfo}</span>
        </div>
      )}

      {/* Floating Map Controls Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-slate-200/80 p-1.5 flex flex-col space-y-1 text-xs">
          {/* Base Layer Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => setBaseStyle('topo')}
              className={`px-2 py-1 rounded-md font-medium text-[11px] transition-colors ${
                baseStyle === 'topo' ? 'bg-white text-alpine-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Topografische Reliefkarte (OpenTopoMap)"
            >
              Topo
            </button>
            <button
              onClick={() => setBaseStyle('osm')}
              className={`px-2 py-1 rounded-md font-medium text-[11px] transition-colors ${
                baseStyle === 'osm' ? 'bg-white text-alpine-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="OpenStreetMap Standardkarte"
            >
              Standard
            </button>
            <button
              onClick={() => setBaseStyle('satellite')}
              className={`px-2 py-1 rounded-md font-medium text-[11px] transition-colors ${
                baseStyle === 'satellite' ? 'bg-white text-alpine-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Satelliten-Orthofoto"
            >
              Satellit
            </button>
          </div>

          <div className="h-px bg-slate-200 my-0.5" />

          {/* Avalanche Warning Layer Toggle */}
          <button
            onClick={() => setShowAvalancheLayer(!showAvalancheLayer)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
              showAvalancheLayer 
                ? 'bg-amber-500/15 text-amber-900 font-semibold border border-amber-300/60' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Lawinengebiete</span>
            </span>
            {showAvalancheLayer ? <Eye className="w-3.5 h-3.5 text-amber-700" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Train Lines Layer Toggle */}
          <button
            onClick={() => setShowTransitLayer(!showTransitLayer)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
              showTransitLayer 
                ? 'bg-blue-500/15 text-blue-900 font-semibold border border-blue-300/60' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Train className="w-3.5 h-3.5 text-blue-600" />
              <span>Öffi-Bahnlinien</span>
            </span>
            {showTransitLayer ? <Eye className="w-3.5 h-3.5 text-blue-700" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Legend Box Bottom-Right */}
      <div className="absolute bottom-6 right-3 z-10 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-200/90 text-xs hidden sm:block max-w-[230px]">
        <div className="font-bold text-slate-800 mb-1.5 flex items-center justify-between">
          <span>Legende</span>
          <span className="text-[10px] text-slate-500 font-normal">Start: {originStation.name}</span>
        </div>

        {/* Transit lines preview */}
        <div className="space-y-1 text-[11px] text-slate-700">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-[#0284c7] rounded-full inline-block"></span>
            <span className="truncate">RE 17 Allgäu / Oberstdorf</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-[#16a34a] rounded-full inline-block"></span>
            <span className="truncate">RB 60 Außerfernbahn</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-[#8b5cf6] rounded-full inline-block"></span>
            <span className="truncate">RB 6 Werdenfels / Karwendel</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-[#06b6d4] border-b border-dashed border-white rounded-full inline-block"></span>
            <span className="truncate">Walserbus 1 (100% D-Ticket)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// MapLibre Styles Helper (Strict 2D)
function getMapStyle(style: BaseMapStyle): maplibregl.StyleSpecification {
  if (style === 'osm') {
    return {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
      },
      layers: [
        { id: 'osm-layer', type: 'raster', source: 'osm-tiles', minzoom: 0, maxzoom: 19 }
      ]
    };
  }

  if (style === 'satellite') {
    return {
      version: 8,
      sources: {
        'satellite-tiles': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Tiles &copy; Esri, i-cubed, USDA, USGS'
        }
      },
      layers: [
        { id: 'satellite-layer', type: 'raster', source: 'satellite-tiles', minzoom: 0, maxzoom: 19 }
      ]
    };
  }

  return {
    version: 8,
    sources: {
      'opentopomap-tiles': {
        type: 'raster',
        tiles: [
          'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
          'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
          'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: 'Kartendaten: &copy; OpenStreetMap, SRTM | OpenTopoMap'
      }
    },
    layers: [
      { id: 'opentopomap-layer', type: 'raster', source: 'opentopomap-tiles', minzoom: 0, maxzoom: 18 }
    ]
  };
}
