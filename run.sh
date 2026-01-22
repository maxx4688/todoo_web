#!/usr/bin/env sh
# Run the ToDoo web app locally. Use from this directory only.
# Standalone: move this folder anywhere and run ./run.sh

cd "$(dirname "$0")"

if command -v python3 >/dev/null 2>&1; then
  echo "Starting server at http://localhost:8080 (Python 3)"
  python3 -m http.server 8080
elif command -v python >/dev/null 2>&1; then
  echo "Starting server at http://localhost:8080 (Python 2)"
  python -m SimpleHTTPServer 8080
elif command -v npx >/dev/null 2>&1; then
  echo "Starting server at http://localhost:8080 (npx http-server)"
  npx -y http-server -p 8080 -c-1 .
else
  echo "No Python or Node.js found. Install one of:"
  echo "  - Python 3: python3 -m http.server 8080"
  echo "  - Node.js:  npm start"
  exit 1
fi
