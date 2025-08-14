'use client'

import React, { useState } from 'react';
import { Calculator, Book, Globe, Beaker, Crown, Microscope, Computer, Briefcase } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardMainContent from '../components/DashboardMainContent';

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

// Mock user data for Senior level
const seniorUser = {
    name: "Grace Mwangi",
    email: "grace.mwangi@student.ke",
    subscription: "Senior Secondary",
    tier: "senior" as const,
    grade: "Grade 12",
    profileImage: "/api/placeholder/40/40",
    joinDate: "January 2025",
    streakDays: 18,
    totalPoints: 3200,
    completedLessons: 65,
    currentLevel: "Advanced"
};

export default function SeniorDashboardPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        console.log("Searching Senior content for:", query);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <DashboardHeader user={seniorUser} onSearch={handleSearch} />

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
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                Mastering Advanced Concepts! 🎓
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Specialized studies in Pure Sciences, Technical subjects, and Advanced Mathematics.
                                KCSE preparation and university pathway planning.
                            </p>
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
                            <DashboardSidebar
                                user={seniorUser}
                                recentActivities={seniorContent.activities}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <DashboardMainContent
                            user={seniorUser}
                            subjectProgress={seniorContent.subjects}
                            upcomingLessons={seniorContent.upcomingLessons}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}