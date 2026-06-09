import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VoiceAssistant from './components/VoiceAssistant';
import NavigationOverlay from './components/NavigationOverlay';

import './index.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TABS = [
  { id: 'map', icon: '🗺️', label: 'Map View' },
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'voice', icon: '🎙️', label: 'Voice AI' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [locations, setLocations] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [serverStatus, setServerStatus] = useState('checking');
  const [theme, setTheme] = useState('dark');
  const [navigationActive, setNavigationActive] = useState(false);
  const [navData, setNavData] = useState(null);

  useEffect(() => {
    const startNav = (e) => {
      setNavData(e.detail);
      setNavigationActive(true);
    };
    window.addEventListener('START_NAVIGATION', startNav);
    return () => window.removeEventListener('START_NAVIGATION', startNav);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Check server health on mount
  useState(() => {
    axios.get(`${API_BASE}/health`, { timeout: 3000 })
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));
  });

  const handleOptimize = useCallback(async (vehicleType = 'truck', priority = 'balanced') => {
    if (locations.length < 2) {
      toast.error('Add at least 2 stops to optimize!');
      return;
    }

    setLoading(true);
    setActiveTab('map');

    try {
      const toastId = toast.loading('🤖 AI agents processing your route…', { duration: Infinity });

      const response = await axios.post(`${API_BASE}/optimize-route`, {
        locations,
        vehicleType,
        priority,
      }, { timeout: 15000 });

      toast.dismiss(toastId);

      const data = response.data;
      setResult(data);
      setAllResults(prev => [...prev, data]);

      // Success notification
      const level = data.decision?.riskScore < 20 ? '✅' : data.decision?.riskScore < 50 ? '⚠️' : '🔴';
      toast.success(
        `${level} Route optimized! ${data.efficiencyGainPct}% efficiency gain over ${data.optimizedRoute.length} stops`,
        { duration: 4000 }
      );

    } catch (err) {
      console.error('Optimization error:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        toast.error('Cannot reach server. Is it running? Start with: npm start in /server');
      } else {
        toast.error(`Error: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [locations]);

  const handleVoiceCommand = useCallback((cmd) => {
    switch (cmd) {
      case 'optimize':
        handleOptimize();
        break;
      case 'clear':
        setLocations([]);
        setResult(null);
        break;
      case 'demo': {
        const demo = [
          { name: "CST Mumbai (Origin)", lat: 18.9398, lng: 72.8355, id: 1 },
          { name: "Dharavi", lat: 19.0396, lng: 72.8552, id: 2 },
          { name: "Andheri Station", lat: 19.1136, lng: 72.8697, id: 3 },
          { name: "Powai Lake", lat: 19.1197, lng: 72.9061, id: 4 },
          { name: "Thane", lat: 19.1855, lng: 72.9743, id: 5 },
        ];
        setLocations(demo);
        setActiveTab('map');
        break;
      }
      case 'dashboard':
        setActiveTab('dashboard');
        break;
      case 'add-mumbai':
        setLocations(prev => [
          ...prev,
          { name: 'Mumbai Central', lat: 18.9698, lng: 72.8192, id: Date.now() }
        ]);
        setActiveTab('map');
        break;
      default:
        break;
    }
  }, [handleOptimize]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(12,16,34,0.97)',
            color: '#f0f4ff',
            border: '1px solid rgba(0,212,255,0.2)',
            backdropFilter: 'blur(12px)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.83rem',
          },
          success: { iconTheme: { primary: '#00ff88', secondary: '#05070f' } },
          error: { iconTheme: { primary: '#ff3b5c', secondary: '#05070f' } },
        }}
      />

      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo-icon">🚀</div>
          <span className="brand-name">RouteAI</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: 4, fontWeight: 400 }}>
            v2.0 · NEURAL NEXUS 2026
          </span>
        </div>

        <div className="navbar-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Server status & Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={toggleTheme}
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.1))',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <div className={`status-badge ${serverStatus === 'online' ? 'online' : ''}`}
              style={serverStatus !== 'online' ? { background: 'rgba(255,59,92,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(255,59,92,0.2)' } : {}}>
              <div className="pulse-dot"
                style={serverStatus !== 'online' ? { background: 'var(--accent-red)', animation: 'none' } : {}} />
              {serverStatus === 'online' ? 'API Online' : serverStatus === 'offline' ? 'API Offline' : 'Checking…'}
            </div>
          </div>
          {locations.length > 0 && (
            <span className="tag tag-cyan" style={{ fontSize: '0.72rem' }}>
              {locations.length} Stops
            </span>
          )}
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────── */}
      <main className="main-content">
        {navigationActive && navData && (
          <div style={{ width: '100vw', height: '100%', position: 'absolute', top: 64, left: 0, zIndex: 5000, background: 'var(--bg-primary)' }}>
             <MapView
               locations={locations}
               optimizedRoute={navData.optimizedRoute}
               routeGeometry={navData.routeGeometry}
               energyStations={navData.energyStations}
               loading={false}
               isNavigationMode={true}
             />
             <NavigationOverlay routeData={navData} onExit={() => setNavigationActive(false)} />
          </div>
        )}
        
        {activeTab === 'map' && !navigationActive && (
          <div className="layout-grid">
            <Sidebar
              locations={locations}
              setLocations={setLocations}
              onOptimize={handleOptimize}
              loading={loading}
              result={result}
            />
            <div className="map-section">
              <MapView
                locations={locations}
                optimizedRoute={result?.optimizedRoute}
                routeGeometry={result?.routeGeometry}
                energyStations={result?.energyStations}
                loading={loading}
              />
              {/* Map nav buttons overlay for mobile */}
              <div style={{
                position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 8, zIndex: 500
              }}>
                {TABS.filter(t => t.id !== 'map').map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: 'rgba(12,16,34,0.9)', border: '1px solid rgba(0,212,255,0.2)',
                      color: 'var(--text-primary)', borderRadius: 20, padding: '8px 16px',
                      fontSize: '0.78rem', cursor: 'pointer', backdropFilter: 'blur(12px)',
                      fontFamily: 'Inter, sans-serif', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'center'
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <div className="sidebar" style={{ width: 220, minWidth: 180 }}>
              <div className="sidebar-header">
                <div className="sidebar-title">🧭 Navigation</div>
              </div>
              <div className="sidebar-content">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ marginBottom: 8, justifyContent: 'flex-start', gap: 10 }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
                <div className="divider" />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.8, padding: '4px 0' }}>
                  <div>🚀 <strong style={{ color: 'var(--text-secondary)' }}>Total Optimizations:</strong> {allResults.length}</div>
                  <div style={{ marginTop: 4 }}>🤖 <strong style={{ color: 'var(--text-secondary)' }}>Agents Active:</strong> 3</div>
                  <div style={{ marginTop: 4 }}>📡 <strong style={{ color: 'var(--text-secondary)' }}>APIs Connected:</strong> 2</div>
                </div>
              </div>
            </div>
            <Dashboard results={allResults} />
          </>
        )}

        {activeTab === 'voice' && (
          <>
            <div className="sidebar" style={{ width: 220, minWidth: 180 }}>
              <div className="sidebar-header">
                <div className="sidebar-title">🧭 Navigation</div>
              </div>
              <div className="sidebar-content">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ marginBottom: 8, justifyContent: 'flex-start', gap: 10 }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
                <div className="divider" />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.8, padding: '4px 0' }}>
                  <div>🎙️ <strong style={{ color: 'var(--text-secondary)' }}>Language:</strong> en-IN</div>
                  <div style={{ marginTop: 4 }}>🧠 <strong style={{ color: 'var(--text-secondary)' }}>NLP:</strong> Rule-based</div>
                  <div style={{ marginTop: 4 }}>🔊 <strong style={{ color: 'var(--text-secondary)' }}>TTS:</strong> Web Speech</div>
                </div>
              </div>
            </div>
            <VoiceAssistant onCommand={handleVoiceCommand} />
          </>
        )}
      </main>

      {/* Hackathon Badge */}
      <div className="hackathon-badge">
        🏆 THE NEURAL NEXUS 2026 · SAKEC
      </div>
    </>
  );
}
