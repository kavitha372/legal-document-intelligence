@echo off
title Frontend - Legal Document Intelligence UI
echo.
echo =====================================================
echo   FRONTEND SERVER - Legal Document Intelligence
echo   Open: http://localhost:5173
echo =====================================================
echo.
echo   Make sure the backend is running first!
echo   Press Ctrl+C to stop.
echo.
cd /d "%~dp0frontend"
npm run dev
