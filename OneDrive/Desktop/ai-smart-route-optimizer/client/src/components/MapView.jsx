// MapView.jsx — Interactive Map with Leaflet + Route Visualization
import { useEffect, useRef, useState } from 'react';

let L;

export default function MapView({ locations, optimizedRoute, routeGeometry, energyStations, loading, isNavigationMode }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const stationMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'petrol', 'cng', 'ev'

  // Dynamically import leaflet
  useEffect(() => {
    import('leaflet').then(mod => {
      L = mod.default;
      setLeafletReady(true);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current, {
      center: [19.0760, 72.8777], // Mumbai default
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletReady]);

  // Update markers when locations change
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (locations.length === 0) return;

    // Add markers
    locations.forEach((loc, i) => {
      const isFirst = i === 0;
      const isLast = i === locations.length - 1;
      const color = isFirst ? '#00ff88' : isLast ? '#ff6b2b' : '#00d4ff';
      const label = isFirst ? `🚀 Origin: ${loc.name}` : isLast ? `🏁 Destination: ${loc.name}` : `📍 ${loc.name}`;

      const icon = L.divIcon({
        html: `<div style="
          padding: 6px 14px;
          background:${color};
          border:2px solid white;
          border-radius:16px;
          display:inline-flex;align-items:center;justify-content:center;
          font-size:12px;
          font-weight:800;
          color:${isFirst || isLast ? 'white' : '#05070f'};
          box-shadow:0 0 12px ${color}80;
          font-family:Inter,sans-serif;
          white-space:nowrap;
        ">${label}</div>`,
        className: '',
        iconSize: null,
      });

      const marker = L.marker([loc.lat, loc.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:150px">
            <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;color:#00d4ff">
              ${isFirst ? '🚀 Origin' : isLast ? '🏁 Final Stop' : `📦 Stop ${i + 1}`}
            </div>
            <div style="font-size:0.75rem;color:#8892b0">${loc.name || ''}</div>
            <div style="font-size:0.7rem;color:#4a5568;margin-top:4px;font-family:monospace">
              ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}
            </div>
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Fit map to markers
    const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

  }, [locations, leafletReady]);

    // Update Energy Station markers
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;

    // Remove old station markers
    stationMarkersRef.current.forEach(m => m.remove());
    stationMarkersRef.current = [];

    if (!energyStations || energyStations.length === 0) return;

    // Apply Filter Logic
    const filteredStations = energyStations.filter(station => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'ev' && station.type === 'ev') return true;
      if (activeFilter === 'petrol' && station.type === 'fuel') return true;
      if (activeFilter === 'cng' && station.type === 'fuel' && station.name.toLowerCase().includes('cng')) return true;
      return false;
    });

    filteredStations.forEach(station => {
      const color = station.type === 'ev' ? '#00ff88' : station.name?.toLowerCase().includes('cng') ? '#00d4ff' : '#ff6b2b';
      const label = station.type === 'ev' ? '⚡' : station.name?.toLowerCase().includes('cng') ? '🔵' : '⛽';
      
      const icon = L.divIcon({
        html: `<div style="
          width:26px;height:26px;
          background: rgba(12, 16, 34, 0.9);
          border: 2px solid ${color};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          box-shadow: 0 0 8px ${color}80;
        ">${label}</div>`,
        className: '',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([station.lat, station.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:150px;font-size:12px;">
            <strong style="color:${color};font-size:14px;">${label} ${station.name}</strong><br/>
            <span style="color:#8892b0;">${station.brand || 'Unbranded'}</span><br/>
            Type: ${station.type === 'ev' ? 'EV Charging' : 'Fuel Station'}
          </div>
        `);
      
      stationMarkersRef.current.push(marker);
    });

  }, [energyStations, leafletReady]);

  // Draw route polyline
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const coords = routeGeometry?.length > 0
      ? routeGeometry
      : optimizedRoute?.length > 0
        ? optimizedRoute.map(l => [l.lat, l.lng])
        : null;

    if (!coords || coords.length < 2) return;

    // Animated gradient polyline
    polylineRef.current = L.polyline(coords, {
      color: '#00d4ff',
      weight: 4,
      opacity: 0.85,
      smoothFactor: 2,
    }).addTo(mapInstanceRef.current);

    // Also draw glow layer
    L.polyline(coords, {
      color: '#7c3aed',
      weight: 8,
      opacity: 0.2,
      smoothFactor: 2,
    }).addTo(mapInstanceRef.current);

    if (!isNavigationMode) {
      mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
    }
  }, [routeGeometry, optimizedRoute, leafletReady, isNavigationMode]);

  // Handle Live Navigation Updates
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;

    const handleLocUpdate = (e) => {
      const [lat, lng] = e.detail;
      
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          html: `<div style="width:24px;height:24px;background:#00d4ff;border:3px solid #fff;border-radius:50%;box-shadow:0 0 15px rgba(0,212,255,0.8);position:relative;">
                  <div style="content:'';position:absolute;top:-10px;left:-10px;right:-10px;bottom:-10px;background:rgba(0,212,255,0.2);border-radius:50%;animation:pulse 2s infinite;"></div>
                 </div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
      } else {
        userMarkerRef.current.setLatLng([lat, lng]);
      }
      
      // Auto-pan map to user
      mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
    };

    window.addEventListener('NAV_LOCATION_UPDATE', handleLocUpdate);
    return () => window.removeEventListener('NAV_LOCATION_UPDATE', handleLocUpdate);
  }, [leafletReady]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="loading-ring" />
            <div className="loading-ring" />
            <div className="loading-ring" />
          </div>
          <div className="loading-text">
            <strong>🤖 AI Agents Processing</strong>
            Route Agent → Traffic Agent → Decision Agent
          </div>
          <div className="step-list">
            {[
              "Route Agent (2-Opt Optimizer)…",
              "Traffic Agent (LSTM Prediction)…",
              "Weather API Integration…",
              "Decision Agent (LLM Reasoning)…",
            ].map((step, i) => (
              <div key={i} className={`step-item ${i === 0 ? 'active' : ''}`}>
                <div className="step-dot" />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Energy Station Filters */}
      {energyStations?.length > 0 && (
        <div style={{
          position: 'absolute', top: 20, right: 20, zIndex: 999,
          display: 'flex', gap: 8, background: 'rgba(5,7,15,0.85)',
          padding: '6px 12px', borderRadius: '24px', backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle)'
        }}>
          {['all', 'petrol', 'cng', 'ev'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                background: activeFilter === filter ? 'var(--accent-purple)' : 'transparent',
                color: activeFilter === filter ? '#fff' : 'var(--text-secondary)',
                border: 'none', padding: '4px 10px', borderRadius: '16px',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {filter === 'all' ? 'All Stations' : filter === 'petrol' ? '⛽ Petrol' : filter === 'cng' ? '🔵 CNG' : '⚡ EV'}
            </button>
          ))}
        </div>
      )}

      {/* Dark map overlay hint */}
      {locations.length === 0 && !loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 10
        }}>
          <div style={{
            background: 'rgba(5,7,15,0.8)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px',
            padding: '24px 32px', textAlign: 'center', maxWidth: '320px'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🗺️</div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: '#00d4ff' }}>
              Interactive AI Map
            </div>
            <div style={{ fontSize: '0.82rem', color: '#8892b0', lineHeight: 1.6 }}>
              Add delivery stops in the sidebar and click<br />
              <span style={{ color: '#00d4ff' }}>Optimize Route</span> to see the AI in action
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
