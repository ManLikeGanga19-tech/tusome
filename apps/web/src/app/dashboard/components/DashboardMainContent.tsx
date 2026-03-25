'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen,
    ChevronRight,
    Play,
    Clock,
    TrendingUp,
    Award,
    BarChart3,
    Calculator,
    Book,
    Globe,
    FlaskConical,
    Palette,
    Languages,
    Wrench,
    Smile,
    Loader2,
    Leaf,
    Heart,
    Zap,
    Dna,
    Landmark,
    Briefcase,
    RefreshCw,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/lib/api/auth';
import { contentApi, type Subject } from '@/lib/api/content';
import { progressApi, type SubjectProgress } from '@/lib/api/progress';

// Map subject icon strings → Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
    calculator: Calculator,
    'book-open': Book,
    languages: Languages,
    flask: FlaskConical,
    globe: Globe,
    palette: Palette,
    wrench: Wrench,
    leaf: Leaf,
    heart: Heart,
    zap: Zap,
    dna: Dna,
    landmark: Landmark,
    briefcase: Briefcase,
};

const TIER_COLORS: Record<string, { bg: string; icon: string; btn: string; cardBg: string }> = {
    primary: {
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
        icon: 'text-blue-600',
        btn: 'bg-blue-600 hover:bg-blue-700',
        cardBg: 'bg-blue-50',
    },
    junior: {
        bg: 'bg-gradient-to-r from-green-50 to-green-100',
        icon: 'text-green-600',
        btn: 'bg-green-600 hover:bg-green-700',
        cardBg: 'bg-green-50',
    },
    senior: {
        bg: 'bg-gradient-to-r from-red-50 to-red-100',
        icon: 'text-red-600',
        btn: 'bg-red-600 hover:bg-red-700',
        cardBg: 'bg-red-50',
    },
};

function SubjectIcon({ iconName, className, style }: { iconName: string | null; className: string; style?: React.CSSProperties }) {
    const Icon = iconName ? (ICON_MAP[iconName] ?? BookOpen) : BookOpen;
    return <Icon className={className} style={style} />;
}

export default function DashboardMainContent() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [progress, setProgress] = useState<Map<string, SubjectProgress>>(new Map());
    const [contentLoading, setContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !user) return;

        let cancelled = false;

        async function load() {
            setContentLoading(true);
            setContentError(null);
            try {
                const [subjectList, progressList] = await Promise.all([
                    contentApi.getSubjects(),
                    progressApi.getSubjectProgress(),
                ]);
                if (cancelled) return;
                setSubjects(subjectList);
                const progMap = new Map<string, SubjectProgress>();
                for (const p of progressList) progMap.set(p.subject_id, p);
                setProgress(progMap);
            } catch (err: any) {
                if (!cancelled) setContentError(err.message || 'Failed to load content');
            } finally {
                if (!cancelled) setContentLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [user, authLoading]);

    if (authLoading || (contentLoading && subjects.length === 0)) {
        return (
            <div className="space-y-6 sm:space-y-8">
                <div className="bg-gray-100 rounded-xl p-4 sm:p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-4 sm:p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-2 bg-gray-200 rounded mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading your dashboard...</span>
                </div>
            </div>
        );
    }

    if (contentError) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                    <p className="text-red-600 font-semibold mb-2">Failed to load content</p>
                    <p className="text-red-500 text-sm mb-4">{contentError}</p>
                    <Button
                        onClick={() => { setContentError(null); setContentLoading(true); }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!user) return null;

    const tier = user.grade_category as 'primary' | 'junior' | 'senior';
    const colors = TIER_COLORS[tier] ?? TIER_COLORS.primary;
    const firstName = user.first_name;

    // Find the first unpublished / not-started lesson across all subjects
    const firstSubject = subjects[0];

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Welcome Banner */}
            <div className={`${colors.bg} rounded-xl p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center">
                            Welcome back, {firstName}! <Smile className="h-5 w-5 ml-2 text-yellow-500" />
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                            You have {subjects.length} subject{subjects.length !== 1 ? 's' : ''} to explore.
                            {(() => {
                                const totalLessons = subjects.reduce((a, s) => a + s.lesson_count, 0);
                                const totalDone = Array.from(progress.values()).reduce((a, p) => a + p.completed_lessons, 0);
                                return totalLessons > 0
                                    ? ` ${totalDone} of ${totalLessons} lessons completed.`
                                    : '';
                            })()}
                        </p>
                        <Button
                            className={`${colors.btn} text-white text-sm sm:text-base h-9 sm:h-10`}
                            onClick={() => firstSubject && router.push(`/dashboard/subjects/${firstSubject.slug}`)}
                        >
                            Continue Learning
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                    <div className="hidden sm:block ml-4">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 ${colors.cardBg} rounded-full flex items-center justify-center`}>
                            <BookOpen className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 ${colors.icon}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subjects Grid */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Subjects</h2>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm w-fit">
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        View Analytics
                    </Button>
                </div>

                {subjects.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            No subjects found for your grade level.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {subjects.map((subject) => {
                            const prog = progress.get(subject.id);
                            const pct = prog?.percent_complete ?? 0;
                            const done = prog?.completed_lessons ?? 0;
                            const total = subject.lesson_count;

                            return (
                                <Card
                                    key={subject.id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/dashboard/subjects/${subject.slug}`)}
                                >
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <div className="flex items-center space-x-2 sm:space-x-3">
                                                <div
                                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: subject.color ? `${subject.color}20` : undefined }}
                                                >
                                                    <SubjectIcon
                                                        iconName={subject.icon}
                                                        className="h-4 w-4 sm:h-5 sm:w-5"
                                                        style={{ color: subject.color ?? undefined } as React.CSSProperties}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{subject.name}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-500">{done}/{total} lessons</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs sm:text-sm mb-1">
                                                    <span className="text-gray-600">Progress</span>
                                                    <span className="font-medium">{Math.round(pct)}%</span>
                                                </div>
                                                <Progress value={pct} className="h-1.5 sm:h-2" />
                                            </div>

                                            {subject.description && (
                                                <div className={`${colors.cardBg} rounded-lg p-2 sm:p-3`}>
                                                    <p className="text-xs text-gray-600 line-clamp-2">{subject.description}</p>
                                                </div>
                                            )}

                                            <Button
                                                className={`w-full ${colors.btn} text-white text-xs sm:text-sm h-8 sm:h-9`}
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/dashboard/subjects/${subject.slug}`);
                                                }}
                                            >
                                                <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                                {done > 0 ? 'Continue' : 'Start'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Subjects</h3>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{subjects.length}</p>
                        <p className="text-xs sm:text-sm text-gray-500">In your curriculum</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Lessons</h3>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">
                            {subjects.reduce((a, s) => a + s.lesson_count, 0)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Available to you</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Completed</h3>
                        <p className="text-xl sm:text-2xl font-bold text-purple-600">
                            {Array.from(progress.values()).reduce((a, p) => a + p.completed_lessons, 0)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Lessons done</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
