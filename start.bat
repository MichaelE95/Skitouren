@echo off
REM Starts the Skitour-Planer locally (http://localhost:3000) and opens it in the browser.
REM In this local mode, added/edited tours are written to public\tours\ and the
REM "Export -> GitHub" button commits and pushes them.
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\npm.cmd" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
  ) else (
    echo Node.js was not found. Please install it from https://nodejs.org/
    pause
    exit /b 1
  )
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install || (pause & exit /b 1)
)

REM Vite opens the browser automatically (server.open in vite.config.ts).
call npm run dev
pause
