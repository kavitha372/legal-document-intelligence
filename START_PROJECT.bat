@echo off
title Legal Document Intelligence - Full Setup and Start
color 0A
cls

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo.
echo ============================================================
echo   LEGAL DOCUMENT INTELLIGENCE - Wipro CPPE Project
echo ============================================================
echo.

:: ── Check Node.js ────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause & exit /b 1
)
echo Node.js: OK
echo.

:: ── STEP 1: Seed database (uses node directly, no ts-node) ───
echo [1/4] Creating demo users in database...
cd /d "%BACKEND%"
node seed.js
if errorlevel 1 (
    echo  Note: Users may already exist, continuing...
)
echo.

:: ── STEP 2: Frontend install (only if needed) ────────────────
if not exist "%FRONTEND%\node_modules\vite" (
    echo [2/4] Installing frontend dependencies (2-3 minutes)...
    cd /d "%FRONTEND%"
    call npm install --no-fund --no-audit
    if errorlevel 1 (
        echo.
        echo ERROR: Frontend npm install failed.
        echo Try running manually: cd frontend and npm install
        pause & exit /b 1
    )
    echo  Frontend install complete.
) else (
    echo [2/4] Frontend dependencies already installed. Skipping.
)
echo.

:: ── STEP 3: Start backend ─────────────────────────────────────
echo [3/4] Starting backend API server (port 3001)...
cd /d "%BACKEND%"
start "BACKEND - API (port 3001) - Keep Open" cmd /k "color 0B && echo Backend starting... && cd /d "%BACKEND%" && node dev-server.js"
echo  Backend launching in separate window...
timeout /t 6 /nobreak >nul

:: ── STEP 4: Start frontend ────────────────────────────────────
echo [4/4] Starting frontend UI server (port 5173)...
cd /d "%FRONTEND%"
start "FRONTEND - UI (port 5173) - Keep Open" cmd /k "color 0A && echo Frontend starting... && cd /d "%FRONTEND%" && node_modules\.bin\vite"
echo  Frontend launching in separate window...
timeout /t 5 /nobreak >nul

:: ── Open browser ──────────────────────────────────────────────
echo.
echo ============================================================
echo   YOUR PROJECT IS STARTING!
echo.
echo   Opening: http://localhost:5173
echo.
echo   Login credentials:
echo     admin      /  Admin@1234!      (Full access)
echo     reviewer1  /  Reviewer@1234!   (Upload + Review)
echo     readonly1  /  Readonly@1234!   (View only)
echo.
echo   IMPORTANT: Keep both black windows open!
echo   Close them only when you want to stop the app.
echo ============================================================
echo.

start "" "http://localhost:5173"
pause
