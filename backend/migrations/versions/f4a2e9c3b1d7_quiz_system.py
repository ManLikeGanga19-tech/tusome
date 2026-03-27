"""quiz system: quizzes, questions, choices, attempts, answers

Revision ID: f4a2e9c3b1d7
Revises: d1e8f4a2c9b3
Create Date: 2026-03-26 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'f4a2e9c3b1d7'
down_revision: Union[str, None] = 'd1e8f4a2c9b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # quizzes
    op.create_table(
        'quizzes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('lesson_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('lessons.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('pass_score', sa.Integer, nullable=False, server_default='60'),
        sa.Column('xp_reward', sa.Integer, nullable=False, server_default='20'),
        sa.Column('time_limit_seconds', sa.Integer, nullable=True),
        sa.Column('grade_category', sa.String(20), nullable=True),
        sa.Column('is_published', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_quizzes_lesson_id', 'quizzes', ['lesson_id'])
    op.create_index('ix_quizzes_grade_category', 'quizzes', ['grade_category'])

    # quiz_questions
    op.create_table(
        'quiz_questions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('quiz_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_text', sa.Text, nullable=False),
        sa.Column('question_type', sa.String(20), nullable=False, server_default='mcq'),
        sa.Column('explanation', sa.Text, nullable=True),
        sa.Column('points', sa.Integer, nullable=False, server_default='1'),
        sa.Column('order', sa.Integer, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_quiz_questions_quiz_id', 'quiz_questions', ['quiz_id'])

    # quiz_choices
    op.create_table(
        'quiz_choices',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('question_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('quiz_questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('choice_text', sa.Text, nullable=False),
        sa.Column('is_correct', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('order', sa.Integer, nullable=False, server_default='0'),
    )
    op.create_index('ix_quiz_choices_question_id', 'quiz_choices', ['question_id'])

    # quiz_attempts
    op.create_table(
        'quiz_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('quiz_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('score_pct', sa.Float, nullable=False, server_default='0'),
        sa.Column('passed', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('xp_earned', sa.Integer, nullable=False, server_default='0'),
        sa.Column('total_questions', sa.Integer, nullable=False, server_default='0'),
        sa.Column('correct_answers', sa.Integer, nullable=False, server_default='0'),
        sa.Column('time_taken_seconds', sa.Integer, nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_quiz_attempts_user_quiz', 'quiz_attempts', ['user_id', 'quiz_id'])

    # quiz_answers
    op.create_table(
        'quiz_answers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('attempt_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('quiz_attempts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('quiz_questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('selected_choice_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('quiz_choices.id', ondelete='SET NULL'), nullable=True),
        sa.Column('is_correct', sa.Boolean, nullable=False, server_default='false'),
        sa.UniqueConstraint('attempt_id', 'question_id', name='uq_quiz_answer_attempt_question'),
    )
    op.create_index('ix_quiz_answers_attempt_id', 'quiz_answers', ['attempt_id'])


def downgrade() -> None:
    op.drop_table('quiz_answers')
    op.drop_table('quiz_attempts')
    op.drop_table('quiz_choices')
    op.drop_table('quiz_questions')
    op.drop_table('quizzes')
