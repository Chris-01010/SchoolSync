"""emergency_leave_fields

Revision ID: da1a8bfb43d3
Revises: 
Create Date: 2026-05-27 12:43:58.700807

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da1a8bfb43d3'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'absences',
        sa.Column(
            'is_emergency',
            sa.Boolean(),
            server_default=sa.text('false'),
            nullable=False
        )
    )

    op.add_column(
        'absences',
        sa.Column(
            'emergency_submitted_at',
            sa.DateTime(timezone=True),
            nullable=True
        )
    )

    op.add_column(
        'absences',
        sa.Column(
            'hod_response_deadline',
            sa.DateTime(timezone=True),
            nullable=True
        )
    )

    op.add_column(
        'absences',
        sa.Column(
            'auto_approved',
            sa.Boolean(),
            server_default=sa.text('false'),
            nullable=False
        )
    )

    op.add_column(
        'relief_assignments',
        sa.Column(
            'is_emergency',
            sa.Boolean(),
            server_default=sa.text('false'),
            nullable=False
        )
    )

    op.add_column(
        'relief_assignments',
        sa.Column(
            'response_deadline',
            sa.DateTime(timezone=True),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column('relief_assignments', 'response_deadline')
    op.drop_column('relief_assignments', 'is_emergency')

    op.drop_column('absences', 'auto_approved')
    op.drop_column('absences', 'hod_response_deadline')
    op.drop_column('absences', 'emergency_submitted_at')
    op.drop_column('absences', 'is_emergency')