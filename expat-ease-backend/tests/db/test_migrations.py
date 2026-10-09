from pathlib import Path

import pytest
from sqlalchemy import create_engine, inspect, text
from sqlmodel import Session, SQLModel

from app.core.config import settings
from app.db import (
    base,  # noqa: F401
    migrate,
)
from app.models.user import User


def _configure_database(monkeypatch: pytest.MonkeyPatch, database_path: Path) -> None:
    database_url = f"sqlite:///{database_path.as_posix()}"
    monkeypatch.setattr(settings, "DATABASE_URL", database_url)
    monkeypatch.setattr(
        migrate,
        "engine",
        create_engine(database_url, connect_args={"check_same_thread": False}),
    )


def test_migrate_creates_fresh_database(monkeypatch, tmp_path):
    database_path = tmp_path / "fresh.db"
    _configure_database(monkeypatch, database_path)

    migrate.migrate_database()

    inspector = inspect(migrate.engine)
    table_names = set(inspector.get_table_names())
    assert set(SQLModel.metadata.tables).issubset(table_names)
    assert "alembic_version" in table_names


def test_migrate_adopts_compatible_existing_database(monkeypatch, tmp_path):
    database_path = tmp_path / "existing.db"
    _configure_database(monkeypatch, database_path)
    SQLModel.metadata.create_all(migrate.engine)

    with Session(migrate.engine) as session:
        session.add(
            User(
                email="preserved@example.com",
                full_name="Preserved User",
                hashed_password="existing-hash",
            )
        )
        session.commit()
    with migrate.engine.begin() as connection:
        connection.execute(text("CREATE TABLE legacy_table (id INTEGER PRIMARY KEY)"))

    migrate.migrate_database()

    with migrate.engine.connect() as connection:
        user_count = connection.execute(text("SELECT COUNT(*) FROM users")).scalar_one()
        version = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
    assert user_count == 1
    assert version == "7e41027f0980"
    assert "legacy_table" in inspect(migrate.engine).get_table_names()


def test_migrate_rejects_incompatible_existing_database(monkeypatch, tmp_path):
    database_path = tmp_path / "incompatible.db"
    _configure_database(monkeypatch, database_path)
    with migrate.engine.begin() as connection:
        connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY)"))

    with pytest.raises(RuntimeError, match="does not match the migration baseline"):
        migrate.migrate_database()

    assert "alembic_version" not in inspect(migrate.engine).get_table_names()
