import React, { useState, useEffect, useRef } from 'react';

// Haversine distance formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; 
}

export default function NavigationOverlay({ routeData, onExit }) {
  const steps = routeData.turnByTurnSteps;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const simInterval = useRef(null);

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];

  // Voice Synthesis
  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // Announce current step when it changes
  useEffect(() => {
    if (currentStep) {
      speak(currentStep.instruction);
      
      // Dipatch an event so MapView can update the user marker
      if (userLocation || isSimulating) {
         window.dispatchEvent(new CustomEvent('UPDATE_NAV_STEP', { detail: currentStepIndex }));
      }
    }
  }, [currentStepIndex]);

  // Real Geolocation
  useEffect(() => {
    if (isSimulating) return;

    if (!('geolocation' in navigator)) {
      setErrorMsg('GPS not supported on this device.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        window.dispatchEvent(new CustomEvent('NAV_LOCATION_UPDATE', { detail: [latitude, longitude] }));
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setErrorMsg('Waiting for GPS signal... (Tip: Use "Simulate Drive" for desktop testing)');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isSimulating]);

  // Check distance to next step to auto-advance
  useEffect(() => {
    if (!userLocation || !currentStep || !currentStep.location) return;

    const [stepLat, stepLng] = currentStep.location;
    const distanceToStep = getDistance(userLocation[0], userLocation[1], stepLat, stepLng);

    // If within 40 meters, advance to next step
    if (distanceToStep < 40 && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [userLocation, currentStep, currentStepIndex, steps]);

  // Simulation Logic for Desktop Demo
  const toggleSimulation = () => {
    if (isSimulating) {
      clearInterval(simInterval.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      setErrorMsg('');
      let simIndex = currentStepIndex;
      let targetPath = routeData.routeGeometry || [];
      // Jump to roughly where the current step is located
      let pathIdx = 0;
      
      simInterval.current = setInterval(() => {
        if (pathIdx >= targetPath.length) {
           clearInterval(simInterval.current);
           speak("You have arrived at your final destination.");
           return;
        }
        
        const loc = targetPath[pathIdx];
        setUserLocation(loc);
        window.dispatchEvent(new CustomEvent('NAV_LOCATION_UPDATE', { detail: loc }));

        // Check if we hit the step location manually during simulation
        const cStep = steps[simIndex];
        if (cStep && cStep.location) {
          const dist = getDistance(loc[0], loc[1], cStep.location[0], cStep.location[1]);
          if (dist < 40 && simIndex < steps.length - 1) {
             simIndex++;
             setCurrentStepIndex(simIndex);
          }
        }
        pathIdx += Math.max(1, Math.floor(targetPath.length / 150)); // Move approx 0.6% of path every tick
      }, 500);
    }
  };

  useEffect(() => {
    return () => clearInterval(simInterval.current);
  }, []);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
    }}>
      {/* Top Banner: Current Instruction */}
      <div style={{
        background: '#0c1022', borderBottom: '2px solid var(--accent-green)',
        padding: '24px', pointerEvents: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', gap: '20px'
      }}>
        <div style={{ fontSize: '3rem' }}>
          {currentStep?.instruction?.toLowerCase().includes('left') ? '↖️' : 
           currentStep?.instruction?.toLowerCase().includes('right') ? '↗️' :
           currentStep?.instruction?.toLowerCase().includes('arrive') ? '🏁' : '⬆️'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--accent-green)', fontSize: '1.2rem', fontWeight: 800 }}>
            {currentStep?.distance > 0 ? (currentStep?.distance >= 1000 ? (currentStep?.distance/1000).toFixed(1) + ' km' : Math.round(currentStep?.distance) + ' m') : 'Now'}
          </div>
          <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.2 }}>
            {currentStep?.instruction || "Proceed to route"}
          </div>
        </div>
        <button onClick={onExit} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', padding:'12px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}>
          Exit
        </button>
      </div>

      {/* Middle: Error or Simulation Controls */}
      <div style={{ padding: '20px', pointerEvents: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
        <button
           onClick={toggleSimulation}
           style={{ background: isSimulating ? 'var(--accent-cyan)' : 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: isSimulating ? '#000' : '#fff', padding: '10px 16px', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold' }}
        >
           {isSimulating ? '⏸ Pause Sim' : '▶ Simulate Drive'}
        </button>
      </div>

      {/* Bottom Panel */}
      <div style={{
        background: 'rgba(5,7,15,0.95)', backdropFilter: 'blur(10px)',
        padding: '20px', pointerEvents: 'auto', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>NEXT</div>
          <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>
            {nextStep ? nextStep.instruction : "Arrive at destination"}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
           {errorMsg ? (
             <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{errorMsg}</div>
           ) : (
             <>
               <div style={{ color: 'var(--accent-cyan)', fontSize: '1.5rem', fontWeight: 800 }}>
                 {routeData.estimatedTimeHrs ? Math.round(parseFloat(routeData.estimatedTimeHrs)*60) : '--'} min
               </div>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                 {routeData.totalDistanceKm} km left
               </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
}
