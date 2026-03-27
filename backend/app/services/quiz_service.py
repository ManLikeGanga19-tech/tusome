"""
QuizService — fetching quizzes and grading attempts.

Anti-cheat measures applied here:
  1. Question + choice order randomised per attempt (when quiz.randomise_order=True)
  2. Minimum time enforced: 3 seconds per question minimum
  3. Daily attempt cap enforced before grading
  4. Lesson completion gate: quiz with lesson_id requires completed UserProgress row
  5. Answer breakdown withheld when quiz.show_correct_answers=False
"""
import random
import uuid
from datetime import datetime, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, BadRequestError, ForbiddenError
from app.models.quiz import Quiz, QuizQuestion, QuizChoice, QuizAttempt, QuizAnswer
from app.models.progress import UserStats, UserProgress
from app.models.user import User
from app.models.content import Lesson, Subject
from app.schemas.quiz import (
    QuizOut, QuestionOut, ChoiceOut,
    SubmitAttemptRequest, AttemptResult, AnswerResult, AttemptSummary,
    QuizListItem,
)

# Minimum seconds per question — submissions faster than this are rejected
MIN_SECONDS_PER_QUESTION = 3


class QuizService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Fetch ──────────────────────────────────────────────────────────────────

    async def list_quizzes(self, user: User) -> list[QuizListItem]:
        """Return all published quizzes for the user's grade with attempt + gate info."""
        result = await self.db.execute(
            select(Quiz)
            .where(Quiz.is_published == True, Quiz.grade_category == user.grade_category)
            .order_by(Quiz.created_at.desc())
        )
        quizzes = result.scalars().all()
        if not quizzes:
            return []

        quiz_ids = [q.id for q in quizzes]
        lesson_ids = [q.lesson_id for q in quizzes if q.lesson_id is not None]

        # Question counts per quiz
        q_counts = await self.db.execute(
            select(QuizQuestion.quiz_id, func.count().label("cnt"))
            .where(QuizQuestion.quiz_id.in_(quiz_ids))
            .group_by(QuizQuestion.quiz_id)
        )
        qcount_map = {row.quiz_id: row.cnt for row in q_counts}

        # Best score + attempt count per quiz for this user
        attempt_rows = await self.db.execute(
            select(
                QuizAttempt.quiz_id,
                func.max(QuizAttempt.score_pct).label("best"),
                func.count().label("cnt"),
                func.bool_or(QuizAttempt.passed).label("ever_passed"),
            )
            .where(QuizAttempt.user_id == user.id, QuizAttempt.quiz_id.in_(quiz_ids))
            .group_by(QuizAttempt.quiz_id)
        )
        attempt_map = {row.quiz_id: row for row in attempt_rows}

        # Attempts today per quiz
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_rows = await self.db.execute(
            select(QuizAttempt.quiz_id, func.count().label("cnt"))
            .where(
                QuizAttempt.user_id == user.id,
                QuizAttempt.quiz_id.in_(quiz_ids),
                QuizAttempt.completed_at >= today_start,
            )
            .group_by(QuizAttempt.quiz_id)
        )
        today_map = {row.quiz_id: row.cnt for row in today_rows}

        # Lesson completion status for gated quizzes
        completed_lessons: set[uuid.UUID] = set()
        if lesson_ids:
            comp_rows = await self.db.execute(
                select(UserProgress.lesson_id)
                .where(
                    UserProgress.user_id == user.id,
                    UserProgress.lesson_id.in_(lesson_ids),
                    UserProgress.completed == True,
                )
            )
            completed_lessons = {row.lesson_id for row in comp_rows}

        # Lesson + subject names
        lesson_map: dict[uuid.UUID, tuple[str, str]] = {}  # lesson_id -> (lesson_title, subject_name)
        if lesson_ids:
            lesson_rows = await self.db.execute(
                select(Lesson.id, Lesson.title, Subject.name)
                .join(Subject, Lesson.subject_id == Subject.id)
                .where(Lesson.id.in_(lesson_ids))
            )
            for row in lesson_rows:
                lesson_map[row.id] = (row.title, row.name)

        items = []
        for q in quizzes:
            att = attempt_map.get(q.id)
            lesson_title = lesson_map[q.lesson_id][0] if q.lesson_id and q.lesson_id in lesson_map else None
            subject_name = lesson_map[q.lesson_id][1] if q.lesson_id and q.lesson_id in lesson_map else None
            lesson_completed = (q.lesson_id is None) or (q.lesson_id in completed_lessons)

            items.append(QuizListItem(
                id=q.id,
                title=q.title,
                description=q.description,
                pass_score=q.pass_score,
                xp_reward=q.xp_reward,
                time_limit_seconds=q.time_limit_seconds,
                grade_category=q.grade_category,
                question_count=qcount_map.get(q.id, 0),
                lesson_id=q.lesson_id,
                lesson_title=lesson_title,
                subject_name=subject_name,
                lesson_completed=lesson_completed,
                best_score_pct=float(att.best) if att else None,
                attempts_count=int(att.cnt) if att else 0,
                passed=bool(att.ever_passed) if att else False,
                attempts_today=today_map.get(q.id, 0),
                max_attempts_per_day=q.max_attempts_per_day,
            ))
        return items

    async def get_quiz_for_lesson(self, lesson_id: uuid.UUID, user: User) -> QuizOut:
        # Gate: lesson must be completed
        await self._assert_lesson_completed(lesson_id, user)

        result = await self.db.execute(
            select(Quiz)
            .where(Quiz.lesson_id == lesson_id, Quiz.is_published == True)
            .options(selectinload(Quiz.questions).selectinload(QuizQuestion.choices))
            .limit(1)
        )
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise NotFoundError("No quiz found for this lesson")
        return self._to_out(quiz)

    async def get_quiz(self, quiz_id: uuid.UUID, user: User) -> QuizOut:
        result = await self.db.execute(
            select(Quiz)
            .where(Quiz.id == quiz_id, Quiz.is_published == True)
            .options(selectinload(Quiz.questions).selectinload(QuizQuestion.choices))
        )
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise NotFoundError("Quiz not found")

        # Gate: if linked to a lesson, that lesson must be completed
        if quiz.lesson_id:
            await self._assert_lesson_completed(quiz.lesson_id, user)

        return self._to_out(quiz)

    def _to_out(self, quiz: Quiz) -> QuizOut:
        questions = list(quiz.questions)
        if quiz.randomise_order:
            questions = random.sample(questions, len(questions))

        return QuizOut(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            pass_score=quiz.pass_score,
            xp_reward=quiz.xp_reward,
            time_limit_seconds=quiz.time_limit_seconds,
            grade_category=quiz.grade_category,
            question_count=len(questions),
            show_correct_answers=quiz.show_correct_answers,
            max_attempts_per_day=quiz.max_attempts_per_day,
            questions=[
                QuestionOut(
                    id=q.id,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    points=q.points,
                    order=q.order,
                    choices=self._shuffle_choices(q.choices, quiz.randomise_order),
                )
                for q in questions
            ],
        )

    def _shuffle_choices(self, choices: list, randomise: bool) -> list[ChoiceOut]:
        lst = [ChoiceOut(id=c.id, choice_text=c.choice_text, order=c.order) for c in choices]
        if randomise:
            random.shuffle(lst)
        return lst

    # ── Submit ─────────────────────────────────────────────────────────────────

    async def submit_attempt(
        self,
        quiz_id: uuid.UUID,
        user: User,
        body: SubmitAttemptRequest,
    ) -> AttemptResult:
        # Load quiz
        result = await self.db.execute(
            select(Quiz)
            .where(Quiz.id == quiz_id, Quiz.is_published == True)
            .options(selectinload(Quiz.questions).selectinload(QuizQuestion.choices))
        )
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise NotFoundError("Quiz not found")

        # Gate: lesson completion
        if quiz.lesson_id:
            await self._assert_lesson_completed(quiz.lesson_id, user)

        if len(body.answers) == 0:
            raise BadRequestError("No answers submitted")

        # Anti-cheat: daily attempt cap
        if quiz.max_attempts_per_day is not None:
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            count_r = await self.db.execute(
                select(func.count())
                .select_from(QuizAttempt)
                .where(
                    QuizAttempt.user_id == user.id,
                    QuizAttempt.quiz_id == quiz_id,
                    QuizAttempt.completed_at >= today_start,
                )
            )
            attempts_today = count_r.scalar() or 0
            if attempts_today >= quiz.max_attempts_per_day:
                raise BadRequestError(
                    f"You have reached the daily limit of {quiz.max_attempts_per_day} "
                    f"attempt(s) for this quiz. Try again tomorrow."
                )

        # Anti-cheat: minimum time check (3 seconds per question)
        if body.time_taken_seconds is not None:
            min_time = len(quiz.questions) * MIN_SECONDS_PER_QUESTION
            if body.time_taken_seconds < min_time:
                raise BadRequestError(
                    "Submission rejected: answers submitted too quickly. "
                    "Please read each question carefully."
                )

        # Build lookup maps
        question_map: dict[uuid.UUID, QuizQuestion] = {q.id: q for q in quiz.questions}
        choice_map: dict[uuid.UUID, QuizChoice] = {
            c.id: c for q in quiz.questions for c in q.choices
        }

        # Previous best score
        prev = await self.db.execute(
            select(QuizAttempt.score_pct)
            .where(QuizAttempt.user_id == user.id, QuizAttempt.quiz_id == quiz_id)
            .order_by(QuizAttempt.score_pct.desc())
            .limit(1)
        )
        previous_best_pct = prev.scalar_one_or_none()

        # Grade answers
        total_points = sum(q.points for q in quiz.questions)
        earned_points = 0
        answer_results: list[AnswerResult] = []

        for ans in body.answers:
            question = question_map.get(ans.question_id)
            if not question:
                continue

            correct_choice = next((c for c in question.choices if c.is_correct), None)
            selected = choice_map.get(ans.selected_choice_id) if ans.selected_choice_id else None
            is_correct = bool(selected and selected.is_correct)

            if is_correct:
                earned_points += question.points

            answer_results.append(AnswerResult(
                question_id=question.id,
                question_text=question.question_text,
                selected_choice_id=selected.id if selected else None,
                correct_choice_id=correct_choice.id if correct_choice else None,
                is_correct=is_correct,
                explanation=question.explanation,
            ))

        score_pct = round((earned_points / total_points * 100) if total_points > 0 else 0, 1)
        passed = score_pct >= quiz.pass_score
        correct_count = sum(1 for a in answer_results if a.is_correct)

        # Award XP only on first pass
        xp_earned = 0
        if passed and (previous_best_pct is None or previous_best_pct < quiz.pass_score):
            xp_earned = quiz.xp_reward
            await self._add_xp(user, xp_earned)

        # Persist attempt
        attempt = QuizAttempt(
            user_id=user.id,
            quiz_id=quiz_id,
            score_pct=score_pct,
            passed=passed,
            xp_earned=xp_earned,
            total_questions=len(quiz.questions),
            correct_answers=correct_count,
            time_taken_seconds=body.time_taken_seconds,
        )
        self.db.add(attempt)
        await self.db.flush()

        for ans, result_row in zip(body.answers, answer_results):
            self.db.add(QuizAnswer(
                attempt_id=attempt.id,
                question_id=ans.question_id,
                selected_choice_id=ans.selected_choice_id,
                is_correct=result_row.is_correct,
            ))

        await self.db.commit()

        # Anti-cheat: withhold per-question breakdown if configured
        return AttemptResult(
            attempt_id=attempt.id,
            score_pct=score_pct,
            passed=passed,
            xp_earned=xp_earned,
            total_questions=len(quiz.questions),
            correct_answers=correct_count,
            pass_score=quiz.pass_score,
            answers=answer_results if quiz.show_correct_answers else [],
            answers_hidden=not quiz.show_correct_answers,
            previous_best_pct=previous_best_pct,
        )

    async def get_my_attempts(
        self, quiz_id: uuid.UUID, user: User
    ) -> list[AttemptSummary]:
        result = await self.db.execute(
            select(QuizAttempt)
            .where(QuizAttempt.quiz_id == quiz_id, QuizAttempt.user_id == user.id)
            .order_by(QuizAttempt.completed_at.desc())
            .limit(10)
        )
        rows = result.scalars().all()
        return [
            AttemptSummary(
                attempt_id=r.id,
                score_pct=r.score_pct,
                passed=r.passed,
                xp_earned=r.xp_earned,
                correct_answers=r.correct_answers,
                total_questions=r.total_questions,
                completed_at=r.completed_at,
            )
            for r in rows
        ]

    # ── Helpers ────────────────────────────────────────────────────────────────

    async def _assert_lesson_completed(self, lesson_id: uuid.UUID, user: User) -> None:
        """Raise ForbiddenError if the user hasn't completed the linked lesson."""
        row = await self.db.execute(
            select(UserProgress)
            .where(
                UserProgress.user_id == user.id,
                UserProgress.lesson_id == lesson_id,
                UserProgress.completed == True,
            )
            .limit(1)
        )
        if not row.scalar_one_or_none():
            raise ForbiddenError("Complete the lesson before taking its quiz.")

    async def _add_xp(self, user: User, xp: int) -> None:
        from app.models.progress import calc_level
        result = await self.db.execute(
            select(UserStats).where(UserStats.user_id == user.id)
        )
        stats = result.scalar_one_or_none()
        if not stats:
            stats = UserStats(user_id=user.id, grade_category=user.grade_category)
            self.db.add(stats)

        stats.total_xp += xp
        level, level_name = calc_level(stats.total_xp)
        stats.level = level
        stats.level_name = level_name
