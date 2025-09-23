"""
Database session management.
"""
from typing import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

# Create database engine
# Support both SQLite (default) and PostgreSQL via DATABASE_URL
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=False,  # Set to True for SQL query logging during development
)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.
    Automatically closes the session after use.
    """
    with Session(engine) as session:
        yield session
