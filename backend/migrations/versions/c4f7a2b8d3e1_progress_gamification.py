"""progress_gamification: XP, levels, streaks, badges

Revision ID: c4f7a2b8d3e1
Revises: b3d9f1a4c7e2
Create Date: 2026-03-26 00:00:00.000000

Changes:
  - user_progress: add subject_id (denorm FK), xp_earned; drop score; add
    UNIQUE(user_id, lesson_id); swap single-col indexes for composite ones
  - drop user_streaks (replaced by user_stats)
  - create user_stats (XP, level, streak, grade_category — leaderboard-ready)
  - create badges + user_badges (badge infrastructure)
  - seed 12 initial badges
"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'c4f7a2b8d3e1'
down_revision: Union[str, None] = 'b3d9f1a4c7e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Alter user_progress ─────────────────────────────────────────────
    # Drop old single-column indexes (replaced by composite ones below)
    op.drop_index('ix_user_progress_user_id', table_name='user_progress')
    op.drop_index('ix_user_progress_lesson_id', table_name='user_progress')

    # Drop old score column (removed from model)
    op.drop_column('user_progress', 'score')

    # Add new columns
    op.add_column('user_progress',
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('user_progress',
        sa.Column('xp_earned', sa.Integer(), nullable=False, server_default='0'))

    # FK: user_progress.subject_id -> subjects.id  (SET NULL so deleting a
    # subject doesn't nuke the completion record)
    op.create_foreign_key(
        'fk_user_progress_subject_id',
        'user_progress', 'subjects',
        ['subject_id'], ['id'],
        ondelete='SET NULL',
    )

    # Unique constraint — prevents double-counting a lesson for the same user
    op.create_unique_constraint(
        'uq_user_progress_user_lesson',
        'user_progress',
        ['user_id', 'lesson_id'],
    )

    # Composite indexes
    op.create_index('ix_user_progress_user_completed_at', 'user_progress',
                    ['user_id', 'completed_at'])
    op.create_index('ix_user_progress_user_subject', 'user_progress',
                    ['user_id', 'subject_id'])

    # ── 2. Drop user_streaks (superseded by user_stats) ────────────────────
    op.drop_table('user_streaks')

    # ── 3. Create user_stats ───────────────────────────────────────────────
    # One row per user.  Pre-aggregated hot path: dashboard, leaderboard, XP bar.
    # (grade_category, total_xp DESC) composite index → leaderboard is a pure
    # index scan even at 1M rows.
    op.create_table(
        'user_stats',
        sa.Column(
            'user_id', postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False, primary_key=True,
        ),
        sa.Column('total_xp', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('level', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('level_name', sa.String(30), nullable=False,
                  server_default='Mwanzo'),
        sa.Column('lessons_completed', sa.Integer(), nullable=False,
                  server_default='0'),
        sa.Column('subjects_mastered', sa.Integer(), nullable=False,
                  server_default='0'),
        sa.Column('current_streak', sa.Integer(), nullable=False,
                  server_default='0'),
        sa.Column('longest_streak', sa.Integer(), nullable=False,
                  server_default='0'),
        # Stored as EAT (Africa/Nairobi UTC+3) calendar date — streak logic
        sa.Column('last_activity_date', sa.Date(), nullable=True),
        # Denorm from users.grade_category — leaderboard filter without JOIN
        sa.Column('grade_category', sa.String(20), nullable=False,
                  server_default=''),
        sa.Column(
            'updated_at', sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text('now()'),
        ),
    )
    # Leaderboard: ORDER BY total_xp DESC within a grade_category
    op.create_index('ix_user_stats_grade_xp', 'user_stats',
                    ['grade_category', 'total_xp'])
    # Global leaderboard (all grades)
    op.create_index('ix_user_stats_total_xp', 'user_stats', ['total_xp'])

    # ── 4. Create badges ───────────────────────────────────────────────────
    op.create_table(
        'badges',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('slug', sa.String(50), nullable=False, unique=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon_url', sa.Text(), nullable=True),
        # criteria_type: "lessons_completed" | "streak_days" |
        #                "subjects_mastered" | "level_reached"
        sa.Column('criteria_type', sa.String(50), nullable=False),
        sa.Column('criteria_value', sa.Integer(), nullable=False),
        sa.Column('xp_bonus', sa.Integer(), nullable=False, server_default='0'),
        sa.Column(
            'created_at', sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text('now()'),
        ),
    )

    # ── 5. Create user_badges ──────────────────────────────────────────────
    op.create_table(
        'user_badges',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            'user_id', postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
        ),
        sa.Column(
            'badge_id', postgresql.UUID(as_uuid=True),
            sa.ForeignKey('badges.id', ondelete='CASCADE'),
            nullable=False,
        ),
        sa.Column(
            'earned_at', sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text('now()'),
        ),
    )
    op.create_unique_constraint('uq_user_badge', 'user_badges',
                                ['user_id', 'badge_id'])
    op.create_index('ix_user_badges_user_id', 'user_badges', ['user_id'])

    # ── 6. Seed 12 initial badges ──────────────────────────────────────────
    badges_tbl = sa.table(
        'badges',
        sa.column('id', postgresql.UUID(as_uuid=True)),
        sa.column('slug', sa.String),
        sa.column('name', sa.String),
        sa.column('description', sa.Text),
        sa.column('criteria_type', sa.String),
        sa.column('criteria_value', sa.Integer),
        sa.column('xp_bonus', sa.Integer),
    )
    op.bulk_insert(badges_tbl, [
        # ── Lessons-completed milestones ──────────────────────────────────
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000001'),
            'slug': 'first_step',
            'name': 'First Step',
            'description': 'Complete your very first lesson.',
            'criteria_type': 'lessons_completed',
            'criteria_value': 1,
            'xp_bonus': 5,
        },
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000002'),
            'slug': 'dedicated',
            'name': 'Dedicated',
            'description': 'Complete 10 lessons.',
            'criteria_type': 'lessons_completed',
            'criteria_value': 10,
            'xp_bonus': 20,
        },
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000003'),
            'slug': 'achiever',
            'name': 'Achiever',
            'description': 'Complete 25 lessons.',
            'criteria_type': 'lessons_completed',
            'criteria_value': 25,
            'xp_bonus': 30,
        },
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000004'),
            'slug': 'centurion',
            'name': 'Centurion',
            'description': 'Complete 100 lessons.',
            'criteria_type': 'lessons_completed',
            'criteria_value': 100,
            'xp_bonus': 100,
        },
        # ── Streak milestones ─────────────────────────────────────────────
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000005'),
            'slug': 'week_warrior',
            'name': 'Week Warrior',
            'description': 'Study every day for 7 days in a row.',
            'criteria_type': 'streak_days',
            'criteria_value': 7,
            'xp_bonus': 25,
        },
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000006'),
            'slug': 'perfect_week',
            'name': 'Perfect Week',
            'description': 'Keep your streak alive for 14 days straight.',
            'criteria_type': 'streak_days',
            'criteria_value': 14,
            'xp_bonus': 75,
        },
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000007'),
            'slug': 'month_master',
            'name': 'Month Master',
            'description': 'Study every day for 30 days in a row.',
            'criteria_type': 'streak_days',
            'criteria_value': 30,
            'xp_bonus': 100,
        },
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000008'),
            'slug': 'unstoppable',
            'name': 'Unstoppable',
            'description': 'Study every day for 100 days in a row.',
            'criteria_type': 'streak_days',
            'criteria_value': 100,
            'xp_bonus': 500,
        },
        # ── Subject mastery ───────────────────────────────────────────────
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000009'),
            'slug': 'subject_master',
            'name': 'Subject Master',
            'description': 'Achieve Master tier in any subject.',
            'criteria_type': 'subjects_mastered',
            'criteria_value': 1,
            'xp_bonus': 50,
        },
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000010'),
            'slug': 'multi_master',
            'name': 'Multi Master',
            'description': 'Achieve Master tier in 3 subjects.',
            'criteria_type': 'subjects_mastered',
            'criteria_value': 3,
            'xp_bonus': 150,
        },
        # ── Level milestones ──────────────────────────────────────────────
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000011'),
            'slug': 'bingwa',
            'name': 'Bingwa',
            'description': 'Reach level 5 — you are a champion.',
            'criteria_type': 'level_reached',
            'criteria_value': 5,
            'xp_bonus': 50,
        },
        {
            'id': uuid.UUID('10000000-0000-0000-0000-000000000012'),
            'slug': 'tusome_champ',
            'name': 'Tusome Champ',
            'description': 'Reach the highest level — Tusome Champ!',
            'criteria_type': 'level_reached',
            'criteria_value': 10,
            'xp_bonus': 200,
        },
    ])


def downgrade() -> None:
    op.drop_table('user_badges')
    op.drop_table('badges')
    op.drop_table('user_stats')

    # Restore user_streaks
    op.create_table(
        'user_streaks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            'user_id', postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
        ),
        sa.Column('current_streak', sa.Integer(), nullable=False),
        sa.Column('longest_streak', sa.Integer(), nullable=False),
        sa.Column('last_study_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('now()')),
        sa.UniqueConstraint('user_id'),
    )

    # Revert user_progress changes
    op.drop_index('ix_user_progress_user_subject', table_name='user_progress')
    op.drop_index('ix_user_progress_user_completed_at', table_name='user_progress')
    op.drop_constraint('uq_user_progress_user_lesson', 'user_progress',
                       type_='unique')
    op.drop_constraint('fk_user_progress_subject_id', 'user_progress',
                       type_='foreignkey')
    op.drop_column('user_progress', 'xp_earned')
    op.drop_column('user_progress', 'subject_id')
    op.add_column('user_progress',
        sa.Column('score', sa.Float(), nullable=True))
    op.create_index('ix_user_progress_user_id', 'user_progress', ['user_id'])
    op.create_index('ix_user_progress_lesson_id', 'user_progress',
                    ['lesson_id'])
