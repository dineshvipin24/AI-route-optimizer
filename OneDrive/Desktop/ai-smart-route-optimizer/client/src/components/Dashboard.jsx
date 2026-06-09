// Dashboard.jsx — Analytics & KPI Overview
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell, PieChart, Pie
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(12,16,34,0.95)', border: '1px solid rgba(0,212,255,0.2)',
      borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem'
    }}>
      <div style={{ color: '#8892b0', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard({ results }) {
  const hasData = results && results.length > 0;

  // Mock historical data for demo
  const trafficHistory = [
    { time: '06:00', score: 0.2, label: '6 AM' },
    { time: '07:00', score: 0.5, label: '7 AM' },
    { time: '08:00', score: 0.85, label: '8 AM' },
    { time: '09:00', score: 1.0, label: '9 AM' },
    { time: '10:00', score: 0.75, label: '10 AM' },
    { time: '11:00', score: 0.6, label: '11 AM' },
    { time: '12:00', score: 0.65, label: '12 PM' },
    { time: '13:00', score: 0.7, label: '1 PM' },
    { time: '14:00', score: 0.6, label: '2 PM' },
    { time: '15:00', score: 0.65, label: '3 PM' },
    { time: '16:00', score: 0.8, label: '4 PM' },
    { time: '17:00', score: 1.0, label: '5 PM' },
    { time: '18:00', score: 0.9, label: '6 PM' },
    { time: '19:00', score: 0.7, label: '7 PM' },
    { time: '20:00', score: 0.5, label: '8 PM' },
    { time: '21:00', score: 0.35, label: '9 PM' },
  ];

  const saveHistory = hasData ? results.map((r, i) => ({
    trip: `Trip ${i + 1}`,
    distance: parseFloat(r.totalDistanceKm),
    saved: parseFloat(r.savedDistanceKm),
    efficiency: r.efficiencyGainPct,
    co2: parseFloat(r.co2SavedKg),
  })) : [
    { trip: 'Trip 1', distance: 32.4, saved: 4.2, efficiency: 13.0, co2: 1.55 },
    { trip: 'Trip 2', distance: 18.7, saved: 2.1, efficiency: 11.2, co2: 0.78 },
    { trip: 'Trip 3', distance: 45.6, saved: 7.3, efficiency: 16.0, co2: 2.70 },
    { trip: 'Trip 4', distance: 28.9, saved: 3.5, efficiency: 12.1, co2: 1.29 },
    { trip: 'Trip 5', distance: 55.3, saved: 9.8, efficiency: 17.7, co2: 3.62 },
  ];

  const radarData = [
    { subject: 'Route Opt', A: 92 },
    { subject: 'Traffic AI', A: 87 },
    { subject: 'Eco Score', A: 78 },
    { subject: 'Speed', A: 95 },
    { subject: 'Safety', A: 88 },
    { subject: 'Accuracy', A: 94 },
  ];

  const pieData = [
    { name: 'Route Agent', value: 40 },
    { name: 'Traffic Agent', value: 30 },
    { name: 'Decision Agent', value: 20 },
    { name: 'Live APIs', value: 10 },
  ];

  const PIE_COLORS = ['#00d4ff', '#ff6b2b', '#7c3aed', '#00ff88'];

  const latestResult = hasData ? results[results.length - 1] : null;

  const totalDistance = hasData
    ? results.reduce((s, r) => s + parseFloat(r.totalDistanceKm || 0), 0).toFixed(1)
    : '178.5';
  const distanceSaved = hasData
    ? results.reduce((s, r) => s + parseFloat(r.savedDistanceKm || 0), 0).toFixed(1)
    : '26.9';
  const fuelSaved = hasData
    ? results.reduce((s, r) => s + parseFloat(r.fuelSavedL || 0), 0).toFixed(1)
    : '3.2';
  const timeSavedMins = hasData
    ? (results.reduce((s, r) => s + parseFloat(r.savedDistanceKm || 0), 0) / 40 * 60).toFixed(0)
    : '40';

  return (
    <div className="dashboard-page fade-in">
      {/* Hero */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>
          📊 Analytics{' '}
          <span style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dashboard
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Real-time insights from your AI route optimization pipeline
        </p>
      </div>

      {/* KPIs */}
      <div className="dashboard-grid">
        <div className="kpi-card cyan">
          <div className="kpi-icon cyan">🛣️</div>
          <div className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>{totalDistance} <span style={{fontSize:'0.9rem'}}>km</span></div>
          <div className="kpi-label">Total Distance</div>
          <div className="kpi-trend trend-up">All past routes</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon green">📏</div>
          <div className="kpi-value" style={{ color: 'var(--accent-green)' }}>{distanceSaved} <span style={{fontSize:'0.9rem'}}>km</span></div>
          <div className="kpi-label">Distance Saved</div>
          <div className="kpi-trend trend-up">AI Path Optimization</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon purple">⛽</div>
          <div className="kpi-value" style={{ color: '#a78bfa' }}>{fuelSaved} <span style={{fontSize:'0.9rem'}}>L</span></div>
          <div className="kpi-label">Fuel Saved</div>
          <div className="kpi-trend trend-up">Eco impact metric</div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon orange">⏱️</div>
          <div className="kpi-value" style={{ color: 'var(--accent-orange)' }}>{timeSavedMins} <span style={{fontSize:'0.9rem'}}>min</span></div>
          <div className="kpi-label">Est. Time Saved</div>
          <div className="kpi-trend trend-up">Traffic prediction logic</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="chart-section">
        <div className="chart-card">
          <div className="chart-title">
            🚦 Traffic Congestion Patterns (LSTM Model)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trafficHistory}>
              <defs>
                <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b2b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b2b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4a5568' }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} domain={[0, 1.1]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#ff6b2b" strokeWidth={2} fill="url(#trafficGrad)" name="Congestion" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">
            📦 Route Efficiency by Trip
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={saveHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="trip" tick={{ fontSize: 10, fill: '#4a5568' }} />
              <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="distance" name="Total (km)" fill="#00d4ff" radius={[4, 4, 0, 0]} opacity={0.7} />
              <Bar dataKey="saved" name="Saved (km)" fill="#00ff88" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="chart-section">
        <div className="chart-card">
          <div className="chart-title">
            🤖 AI Agent Performance Radar
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892b0', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4a5568', fontSize: 9 }} />
              <Radar name="Score" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">
            🌿 CO₂ Savings per Trip
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={saveHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="trip" tick={{ fontSize: 10, fill: '#4a5568' }} />
              <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="co2" name="CO₂ (kg)" stroke="#00ff88" strokeWidth={2.5} dot={{ fill: '#00ff88', r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Contribution Pie + Live Result */}
      <div className="chart-section">
        <div className="chart-card">
          <div className="chart-title">🤖 Agent System Contribution</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i], flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                  <span style={{ color: PIE_COLORS[i], fontWeight: 700, marginLeft: 'auto' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {latestResult ? (
          <div className="chart-card">
            <div className="chart-title">📡 Latest Optimization Result</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Total Distance', value: `${latestResult.totalDistanceKm} km`, color: 'var(--accent-cyan)' },
                { label: 'Traffic Level', value: latestResult.traffic?.trafficLevel, color: latestResult.traffic?.trafficLevel === 'High' ? 'var(--accent-red)' : latestResult.traffic?.trafficLevel === 'Moderate' ? 'var(--accent-yellow)' : 'var(--accent-green)' },
                { label: 'Weather', value: latestResult.weather?.condition, color: 'var(--accent-green)' },
                { label: 'ETA (with traffic)', value: `${latestResult.trafficAdjustedTimeMin} min`, color: 'var(--accent-purple)' },
                { label: 'Efficiency Gain', value: `${latestResult.efficiencyGainPct}%`, color: 'var(--accent-orange)' },
                { label: 'Risk Score', value: `${latestResult.decision?.riskScore}/100`, color: latestResult.decision?.riskScore > 50 ? 'var(--accent-red)' : 'var(--accent-green)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.83rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="chart-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '2rem' }}>🎯</div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--text-secondary)' }}>Run Optimization</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Go to Map View, add stops, and click Optimize to populate live results
            </div>
          </div>
        )}
      </div>

      {/* Architecture */}
      <div className="chart-card" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="chart-title">🏗️ System Architecture</div>
        <div style={{
          fontFamily: 'Space Grotesk, monospace',
          fontSize: '0.75rem',
          lineHeight: 1.8,
          color: 'var(--text-secondary)',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 10,
          padding: '16px 20px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ color: 'var(--accent-cyan)' }}>┌───────────────────────────────────────────┐</div>
          <div><span style={{ color: 'var(--accent-cyan)' }}>│</span>  React UI (Map View | Dashboard | Voice)  <span style={{ color: 'var(--accent-cyan)' }}>│</span></div>
          <div style={{ color: 'var(--accent-cyan)' }}>└──────────────────┬────────────────────────┘</div>
          <div style={{ marginLeft: 18, color: '#4a5568' }}>│</div>
          <div><span style={{ color: 'var(--accent-purple)' }}>         ┌────────▼────────┐</span></div>
          <div><span style={{ color: 'var(--accent-purple)' }}>         │  Express.js API │</span> <span style={{ color: '#4a5568' }}>← API Gateway</span></div>
          <div><span style={{ color: 'var(--accent-purple)' }}>         └────────┬────────┘</span></div>
          <div style={{ marginLeft: 18, color: '#4a5568' }}>│</div>
          <div style={{ display: 'flex', gap: 40 }}>
            <span style={{ color: 'var(--accent-cyan)' }}>┌────────┐</span>
            <span style={{ color: 'var(--accent-orange)' }}>┌─────────┐</span>
            <span style={{ color: 'var(--accent-purple)' }}>┌──────────┐</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <span style={{ color: 'var(--accent-cyan)' }}>│ Route  │</span>
            <span style={{ color: 'var(--accent-orange)' }}>│ Traffic │</span>
            <span style={{ color: 'var(--accent-purple)' }}>│ Decision │</span>
          </div>
          <div style={{ display: 'flex', gap: 31 }}>
            <span style={{ color: 'var(--accent-cyan)' }}>│ Agent  │</span>
            <span style={{ color: 'var(--accent-orange)' }}>│  Agent  │</span>
            <span style={{ color: 'var(--accent-purple)' }}>│  Agent   │</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <span style={{ color: 'var(--accent-cyan)' }}>│ 2-Opt  │</span>
            <span style={{ color: 'var(--accent-orange)' }}>│  LSTM   │</span>
            <span style={{ color: 'var(--accent-purple)' }}>│   LLM    │</span>
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            <span style={{ color: 'var(--accent-cyan)' }}>└────────┘</span>
            <span style={{ color: 'var(--accent-orange)' }}>└─────────┘</span>
            <span style={{ color: 'var(--accent-purple)' }}>└──────────┘</span>
          </div>
          <div style={{ marginTop: 6, color: 'var(--accent-green)' }}>
            ↓ Live APIs: OpenRouteService · OpenWeatherMap · OSRM
          </div>
        </div>
      </div>
    </div>
  );
}
