'use client'

import React, { useState, useEffect } from 'react';
import { Calculator, Book, Globe, Beaker, Crown, Microscope, Computer, Briefcase, GraduationCap } from 'lucide-react';
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

// Senior Secondary content configuration (Grade 10-12)
const seniorContent = {
    tierName: "Senior Secondary",
    category: "senior" as const,
    gradeRange: "Grade 10-12",
    icon: Crown,
    color: "red",
    subjects: [
        {
            name: "Mathematics",
            progress: 88,
            icon: Calculator,
            lessons: 32,
            completed: 28,
            nextLesson: "Calculus Fundamentals"
        },
        {
            name: "English",
            progress: 85,
            icon: Book,
            lessons: 28,
            completed: 24,
            nextLesson: "Literature Analysis"
        },
        {
            name: "Kiswahili",
            progress: 82,
            icon: Globe,
            lessons: 25,
            completed: 21,
            nextLesson: "Fasihi ya Kiswahili"
        },
        {
            name: "Science and Technology",
            progress: 79,
            icon: Beaker,
            lessons: 35,
            completed: 28,
            nextLesson: "Advanced Chemistry"
        },
        {
            name: "Pure Sciences",
            progress: 83,
            icon: Microscope,
            lessons: 30,
            completed: 25,
            nextLesson: "Quantum Physics"
        },
        {
            name: "Technical Studies",
            progress: 91,
            icon: Computer,
            lessons: 26,
            completed: 24,
            nextLesson: "Data Structures"
        },
        {
            name: "Languages",
            progress: 76,
            icon: Briefcase,
            lessons: 24,
            completed: 18,
            nextLesson: "Advanced Grammar"
        }
    ],
    upcomingLessons: [
        {
            subject: "Mathematics",
            title: "Calculus Fundamentals",
            time: "Today, 5:00 PM",
            duration: "60 min",
            difficulty: "Advanced" as const
        },
        {
            subject: "Pure Sciences",
            title: "Quantum Physics Intro",
            time: "Tomorrow, 4:00 PM",
            duration: "55 min",
            difficulty: "Advanced" as const
        },
        {
            subject: "Technical Studies",
            title: "Machine Learning Basics",
            time: "Wed, 5:00 PM",
            duration: "50 min",
            difficulty: "Advanced" as const
        }
    ],
    activities: [
        {
            type: "lesson" as const,
            subject: "Technical Studies",
            title: "Completed: Algorithms",
            time: "1 hour ago",
            points: 75
        },
        {
            type: "quiz" as const,
            subject: "Pure Sciences",
            title: "Quiz Score: 92%",
            time: "3 hours ago",
            points: 60
        },
        {
            type: "milestone" as const,
            subject: "Mathematics",
            title: "Advanced Level Unlocked",
            time: "1 day ago",
            points: 150
        },
        {
            type: "streak" as const,
            subject: "General",
            title: "18-day learning streak!",
            time: "Today",
            points: 35
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

                // Verify this is a senior user (grades 10-12)
                if (parsedUser.grade_category !== 'senior') {
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

export default function SeniorDashboardPage() {
    const { user, loading } = useAuthenticatedUser();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        console.log("Searching Senior content for:", query);
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
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
                {/* Senior Secondary Welcome Banner */}
                <div className="bg-gradient-to-r from-red-50 via-red-100 to-red-50 rounded-xl p-4 sm:p-6 mb-6 border border-red-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center mb-2">
                                <Crown className="h-6 w-6 text-red-600 mr-2" />
                                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    Senior Secondary • Grade 10-12
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center">
                                Welcome back, {user.first_name}! <GraduationCap className="h-5 w-5 ml-2 text-red-600" />
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Specialized studies in Pure Sciences, Technical subjects, and Advanced Mathematics.
                                KCSE preparation and university pathway planning.
                            </p>

                            {/* Show demo account notice for demo users */}
                            {user.email.includes('demo.senior@test.com') && (
                                <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                                    <p className="text-xs text-red-800">
                                         Demo Account: You're exploring the Senior Secondary dashboard with sample progress data.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:block ml-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-200 rounded-full flex items-center justify-center">
                                <Microscope className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
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