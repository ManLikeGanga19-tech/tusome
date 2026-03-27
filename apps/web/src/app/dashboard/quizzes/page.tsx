'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Brain, CheckCircle, XCircle, Clock, Star, Zap,
    RotateCcw, Play, Loader2, AlertCircle, Lock, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/api/auth';
import { quizApi, type QuizListItem } from '@/lib/api/quiz';
import DashboardHeader from '../components/DashboardHeader';

// ── Quiz Card ─────────────────────────────────────────────────────────────────

function StatusBadge({ item }: { item: QuizListItem }) {
    if (!item.lesson_completed) {
        return (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                <Lock className="h-3 w-3" />
                Locked
            </span>
        );
    }
    if (item.best_score_pct === null) {
        return (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                Not attempted
            </span>
        );
    }
    if (item.passed) {
        return (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                <CheckCircle className="h-3 w-3" />
                Passed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
            <XCircle className="h-3 w-3" />
            Not passed
        </span>
    );
}

function QuizCard({ item, onStart }: { item: QuizListItem; onStart: () => void }) {
    const isLocked = !item.lesson_completed;
    const dailyCapped =
        item.max_attempts_per_day !== null &&
        item.attempts_today >= item.max_attempts_per_day;

    const scoreColor = item.passed
        ? 'text-green-600'
        : item.best_score_pct !== null
            ? 'text-red-500'
            : 'text-gray-400';

    return (
        <div className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-shadow ${
            isLocked
                ? 'border-gray-200 opacity-70'
                : item.passed
                    ? 'border-green-200 hover:shadow-md'
                    : 'border-gray-200 hover:shadow-md'
        }`}>
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 leading-tight">{item.title}</h3>
                    {/* Lesson / subject breadcrumb */}
                    {(item.lesson_title || item.subject_name) && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {item.subject_name && <span>{item.subject_name}</span>}
                            {item.subject_name && item.lesson_title && <span>·</span>}
                            {item.lesson_title && <span>{item.lesson_title}</span>}
                        </p>
                    )}
                    {item.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                </div>
                <StatusBadge item={item} />
            </div>

            {/* Locked notice */}
            {isLocked && (
                <div className="flex items-start gap-2 bg-amber-50 text-amber-700 rounded-xl px-3 py-2 text-xs">
                    <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                        Complete{' '}
                        <span className="font-medium">{item.lesson_title ?? 'the linked lesson'}</span>
                        {' '}first to unlock this quiz.
                    </span>
                </div>
            )}

            {/* Score bar (if attempted) */}
            {!isLocked && item.best_score_pct !== null && (
                <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className={`font-medium ${scoreColor}`}>
                            Best: {Math.round(item.best_score_pct)}%
                        </span>
                        <span>Pass: {item.pass_score}%</span>
                    </div>
                    <Progress
                        value={item.best_score_pct}
                        className={`h-2 ${item.passed ? '[&>div]:bg-green-500' : '[&>div]:bg-red-400'}`}
                    />
                </div>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1">
                    <Brain className="h-3.5 w-3.5" />
                    {item.question_count} question{item.question_count !== 1 ? 's' : ''}
                </span>
                {item.time_limit_seconds && (
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {Math.round(item.time_limit_seconds / 60)} min
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-yellow-400" />
                    {item.xp_reward} XP
                </span>
                {item.attempts_count > 0 && (
                    <span className="flex items-center gap-1">
                        <RotateCcw className="h-3.5 w-3.5" />
                        {item.attempts_count} attempt{item.attempts_count !== 1 ? 's' : ''}
                    </span>
                )}
                {item.max_attempts_per_day !== null && (
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {item.attempts_today}/{item.max_attempts_per_day} today
                    </span>
                )}
            </div>

            {/* CTA */}
            {isLocked ? (
                <Button
                    size="sm"
                    disabled
                    className="w-full bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                    <Lock className="h-4 w-4 mr-1.5" />
                    Locked
                </Button>
            ) : dailyCapped ? (
                <div className="text-xs text-center text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                    Daily limit reached · come back tomorrow
                </div>
            ) : (
                <Button
                    onClick={onStart}
                    size="sm"
                    className={`w-full ${
                        item.passed
                            ? 'bg-green-600 hover:bg-green-700'
                            : item.best_score_pct !== null
                                ? 'bg-orange-500 hover:bg-orange-600'
                                : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                >
                    {item.best_score_pct === null ? (
                        <><Play className="h-4 w-4 mr-1.5" />Start Quiz</>
                    ) : item.passed ? (
                        <><RotateCcw className="h-4 w-4 mr-1.5" />Retake</>
                    ) : (
                        <><RotateCcw className="h-4 w-4 mr-1.5" />Try Again</>
                    )}
                </Button>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QuizzesPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'todo' | 'passed'>('all');

    useEffect(() => {
        if (authLoading || !user) return;
        quizApi.listQuizzes()
            .then(setQuizzes)
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    }, [authLoading, user]);

    if (authLoading || !user) return null;

    const filtered = quizzes.filter((q) => {
        if (filter === 'todo') return !q.passed;
        if (filter === 'passed') return q.passed;
        return true;
    });

    const passedCount = quizzes.filter((q) => q.passed).length;
    const notDoneCount = quizzes.filter((q) => !q.passed).length;
    const totalXpAvail = quizzes.filter((q) => !q.passed).reduce((s, q) => s + q.xp_reward, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Brain className="h-7 w-7 text-green-600" />
                        My Quizzes
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Test your knowledge. Results are instant — no waiting.
                    </p>

                    {/* Summary strip */}
                    {!loading && quizzes.length > 0 && (
                        <div className="flex gap-4 mt-4 flex-wrap">
                            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    {passedCount} / {quizzes.length} passed
                                </span>
                            </div>
                            {totalXpAvail > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {totalXpAvail} XP still to earn
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Filter tabs */}
                {!loading && quizzes.length > 0 && (
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 self-start w-fit">
                        {([
                            { key: 'all', label: `All (${quizzes.length})` },
                            { key: 'todo', label: `To Do (${notDoneCount})` },
                            { key: 'passed', label: `Passed (${passedCount})` },
                        ] as const).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                    filter === key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex items-center gap-3 text-gray-400 py-12 justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading quizzes…
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 text-red-500 bg-red-50 rounded-xl px-4 py-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        {error}
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-16">
                        <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No quizzes available yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Quizzes will appear here once your teachers publish them.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push('/dashboard')}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        No quizzes match this filter.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filtered.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                item={quiz}
                                onStart={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
