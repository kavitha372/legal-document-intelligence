@echo off
title Legal Document Intelligence - Setup
color 0A

echo.
echo =====================================================
echo   LEGAL DOCUMENT INTELLIGENCE - SETUP
echo   Wipro CPPE Assessment Project
echo =====================================================
echo.

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    echo Then restart your computer and run this again.
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODEVER=%%v
for /f "tokens=*" %%v in ('npm --version') do set NPMVER=%%v
echo Node.js: %NODEVER%
echo npm:     %NPMVER%
echo.

set "BACKEND=%~dp0backend"
set "FRONTEND=%~dp0frontend"

:: ─── BACKEND ────────────────────────────────────────
echo [1/6] Installing backend dependencies...
echo       (This may take 2-3 minutes on first run)
cd /d "%BACKEND%"
call npm install --no-fund --no-audit
if errorlevel 1 ( echo. & echo ERROR at step 1 & pause & exit /b 1 )
echo       Done.

echo.
echo [2/6] Generating Prisma client...
call npx prisma generate
if errorlevel 1 ( echo. & echo ERROR at step 2 & pause & exit /b 1 )
echo       Done.

echo.
echo [3/6] Creating SQLite database...
call npx prisma db push --accept-data-loss
if errorlevel 1 ( echo. & echo ERROR at step 3 & pause & exit /b 1 )
echo       Done.

echo.
echo [4/6] Seeding demo users...
call npx ts-node src/utils/seed.ts
if errorlevel 1 ( echo WARNING: seed may have already run - continuing )
echo       Done.

echo.
echo [5/6] Generating sample PDF documents...
call npx ts-node src/utils/generateSamplePdfs.ts
if errorlevel 1 ( echo WARNING: PDF generation failed - continuing )
echo       Done.

:: ─── FRONTEND ───────────────────────────────────────
echo.
echo [6/6] Installing frontend dependencies...
cd /d "%FRONTEND%"
call npm install --no-fund --no-audit
if errorlevel 1 ( echo. & echo ERROR at step 6 & pause & exit /b 1 )
echo       Done.

:: ─── SUCCESS ─────────────────────────────────────────
echo.
echo =====================================================
echo   SETUP COMPLETE!
echo =====================================================
echo.
echo   Next: Run these TWO .bat files (each in its own
echo   Command Prompt window):
echo.
echo     run-backend.bat   (starts the API on port 3001)
echo     run-frontend.bat  (starts the UI on port 5173)
echo.
echo   Then open:  http://localhost:5173
echo.
echo   Demo logins:
echo     admin     / Admin@1234!      (Administrator)
echo     reviewer1 / Reviewer@1234!   (Legal Reviewer)
echo     readonly1 / Readonly@1234!   (Read-Only)
echo.
echo =====================================================
echo.
pause
