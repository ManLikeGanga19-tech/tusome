'use client'

import React from 'react';
import TrialBanner from '@/components/TrialBanner';
import AnnouncementBanner from '@/components/AnnouncementBanner';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <AnnouncementBanner />
            <TrialBanner />
            {children}
        </div>
    );
}
