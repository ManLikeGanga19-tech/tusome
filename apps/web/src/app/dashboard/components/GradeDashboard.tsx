'use client';

/**
 * GradeDashboard — shared layout for primary / junior / senior grade pages.
 *
 * Responsibilities:
 *  - Auth guard: redirect to sign-in if not authenticated
 *  - Grade guard: redirect to the correct tier page if the user's grade doesn't match
 *  - Render the standard Header → Sidebar + MainContent layout
 *
 * DashboardMainContent and DashboardSidebar each own their own data-fetching
 * (subjects, progress, stats) and are fully wired to the real API.
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/api/auth';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import DashboardMainContent from './DashboardMainContent';

type GradeCategory = 'primary' | 'junior' | 'senior';

interface Props {
    category: GradeCategory;
}

export default function GradeDashboard({ category }: Props) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/auth/signin');
            return;
        }
        // Redirect to the correct tier if the user lands on the wrong one
        if (user.grade_category !== category) {
            router.replace(`/dashboard/${user.grade_category}`);
        }
    }, [user, loading, router, category]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Render nothing while redirect is in flight
    if (!user || user.grade_category !== category) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 lg:top-24">
                            <DashboardSidebar />
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <DashboardMainContent />
                    </div>
                </div>
            </div>
        </div>
    );
}
