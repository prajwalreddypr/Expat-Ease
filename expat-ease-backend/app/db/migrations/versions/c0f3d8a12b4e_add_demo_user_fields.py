"""add demo user fields

Revision ID: c0f3d8a12b4e
Revises: 7e41027f0980
Create Date: 2026-11-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c0f3d8a12b4e"
down_revision: Union[str, None] = "7e41027f0980"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_demo", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column("users", sa.Column("demo_expires_at", sa.DateTime(), nullable=True))
    op.create_index(op.f("ix_users_is_demo"), "users", ["is_demo"], unique=False)
    op.create_index(op.f("ix_users_demo_expires_at"), "users", ["demo_expires_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_demo_expires_at"), table_name="users")
    op.drop_index(op.f("ix_users_is_demo"), table_name="users")
    op.drop_column("users", "demo_expires_at")
    op.drop_column("users", "is_demo")
