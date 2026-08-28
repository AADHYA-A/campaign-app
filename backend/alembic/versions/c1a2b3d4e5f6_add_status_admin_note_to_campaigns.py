"""add_status_admin_note_to_campaigns

Revision ID: c1a2b3d4e5f6
Revises: a3f92c1d7e45
Create Date: 2026-08-28 10:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c1a2b3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'a3f92c1d7e45'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'campaigns',
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
    )
    op.add_column(
        'campaigns',
        sa.Column('admin_note', sa.Text(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('campaigns', 'admin_note')
    op.drop_column('campaigns', 'status')
