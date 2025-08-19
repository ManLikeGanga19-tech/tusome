'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';

// Types to match your backend
interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    grade: string;
    grade_category: 'primary' | 'junior' | 'senior';
    grade_tier: 'Primary CBC' | 'Junior Secondary' | 'Senior Secondary';
    profile_image?: string;
    is_active: boolean;
    email_verified: boolean;
    trial_start_date?: Date;
    trial_end_date?: Date;
    subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
    last_login_at?: Date;
    created_at: Date;
    updated_at: Date;
}

// Function to get user grade category from Encore backend authentication
const getUserGradeCategory = async (): Promise<'primary' | 'junior' | 'senior' | null> => {
    try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
            return null;
        }

        // First, try to get user data from localStorage (stored during login)
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            try {
                const user: User = JSON.parse(storedUser);

                // Validate the user object has the required grade_category
                if (user.grade_category && ['primary', 'junior', 'senior'].includes(user.grade_category)) {
                    console.log('Using stored user grade category:', user.grade_category);
                    return user.grade_category;
                }
            } catch (parseError) {
                console.error('Error parsing stored user data:', parseError);
                // Continue to API call if localStorage data is invalid
            }
        }

        // If no valid stored data, fetch from backend using token
        if (storedToken) {
            console.log('Fetching user profile from backend...');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const userData: User = await response.json();

                // Update localStorage with fresh user data
                localStorage.setItem('user', JSON.stringify(userData));

                console.log('Successfully fetched user profile:', userData.grade_category);
                return userData.grade_category;
            } else {
                console.error('Failed to fetch user profile:', response.status, response.statusText);

                // If token is invalid, clear stored data
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                }

                return null;
            }
        }

        // No token found - user is not authenticated
        console.log('No authentication token found');
        return null;

    } catch (error) {
        console.error('Error getting user grade category:', error);
        return null;
    }
};

// Function to check if user is authenticated
const isUserAuthenticated = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    return !!(token && user);
};

export default function DashboardPage() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(true);
    const [loadingStep, setLoadingStep] = useState<'auth' | 'grade' | 'content' | 'ready'>('auth');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const redirectToGradeDashboard = async () => {
            try {
                setLoadingStep('auth');

                // Check if user is authenticated
                if (!isUserAuthenticated()) {
                    console.log('User not authenticated, redirecting to signin');
                    router.replace('/auth/signin');
                    return;
                }

                setLoadingStep('grade');

                // Get user's grade category from backend
                const gradeCategory = await getUserGradeCategory();

                if (gradeCategory) {
                    setLoadingStep('content');

                    // Small delay for smooth UX
                    await new Promise(resolve => setTimeout(resolve, 800));

                    setLoadingStep('ready');

                    console.log(`Redirecting to /dashboard/${gradeCategory}`);

                    // Redirect to the appropriate grade-specific dashboard
                    router.replace(`/dashboard/${gradeCategory}`);
                } else {
                    // If no grade info found or API error, redirect to signup
                    console.log('No grade category found, redirecting to signup');
                    setError('Unable to determine your grade level. Please sign up again.');

                    // Clear any invalid stored data
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');

                    setTimeout(() => {
                        router.replace('/auth/signup');
                    }, 2000);
                }
            } catch (error) {
                console.error('Error determining user grade:', error);
                setError('An error occurred while loading your dashboard.');

                // Fallback to signup if there's an error
                setTimeout(() => {
                    router.replace('/auth/signup');
                }, 2000);
            } finally {
                // Keep loading state for a bit longer for smooth UX
                setTimeout(() => {
                    setIsRedirecting(false);
                }, 1000);
            }
        };

        // Small delay to ensure smooth transition
        const timeoutId = setTimeout(redirectToGradeDashboard, 300);

        return () => clearTimeout(timeoutId);
    }, [router]);

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
                                onClick={() => {
                                    // Store grade preference for next time
                                    localStorage.setItem('userGradeCategory', 'primary');
                                    router.push('/dashboard/primary');
                                }}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            >
                                Primary (4-6)
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('userGradeCategory', 'junior');
                                    router.push('/dashboard/junior');
                                }}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                            >
                                Junior (7-9)
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('userGradeCategory', 'senior');
                                    router.push('/dashboard/senior');
                                }}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                                Senior (10-12)
                            </button>
                        </div>

                        {/* Sign out option */}
                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('user');
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('refresh_token');
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
                        Backend: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'} | Step: {loadingStep}
                    </div>
                )}
            </div>
        </div>
    );
}