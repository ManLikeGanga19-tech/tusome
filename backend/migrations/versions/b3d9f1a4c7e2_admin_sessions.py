"""admin_sessions table

Revision ID: b3d9f1a4c7e2
Revises: a7c2e5f8b1d3
Create Date: 2026-03-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'b3d9f1a4c7e2'
down_revision: Union[str, None] = 'a7c2e5f8b1d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'admin_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('admin_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('admin_users.id', ondelete='CASCADE'),
                  nullable=False, index=True),
        sa.Column('jti', sa.String(36), nullable=False, unique=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('now()')),
        sa.Column('last_active_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('now()')),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_admin_sessions_jti', 'admin_sessions', ['jti'], unique=True)
    op.create_index('ix_admin_sessions_is_active', 'admin_sessions', ['is_active'])
    op.create_index('ix_admin_sessions_created_at', 'admin_sessions', ['created_at'])


def downgrade() -> None:
    op.drop_table('admin_sessions')
