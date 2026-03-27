'use client';

import { apiRequest } from './client';

export interface Subject {
    id: string;
    name: string;
    slug: string;
    grade_category: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    order: number;
    lesson_count: number;
}

export interface Lesson {
    id: string;
    subject_id: string;
    title: string;
    slug: string;
    description: string | null;
    order: number;
    duration_minutes: number;
    is_free_preview: boolean;
    resources: LessonResource[];
}

export interface LessonResource {
    id: string;
    resource_type: string;
    title: string;
    url: string;
}

export interface LessonDetail extends Lesson {
    content: string | null;
}

export interface SearchResult {
    id: string;
    subject_id: string;
    subject_name: string;
    title: string;
    slug: string;
    description: string | null;
    duration_minutes: number;
    is_free_preview: boolean;
}

export const contentApi = {
    getSubjects: () => apiRequest<Subject[]>('/content/subjects'),
    getLessons: (slug: string) => apiRequest<Lesson[]>(`/content/subjects/${slug}/lessons`),
    getLesson: (lessonId: string) => apiRequest<LessonDetail>(`/content/lessons/${lessonId}`),
    search: (q: string) => apiRequest<SearchResult[]>(`/content/search?q=${encodeURIComponent(q)}`),
};
