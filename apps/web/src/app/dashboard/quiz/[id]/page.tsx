'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock,
    Star, Trophy, Zap, RotateCcw, Loader2, AlertCircle,
    BookOpen, Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/api/auth';
import DashboardHeader from '../../components/DashboardHeader';
import {
    quizApi,
    type Quiz,
    type AttemptResult,
    type AttemptSummary,
} from '@/lib/api/quiz';

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'error' | 'intro' | 'question' | 'submitting' | 'result';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function ScoreCircle({ pct, passed }: { pct: number; passed: boolean }) {
    return (
        <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-8 ${passed ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'}`}>
            <span className={`text-3xl font-bold ${passed ? 'text-green-700' : 'text-red-600'}`}>
                {Math.round(pct)}%
            </span>
            <span className={`text-xs font-medium ${passed ? 'text-green-600' : 'text-red-500'}`}>
                {passed ? 'PASSED' : 'FAILED'}
            </span>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params?.id as string;

    const { user, loading: authLoading } = useAuth();

    // Page state
    const [phase, setPhase] = useState<Phase>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    // Quiz data
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [pastAttempts, setPastAttempts] = useState<AttemptSummary[]>([]);

    // In-progress state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | null>>({});   // question_id → choice_id | null

    // Timer
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startedAt = useRef<number>(0);

    // Result
    const [result, setResult] = useState<AttemptResult | null>(null);
    const [showAnswerReview, setShowAnswerReview] = useState(false);

    // ── Auth guard ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!authLoading && !user) router.replace('/auth/signin');
    }, [authLoading, user, router]);

    // ── Load quiz ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (authLoading || !user || !quizId) return;
        Promise.all([
            quizApi.getQuiz(quizId),
            quizApi.getMyAttempts(quizId).catch(() => []),
        ])
            .then(([q, attempts]) => {
                setQuiz(q);
                setPastAttempts(attempts);
                setPhase('intro');
            })
            .catch((err) => {
                setErrorMsg(err.message ?? 'Could not load quiz');
                setPhase('error');
            });
    }, [authLoading, user, quizId]);

    // ── Timer ──────────────────────────────────────────────────────────────────

    const stopTimer = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }, []);

    const startTimer = useCallback((seconds: number) => {
        setTimeLeft(seconds);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    stopTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stopTimer]);

    // Auto-submit when timer hits 0
    useEffect(() => {
        if (timeLeft === 0 && phase === 'question') handleSubmit();
    }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => () => stopTimer(), [stopTimer]);

    // ── Actions ────────────────────────────────────────────────────────────────

    function startQuiz() {
        if (!quiz) return;
        setCurrentIndex(0);
        setAnswers({});
        setResult(null);
        setShowAnswerReview(false);
        startedAt.current = Date.now();
        if (quiz.time_limit_seconds) startTimer(quiz.time_limit_seconds);
        setPhase('question');
    }

    function selectChoice(questionId: string, choiceId: string) {
        setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
    }

    function goNext() {
        if (!quiz) return;
        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(i => i + 1);
        }
    }

    function goPrev() {
        if (currentIndex > 0) setCurrentIndex(i => i - 1);
    }

    async function handleSubmit() {
        if (!quiz) return;
        stopTimer();
        setPhase('submitting');
        const timeTaken = Math.round((Date.now() - startedAt.current) / 1000);
        const payload = quiz.questions.map(q => ({
            question_id: q.id,
            selected_choice_id: answers[q.id] ?? null,
        }));
        try {
            const res = await quizApi.submitAttempt(quiz.id, payload, timeTaken);
            setResult(res);
            // Refresh attempt history
            quizApi.getMyAttempts(quiz.id).then(setPastAttempts).catch(() => {});
            setPhase('result');
        } catch (err: any) {
            setErrorMsg(err.message ?? 'Submission failed');
            setPhase('error');
        }
    }

    // ── Renders ────────────────────────────────────────────────────────────────

    if (authLoading || phase === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    if (phase === 'error') {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 w-full">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // ── Intro screen ───────────────────────────────────────────────────────────

    if (phase === 'intro' && quiz) {
        const bestAttempt = pastAttempts.length > 0
            ? pastAttempts.reduce((best, a) => a.score_pct > best.score_pct ? a : best)
            : null;

        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <div className="max-w-2xl mx-auto px-4 py-10">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6 text-gray-500">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>

                    <Card className="border-0 shadow-xl bg-white">
                        <CardContent className="p-8 space-y-6">
                            {/* Icon + title */}
                            <div className="text-center space-y-3">
                                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                                {quiz.description && (
                                    <p className="text-gray-500 text-sm leading-relaxed">{quiz.description}</p>
                                )}
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-2xl font-bold text-gray-800">{quiz.question_count}</p>
                                    <p className="text-xs text-gray-500 mt-1">Questions</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-2xl font-bold text-gray-800">{quiz.pass_score}%</p>
                                    <p className="text-xs text-gray-500 mt-1">Pass Score</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4">
                                    <p className="text-2xl font-bold text-green-700">+{quiz.xp_reward}</p>
                                    <p className="text-xs text-green-600 mt-1">XP Reward</p>
                                </div>
                            </div>

                            {/* Time limit */}
                            {quiz.time_limit_seconds && (
                                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                    <Clock className="h-4 w-4 flex-shrink-0" />
                                    <span>Time limit: <strong>{formatTime(quiz.time_limit_seconds)}</strong></span>
                                </div>
                            )}

                            {/* Previous best */}
                            {bestAttempt && (
                                <div className="flex items-center justify-between text-sm bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                                    <span className="text-blue-700 font-medium">Your best score</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className={bestAttempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}>
                                            {bestAttempt.passed ? 'Passed' : 'Failed'}
                                        </Badge>
                                        <span className="font-bold text-blue-800">{Math.round(bestAttempt.score_pct)}%</span>
                                    </div>
                                </div>
                            )}

                            <Button onClick={startQuiz} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold">
                                {pastAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // ── Question screen ────────────────────────────────────────────────────────

    if (phase === 'question' && quiz) {
        const question = quiz.questions[currentIndex];
        const selectedChoice = answers[question.id] ?? null;
        const answeredCount = Object.values(answers).filter(v => v !== null && v !== undefined).length;
        const isLast = currentIndex === quiz.questions.length - 1;
        const allAnswered = answeredCount === quiz.questions.length;
        const progressPct = ((currentIndex + 1) / quiz.questions.length) * 100;

        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <div className="max-w-2xl mx-auto px-4 py-6">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-medium text-gray-500">
                            Question {currentIndex + 1} / {quiz.questions.length}
                        </span>
                        <div className="flex items-center gap-3">
                            {timeLeft !== null && (
                                <div className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatTime(timeLeft)}
                                </div>
                            )}
                            <span className="text-xs text-gray-400">{answeredCount}/{quiz.questions.length} answered</span>
                        </div>
                    </div>

                    <Progress value={progressPct} className="mb-6 h-2" />

                    {/* Question card */}
                    <Card className="border-0 shadow-lg bg-white mb-6">
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                                    {currentIndex + 1}
                                </span>
                                <p className="text-gray-800 font-medium text-base sm:text-lg leading-relaxed pt-1">
                                    {question.question_text}
                                </p>
                            </div>

                            {/* Choices */}
                            <div className="space-y-3">
                                {question.choices.map((choice) => {
                                    const isSelected = selectedChoice === choice.id;
                                    return (
                                        <button
                                            key={choice.id}
                                            onClick={() => selectChoice(question.id, choice.id)}
                                            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150 text-sm sm:text-base ${
                                                isSelected
                                                    ? 'border-green-500 bg-green-50 text-green-900 font-medium'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                                                    {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                                                </span>
                                                {choice.choice_text}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            variant="outline"
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            className="border-gray-200"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>

                        {isLast ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={!allAnswered}
                                className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none sm:px-8"
                            >
                                <Trophy className="h-4 w-4 mr-2" />
                                Submit Quiz {!allAnswered && `(${quiz.questions.length - answeredCount} left)`}
                            </Button>
                        ) : (
                            <Button
                                onClick={goNext}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Next <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>

                    {/* Question dots */}
                    <div className="flex justify-center flex-wrap gap-1.5 mt-6">
                        {quiz.questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                                    i === currentIndex
                                        ? 'bg-green-600 text-white'
                                        : answers[q.id]
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── Submitting ─────────────────────────────────────────────────────────────

    if (phase === 'submitting') {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                    <p className="text-gray-600 font-medium">Grading your answers…</p>
                </div>
            </div>
        );
    }

    // ── Result screen ──────────────────────────────────────────────────────────

    if (phase === 'result' && result && quiz) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />
                <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

                    {/* Score card */}
                    <Card className="border-0 shadow-xl bg-white overflow-hidden">
                        {/* Colour banner */}
                        <div className={`h-2 w-full ${result.passed ? 'bg-green-500' : 'bg-red-400'}`} />
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <ScoreCircle pct={result.score_pct} passed={result.passed} />
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {result.passed ? '🎉 Well done!' : 'Keep practising!'}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {result.passed
                                            ? `You passed with ${Math.round(result.score_pct)}% (pass mark: ${result.pass_score}%)`
                                            : `You scored ${Math.round(result.score_pct)}% — you need ${result.pass_score}% to pass`}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <Target className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-gray-800">{result.correct_answers}/{result.total_questions}</p>
                                    <p className="text-xs text-gray-500">Correct</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <Star className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-gray-800">{Math.round(result.score_pct)}%</p>
                                    <p className="text-xs text-gray-500">Score</p>
                                </div>
                                <div className={`rounded-xl p-4 ${result.xp_earned > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <Zap className={`h-5 w-5 mx-auto mb-1 ${result.xp_earned > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                                    <p className={`text-xl font-bold ${result.xp_earned > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                                        +{result.xp_earned}
                                    </p>
                                    <p className="text-xs text-gray-500">XP Earned</p>
                                </div>
                            </div>

                            {/* First-time pass bonus note */}
                            {result.xp_earned > 0 && result.previous_best_pct === null && (
                                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                                    <Trophy className="h-4 w-4 flex-shrink-0" />
                                    First time passing — full XP bonus awarded!
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-gray-200"
                                    onClick={() => setShowAnswerReview(r => !r)}
                                >
                                    {showAnswerReview ? 'Hide' : 'Review'} Answers
                                </Button>
                                <Button
                                    onClick={startQuiz}
                                    variant="outline"
                                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" /> Try Again
                                </Button>
                                <Button
                                    onClick={() => router.back()}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Lesson
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Answer review */}
                    {showAnswerReview && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Answer Review</h3>
                            {result.answers.map((ans, i) => {
                                const question = quiz.questions.find(q => q.id === ans.question_id);
                                const selectedChoice = question?.choices.find(c => c.id === ans.selected_choice_id);
                                const correctChoice = question?.choices.find(c => c.id === ans.correct_choice_id);

                                return (
                                    <Card key={ans.question_id} className={`border-l-4 shadow-sm ${ans.is_correct ? 'border-l-green-500' : 'border-l-red-400'}`}>
                                        <CardContent className="p-5 space-y-3">
                                            <div className="flex items-start gap-3">
                                                {ans.is_correct
                                                    ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                }
                                                <p className="font-medium text-gray-800 text-sm leading-relaxed">
                                                    <span className="text-gray-400 mr-1">Q{i + 1}.</span>
                                                    {ans.question_text}
                                                </p>
                                            </div>

                                            <div className="pl-8 space-y-1.5 text-sm">
                                                {selectedChoice && (
                                                    <p className={`${ans.is_correct ? 'text-green-700' : 'text-red-600'}`}>
                                                        <span className="font-medium">Your answer: </span>{selectedChoice.choice_text}
                                                    </p>
                                                )}
                                                {!ans.is_correct && correctChoice && (
                                                    <p className="text-green-700">
                                                        <span className="font-medium">Correct answer: </span>{correctChoice.choice_text}
                                                    </p>
                                                )}
                                                {!selectedChoice && (
                                                    <p className="text-gray-400 italic">Not answered</p>
                                                )}
                                                {ans.explanation && (
                                                    <p className="text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-2 leading-relaxed">
                                                        💡 {ans.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
