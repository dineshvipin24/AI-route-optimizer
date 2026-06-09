// VoiceAssistant.jsx — Voice Command Interface with Web Speech API
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const COMMANDS = [
  { cmd: '"Add Mumbai"', desc: 'Add Mumbai as next stop' },
  { cmd: '"Optimize route"', desc: 'Run route optimization' },
  { cmd: '"Clear all stops"', desc: 'Remove all locations' },
  { cmd: '"Load demo"', desc: 'Load demo Mumbai route' },
  { cmd: '"Show dashboard"', desc: 'Switch to dashboard' },
  { cmd: '"Traffic report"', desc: 'Get traffic status' },
];

export default function VoiceAssistant({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [supported, setSupported] = useState(true);
  const [waveform, setWaveform] = useState([]);
  const recognitionRef = useRef(null);
  const waveIntervalRef = useRef(null);

  // Check browser support
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  // Animated waveform
  useEffect(() => {
    if (isListening) {
      waveIntervalRef.current = setInterval(() => {
        setWaveform(Array.from({ length: 20 }, () => Math.random() * 60 + 10));
      }, 100);
    } else {
      clearInterval(waveIntervalRef.current);
      setWaveform(Array.from({ length: 20 }, () => 8));
    }
    return () => clearInterval(waveIntervalRef.current);
  }, [isListening]);

  const startListening = () => {
    if (!supported) {
      toast.error('Voice recognition not supported in this browser. Use Chrome!');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Listening…');
      setResponse('');
      toast('🎙️ Listening…', { duration: 2000 });
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setTranscript(final || interim);
      if (final) processCommand(final.toLowerCase().trim());
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      if (e.error !== 'no-speech') {
        toast.error(`Voice error: ${e.error}`);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = (text) => {
    let res = '';

    if (text.includes('optimize') || text.includes('start route') || text.includes('find route')) {
      res = 'Activating AI route optimizer. Running Route Agent, Traffic Agent, and Decision Agent…';
      onCommand?.('optimize');
    } else if (text.includes('clear') || text.includes('reset') || text.includes('remove all')) {
      res = 'Clearing all delivery stops from the map.';
      onCommand?.('clear');
    } else if (text.includes('demo') || text.includes('sample')) {
      res = 'Loading demo Mumbai route with 5 stops. Click optimize to see AI in action!';
      onCommand?.('demo');
    } else if (text.includes('dashboard') || text.includes('analytics')) {
      res = 'Switching to analytics dashboard.';
      onCommand?.('dashboard');
    } else if (text.includes('traffic')) {
      res = 'Pulling real-time traffic data from LSTM traffic agent…';
      onCommand?.('traffic');
    } else if (text.includes('mumbai') || text.includes('add mumbai')) {
      res = 'Adding Mumbai Central as a delivery stop.';
      onCommand?.('add-mumbai');
    } else if (text.includes('help') || text.includes('commands')) {
      res = 'Available commands: Optimize route, Load demo, Clear all stops, Show dashboard, Traffic report, Add Mumbai.';
    } else if (text.includes('hello') || text.includes('hi')) {
      res = 'Hello! I am RouteAI assistant. Say "Optimize route" to start, or "Load demo" to see a sample route.';
    } else {
      res = `I heard: "${text}". Try saying "Optimize route", "Load demo", or "Traffic report".`;
    }

    setResponse(res);
    speak(res);
    toast.success(`🤖 ${res.substring(0, 60)}…`, { duration: 3000 });
  };

  const runDemoCommand = (cmdText) => {
    setTranscript(cmdText.replace(/"/g, ''));
    processCommand(cmdText.toLowerCase().replace(/"/g, ''));
  };

  return (
    <div className="voice-page fade-in">
      {/* Title */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 20, padding: '6px 16px', fontSize: '0.75rem',
          color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 20
        }}>
          <span>🎙️</span> AI Voice Interface
        </div>
        <h1 className="voice-title">RouteAI Assistant</h1>
        <p className="voice-subtitle">
          Control your route optimizer with natural voice commands.<br />
          Powered by Web Speech API + AI Agent Pipeline.
        </p>
      </div>

      {/* Voice Orb */}
      <div
        className={`voice-orb ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stopListening : startListening}
        style={{ cursor: 'pointer' }}
      >
        <span className="voice-icon">{isListening ? '🎙️' : '🎤'}</span>
      </div>

      <div style={{ marginBottom: 32, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
        {isListening
          ? <span style={{ color: 'var(--accent-cyan)', animation: 'textBlink 1s infinite' }}>● Listening… Say a command</span>
          : 'Click the orb or tap a command below'}
      </div>

      {/* Waveform */}
      {waveform.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 80, marginBottom: 24 }}>
          {waveform.map((h, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: `${h}px`,
                background: isListening
                  ? `hsl(${180 + i * 10}, 100%, 60%)`
                  : 'var(--border-subtle)',
                borderRadius: 2,
                transition: 'height 0.1s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="transcript-box" style={{ maxWidth: 500, marginBottom: 16 }}>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontStyle: 'normal' }}>You: </span>
          {transcript}
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div className="transcript-box" style={{ maxWidth: 500, marginBottom: 32, borderColor: 'rgba(124,58,237,0.3)' }}>
          <span style={{ color: '#a78bfa', fontWeight: 600, fontStyle: 'normal' }}>🤖 RouteAI: </span>
          {response}
        </div>
      )}

      {/* Quick Commands */}
      <div style={{ maxWidth: 600, width: '100%' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Quick Commands
        </div>
        <div className="voice-commands">
          {COMMANDS.map((c, i) => (
            <button
              key={i}
              className="voice-cmd"
              onClick={() => runDemoCommand(c.cmd)}
            >
              <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.8rem', marginBottom: 2 }}>{c.cmd}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Browser support notice */}
      {!supported && (
        <div style={{
          marginTop: 24, padding: '12px 20px', background: 'rgba(255,59,92,0.08)',
          border: '1px solid rgba(255,59,92,0.2)', borderRadius: 10,
          color: 'var(--accent-red)', fontSize: '0.8rem', maxWidth: 400, textAlign: 'center'
        }}>
          ⚠️ Voice recognition requires Chrome or Edge browser.
          Demo button clicks still work!
        </div>
      )}

      {/* Info */}
      <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 600 }}>
        {[
          { icon: '🧠', text: 'NLP Command Processing' },
          { icon: '🎙️', text: 'Web Speech API (en-IN)' },
          { icon: '🔊', text: 'Text-to-Speech feedback' },
          { icon: '⚡', text: 'Real-time agent trigger' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)', borderRadius: 20,
            fontSize: '0.75rem', color: 'var(--text-secondary)'
          }}>
            {item.icon} {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
