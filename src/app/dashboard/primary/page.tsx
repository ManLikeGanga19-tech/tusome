'use client'

import React, { useState } from 'react';
import { Calculator, Book, Globe, TreePine, Palette, Users } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardMainContent from '../components/DashboardMainContent';

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

// Mock user data for Primary level
const primaryUser = {
    name: "Peter Kiprotich",
    email: "peter.kiprotich@student.ke",
    subscription: "Primary CBC",
    tier: "primary" as const,
    grade: "Grade 6",
    profileImage: "/api/placeholder/40/40",
    joinDate: "January 2025",
    streakDays: 8,
    totalPoints: 1800,
    completedLessons: 28,
    currentLevel: "Beginner"
};

export default function PrimaryDashboardPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        console.log("Searching Primary content for:", query);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <DashboardHeader user={primaryUser} onSearch={handleSearch} />

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
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                Building Strong Foundations! 🌱
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Learning fundamentals in Mathematics, Languages, Science, and Creative Arts.
                                Age-appropriate content designed for young learners.
                            </p>
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
                            <DashboardSidebar
                                user={primaryUser}
                                recentActivities={primaryContent.activities}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <DashboardMainContent
                            user={primaryUser}
                            subjectProgress={primaryContent.subjects}
                            upcomingLessons={primaryContent.upcomingLessons}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}