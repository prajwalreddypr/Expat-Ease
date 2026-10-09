from alembic import command
from alembic.config import Config
from sqlalchemy import inspect
from sqlmodel import SQLModel

from app.db import base  # noqa: F401
from app.db.session import engine


def _alembic_config() -> Config:
    return Config("alembic.ini")


def _validate_existing_schema() -> None:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    expected_tables = set(SQLModel.metadata.tables)

    missing_tables = sorted(expected_tables - existing_tables)
    missing_columns: list[str] = []
    for table_name in sorted(expected_tables & existing_tables):
        existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
        expected_columns = set(SQLModel.metadata.tables[table_name].columns.keys())
        for column_name in sorted(expected_columns - existing_columns):
            missing_columns.append(f"{table_name}.{column_name}")

    if missing_tables or missing_columns:
        details = []
        if missing_tables:
            details.append(f"missing tables: {', '.join(missing_tables)}")
        if missing_columns:
            details.append(f"missing columns: {', '.join(missing_columns)}")
        raise RuntimeError(
            "Existing database does not match the migration baseline ("
            + "; ".join(details)
            + "). No migration state was changed."
        )


def migrate_database() -> None:
    config = _alembic_config()
    existing_tables = set(inspect(engine).get_table_names())

    if existing_tables and "alembic_version" not in existing_tables:
        _validate_existing_schema()
        command.stamp(config, "head")

    command.upgrade(config, "head")


if __name__ == "__main__":
    migrate_database()
