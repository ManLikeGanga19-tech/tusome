'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Trophy,
    Flame,
    Star,
    BookOpen,
    CheckCircle,
    Lock,
    Loader2,
    TrendingUp,
    Users,
    Award,
    Crown,
    Zap,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/api/auth';
import {
    progressApi,
    type UserStats,
    type SubjectProgress,
    type CalendarDay,
    type LeaderboardEntry,
    type UserBadge,
    currentLevelXp,
    LEVELS,
} from '@/lib/api/progress';
import DashboardHeader from '../components/DashboardHeader';

// All 12 badge slugs so we can show locked placeholders
const ALL_BADGE_SLUGS = [
    { slug: 'first_step', name: 'First Step', criteria: 'Complete 1 lesson' },
    { slug: 'dedicated', name: 'Dedicated', criteria: 'Complete 10 lessons' },
    { slug: 'achiever', name: 'Achiever', criteria: 'Complete 25 lessons' },
    { slug: 'centurion', name: 'Centurion', criteria: 'Complete 100 lessons' },
    { slug: 'week_warrior', name: 'Week Warrior', criteria: '7-day streak' },
    { slug: 'perfect_week', name: 'Perfect Week', criteria: '14-day streak' },
    { slug: 'month_master', name: 'Month Master', criteria: '30-day streak' },
    { slug: 'unstoppable', name: 'Unstoppable', criteria: '100-day streak' },
    { slug: 'subject_master', name: 'Subject Master', criteria: 'Master 1 subject' },
    { slug: 'multi_master', name: 'Multi Master', criteria: 'Master 3 subjects' },
    { slug: 'bingwa', name: 'Bingwa', criteria: 'Reach level 5' },
    { slug: 'tusome_champ', name: 'Tusome Champ', criteria: 'Reach level 10' },
];

