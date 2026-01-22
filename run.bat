@echo off
REM Run the ToDoo web app locally. Run from this directory only.
REM Standalone: move this folder anywhere and run run.bat

cd /d "%~dp0"

where python >nul 2>&1
if %errorlevel% equ 0 (
  echo Starting server at http://localhost:8080
  python -m http.server 8080
  goto :eof
)

where npx >nul 2>&1
if %errorlevel% equ 0 (
  echo Starting server at http://localhost:8080
  npx -y http-server -p 8080 -c-1 .
  goto :eof
)

echo No Python or Node.js found. Install one of:
echo   - Python: python -m http.server 8080
echo   - Node.js: npm start
exit /b 1
