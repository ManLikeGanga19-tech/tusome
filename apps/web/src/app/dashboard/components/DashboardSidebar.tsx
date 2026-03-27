'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Trophy,
    Flame,
    Star,
    BookOpen,
    Download,
    Phone,
    Calendar,
    TrendingUp,
    Loader2,
    Brain,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/lib/api/auth';
import { progressApi, type UserStats, currentLevelXp } from '@/lib/api/progress';

const TIER_COLOR: Record<string, string> = {
    primary: 'bg-blue-100 text-blue-600',
    junior: 'bg-green-100 text-green-600',
    senior: 'bg-red-100 text-red-600',
};

const TIER_BTN: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    junior: 'bg-green-600 hover:bg-green-700',
    senior: 'bg-red-600 hover:bg-red-700',
};

export default function DashboardSidebar() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [stats, setStats] = useState<UserStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;
        progressApi.getStats()
            .then(setStats)
            .catch(() => { /* non-blocking */ })
            .finally(() => setStatsLoading(false));
    }, [authLoading, user]);

    const tier = (user?.grade_category ?? 'junior') as 'primary' | 'junior' | 'senior';
    const tierColor = TIER_COLOR[tier] ?? TIER_COLOR.junior;
    const tierBtn = TIER_BTN[tier] ?? TIER_BTN.junior;

    // XP bar
    const levelStart = stats ? currentLevelXp(stats.level) : 0;
    const levelEnd = stats?.next_level_xp ?? (stats ? stats.total_xp : 50);
    const xpProgress = stats
        ? stats.next_level_xp
            ? Math.round(((stats.total_xp - levelStart) / (levelEnd - levelStart)) * 100)
            : 100
        : 0;

    if (authLoading || statsLoading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base sm:text-lg">My Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                            </div>
                        ))}
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Stats card */}
            <Card>
                <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg">My Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                    {/* Level badge */}
                    <div className="text-center">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${tierColor}`}>
                            <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {stats?.level_name ?? 'Mwanzo'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Level {stats?.level ?? 1}
                        </p>
                    </div>

                    {/* XP progress bar */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{(stats?.total_xp ?? 0).toLocaleString()} XP</span>
                            <span>
                                {stats?.next_level_xp
                                    ? `${stats.next_level_xp.toLocaleString()} XP`
                                    : 'Max level'}
                            </span>
                        </div>
                        <Progress value={xpProgress} className="h-2" />
                    </div>

                    {/* Stats rows */}
                    <div className="space-y-2 sm:space-y-3 pt-1">
                        <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                                <Flame className="h-3.5 w-3.5 text-orange-500" /> Streak
                            </span>
                            <span className="font-semibold text-orange-600 text-sm">
                                {stats?.current_streak ?? 0} days
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                                <Star className="h-3.5 w-3.5 text-yellow-500" /> Total XP
                            </span>
                            <span className="font-semibold text-green-600 text-sm">
                                {(stats?.total_xp ?? 0).toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                                <BookOpen className="h-3.5 w-3.5 text-blue-500" /> Lessons Done
                            </span>
                            <span className="font-semibold text-blue-600 text-sm">
                                {stats?.lessons_completed ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* View progress link */}
                    <Button
                        onClick={() => router.push('/dashboard/progress')}
                        variant="outline"
                        className="w-full text-xs sm:text-sm h-8 sm:h-9"
                        size="sm"
                    >
                        <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                        View Full Progress
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard/quizzes')}
                        variant="outline"
                        className="w-full text-xs sm:text-sm h-8 sm:h-9"
                        size="sm"
                    >
                        <Brain className="h-3.5 w-3.5 mr-1.5" />
                        My Quizzes
                    </Button>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 sm:space-y-2">
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9" size="sm">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Download Lessons
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9" size="sm">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Contact Teacher
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9" size="sm">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        View Schedule
                    </Button>
                </CardContent>
            </Card>

            {/* Subscription */}
            {user?.subscription_status === 'trial' && (
                <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                            {user.grade_tier} — Free Trial
                        </p>
                        <p className="text-xs text-gray-500 mb-2">Upgrade to unlock all features</p>
                        <Button
                            onClick={() => router.push('/dashboard/subscribe')}
                            size="sm"
                            className={`w-full text-xs h-7 ${tierBtn} text-white`}
                        >
                            Upgrade Now
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
