#!/bin/bash
# Build backend binary for Tauri sidecar

set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Building backend binary..."

# Activate virtual environment
source ./venv/bin/activate

# Build with PyInstaller
pyinstaller --onefile \
    --name backend \
    --add-data "main.py:." \
    --hidden-import uvicorn.logging \
    --hidden-import uvicorn.loops \
    --hidden-import uvicorn.loops.auto \
    --hidden-import uvicorn.protocols \
    --hidden-import uvicorn.protocols.http \
    --hidden-import uvicorn.protocols.http.auto \
    --hidden-import uvicorn.protocols.websockets \
    --hidden-import uvicorn.protocols.websockets.auto \
    --hidden-import uvicorn.lifespan \
    --hidden-import uvicorn.lifespan.on \
    main.py

echo "Binary built successfully at: dist/backend"

# Copy to frontend binaries directory
mkdir -p ../frontend/src-tauri/binaries
cp dist/backend ../frontend/src-tauri/binaries/backend

# Make it executable
chmod +x ../frontend/src-tauri/binaries/backend

echo "Binary copied to frontend/src-tauri/binaries/backend"
