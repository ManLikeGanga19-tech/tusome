'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/api/auth';


export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [loadingStep, setLoadingStep] = useState<'auth' | 'grade' | 'content' | 'ready'>('auth');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace('/auth/signin');
            return;
        }

        setLoadingStep('grade');
        setTimeout(() => {
            setLoadingStep('ready');
            router.replace(`/dashboard/${user.grade_category}`);
        }, 500);
    }, [user, loading, router]);

    // Get loading messages based on current step
    const getLoadingMessage = () => {
        switch (loadingStep) {
            case 'auth':
                return 'Verifying authentication...';
            case 'grade':
                return 'Checking your grade level...';
            case 'content':
                return 'Loading personalized content...';
            case 'ready':
                return 'Preparing your dashboard...';
            default:
                return 'Loading...';
        }
    };

    // Loading screen while redirecting
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
            <div className="text-center">
                {/* Logo */}
                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        <BookOpen className="h-16 w-16 text-green-600 animate-pulse" />
                        <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-75 rounded-full"></div>
                    </div>
                    <span className="ml-4 text-4xl font-bold text-gray-900 tracking-tight">Tusome</span>
                </div>

                {/* Loading animation */}
                <div className="mb-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                </div>

                {/* Loading text */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">Loading Your Dashboard</h2>
                    <p className="text-gray-600">
                        {error || getLoadingMessage()}
                    </p>
                </div>

                {/* Progress indicators */}
                <div className="mt-8 space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Verifying authentication</span>
                        <span className={loadingStep !== 'auth' ? "text-green-600" : "text-gray-400"}>
                            {loadingStep !== 'auth' ? '✓' : '⏳'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Checking grade level</span>
                        <span className={loadingStep === 'content' || loadingStep === 'ready' ? "text-green-600" : loadingStep === 'grade' ? "" : "text-gray-400"}>
                            {loadingStep === 'content' || loadingStep === 'ready' ? '✓' :
                                loadingStep === 'grade' ? <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div> : '⏳'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Loading personalized content</span>
                        <span className={loadingStep === 'ready' ? "text-green-600" : loadingStep === 'content' ? "" : "text-gray-400"}>
                            {loadingStep === 'ready' ? '✓' :
                                loadingStep === 'content' ? <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div> : '⏳'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>Preparing dashboard</span>
                        <span className={loadingStep === 'ready' ? "text-green-600" : "text-gray-400"}>
                            {loadingStep === 'ready' ? '✓' : '⏳'}
                        </span>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Manual navigation fallback - only show if taking too long or error */}
                {(loadingStep === 'ready' || error) && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-4">
                            {error ? 'Having trouble? Choose your grade level manually:' : 'Taking too long? Choose your grade level:'}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => router.push('/dashboard/primary')}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            >
                                Primary (4-6)
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/junior')}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                            >
                                Junior (7-9)
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/senior')}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                                Senior (10-12)
                            </button>
                        </div>

                        {/* Sign out option */}
                        <div className="mt-6">
                            <button
                                onClick={async () => {
                                    await logout();
                                    router.push('/auth/signin');
                                }}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Sign out and try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Development info */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                        Backend: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'} | Step: {loadingStep}
                    </div>
                )}
            </div>
        </div>
    );
}