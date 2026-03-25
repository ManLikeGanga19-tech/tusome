'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/api/auth';

function getDaysRemaining(trialEndDate: string | null | undefined): number | null {
    if (!trialEndDate) return null;
    const end = new Date(trialEndDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}

export default function TrialBanner() {
    const router = useRouter();
    const { user } = useAuth();
    const [dismissed, setDismissed] = useState(false);

    // Don't re-show same-day dismissal
    useEffect(() => {
        const key = `trial_banner_dismissed_${new Date().toDateString()}`;
        if (sessionStorage.getItem(key)) setDismissed(true);
    }, []);

    if (!user || dismissed) return null;

    const { subscription_status, trial_end_date } = user;

    // Active subscribers — no banner needed
    if (subscription_status === 'active') return null;

    const daysLeft = getDaysRemaining(trial_end_date);

    // ── Expired ────────────────────────────────────────────────────────────
    if (subscription_status === 'expired') {
        return (
            <div className="bg-red-600 text-white px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>Your free trial has ended. Subscribe to continue learning.</span>
                    </div>
                    <Button
                        size="sm"
                        className="bg-white text-red-600 hover:bg-red-50 font-semibold flex-shrink-0 h-7 text-xs"
                        onClick={() => router.push('/dashboard/subscribe')}
                    >
                        <Zap className="h-3 w-3 mr-1" />
                        Subscribe Now
                    </Button>
                </div>
            </div>
        );
    }

    // ── Trial active ───────────────────────────────────────────────────────
    if (subscription_status !== 'trial' || daysLeft === null) return null;

    // > 5 days: soft green info
    // 3–5 days: amber warning
    // ≤ 2 days: red urgent
    const isUrgent = daysLeft <= 2;
    const isWarning = daysLeft <= 5;

    const bg = isUrgent ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-green-700';
    const btnCls = isUrgent
        ? 'bg-white text-red-600 hover:bg-red-50'
        : isWarning
            ? 'bg-white text-amber-600 hover:bg-amber-50'
            : 'bg-white text-green-700 hover:bg-green-50';

    const message = daysLeft <= 0
        ? 'Your trial has expired.'
        : daysLeft === 1
            ? 'Your free trial ends TODAY.'
            : `${daysLeft} days left in your free trial.`;

    function dismiss() {
        const key = `trial_banner_dismissed_${new Date().toDateString()}`;
        sessionStorage.setItem(key, '1');
        setDismissed(true);
    }

    return (
        <div className={`${bg} text-white px-4 py-2.5`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{message}</span>
                    {!isUrgent && (
                        <span className="hidden sm:inline opacity-80">
                            Upgrade to keep your progress and unlock all lessons.
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                        size="sm"
                        className={`${btnCls} font-semibold h-7 text-xs`}
                        onClick={() => router.push('/dashboard/subscribe')}
                    >
                        <Zap className="h-3 w-3 mr-1" />
                        Upgrade
                    </Button>
                    {!isUrgent && (
                        <button
                            onClick={dismiss}
                            className="opacity-70 hover:opacity-100 transition-opacity"
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
