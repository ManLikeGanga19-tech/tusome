'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    Loader2,
    BookOpen,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/api/auth';
import { contentApi, type LessonDetail } from '@/lib/api/content';
import { progressApi } from '@/lib/api/progress';
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
    const startTime = useRef<number>(Date.now());

    useEffect(() => {
        if (authLoading || !user || !lessonId) return;
        let cancelled = false;

        contentApi.getLesson(lessonId)
            .then(data => { if (!cancelled) { setLesson(data); setLoading(false); } })
            .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });

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
            await progressApi.updateLesson({
                lesson_id: lesson.id,
                status: 'completed',
                time_spent_seconds: seconds,
            });
            setCompleted(true);
        } catch {
            // noop — we don't block on tracking failure
        } finally {
            setMarking(false);
        }
    }

    const [searchQuery, setSearchQuery] = useState('');

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
                        <div className="prose prose-sm sm:prose max-w-none
                            prose-headings:font-bold prose-headings:text-gray-900
                            prose-p:text-gray-700 prose-p:leading-relaxed
                            prose-li:text-gray-700
                            prose-table:text-sm
                            prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
                            prose-pre:bg-gray-900 prose-pre:text-green-400">
                            {/* Render markdown as plain text with basic formatting */}
                            <LessonContent markdown={lesson.content} />
                        </div>
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
                        <div className="mt-4">
                            <Button onClick={() => router.back()} variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Subject
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple markdown renderer — turns the markdown content into readable HTML-like JSX
function LessonContent({ markdown }: { markdown: string }) {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // H1
        if (line.startsWith('# ')) {
            elements.push(<h1 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{renderInline(line.slice(2))}</h1>);
            i++; continue;
        }
        // H2
        if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className="text-xl font-bold text-gray-800 mt-5 mb-2 border-b pb-1">{renderInline(line.slice(3))}</h2>);
            i++; continue;
        }
        // H3
        if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{renderInline(line.slice(4))}</h3>);
            i++; continue;
        }
        // Code block
        if (line.startsWith('```')) {
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(
                <pre key={i} className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto text-sm my-4">
                    <code>{codeLines.join('\n')}</code>
                </pre>
            );
            i++; continue;
        }
        // Table
        if (line.startsWith('|')) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            elements.push(<MarkdownTable key={i} rows={tableLines} />);
            continue;
        }
        // Bullet list
        if (line.startsWith('- ') || line.startsWith('* ')) {
            const items: string[] = [];
            while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
                items.push(lines[i].slice(2));
                i++;
            }
            elements.push(
                <ul key={i} className="list-disc list-inside space-y-1 my-3 text-gray-700">
                    {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                </ul>
            );
            continue;
        }
        // Numbered list
        if (/^\d+\. /.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\. /.test(lines[i])) {
                items.push(lines[i].replace(/^\d+\. /, ''));
                i++;
            }
            elements.push(
                <ol key={i} className="list-decimal list-inside space-y-1 my-3 text-gray-700">
                    {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                </ol>
            );
            continue;
        }
        // Blockquote
        if (line.startsWith('> ')) {
            elements.push(
                <blockquote key={i} className="border-l-4 border-blue-300 pl-4 py-1 my-3 text-gray-600 italic bg-blue-50 rounded-r">
                    {renderInline(line.slice(2))}
                </blockquote>
            );
            i++; continue;
        }
        // Horizontal rule
        if (line === '---' || line === '***') {
            elements.push(<hr key={i} className="my-4 border-gray-200" />);
            i++; continue;
        }
        // Empty line
        if (line.trim() === '') {
            i++; continue;
        }
        // Paragraph
        elements.push(
            <p key={i} className="text-gray-700 leading-relaxed my-2">{renderInline(line)}</p>
        );
        i++;
    }

    return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
    // Bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={i} className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm">{part.slice(1, -1)}</code>;
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}

function MarkdownTable({ rows }: { rows: string[] }) {
    if (rows.length < 2) return null;
    const header = rows[0].split('|').map(c => c.trim()).filter(Boolean);
    // rows[1] is the separator line (---|---|...)
    const body = rows.slice(2).map(row => row.split('|').map(c => c.trim()).filter(Boolean));

    return (
        <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        {header.map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 border-b">
                                {renderInline(h)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {body.map((row, ri) => (
                        <tr key={ri} className="hover:bg-gray-50">
                            {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-2 text-gray-700">{renderInline(cell)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
