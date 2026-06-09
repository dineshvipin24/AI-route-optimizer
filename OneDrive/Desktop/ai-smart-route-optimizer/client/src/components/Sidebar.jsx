// Sidebar.jsx — Location input, stop management, optimization controls
import { useState } from 'react';
import toast from 'react-hot-toast';

const MUMBAI_PRESETS = [
  { name: "Chhatrapati Shivaji Terminus", lat: 18.9398, lng: 72.8355 },
  { name: "Bandra Station", lat: 19.0544, lng: 72.8392 },
  { name: "Dharavi", lat: 19.0396, lng: 72.8552 },
  { name: "Juhu Beach", lat: 19.0989, lng: 72.8265 },
  { name: "Andheri Station", lat: 19.1136, lng: 72.8697 },
  { name: "Powai Lake", lat: 19.1197, lng: 72.9061 },
  { name: "Colaba Causeway", lat: 18.9220, lng: 72.8313 },
  { name: "Dadar Station", lat: 19.0178, lng: 72.8437 },
  { name: "Goregaon", lat: 19.1663, lng: 72.8526 },
  { name: "Vikhroli", lat: 19.1055, lng: 72.9258 },
  { name: "Thane Station", lat: 19.1855, lng: 72.9743 },
  { name: "Navi Mumbai (Vashi)", lat: 19.0771, lng: 73.0082 },
];

