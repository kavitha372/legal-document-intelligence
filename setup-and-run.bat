@echo off
:: ============================================================
:: Legal Document Intelligence — One-Click Setup and Run
:: Double-click this file OR run it from Command Prompt
:: ============================================================

setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo.
echo ========================================
echo  Legal Document Intelligence Setup
echo ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found in PATH.
    echo Please restart your computer after installing Node.js.
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

node --version
npm --version

echo.
echo [1/6] Installing backend dependencies...
cd /d "%BACKEND%"
call npm install --no-fund --no-audit
if errorlevel 1 (
    echo ERROR: Backend npm install failed.
    pause
    exit /b 1
)

echo.
echo [2/6] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Prisma generate failed.
    pause
    exit /b 1
)

echo.
echo [3/6] Creating database schema...
call npx prisma db push --accept-data-loss
if errorlevel 1 (
    echo ERROR: Prisma db push failed.
    pause
    exit /b 1
)

echo.
echo [4/6] Seeding demo users...
call npx ts-node src/utils/seed.ts
if errorlevel 1 (
    echo WARNING: Seeding failed (may already be seeded - continuing)
)

echo.
echo [5/6] Generating sample PDF documents...
call npx ts-node src/utils/generateSamplePdfs.ts
if errorlevel 1 (
    echo WARNING: PDF generation failed (continuing)
)

echo.
echo [6/6] Installing frontend dependencies...
cd /d "%FRONTEND%"
call npm install --no-fund --no-audit
if errorlevel 1 (
    echo ERROR: Frontend npm install failed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Setup complete!
echo ========================================
echo.
echo  Starting backend (port 3001)...
echo  Starting frontend (port 5173)...
echo.
echo  Once both servers start, open:
echo    http://localhost:5173
echo.
echo  Demo login:
echo    admin        / Admin@1234!
echo    reviewer1    / Reviewer@1234!
echo    readonly1    / Readonly@1234!
echo.
echo  Press Ctrl+C in each window to stop.
echo ========================================
echo.

:: Start backend in new window
start "Backend - Legal Doc API" cmd /k "cd /d "%BACKEND%" && npm run dev"

:: Wait 3 seconds then start frontend
timeout /t 3 /nobreak >nul

:: Start frontend in new window
start "Frontend - Legal Doc UI" cmd /k "cd /d "%FRONTEND%" && npm run dev"

echo Both servers are starting in separate windows.
echo Backend API docs: http://localhost:3001/api/docs
echo.
pause
endlocal
