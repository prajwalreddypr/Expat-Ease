"""
Main API router for v1 endpoints.
"""
from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

# TODO: Add more routers here as you create them
# api_router.include_router(cities.router, prefix="/cities", tags=["cities"])
# api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
