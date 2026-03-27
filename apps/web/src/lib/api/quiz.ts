'use client';

import { apiRequest } from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuizChoice {
    id: string;
    choice_text: string;
    order: number;
}

export interface QuizQuestion {
    id: string;
    question_text: string;
    question_type: 'mcq' | 'true_false';
    points: number;
    order: number;
    choices: QuizChoice[];
}

export interface Quiz {
    id: string;
    title: string;
    description: string | null;
    pass_score: number;
    xp_reward: number;
    time_limit_seconds: number | null;
    grade_category: string | null;
    question_count: number;
    show_correct_answers: boolean;
    max_attempts_per_day: number | null;
    questions: QuizQuestion[];
}

export interface AnswerResult {
    question_id: string;
    question_text: string;
    selected_choice_id: string | null;
    correct_choice_id: string | null;
    is_correct: boolean;
    explanation: string | null;
}

export interface AttemptResult {
    attempt_id: string;
    score_pct: number;
    passed: boolean;
    xp_earned: number;
    total_questions: number;
    correct_answers: number;
    pass_score: number;
    answers: AnswerResult[];
    answers_hidden: boolean;
    previous_best_pct: number | null;
}

export interface AttemptSummary {
    attempt_id: string;
    score_pct: number;
    passed: boolean;
    xp_earned: number;
    correct_answers: number;
    total_questions: number;
    completed_at: string;
}

export interface QuizListItem {
    id: string;
    title: string;
    description: string | null;
    pass_score: number;
    xp_reward: number;
    time_limit_seconds: number | null;
    grade_category: string | null;
    question_count: number;
    lesson_id: string | null;
    lesson_title: string | null;
    subject_name: string | null;
    lesson_completed: boolean;       // false = locked (must complete lesson first)
    best_score_pct: number | null;   // null = never attempted
    attempts_count: number;
    passed: boolean;
    attempts_today: number;
    max_attempts_per_day: number | null;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const quizApi = {
    listQuizzes(): Promise<QuizListItem[]> {
        return apiRequest<QuizListItem[]>('/quizzes');
    },

    getQuizForLesson(lessonId: string): Promise<Quiz> {
        return apiRequest<Quiz>(`/quizzes/lesson/${lessonId}`);
    },

    getQuiz(quizId: string): Promise<Quiz> {
        return apiRequest<Quiz>(`/quizzes/${quizId}`);
    },

    submitAttempt(
        quizId: string,
        answers: { question_id: string; selected_choice_id: string | null }[],
        time_taken_seconds?: number,
    ): Promise<AttemptResult> {
        return apiRequest<AttemptResult>(`/quizzes/${quizId}/attempt`, {
            method: 'POST',
            body: JSON.stringify({ answers, time_taken_seconds }),
        });
    },

    getMyAttempts(quizId: string): Promise<AttemptSummary[]> {
        return apiRequest<AttemptSummary[]>(`/quizzes/${quizId}/my-attempts`);
    },
};
