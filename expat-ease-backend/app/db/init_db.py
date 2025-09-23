"""
Database initialization utilities.
"""
from sqlmodel import SQLModel

from app.db.session import engine


def create_db_and_tables() -> None:
    """
    Create database and all tables.
    This function should be called on application startup.
    """
    # Import all models to register them with SQLModel
    # This is important for SQLModel.metadata.create_all() to work
    from app.db import base  # noqa: F401
    
    # Create all tables
    SQLModel.metadata.create_all(engine)