export default function Sidebar({ locations, setLocations, onOptimize, loading, result }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [vehicleType, setVehicleType] = useState('truck');
  const [priority, setPriority] = useState('balanced');
  const [showPresets, setShowPresets] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Geocode using Nominatim (free OpenStreetMap geocoder)
  const searchPlace = async (query) => {
    if (!query || query.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      toast.error('Search failed. Try manual entry.');
    }
    setSearching(false);
  };

  const addFromSearch = (place) => {
    if (locations.length >= 12) { toast.error('Maximum 12 stops'); return; }
    const name = place.display_name.split(',').slice(0, 2).join(',').trim();
    setLocations(prev => [...prev, {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      name,
      id: Date.now()
    }]);
    setSearchInput('');
    setSearchResults([]);
    toast.success(`📍 ${name} added!`, { duration: 1500 });
  };

  const addLocation = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) { toast.error('Enter valid latitude and longitude'); return; }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) { toast.error('Coordinates out of range'); return; }
    if (locations.length >= 12) { toast.error('Maximum 12 stops allowed'); return; }
    setLocations(prev => [...prev, { lat, lng, name: nameInput || `Stop ${prev.length + 1}`, id: Date.now() }]);
    setLatInput(''); setLngInput(''); setNameInput('');
    toast.success('📍 Stop added!', { duration: 1500 });
  };

  const addPreset = (preset) => {
    if (locations.length >= 12) { toast.error('Maximum 12 stops allowed'); return; }
    setLocations(prev => [...prev, { ...preset, id: Date.now() }]);
    toast.success(`📍 ${preset.name} added!`, { duration: 1500 });
  };

  const removeLocation = (id) => { setLocations(prev => prev.filter(l => l.id !== id)); };

  const loadDemo = () => {
    const demo = [
      { name: "CST Mumbai (Origin)", lat: 18.9398, lng: 72.8355, id: 1 },
      { name: "Dharavi", lat: 19.0396, lng: 72.8552, id: 2 },
      { name: "Andheri", lat: 19.1136, lng: 72.8697, id: 3 },
      { name: "Powai", lat: 19.1197, lng: 72.9061, id: 4 },
      { name: "Thane", lat: 19.1855, lng: 72.9743, id: 5 },
    ];
    setLocations(demo);
    toast.success('🚀 Demo route loaded! Click Optimize.', { duration: 2500 });
  };

  const clearAll = () => { setLocations([]); toast('Locations cleared', { icon: '🗑️' }); };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">⚡ Route Configuration</div>
      </div>

      <div className="sidebar-content">
        {/* Agent Pipeline Preview */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🤖 AI Agent Pipeline</span>
            <span className="tag tag-cyan">3 Agents</span>
          </div>
          <div className="pipeline">
            <div className="pipeline-step">
              <div className="pipeline-dot" style={{ background: '#00d4ff' }} />
              <span><strong style={{ color: '#00d4ff' }}>Route Agent</strong> — 2-Opt Optimizer</span>
            </div>
            <div className="pipeline-line" />
            <div className="pipeline-step">
              <div className="pipeline-dot" style={{ background: '#ff6b2b' }} />
              <span><strong style={{ color: '#ff6b2b' }}>Traffic Agent</strong> — LSTM Prediction</span>
            </div>
            <div className="pipeline-line" />
            <div className="pipeline-step">
              <div className="pipeline-dot" style={{ background: '#7c3aed' }} />
              <span><strong style={{ color: '#a78bfa' }}>Decision Agent</strong> — LLM Reasoning</span>
            </div>
            <div className="pipeline-line" />
            <div className="pipeline-step">
              <div className="pipeline-dot" style={{ background: '#00ff88' }} />
              <span><strong style={{ color: '#00ff88' }}>Live APIs</strong> — Maps + Weather</span>
            </div>
          </div>
        </div>

        {/* Vehicle + Priority */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🚛 Mission Settings</div>
          <div className="input-group">
            <label className="input-label">Vehicle Type</label>
            <select className="select-field" value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
              <option value="truck">🚛 Truck</option>
              <option value="van">🚐 Van</option>
              <option value="car">🚗 Car</option>
              <option value="bike">🏍️ Bike</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Optimization Priority</label>
            <select className="select-field" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="balanced">⚖️ Balanced</option>
              <option value="fastest">⚡ Fastest Route</option>
              <option value="eco">🌿 Eco-Friendly</option>
              <option value="shortest">📏 Shortest Distance</option>
            </select>
          </div>
        </div>

        {/* Add Location — Smart Search */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📍 Add Delivery Stops</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: 'auto', padding: '4px 10px', fontSize: '0.7rem' }}
                onClick={() => setShowPresets(!showPresets)}
              >
                {showPresets ? 'Hide' : 'Presets ▾'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: 'auto', padding: '4px 10px', fontSize: '0.7rem' }}
                onClick={() => setShowManual(!showManual)}
              >
                {showManual ? 'Search' : 'Manual'}
              </button>
            </div>
          </div>

          {showPresets && (
            <div style={{ marginBottom: 12, maxHeight: 160, overflowY: 'auto', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
              {MUMBAI_PRESETS.map((p, i) => (
                <div
                  key={i}
                  onClick={() => addPreset(p)}
                  style={{
                    padding: '7px 12px', fontSize: '0.78rem', cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  📍 {p.name}
                </div>
              ))}
            </div>
          )}

          {!showManual ? (
            /* 🔍 Smart Search Mode */
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <input
                  className="input-field"
                  style={{ paddingLeft: 12, flex: 1 }}
                  type="text"
                  placeholder="🔍 Search any place... (e.g. Chembur, Mumbai)"
                  value={searchInput}
                  onChange={e => {
                    setSearchInput(e.target.value);
                    if (e.target.value.length > 2) searchPlace(e.target.value);
                    else setSearchResults([]);
                  }}
                  onKeyDown={e => e.key === 'Enter' && searchPlace(searchInput)}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: 'auto', padding: '8px 14px', flexShrink: 0 }}
                  onClick={() => searchPlace(searchInput)}
                  disabled={searching}
                >
                  {searching ? '⏳' : '🔍'}
                </button>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                Type any location in India — powered by OpenStreetMap
              </div>
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute', zIndex: 999, top: '100%', left: 0, right: 0,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-accent)',
                  borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  maxHeight: 200, overflowY: 'auto'
                }}>
                  {searchResults.map((place, i) => (
                    <div
                      key={i}
                      onClick={() => addFromSearch(place)}
                      style={{
                        padding: '10px 14px', fontSize: '0.8rem', cursor: 'pointer',
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)', lineHeight: 1.4
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: 2 }}>
                        📍 {place.display_name.split(',').slice(0, 2).join(',')}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {place.display_name.split(',').slice(2, 4).join(',')} · {parseFloat(place.lat).toFixed(4)}, {parseFloat(place.lon).toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* 🔧 Manual Coordinates Mode */
            <>
              <div className="input-group">
                <label className="input-label">Stop Name</label>
                <input
                  className="input-field"
                  style={{ paddingLeft: 12 }}
                  type="text"
                  placeholder="e.g. Warehouse A"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div>
                  <label className="input-label">Latitude</label>
                  <input
                    className="input-field"
                    style={{ paddingLeft: 12 }}
                    type="number"
                    step="0.0001"
                    placeholder="19.0760"
                    value={latInput}
                    onChange={e => setLatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addLocation()}
                  />
                </div>
                <div>
                  <label className="input-label">Longitude</label>
                  <input
                    className="input-field"
                    style={{ paddingLeft: 12 }}
                    type="number"
                    step="0.0001"
                    placeholder="72.8777"
                    value={lngInput}
                    onChange={e => setLngInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addLocation()}
                  />
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={addLocation} disabled={loading}>
                + Add Stop
              </button>
            </>
          )}
        </div>


        {/* Current Stops */}
        {locations.length > 0 && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">📦 Stops ({locations.length})</span>
              <button className="btn btn-danger btn-sm" style={{ width: 'auto', padding: '4px 10px', fontSize: '0.7rem' }} onClick={clearAll}>
                Clear All
              </button>
            </div>
            <div className="stops-list">
              {locations.map((loc, i) => (
                <div key={loc.id} className="stop-item">
                  <div className="stop-number">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="stop-name">{loc.name}</div>
                    <div className="stop-coords">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</div>
                  </div>
                  {i === 0 && <span className="tag tag-green" style={{ fontSize: '0.6rem' }}>ORIGIN</span>}
                  <button className="stop-delete" onClick={() => removeLocation(loc.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            className="btn btn-primary"
            onClick={() => onOptimize(vehicleType, priority)}
            disabled={loading || locations.length < 2}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Optimizing…
              </>
            ) : (
              <>⚡ Optimize Route</>
            )}
          </button>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadDemo} disabled={loading}>
          🚀 Load Demo Route (Mumbai)
        </button>

        {/* Results */}
        {result && (
          <div style={{ marginTop: 14 }} className="fade-in">
            {/* Decision */}
            <div className="card agent-card agent-decision" style={{ border: '1px solid rgba(124,58,237,0.4)', background: 'linear-gradient(to bottom, rgba(124,58,237,0.1), rgba(124,58,237,0.02))' }}>
              <div className="agent-name" style={{ color: '#a78bfa', display: 'flex', justifyContent: 'space-between' }}>
                <span>🤖 Gemini LLM Brain Output</span>
                <span style={{ fontSize: '0.6rem', background: '#a78bfa22', padding: '2px 6px', borderRadius: 4 }}>AI GENERATED</span>
              </div>
              <div
                className={`decision-tag ${
                  result.decision.riskScore < 20 ? 'decision-go' :
                  result.decision.riskScore < 50 ? 'decision-caution' : 'decision-stop'
                }`}
                style={{ marginTop: 8 }}
              >
                {result.decision.overallDecision}
              </div>
              
              {result.decision.decisions?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>⚡ AI REASONING</div>
                  <ul className="rec-list" style={{ marginBottom: 0 }}>
                    {result.decision.decisions.map((d, i) => (
                      <li key={i} style={{ color: 'var(--text-primary)' }}>• {d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.decision.recommendations?.length > 0 && (
                <div style={{ marginBottom: 8, padding: '8px', background: 'rgba(0,212,255,0.05)', borderRadius: '6px', borderLeft: '2px solid var(--accent-cyan)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 4 }}>✅ ACTION ITEMS</div>
                  <ul className="rec-list" style={{ border: 'none' }}>
                    {result.decision.recommendations.map((r, i) => (
                      <li key={i} style={{ borderBottom: 'none', padding: '2px 0' }}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
                {result.decision.reasoning}
              </div>
            </div>

            {/* Core Stats */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>📊 Route Results</div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value glow-cyan">{result.totalDistanceKm} <span style={{ fontSize: '0.75rem' }}>km</span></div>
                  <div className="stat-label">Road Distance</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value glow-purple">{result.trafficAdjustedTimeMin} <span style={{ fontSize: '0.75rem' }}>min</span></div>
                  <div className="stat-label">ETA (Traffic adj.)</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value glow-green">{result.efficiencyGainPct}%</div>
                  <div className="stat-label">Efficiency Gain</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>₹{result.fuelCostINR}</div>
                  <div className="stat-label">Est. Fuel Cost</div>
                </div>
              </div>
            </div>

            {/* Traffic Agent */}
            <div className="card agent-card agent-traffic">
              <div className="agent-name" style={{ color: 'var(--accent-orange)' }}>🚦 Traffic Agent (LSTM)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className={`traffic-badge traffic-${result.traffic.trafficLevel.toLowerCase()}`}>
                  {result.traffic.trafficLevel} Traffic
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Score: {result.traffic.congestionScore}
                </span>
              </div>
              <div className="agent-status">{result.traffic.prediction}</div>
              {result.traffic.peakHour && (
                <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--accent-yellow)', background: 'rgba(255,214,10,0.08)', padding: '4px 8px', borderRadius: 6 }}>
                  ⚠️ Peak hour detected — expect delays
                </div>
              )}
            </div>

            {/* Weather */}
            <div className="card agent-card agent-weather">
              <div className="agent-name" style={{ color: 'var(--accent-green)' }}>🌤️ Weather Feed</div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value" style={{ fontSize: '1rem', color: 'var(--accent-green)' }}>{result.weather.temp}°C</div>
                  <div className="stat-label">Temperature</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ fontSize: '1rem', color: 'var(--accent-cyan)' }}>{result.weather.windSpeed} m/s</div>
                  <div className="stat-label">Wind Speed</div>
                </div>
              </div>
              <div className="agent-status" style={{ marginTop: 8 }}>
                {result.weather.condition} · Humidity {result.weather.humidity}%
                {result.weather.source === 'simulated' && <span className="tag tag-orange" style={{ marginLeft: 6, fontSize: '0.58rem' }}>SIM</span>}
              </div>
            </div>

            {/* Eco */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>🌿 Eco Impact</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CO₂ Saved</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 700 }}>{result.co2SavedKg} kg</span>
              </div>
              <div className="eco-bar">
                <div className="eco-bar-fill" style={{ width: `${Math.min(100, result.efficiencyGainPct * 3)}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fuel Saved</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 700 }}>{result.fuelSavedL} L</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Distance Saved</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{result.savedDistanceKm} km</span>
              </div>
            </div>

            {/* Processing info */}
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', padding: '4px' }}>
              ⚡ Processed in {result.processingTimeMs}ms · {result.agentPipeline?.join(' → ')}
            </div>

            {/* Turn by turn Navigation */}
            {result.turnByTurnSteps?.length > 0 && (
              <div className="card" style={{ marginTop: 14 }}>
                <div className="card-header" style={{ marginBottom: 8 }}>
                  <span className="card-title">🗺️ Turn-by-Turn Navigation</span>
                  <span className="tag tag-green">{result.turnByTurnSteps.length} Steps</span>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }} className="panel-scroll">
                  {result.turnByTurnSteps.map((step, idx) => {
                    // Handle both string steps and object steps
                    const instruction = typeof step === 'string' ? step : step.instruction;
                    const distance = typeof step === 'object' ? step.distance : null;
                    return (
                      <div key={idx} style={{ 
                        display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--text-primary)',
                        padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' 
                      }}>
                        <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', width: '20px' }}>{idx + 1}.</div>
                        <div>
                          {instruction}
                          {distance > 0 && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {distance >= 1000 ? (distance / 1000).toFixed(1) + ' km' : Math.round(distance) + ' m'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Start Navigation Button — shows whenever a route is loaded */}
            {result?.optimizedRoute?.length > 0 && (
              <button
                className="btn btn-primary"
                style={{ 
                  width: '100%', marginTop: '16px', 
                  background: 'linear-gradient(135deg, #00ff88, #00b360)', 
                  color: '#05070f', fontSize: '1rem', padding: '14px', border: 'none', 
                  borderRadius: 'var(--radius-sm)', fontWeight: 800, cursor: 'pointer', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  boxShadow: '0 0 20px rgba(0,255,136,0.4)'
                }}
                onClick={() => window.dispatchEvent(new CustomEvent('START_NAVIGATION', { detail: result }))}
              >
                <span style={{ fontSize: '1.4rem' }}>🚗</span> START NAVIGATION
              </button>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
