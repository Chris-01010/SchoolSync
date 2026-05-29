"""add_read_at_to_notifications

Revision ID: 428d82c0aaa7
Revises: da1a8bfb43d3
Create Date: 2026-05-27 14:37:55.387540

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '428d82c0aaa7'
down_revision: Union[str, Sequence[str], None] = 'da1a8bfb43d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'notifications',
        sa.Column(
            'read_at',
            sa.DateTime(timezone=True),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        'notifications',
        'read_at'
    )
