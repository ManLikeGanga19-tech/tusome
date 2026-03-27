'use client';

import { apiRequest } from './client';

// ── XP level thresholds (mirrors backend LEVELS constant) ────────────────────
export const LEVELS = [
    { level: 1, name: 'Mwanzo', xp: 0 },
    { level: 2, name: 'Mwanafunzi', xp: 50 },
    { level: 3, name: 'Mchunguzi', xp: 150 },
    { level: 4, name: 'Mjuzi', xp: 300 },
    { level: 5, name: 'Bingwa', xp: 550 },
    { level: 6, name: 'Mwalimu', xp: 850 },
    { level: 7, name: 'Msomi', xp: 1200 },
    { level: 8, name: 'Daktari', xp: 1700 },
    { level: 9, name: 'Profesa', xp: 2300 },
    { level: 10, name: 'Tusome Champ', xp: 3000 },
];

/** XP needed to reach the current level (lower bound for progress bar). */
export function currentLevelXp(level: number): number {
    return LEVELS.find(l => l.level === level)?.xp ?? 0;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BadgeInfo {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon_url: string | null;
    criteria_type: string;
    criteria_value: number;
    xp_bonus: number;
}

export interface MarkCompleteResponse {
    lesson_id: string;
    xp_earned: number;
    total_xp: number;
    level: number;
    level_name: string;
    next_level_xp: number | null;
    current_streak: number;
    newly_earned_badges: BadgeInfo[];
}

export interface UserStats {
    total_xp: number;
    level: number;
    level_name: string;
    next_level_xp: number | null;
    lessons_completed: number;
    subjects_mastered: number;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
}

export interface SubjectProgress {
    subject_id: string;
    subject_name: string;
    total_lessons: number;
    completed_lessons: number;
    percent_complete: number;
    tier: string;
}

export interface CalendarDay {
    date: string;
    completed: boolean;
}

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    display_name: string;
    total_xp: number;
    level: number;
    level_name: string;
    grade_category: string;
}

export interface UserBadge {
    badge: BadgeInfo;
    earned_at: string;
}

// ── Legacy types kept for any existing code ───────────────────────────────────

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

// ── API ───────────────────────────────────────────────────────────────────────

export const progressApi = {
    markComplete: (lesson_id: string, time_spent_seconds = 0) =>
        apiRequest<MarkCompleteResponse>('/progress/complete', {
            method: 'POST',
            body: JSON.stringify({ lesson_id, time_spent_seconds }),
        }),

    getStats: () => apiRequest<UserStats>('/progress/me'),

    getSubjectProgress: () => apiRequest<SubjectProgress[]>('/progress/subjects'),

    getCalendar: () => apiRequest<CalendarDay[]>('/progress/calendar'),

    getBadges: () => apiRequest<UserBadge[]>('/progress/badges'),

    getLeaderboard: (grade_category?: string) => {
        const qs = grade_category ? `?grade_category=${grade_category}` : '';
        return apiRequest<LeaderboardEntry[]>(`/progress/leaderboard${qs}`);
    },
};
