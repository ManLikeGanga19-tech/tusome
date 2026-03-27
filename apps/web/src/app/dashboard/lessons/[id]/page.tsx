'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    Loader2,
    BookOpen,
    Star,
    Flame,
    Trophy,
    X,
    TrendingUp,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/lib/api/auth';
import { contentApi, type LessonDetail } from '@/lib/api/content';
import {
    progressApi,
    type MarkCompleteResponse,
    currentLevelXp,
} from '@/lib/api/progress';
import { quizApi } from '@/lib/api/quiz';
import DashboardHeader from '../../components/DashboardHeader';

export default function LessonDetailPage() {
    const router = useRouter();
    const params = useParams();
    const lessonId = params?.id as string;

    const { user, loading: authLoading } = useAuth();
    const [lesson, setLesson] = useState<LessonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);
    const [marking, setMarking] = useState(false);
    const [celebration, setCelebration] = useState<MarkCompleteResponse | null>(null);
    const startTime = useRef<number>(Date.now());
    const [quizId, setQuizId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (authLoading || !user || !lessonId) return;
        let cancelled = false;

        contentApi.getLesson(lessonId)
            .then(data => { if (!cancelled) { setLesson(data); setLoading(false); } })
            .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });

        // Silently check if a quiz exists for this lesson (404 is normal — not all lessons have quizzes)
        quizApi.getQuizForLesson(lessonId)
            .then(q => { if (!cancelled) setQuizId(q.id); })
            .catch(() => { /* no quiz for this lesson */ });

        return () => { cancelled = true; };
    }, [lessonId, user, authLoading]);

    useEffect(() => {
        if (!authLoading && !user) router.replace('/auth/signin');
    }, [authLoading, user, router]);

    async function markComplete() {
        if (!lesson || completed) return;
        setMarking(true);
        const seconds = Math.round((Date.now() - startTime.current) / 1000);
        try {
            const result = await progressApi.markComplete(lesson.id, seconds);
            setCompleted(true);
            setCelebration(result);
        } catch {
            // noop — tracking failure should not block the user
        } finally {
            setMarking(false);
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader onSearch={setSearchQuery} />
                <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading lesson...</p>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader onSearch={setSearchQuery} />
                <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                    <p className="text-red-600 font-semibold mb-4">{error ?? 'Lesson not found'}</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader onSearch={setSearchQuery} />

            {/* XP Celebration overlay */}
            {celebration && (
                <XpCelebration
                    result={celebration}
                    onDismiss={() => setCelebration(null)}
                    onViewProgress={() => { setCelebration(null); router.push('/dashboard/progress'); }}
                />
            )}

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Nav */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Subject
                </button>

                {/* Lesson header */}
                <div className="bg-white rounded-xl p-5 sm:p-6 mb-6 shadow-sm border">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        {lesson.is_free_preview && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Free Preview</Badge>
                        )}
                        {completed && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Completed
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                    {lesson.description && (
                        <p className="text-gray-600 text-sm sm:text-base mb-3">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {lesson.duration_minutes} min read
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl p-5 sm:p-8 shadow-sm border mb-6">
                    {lesson.content ? (
                        <LessonContent markdown={lesson.content} />
                    ) : (
                        <div className="text-center text-gray-400 py-12">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                            <p>Lesson content coming soon.</p>
                        </div>
                    )}
                </div>

                {/* Mark complete */}
                {!completed ? (
                    <div className="text-center">
                        <Button
                            onClick={markComplete}
                            disabled={marking}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 h-11"
                        >
                            {marking ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                <><CheckCircle className="h-4 w-4 mr-2" /> Mark as Complete</>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-700 font-medium">Lesson completed!</span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                            <Button onClick={() => router.back()} variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Subject
                            </Button>
                            {quizId && (
                                <Button
                                    onClick={() => router.push(`/dashboard/quiz/${quizId}`)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Take Quiz
                                </Button>
                            )}
                            <Button
                                onClick={() => router.push('/dashboard/progress')}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View Progress
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── XP Celebration Modal ───────────────────────────────────────────────────────

function XpCelebration({
    result,
    onDismiss,
    onViewProgress,
}: {
    result: MarkCompleteResponse;
    onDismiss: () => void;
    onViewProgress: () => void;
}) {
    const levelXpStart = currentLevelXp(result.level);
    const levelXpEnd = result.next_level_xp ?? result.total_xp;
    const progress = result.next_level_xp
        ? Math.round(((result.total_xp - levelXpStart) / (levelXpEnd - levelXpStart)) * 100)
        : 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onDismiss}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-5">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-9 w-9 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Lesson Complete!</h2>
                    <p className="text-gray-500 text-sm mt-1">Great work — keep it up!</p>
                </div>

                {/* XP earned */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 text-center border border-green-100">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-2xl font-bold text-green-700">+{result.xp_earned} XP</span>
                        <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="text-sm text-gray-600">{result.total_xp.toLocaleString()} total XP</p>
                </div>

                {/* Level progress */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-700">
                            Level {result.level} — {result.level_name}
                        </span>
                        <span className="text-xs text-gray-500">
                            {result.next_level_xp
                                ? `${result.next_level_xp - result.total_xp} XP to next level`
                                : 'Max level!'}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                </div>

                {/* Streak */}
                {result.current_streak > 0 && (
                    <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2 mb-4 border border-orange-100">
                        <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm text-orange-700 font-medium">
                            {result.current_streak}-day streak!
                        </span>
                    </div>
                )}

                {/* New badges */}
                {result.newly_earned_badges.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Badges earned
                        </p>
                        <div className="space-y-2">
                            {result.newly_earned_badges.map(badge => (
                                <div
                                    key={badge.slug}
                                    className="flex items-center gap-3 bg-purple-50 rounded-lg px-3 py-2 border border-purple-100"
                                >
                                    <Trophy className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-purple-800">{badge.name}</p>
                                        <p className="text-xs text-purple-600">{badge.description}</p>
                                    </div>
                                    <span className="ml-auto text-xs font-bold text-purple-700">+{badge.xp_bonus} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <Button onClick={onDismiss} variant="outline" className="flex-1">
                        Continue
                    </Button>
                    <Button
                        onClick={onViewProgress}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <TrendingUp className="h-4 w-4 mr-1.5" />
                        Progress
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Markdown renderer ──────────────────────────────────────────────────────────

function LessonContent({ markdown }: { markdown: string }) {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith('# ')) {
            elements.push(<h1 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{renderInline(line.slice(2))}</h1>);
            i++; continue;
        }
        if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className="text-xl font-bold text-gray-800 mt-5 mb-2 border-b pb-1">{renderInline(line.slice(3))}</h2>);
            i++; continue;
        }
        if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{renderInline(line.slice(4))}</h3>);
            i++; continue;
        }
        if (line.startsWith('```')) {
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
            elements.push(
                <pre key={i} className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto text-sm my-4">
                    <code>{codeLines.join('\n')}</code>
                </pre>
            );
            i++; continue;
        }
        if (line.startsWith('|')) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].startsWith('|')) { tableLines.push(lines[i]); i++; }
            elements.push(<MarkdownTable key={i} rows={tableLines} />);
            continue;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
            const items: string[] = [];
            while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
                items.push(lines[i].slice(2)); i++;
            }
            elements.push(
                <ul key={i} className="list-disc list-inside space-y-1 my-3 text-gray-700">
                    {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                </ul>
            );
            continue;
        }
        if (/^\d+\. /.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\. /.test(lines[i])) {
                items.push(lines[i].replace(/^\d+\. /, '')); i++;
            }
            elements.push(
                <ol key={i} className="list-decimal list-inside space-y-1 my-3 text-gray-700">
                    {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                </ol>
            );
            continue;
        }
        if (line.startsWith('> ')) {
            elements.push(
                <blockquote key={i} className="border-l-4 border-blue-300 pl-4 py-1 my-3 text-gray-600 italic bg-blue-50 rounded-r">
                    {renderInline(line.slice(2))}
                </blockquote>
            );
            i++; continue;
        }
        if (line === '---' || line === '***') {
            elements.push(<hr key={i} className="my-4 border-gray-200" />);
            i++; continue;
        }
        if (line.trim() === '') { i++; continue; }
        elements.push(<p key={i} className="text-gray-700 leading-relaxed my-2">{renderInline(line)}</p>);
        i++;
    }

    return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**'))
                    return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                if (part.startsWith('`') && part.endsWith('`'))
                    return <code key={i} className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm">{part.slice(1, -1)}</code>;
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}

function MarkdownTable({ rows }: { rows: string[] }) {
    if (rows.length < 2) return null;
    const header = rows[0].split('|').map(c => c.trim()).filter(Boolean);
    const body = rows.slice(2).map(row => row.split('|').map(c => c.trim()).filter(Boolean));
    return (
        <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                <thead className="bg-gray-50">
                    <tr>{header.map((h, i) => <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 border-b">{renderInline(h)}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {body.map((row, ri) => (
                        <tr key={ri} className="hover:bg-gray-50">
                            {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-gray-700">{renderInline(cell)}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
