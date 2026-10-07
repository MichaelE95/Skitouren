import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SkiTour, AvalancheRegion, MasterStation } from '../../types';
import { getAllMasterStations } from '../../data/trainLines';
import { EAWS_COLORS } from '../../data/avalancheData';
import { Eye, EyeOff, ShieldAlert, Footprints } from 'lucide-react';

interface AlpineMapProps {
  tours: SkiTour[];
  selectedTour: SkiTour | null;
  onSelectTour: (tour: SkiTour) => void;
  avalancheRegions: AvalancheRegion[];
  originStation: MasterStation;
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
      maxPitch: 0 // Strict 2D
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      addAvalancheLayers(map, avalancheRegions);
      addActiveTrackLayers(map);
      updateSelectedTourTrack(selectedTour);
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
          '#94a3b8',
          ['==', ['get', 'dangerLevel'], 1],
          EAWS_COLORS[1].bg,
          ['==', ['get', 'dangerLevel'], 2],
          EAWS_COLORS[2].bg,
          ['==', ['get', 'dangerLevel'], 3],
          EAWS_COLORS[3].bg,
          ['==', ['get', 'dangerLevel'], 4],
          EAWS_COLORS[4].bg,
          EAWS_COLORS[5].bg
        ],
        'fill-opacity': [
          'case',
          ['!', ['get', 'isSeasonActive']],
          0.12,
          0.32
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

  // Add Active Tour Track Layers (Ski Tour GPX + Walking Connection to Station)
  const addActiveTrackLayers = (map: maplibregl.Map) => {
    // 1. Ski Tour GPX Track
    if (!map.getSource('active-tour-track')) {
      map.addSource('active-tour-track', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Outer glow for great contrast on satellite & topo
      map.addLayer({
        id: 'active-tour-track-glow',
        type: 'line',
        source: 'active-tour-track',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#0284c7',
          'line-width': 8,
          'line-opacity': 0.6,
          'line-blur': 2
        }
      });

      map.addLayer({
        id: 'active-tour-track',
        type: 'line',
        source: 'active-tour-track',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 4
        }
      });
    }

    // 2. Walking Path from Station to Trailhead
    if (!map.getSource('active-walk-track')) {
      map.addSource('active-walk-track', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'active-walk-track',
        type: 'line',
        source: 'active-walk-track',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#16a34a',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      });
    }
  };

  // Update selected tour track
  const updateSelectedTourTrack = (tour: SkiTour | null) => {
    const map = mapRef.current;
    if (!map || !map.getSource('active-tour-track')) return;

    if (!tour || !tour.gpxTrackCoordinates || tour.gpxTrackCoordinates.length === 0) {
      (map.getSource('active-tour-track') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: []
      });
      if (map.getSource('active-walk-track')) {
        (map.getSource('active-walk-track') as maplibregl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      return;
    }

    // Highlight GPX ski tour track
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

    // Find destination station coordinates to draw walk connection
    const allStations = getAllMasterStations();
    const destStation = allStations.find(s =>
      s.name === tour.transit.destinationStation ||
      s.cleanDbName === tour.transit.cleanDbStationName
    );

    if (destStation && map.getSource('active-walk-track')) {
      (map.getSource('active-walk-track') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Fußweg zum Einstieg' },
            geometry: {
              type: 'LineString',
              coordinates: [destStation.coordinates, tour.coordinates.trailhead]
            }
          }
        ]
      });
    }
  };

  useEffect(() => {
    updateSelectedTourTrack(selectedTour);
  }, [selectedTour]);

  // Update avalanche layer visibility toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer('avalanche-fill')) {
      map.setLayoutProperty('avalanche-fill', 'visibility', showAvalancheLayer ? 'visible' : 'none');
    }
    if (map.getLayer('avalanche-line')) {
      map.setLayoutProperty('avalanche-line', 'visibility', showAvalancheLayer ? 'visible' : 'none');
    }
  }, [showAvalancheLayer]);

  // Render Tour Markers & Origin Pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Origin Station Pin
    const originEl = document.createElement('div');
    originEl.className = 'flex flex-col items-center cursor-pointer group z-20';
    originEl.innerHTML = `
      <div class="px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded-full shadow-lg border-2 border-white flex items-center space-x-1">
        <span>📍 Start: ${originStation.name}</span>
      </div>
      <div class="w-2.5 h-2.5 bg-red-600 rotate-45 -mt-1 shadow-sm"></div>
    `;
    const originMarker = new maplibregl.Marker({ element: originEl })
      .setLngLat(originStation.coordinates)
      .addTo(map);
    markersRef.current.push(originMarker);

    // Selected Tour Destination Station Pin (if a tour is active)
    if (selectedTour) {
      const allStations = getAllMasterStations();
      const destStation = allStations.find(s =>
        s.name === selectedTour.transit.destinationStation ||
        s.cleanDbName === selectedTour.transit.cleanDbStationName
      );

      if (destStation) {
        const destEl = document.createElement('div');
        destEl.className = 'flex flex-col items-center cursor-pointer z-25';
        destEl.innerHTML = `
          <div class="px-2 py-0.5 bg-sky-700 text-white font-bold text-[11px] rounded-full shadow-md border border-white flex items-center space-x-1">
            <span>🚆 Ziel: ${destStation.name}</span>
          </div>
          <div class="w-2 h-2 bg-sky-700 rotate-45 -mt-1 shadow-xs"></div>
        `;
        const destMarker = new maplibregl.Marker({ element: destEl })
          .setLngLat(destStation.coordinates)
          .addTo(map);
        markersRef.current.push(destMarker);

        // Trailhead start pin
        const thEl = document.createElement('div');
        thEl.className = 'w-3.5 h-3.5 bg-emerald-600 border-2 border-white rounded-full shadow-md';
        thEl.title = `Einstieg: ${selectedTour.name}`;
        const thMarker = new maplibregl.Marker({ element: thEl })
          .setLngLat(selectedTour.coordinates.trailhead)
          .addTo(map);
        markersRef.current.push(thMarker);
      }
    }

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
                baseStyle === 'topo' ? 'bg-white text-alpine-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Topografische Reliefkarte (OpenTopoMap)"
            >
              Topo
            </button>
            <button
              onClick={() => setBaseStyle('osm')}
              className={`px-2 py-1 rounded-md font-medium text-[11px] transition-colors ${
                baseStyle === 'osm' ? 'bg-white text-alpine-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="OpenStreetMap Standardkarte"
            >
              Standard
            </button>
            <button
              onClick={() => setBaseStyle('satellite')}
              className={`px-2 py-1 rounded-md font-medium text-[11px] transition-colors ${
                baseStyle === 'satellite' ? 'bg-white text-alpine-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
          attribution: '&copy; OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  }

  if (style === 'satellite') {
    return {
      version: 8,
      sources: {
        'satellite-tiles': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite-tiles',
          minzoom: 0,
          maxzoom: 18
        }
      ]
    };
  }

  // Default: Topographic Map (OpenTopoMap)
  return {
    version: 8,
    sources: {
      'opentopo-tiles': {
        type: 'raster',
        tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        maxzoom: 17,
        attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap (CC-BY-SA)'
      }
    },
    layers: [
      {
        id: 'opentopo-layer',
        type: 'raster',
        source: 'opentopo-tiles',
        minzoom: 0,
        maxzoom: 17
      }
    ]
  };
}
