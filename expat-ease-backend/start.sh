#!/bin/bash
# Start script for Render deployment

set -e

# Set default port if not provided
export PORT=${PORT:-10000}

# Apply schema migrations before starting the application.
python -m app.db.migrate

# Start the application
uvicorn app.main:app --host 0.0.0.0 --port $PORT
