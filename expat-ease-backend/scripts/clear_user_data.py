"""
Clear all user accounts from the database.

This script is intentionally destructive. It supports a dry-run mode and a confirmation
prompt. It uses the application's SQLModel session and models so mappers are loaded.

Usage:
    python scripts/clear_user_data.py --dry-run
    python scripts/clear_user_data.py

Be sure to back up your database before running.
"""
from __future__ import annotations

import argparse
from typing import Optional
import os
import sys
from pathlib import Path

# Ensure the project root is on sys.path so 'app' package imports work when running
# this script directly from the scripts/ folder.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sqlmodel import select

from app.db.session import engine
from app.db.init_db import create_db_and_tables

# Import models to ensure mappers are registered
from app.models.user import User
from app.models.password_reset_token import PasswordResetToken


def count_rows() -> dict:
    from sqlmodel import Session

    with Session(engine) as session:
        users = session.exec(select(User)).all()
        tokens = session.exec(select(PasswordResetToken)).all()
        return {"users": len(users), "password_reset_tokens": len(tokens)}


def delete_users(confirm: bool = False) -> None:
    from sqlmodel import Session, delete

    if not confirm:
        raise RuntimeError("delete_users called without confirmation=True")

    with Session(engine) as session:
        # Remove password reset tokens first to avoid FK issues
        stmt_tokens = delete(PasswordResetToken)
        res_tokens = session.exec(stmt_tokens)

        stmt_users = delete(User)
        res_users = session.exec(stmt_users)

        session.commit()


def main(argv: Optional[list[str]] = None) -> None:
    parser = argparse.ArgumentParser(description="Clear all users from the DB (dangerous)")
    parser.add_argument("--dry-run", action="store_true", help="Don't delete, just show counts")
    parser.add_argument("--yes-actually-delete", action="store_true", help="Confirm destructive action")
    args = parser.parse_args(argv)

    # Ensure tables exist
    create_db_and_tables()

    counts_before = count_rows()
    print("Counts before:", counts_before)

    if args.dry_run:
        print("Dry run — no changes made.")
        return

    if not args.yes_actually_delete:
        print("This will DELETE ALL USERS and PASSWORD RESET TOKENS from the database.")
        print("If you are sure, re-run with --yes-actually-delete")
        return

    # Proceed with deletion
    delete_users(confirm=True)

    counts_after = count_rows()
    print("Counts after:", counts_after)


if __name__ == "__main__":
    main()
