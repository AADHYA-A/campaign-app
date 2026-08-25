"""add_manager_role_department_manager_id

Revision ID: a3f92c1d7e45
Revises: fdb12baa632e
Create Date: 2026-08-25 19:28:00.000000

Adds:
  - users.department    (VARCHAR 255, nullable)
  - users.manager_id    (VARCHAR 36, FK → users.id ON DELETE SET NULL, nullable)

Role column already exists (default: "user").
The new manager role ("manager") is a soft-code change — no schema change needed
since the column accepts any string. This migration only adds the new columns.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a3f92c1d7e45"
down_revision: Union[str, None] = "fdb12baa632e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add department column (optional string)
    op.add_column(
        "users",
        sa.Column("department", sa.String(255), nullable=True),
    )

    # Add manager_id FK (self-referential, optional)
    op.add_column(
        "users",
        sa.Column("manager_id", sa.String(36), nullable=True),
    )

    # Add foreign key constraint (best-effort — may fail on SQLite which ignores FK constraints)
    try:
        op.create_foreign_key(
            "fk_users_manager_id",
            "users",
            "users",
            ["manager_id"],
            ["id"],
            ondelete="SET NULL",
        )
    except Exception:
        # SQLite does not support ALTER TABLE ADD FOREIGN KEY — skip gracefully
        pass


def downgrade() -> None:
    try:
        op.drop_constraint("fk_users_manager_id", "users", type_="foreignkey")
    except Exception:
        pass

    op.drop_column("users", "manager_id")
    op.drop_column("users", "department")
