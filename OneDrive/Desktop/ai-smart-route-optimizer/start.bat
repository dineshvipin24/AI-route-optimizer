@echo off
echo.
echo  ================================================
echo   RouteAI - AI Smart Route Optimizer
echo   THE NEURAL NEXUS 2026 - SAKEC Hackathon
echo  ================================================
echo.
echo  Starting servers...
echo.

:: Start the backend server
echo  [1/2] Starting Express API Server (port 5000)...
start "RouteAI Server" cmd /k "cd /d %~dp0server && node index.js"

:: Wait a moment
timeout /t 2 /nobreak > nul

:: Start the frontend
echo  [2/2] Starting React Frontend (port 5173)...
start "RouteAI Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo  ✅ Both servers starting!
echo.
echo  📡 API Server:  http://localhost:5000
echo  🌐 Frontend:    http://localhost:5173
echo.
echo  Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:5173

pause
