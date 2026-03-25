'use client';

import { apiRequest } from './client';

export interface SubjectProgress {
    subject_id: string;
    subject_name: string;
    total_lessons: number;
    completed_lessons: number;
    percent_complete: number;
}

export interface Streak {
    current_streak: number;
    longest_streak: number;
    last_study_date: string | null;
}

export interface ProgressUpdate {
    lesson_id: string;
    status: 'in_progress' | 'completed';
    time_spent_seconds?: number;
    score?: number;
}

export const progressApi = {
    getSubjectProgress: () => apiRequest<SubjectProgress[]>('/progress/subjects'),
    getStreak: () => apiRequest<Streak>('/progress/streak'),
    updateLesson: (body: ProgressUpdate) => apiRequest('/progress/lesson', {
        method: 'POST',
        body: JSON.stringify(body),
    }),
};
