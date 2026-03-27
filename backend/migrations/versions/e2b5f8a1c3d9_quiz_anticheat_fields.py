"""quiz anti-cheat fields

Revision ID: e2b5f8a1c3d9
Revises: f4a2e9c3b1d7
Create Date: 2026-03-26

"""
from alembic import op
import sqlalchemy as sa

revision = 'e2b5f8a1c3d9'
down_revision = 'f4a2e9c3b1d7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('quizzes', sa.Column('randomise_order', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('quizzes', sa.Column('max_attempts_per_day', sa.Integer(), nullable=True, server_default='3'))
    op.add_column('quizzes', sa.Column('show_correct_answers', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    op.drop_column('quizzes', 'show_correct_answers')
    op.drop_column('quizzes', 'max_attempts_per_day')
    op.drop_column('quizzes', 'randomise_order')
