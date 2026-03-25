'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/api/auth';

interface Props {
    children: React.ReactNode;
    /** If true, show the content blurred/locked when subscription has expired */
    soft?: boolean;
}

export default function SubscriptionGate({ children, soft = false }: Props) {
    const router = useRouter();
    const { user, loading } = useAuth();

    if (loading || !user) return null;

    const { subscription_status } = user;
    const hasAccess = subscription_status === 'trial' || subscription_status === 'active';

    if (hasAccess) return <>{children}</>;

    // Hard gate — replace content entirely
    if (!soft) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Subscription Required</h2>
                <p className="text-gray-600 max-w-sm mb-6">
                    Your free trial has ended. Subscribe to continue accessing all lessons and track your progress.
                </p>
                <Button
                    onClick={() => router.push('/dashboard/subscribe')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    <Zap className="h-4 w-4 mr-2" />
                    View Plans & Subscribe
                </Button>
            </div>
        );
    }

    // Soft gate — blur content with overlay
    return (
        <div className="relative">
            <div className="pointer-events-none select-none blur-sm opacity-40">
                {children}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                <Lock className="h-8 w-8 text-gray-500 mb-3" />
                <p className="text-sm font-semibold text-gray-700 mb-3">Subscribe to access this content</p>
                <Button
                    onClick={() => router.push('/dashboard/subscribe')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    <Zap className="h-3 w-3 mr-1.5" />
                    Upgrade Now
                </Button>
            </div>
        </div>
    );
}
