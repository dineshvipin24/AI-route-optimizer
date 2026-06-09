# 🚀 RouteAI — AI Smart Route Optimizer

> **THE NEURAL NEXUS 2026 | SAKEC Hackathon | Smart Routing (Logistics)**

A full-stack AI-powered multi-stop delivery route optimizer featuring a 3-agent pipeline with real-time traffic prediction, weather integration, LLM-based decision making, and an interactive map dashboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           USER INTERFACE (React)            │
│  Map View | Dashboard | Voice AI | Analytics│
└──────────────────┬──────────────────────────┘
                   │ axios HTTP
         ┌─────────▼─────────┐
         │   API GATEWAY     │
         │   (Express.js)    │
         └─────────┬─────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐    ┌────▼────┐   ┌────▼─────┐
│ Route  │    │ Traffic │   │ Decision │
│ Agent  │◄──►│  Agent  │◄─►│  Agent   │
│ 2-Opt  │    │  LSTM   │   │  LLM     │
└───┬────┘    └────┬────┘   └────┬─────┘
    │              │              │
    └──────────────┼──────────────┘
                   │
         ┌─────────▼─────────┐
         │   LIVE APIs       │
         │  ORS | Weather    │
         └───────────────────┘
```

---

## 🤖 AI Agents

### 1. Route Agent (2-Opt Optimizer)
- Nearest-Neighbor heuristic for initial ordering
- **2-Opt improvement** for local search optimization
- Real road geometry via OpenRouteService API

### 2. Traffic Agent (LSTM-based Simulation)
- Hour-of-day × day-of-week congestion matrix
- Sigmoid-based delay factor prediction
- Peak hour detection and advisory

### 3. Decision Agent (LLM-style Reasoning)
- Rule-based multi-factor decision engine
- Analyzes: traffic level, weather, distance, stops, time
- Outputs risk score (0-100), go/caution/stop decision
- Context-aware recommendations

---

## 🌐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Map | Leaflet + react-leaflet |
| Charts | Recharts |
| Backend | Express.js + Node.js |
| Route Opt | Nearest Neighbor + 2-Opt |
| Traffic AI | LSTM-inspired weights |
| Maps API | OpenRouteService |
| Weather | OpenWeatherMap |
| Voice | Web Speech API (en-IN) |

---

## 🚀 Quick Start

### Option 1: Double-click `start.bat` (Windows)
This launches both servers and opens the browser automatically.

### Option 2: Manual

**Terminal 1 — Backend:**
```bash
cd server
npm install
npm start
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
npm run dev
```

Open: http://localhost:5173

---

## 🔑 API Keys (Optional)

The app works in **simulation mode** without API keys — perfect for demos!

For live road routing, add keys to `server/.env`:

```env
# Free at https://openrouteservice.org/dev/#/signup
ORS_API_KEY=your_key_here

# Free at https://openweathermap.org/api
OPENWEATHER_API_KEY=your_key_here
```

---

## 📖 Features

- ✅ **Interactive map** with colored stop markers
- ✅ **2-Opt route optimization** (proven logistics algorithm)
- ✅ **Real road geometry** via OpenRouteService (or simulated)
- ✅ **LSTM traffic prediction** by hour/day patterns
- ✅ **Weather integration** with routing impact analysis
- ✅ **AI Decision Agent** with risk scoring + recommendations
- ✅ **Eco metrics**: CO₂ saved, fuel saved, efficiency gain
- ✅ **Analytics dashboard** with 5 chart types (Recharts)
- ✅ **Voice AI interface** with Web Speech API (en-IN)
- ✅ **Mumbai delivery presets** for instant demo
- ✅ **Multi-vehicle support**: Truck, Van, Car, Bike
- ✅ **Priority modes**: Balanced, Fastest, Eco, Shortest
- ✅ **Live API status** indicator

---

## 🏆 Hackathon Submission

**Event:** THE NEURAL NEXUS 2026  
**Organizer:** CogniScience Club × CSI SAKEC, Mumbai  
**Date:** April 24, 2026  
**Domain:** Smart Routing (Logistics)  
**Team:** [Your team name]

### Bonus Points Achieved:
- [x] Live APIs (OpenRouteService + OpenWeatherMap)
- [x] AI Agent pipeline (3 coordinated agents)
- [x] System architecture demonstrated
- [x] Voice interface (Edge AI concept)
- [x] Real-world logistics use case
