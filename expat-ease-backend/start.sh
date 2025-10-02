#!/bin/bash
# Start script for Render deployment

# Set default port if not provided
export PORT=${PORT:-10000}

# Start the application
uvicorn app.main:app --host 0.0.0.0 --port $PORT
