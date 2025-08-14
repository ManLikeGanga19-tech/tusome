'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';

// Function to get user grade category from authentication
const getUserGradeCategory = (): 'primary' | 'junior' | 'senior' | null => {
    // In real implementation, this would come from:
    // - Authentication context/token
    // - API call to user profile  
    // - Local storage from login
    // - JWT token payload

    // For demo purposes, check localStorage or use mock data
    if (typeof window !== 'undefined') {
        // Check if user has a stored grade preference
        const storedGrade = localStorage.getItem('userGradeCategory');
        if (storedGrade && ['primary', 'junior', 'senior'].includes(storedGrade)) {
            return storedGrade as 'primary' | 'junior' | 'senior';
        }
    }

    // Mock user for demo - you can change this for testing
    const mockUserType: 'primary' | 'junior' | 'senior' = 'junior'; // Change this for testing
    return mockUserType;
};

export default function DashboardPage() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(true);

    useEffect(() => {
        const redirectToGradeDashboard = async () => {
            try {
                // Get user's grade category
                const gradeCategory = getUserGradeCategory();

                if (gradeCategory) {
                    // Redirect to the appropriate grade-specific dashboard
                    router.replace(`/dashboard/${gradeCategory}`);
                } else {
                    // If no grade info found, redirect to grade selection or sign up
                    router.replace('/auth/signup');
                }
            } catch (error) {
                console.error('Error determining user grade:', error);
                // Fallback to signup if there's an error
                router.replace('/auth/signup');
            }
        };

        // Small delay to ensure smooth transition
        const timeoutId = setTimeout(redirectToGradeDashboard, 500);

        return () => clearTimeout(timeoutId);
    }, [router]);

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
                        Personalizing your CBC learning experience...
                    </p>
                </div>

                {/* Progress indicators */}
                <div className="mt-8 space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Checking grade level</span>
                        <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Loading personalized content</span>
                        <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>Preparing dashboard</span>
                        <span>⏳</span>
                    </div>
                </div>

                {/* Manual navigation fallback */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">
                        Taking too long? Choose your grade level:
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
                </div>
            </div>
        </div>
    );
}