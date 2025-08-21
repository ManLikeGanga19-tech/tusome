'use client'

import React, { useState, useEffect } from 'react';
import { Calculator, Book, Globe, TreePine, Palette, Users, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardMainContent from '../components/DashboardMainContent';

// User interface to match sign-in page
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

// Primary CBC content configuration (Grade 4-6)
const primaryContent = {
    tierName: "Primary CBC",
    category: "primary" as const,
    gradeRange: "Grade 4-6",
    icon: Users,
    color: "blue",
    subjects: [
        {
            name: "Mathematics",
            progress: 68,
            icon: Calculator,
            lessons: 20,
            completed: 14,
            nextLesson: "Addition & Subtraction"
        },
        {
            name: "English",
            progress: 75,
            icon: Book,
            lessons: 18,
            completed: 14,
            nextLesson: "Reading Comprehension"
        },
        {
            name: "Kiswahili",
            progress: 72,
            icon: Globe,
            lessons: 16,
            completed: 12,
            nextLesson: "Mazungumzo ya Kila Siku"
        },
        {
            name: "Science and Technology",
            progress: 80,
            icon: TreePine,
            lessons: 15,
            completed: 12,
            nextLesson: "Our Environment"
        },
        {
            name: "Creative Arts",
            progress: 85,
            icon: Palette,
            lessons: 12,
            completed: 10,
            nextLesson: "Drawing & Painting"
        }
    ],
    upcomingLessons: [
        {
            subject: "Mathematics",
            title: "Addition & Subtraction",
            time: "Today, 3:00 PM",
            duration: "30 min",
            difficulty: "Beginner" as const
        },
        {
            subject: "Science and Technology",
            title: "Plants Around Us",
            time: "Tomorrow, 2:30 PM",
            duration: "35 min",
            difficulty: "Beginner" as const
        },
        {
            subject: "English",
            title: "Story Reading",
            time: "Wed, 3:00 PM",
            duration: "25 min",
            difficulty: "Beginner" as const
        }
    ],
    activities: [
        {
            type: "lesson" as const,
            subject: "Mathematics",
            title: "Completed: Number Patterns",
            time: "1 hour ago",
            points: 30
        },
        {
            type: "quiz" as const,
            subject: "English",
            title: "Quiz Score: 90%",
            time: "2 hours ago",
            points: 25
        },
        {
            type: "milestone" as const,
            subject: "Science and Technology",
            title: "Completed Week 3",
            time: "1 day ago",
            points: 50
        },
        {
            type: "streak" as const,
            subject: "General",
            title: "8-day learning streak!",
            time: "Today",
            points: 20
        }
    ]
};

// Custom hook to get authenticated user data
function useAuthenticatedUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuthentication = () => {
            try {
                // Get user data from localStorage (set by sign-in page)
                const userData = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                if (!userData || !token) {
                    console.log('No user data or token found, redirecting to sign-in');
                    router.push('/auth/signin');
                    return;
                }

                const parsedUser: User = JSON.parse(userData);

                // Verify this is a primary user (grades 4-6)
                if (parsedUser.grade_category !== 'primary') {
                    console.log(`User is ${parsedUser.grade_category}, redirecting to appropriate dashboard`);
                    router.push(`/dashboard/${parsedUser.grade_category}`);
                    return;
                }

                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                router.push('/auth/signin');
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, [router]);

    return { user, loading };
}

export default function PrimaryDashboardPage() {
    const { user, loading } = useAuthenticatedUser();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        console.log("Searching Primary content for:", query);
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // User should be set by now due to redirect logic in hook
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - only needs onSearch prop */}
            <DashboardHeader onSearch={handleSearch} />

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Primary CBC Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-xl p-4 sm:p-6 mb-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center mb-2">
                                <Users className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    Primary CBC • Grade 4-6
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center">
                                Welcome back, {user.first_name}! <Zap className="h-5 w-5 ml-2 text-blue-600" />
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Learning fundamentals in Mathematics, Languages, Science, and Creative Arts.
                                Age-appropriate content designed for young learners.
                            </p>

                            {/* Show demo account notice for demo users */}
                            {user.email.includes('demo.primary@test.com') && (
                                <div className="mt-3 p-2 bg-blue-100 border border-blue-200 rounded-lg">
                                    <p className="text-xs text-blue-800">
                                         Demo Account: You're exploring the Primary CBC dashboard with sample progress data.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:block ml-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-200 rounded-full flex items-center justify-center">
                                <TreePine className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 lg:top-24">
                            <DashboardSidebar />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <DashboardMainContent />
                    </div>
                </div>
            </div>
        </div>
    );
}