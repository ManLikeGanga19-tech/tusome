'use client'

import React, { useState } from 'react';
import { Calculator, Book, Globe, Beaker, Palette, Crown, Users, Rocket, Target } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardMainContent from '../components/DashboardMainContent';

// Junior Secondary content configuration (Grade 7-9)
const juniorContent = {
    tierName: "Junior Secondary",
    category: "junior" as const,
    gradeRange: "Grade 7-9",
    icon: Crown,
    color: "green",
    subjects: [
        {
            name: "Mathematics",
            progress: 75,
            icon: Calculator,
            lessons: 24,
            completed: 18,
            nextLesson: "Quadratic Equations"
        },
        {
            name: "English",
            progress: 82,
            icon: Book,
            lessons: 20,
            completed: 16,
            nextLesson: "Essay Writing"
        },
        {
            name: "Kiswahili",
            progress: 68,
            icon: Globe,
            lessons: 18,
            completed: 12,
            nextLesson: "Mazungumzo"
        },
        {
            name: "Science and Technology",
            progress: 71,
            icon: Beaker,
            lessons: 28,
            completed: 20,
            nextLesson: "Chemical Reactions"
        },
        {
            name: "Creative Arts",
            progress: 85,
            icon: Palette,
            lessons: 15,
            completed: 13,
            nextLesson: "Digital Art"
        },
        {
            name: "Languages",
            progress: 78,
            icon: Users,
            lessons: 22,
            completed: 17,
            nextLesson: "French Basics"
        }
    ],
    upcomingLessons: [
        {
            subject: "Mathematics",
            title: "Quadratic Equations",
            time: "Today, 4:00 PM",
            duration: "45 min",
            difficulty: "Intermediate" as const
        },
        {
            subject: "Science and Technology",
            title: "Chemical Reactions",
            time: "Tomorrow, 3:30 PM",
            duration: "50 min",
            difficulty: "Intermediate" as const
        },
        {
            subject: "English",
            title: "Essay Writing Techniques",
            time: "Wed, 4:00 PM",
            duration: "40 min",
            difficulty: "Intermediate" as const
        }
    ],
    activities: [
        {
            type: "lesson" as const,
            subject: "Mathematics",
            title: "Completed: Linear Equations",
            time: "2 hours ago",
            points: 50
        },
        {
            type: "quiz" as const,
            subject: "English",
            title: "Quiz Score: 85%",
            time: "1 day ago",
            points: 35
        },
        {
            type: "milestone" as const,
            subject: "Kiswahili",
            title: "Reached Intermediate Level",
            time: "2 days ago",
            points: 100
        },
        {
            type: "streak" as const,
            subject: "General",
            title: "12-day learning streak!",
            time: "Today",
            points: 25
        }
    ]
};

// Mock user data for Junior level
const juniorUser = {
    name: "Grace Wanjiku",
    email: "grace.wanjiku@student.ke",
    subscription: "Junior Secondary",
    tier: "junior" as const,
    grade: "Grade 8",
    profileImage: "/api/placeholder/40/40",
    joinDate: "January 2025",
    streakDays: 12,
    totalPoints: 2450,
    completedLessons: 45,
    currentLevel: "Intermediate"
};

export default function JuniorDashboardPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        console.log("Searching Junior content for:", query);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <DashboardHeader user={juniorUser} onSearch={handleSearch} />

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Junior Secondary Welcome Banner */}
                <div className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 rounded-xl p-4 sm:p-6 mb-6 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center mb-2">
                                <Crown className="h-6 w-6 text-green-600 mr-2" />
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    Junior Secondary • Grade 7-9
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center">
                                Advancing Your Knowledge! <Rocket className="h-5 w-5 ml-2 text-green-600" />
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Exploring advanced concepts in Science, Mathematics, and Languages.
                                Preparing for KPSEA and Senior Secondary transition.
                            </p>
                        </div>
                        <div className="hidden sm:block ml-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-200 rounded-full flex items-center justify-center">
                                <Target className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 lg:top-24">
                            <DashboardSidebar
                                user={juniorUser}
                                recentActivities={juniorContent.activities}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <DashboardMainContent
                            user={juniorUser}
                            subjectProgress={juniorContent.subjects}
                            upcomingLessons={juniorContent.upcomingLessons}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}