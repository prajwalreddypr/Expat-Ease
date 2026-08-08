"""
Reminder API — FastAPI backend with JWT auth and SQLite storage.

Run:
    pip install -r requirements.txt
    uvicorn app.main:app --reload

Then open http://127.0.0.1:8000/docs
"""

from __future__ import annotations

import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.database import create_db_and_tables
from app.models import utcnow
from app.routers import auth, reminders
from app.scheduler import scheduler_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    task = asyncio.create_task(scheduler_loop())
    yield
    task.cancel()


app = FastAPI(title="Reminder API", version="1.0.0", lifespan=lifespan)

# Permissive CORS for local development / preview panels.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(reminders.router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "time": utcnow().isoformat()}


# Serve the simple demo frontend at the root URL.
_FRONTEND = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "index.html")


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(_FRONTEND)
