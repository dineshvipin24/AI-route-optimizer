# Deployment Guide

## GitHub Setup ✅
Your code is now on GitHub: https://github.com/dineshvipin24/AI-route-optimizer

## Vercel Deployment

### Option 1: Deploy Frontend (Client) to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "New Project"
3. Import your `AI-route-optimizer` repository
4. In the settings:
   - **Framework**: Vite
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Root Directory**: Leave blank
5. Add environment variables:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend-api.com`)
6. Click "Deploy"

### Option 2: Deploy Backend (Server) to Vercel

1. Create a new Vercel project from your GitHub repo
2. In settings:
   - **Build Command**: `cd server && npm install`
   - **Output Directory**: `server`
   - **Start Command**: `node index.js`
3. Add environment variables:
   - `PORT`: 3000 (or your preferred port)
   - `ORS_API_KEY`: Your OpenRouteService API key
   - `OPENWEATHER_API_KEY`: Your OpenWeatherMap API key
   - `GEMINI_API_KEY`: Your Gemini API key
4. Click "Deploy"

### Option 3: Full Stack Deployment (Recommended)

Deploy frontend and backend as separate Vercel projects:

**Frontend Project:**
- Repository: Your GitHub repo
- Build: `cd client && npm install && npm run build`
- Output: `client/dist`

**Backend Project:**
- Repository: Your GitHub repo
- Build: `cd server && npm install`
- Start: `node index.js`
- Add all required API keys as environment variables

Then update the frontend's `VITE_API_URL` to point to your backend Vercel URL.

## Getting API Keys

- **OpenRouteService**: https://openrouteservice.org/dev/#/signup
- **OpenWeatherMap**: https://openweathermap.org/api
- **Gemini**: https://aistudio.google.com/

## Local Setup
Copy `.env.example` to `.env` in the server folder and add your actual API keys.
