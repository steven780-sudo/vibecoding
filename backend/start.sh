#!/bin/bash
# Backend startup script

cd "$(dirname "$0")"
./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8765 --reload
