'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    Play,
    Lock,
    CheckCircle,
    Loader2,
    BookOpen,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/lib/api/auth';
import { contentApi, type Subject, type Lesson } from '@/lib/api/content';
import { progressApi, type SubjectProgress } from '@/lib/api/progress';
import DashboardHeader from '../../components/DashboardHeader';

export default function SubjectLessonsPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;

    const { user, loading: authLoading } = useAuth();

    const [subject, setSubject] = useState<Subject | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [subjectProgress, setSubjectProgress] = useState<SubjectProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !user) return;
        if (!slug) return;

        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [lessonList, progressList, subjectList] = await Promise.all([
                    contentApi.getLessons(slug),
                    progressApi.getSubjectProgress(),
                    contentApi.getSubjects(),
                ]);
                if (cancelled) return;

                setLessons(lessonList);

                const foundSubject = subjectList.find(s => s.slug === slug) ?? null;
                setSubject(foundSubject);

                if (foundSubject) {
                    const prog = progressList.find(p => p.subject_id === foundSubject.id) ?? null;
                    setSubjectProgress(prog);
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Failed to load lessons');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [slug, user, authLoading]);

    // Auth redirect
    useEffect(() => {
        if (!authLoading && !user) router.replace('/auth/signin');
    }, [authLoading, user, router]);

    const [searchQuery, setSearchQuery] = useState('');

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader onSearch={setSearchQuery} />
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading lessons...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader onSearch={setSearchQuery} />
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <p className="text-red-600 font-semibold mb-2">{error}</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const pct = subjectProgress?.percent_complete ?? 0;
    const done = subjectProgress?.completed_lessons ?? 0;
    const total = lessons.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader onSearch={setSearchQuery} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Back navigation */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </button>

                {/* Subject header */}
                <div className="bg-white rounded-xl p-5 sm:p-6 mb-6 shadow-sm border">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                {subject?.name ?? slug}
                            </h1>
                            {subject?.description && (
                                <p className="text-gray-600 text-sm sm:text-base mb-4">{subject.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {total} lesson{total !== 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    {done} completed
                                </span>
                            </div>
                        </div>
                    </div>

                    {total > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{Math.round(pct)}%</span>
                            </div>
                            <Progress value={pct} className="h-2" />
                        </div>
                    )}
                </div>

                {/* Lesson list */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Lessons</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {lessons.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No lessons available yet.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {lessons.map((lesson, idx) => (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/dashboard/lessons/${lesson.id}`)}
                                    >
                                        {/* Number bubble */}
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                                            {idx + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                                    {lesson.title}
                                                </h3>
                                                {lesson.is_free_preview && (
                                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                        Free Preview
                                                    </Badge>
                                                )}
                                            </div>
                                            {lesson.description && (
                                                <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{lesson.description}</p>
                                            )}
                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                                <Clock className="h-3 w-3" />
                                                {lesson.duration_minutes} min
                                            </div>
                                        </div>

                                        <Button size="sm" variant="outline" className="flex-shrink-0 text-xs h-8">
                                            <Play className="h-3 w-3 mr-1" />
                                            Start
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