const TIER_COLORS: Record<string, { bar: string; badge: string }> = {
    Beginner:   { bar: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-700' },
    Explorer:   { bar: 'bg-blue-400',  badge: 'bg-blue-100 text-blue-700' },
    Learner:    { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
    Proficient: { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700' },
    Master:     { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
};

export default function ProgressPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [stats, setStats] = useState<UserStats | null>(null);
    const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
    const [calendar, setCalendar] = useState<CalendarDay[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [badges, setBadges] = useState<UserBadge[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading && !user) { router.replace('/auth/signin'); return; }
        if (authLoading || !user) return;

        Promise.all([
            progressApi.getStats(),
            progressApi.getSubjectProgress(),
            progressApi.getCalendar(),
            progressApi.getLeaderboard(),
            progressApi.getBadges(),
        ]).then(([s, sub, cal, lb, bdg]) => {
            setStats(s);
            setSubjects(sub);
            setCalendar(cal);
            setLeaderboard(lb);
            setBadges(bdg);
        }).catch(() => { /* show whatever loaded */ })
          .finally(() => setLoading(false));
    }, [authLoading, user, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader onSearch={setSearchQuery} />
                <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading your progress...</p>
                </div>
            </div>
        );
    }

    const levelStart = stats ? currentLevelXp(stats.level) : 0;
    const levelEnd = stats?.next_level_xp ?? (stats?.total_xp ?? 50);
    const xpPct = stats
        ? stats.next_level_xp
            ? Math.round(((stats.total_xp - levelStart) / (levelEnd - levelStart)) * 100)
            : 100
        : 0;

    const earnedSlugs = new Set(badges.map(b => b.badge.slug));

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader onSearch={setSearchQuery} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </button>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-green-600" />
                    My Progress
                </h1>

                {/* ── Stats overview ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <StatCard
                        icon={<Trophy className="h-5 w-5 text-purple-600" />}
                        bg="bg-purple-50"
                        label="Level"
                        value={stats?.level_name ?? 'Mwanzo'}
                        sub={`Level ${stats?.level ?? 1}`}
                    />
                    <StatCard
                        icon={<Star className="h-5 w-5 text-yellow-500" />}
                        bg="bg-yellow-50"
                        label="Total XP"
                        value={(stats?.total_xp ?? 0).toLocaleString()}
                        sub={stats?.next_level_xp ? `${stats.next_level_xp - stats.total_xp} to next` : 'Max level!'}
                    />
                    <StatCard
                        icon={<Flame className="h-5 w-5 text-orange-500" />}
                        bg="bg-orange-50"
                        label="Current Streak"
                        value={`${stats?.current_streak ?? 0} days`}
                        sub={`Best: ${stats?.longest_streak ?? 0} days`}
                    />
                    <StatCard
                        icon={<BookOpen className="h-5 w-5 text-blue-600" />}
                        bg="bg-blue-50"
                        label="Lessons Done"
                        value={String(stats?.lessons_completed ?? 0)}
                        sub={`${stats?.subjects_mastered ?? 0} subjects mastered`}
                    />
                </div>

                {/* ── XP level bar ───────────────────────────────────────── */}
                <Card className="mb-6">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                    {stats?.level_name ?? 'Mwanzo'}
                                </span>
                            </div>
                            {stats?.next_level_xp && (
                                <span className="text-sm text-gray-500">
                                    {stats.total_xp.toLocaleString()} / {stats.next_level_xp.toLocaleString()} XP
                                </span>
                            )}
                        </div>
                        <Progress value={xpPct} className="h-3 mb-1" />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            {LEVELS.map(l => (
                                <span
                                    key={l.level}
                                    className={`hidden sm:inline ${stats && stats.level >= l.level ? 'text-green-600 font-medium' : ''}`}
                                >
                                    {l.level}
                                </span>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Lv {stats?.level ?? 1}: {levelStart.toLocaleString()} XP</span>
                            {stats?.next_level_xp && (
                                <span>
                                    Next: {LEVELS.find(l => l.xp === stats.next_level_xp)?.name} — {stats.next_level_xp.toLocaleString()} XP
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── 30-day calendar ────────────────────────────────────── */}
                <Card className="mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            30-Day Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <CalendarHeatmap days={calendar} />
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Studied
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> No activity
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* ── Subject progress ──────────────────────────────── */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                                Subjects
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {subjects.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No subjects yet.</p>
                            ) : subjects.map(s => (
                                <SubjectBar key={s.subject_id} subject={s} />
                            ))}
                        </CardContent>
                    </Card>

                    {/* ── Leaderboard ───────────────────────────────────── */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                Leaderboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {leaderboard.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">
                                    Complete a lesson to appear on the leaderboard!
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {leaderboard.map(entry => (
                                        <LeaderboardRow
                                            key={entry.user_id}
                                            entry={entry}
                                            isMe={entry.user_id === user?.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Badges ────────────────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            Badges ({earnedSlugs.size}/{ALL_BADGE_SLUGS.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {ALL_BADGE_SLUGS.map(({ slug, name, criteria }) => {
                                const earned = earnedSlugs.has(slug);
                                const earnedInfo = badges.find(b => b.badge.slug === slug);
                                return (
                                    <BadgeTile
                                        key={slug}
                                        name={name}
                                        criteria={criteria}
                                        earned={earned}
                                        earnedAt={earnedInfo?.earned_at}
                                    />
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon, bg, label, value, sub }: {
    icon: React.ReactNode;
    bg: string;
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                    {icon}
                </div>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </CardContent>
        </Card>
    );
}

function CalendarHeatmap({ days }: { days: CalendarDay[] }) {
    if (days.length === 0) {
        return <div className="text-sm text-gray-400 text-center py-4">No data yet.</div>;
    }

    // Split 30 days into rows of 7 (+ partial first row)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const firstDate = new Date(days[0].date + 'T00:00:00');
    const startDow = firstDate.getDay(); // 0=Sun
    // Pad with nulls to align to week grid
    const padded: (CalendarDay | null)[] = [
        ...Array(startDow).fill(null),
        ...days,
    ];
    const weeks: (CalendarDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
        weeks.push(padded.slice(i, i + 7));
    }

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[280px]">
                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayNames.map(d => (
                        <span key={d} className="text-center text-xs text-gray-400">{d}</span>
                    ))}
                </div>
                {/* Weeks */}
                {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                        {week.map((day, di) => {
                            if (!day) return <div key={di} className="aspect-square" />;
                            const d = new Date(day.date + 'T00:00:00');
                            const label = `${d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`;
                            return (
                                <div
                                    key={di}
                                    title={label}
                                    className={`aspect-square rounded-sm ${
                                        day.completed ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

function SubjectBar({ subject }: { subject: SubjectProgress }) {
    const colors = TIER_COLORS[subject.tier] ?? TIER_COLORS.Beginner;
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800 truncate mr-2">{subject.subject_name}</span>
                <Badge className={`text-xs shrink-0 ${colors.badge}`}>{subject.tier}</Badge>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-2 rounded-full ${colors.bar} transition-all`}
                        style={{ width: `${subject.percent_complete}%` }}
                    />
                </div>
                <span className="text-xs text-gray-500 w-20 text-right shrink-0">
                    {subject.completed_lessons}/{subject.total_lessons} ({subject.percent_complete}%)
                </span>
            </div>
        </div>
    );
}

function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
    const rankIcon = entry.rank === 1
        ? <Crown className="h-4 w-4 text-yellow-500" />
        : entry.rank === 2
            ? <Crown className="h-4 w-4 text-gray-400" />
            : entry.rank === 3
                ? <Crown className="h-4 w-4 text-amber-600" />
                : <span className="text-xs text-gray-400 w-4 text-center">{entry.rank}</span>;

    return (
        <div className={`flex items-center gap-3 p-2 rounded-lg ${isMe ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}>
            <div className="w-5 flex items-center justify-center shrink-0">{rankIcon}</div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isMe ? 'text-green-800' : 'text-gray-900'}`}>
                    {entry.display_name} {isMe && <span className="text-xs">(you)</span>}
                </p>
                <p className="text-xs text-gray-500">{entry.level_name} · Lv {entry.level}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Star className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700">{entry.total_xp.toLocaleString()}</span>
            </div>
        </div>
    );
}

function BadgeTile({ name, criteria, earned, earnedAt }: {
    name: string;
    criteria: string;
    earned: boolean;
    earnedAt?: string;
}) {
    const dateLabel = earnedAt
        ? new Date(earnedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
        : '';

    return (
        <div
            title={earned ? `${name} — earned ${dateLabel}` : `${name}: ${criteria}`}
            className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                earned
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200 opacity-50'
            }`}
        >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                earned ? 'bg-yellow-100' : 'bg-gray-100'
            }`}>
                {earned
                    ? <CheckCircle className="h-5 w-5 text-yellow-600" />
                    : <Lock className="h-4 w-4 text-gray-400" />
                }
            </div>
            <p className={`text-xs font-medium leading-tight ${earned ? 'text-yellow-800' : 'text-gray-500'}`}>
                {name}
            </p>
            {earned && dateLabel && (
                <p className="text-xs text-yellow-600 mt-0.5">{dateLabel}</p>
            )}
            {!earned && (
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{criteria}</p>
            )}
        </div>
    );
}
