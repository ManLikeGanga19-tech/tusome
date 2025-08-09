'use client'

import React, { useState } from 'react';
import { Calculator, Book, Globe, Beaker, Palette } from 'lucide-react';
import DashboardHeader from './components/DashboardHeader';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardMainContent from './components/DashboardMainContent';

// Mock user data - in real app this would come from authentication/API
const mockUser = {
    name: "Grace Wanjiku",
    email: "grace.wanjiku@example.com",
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

// Mock progress data
const subjectProgress = [
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
];

// Recent activities
const recentActivities = [
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
];

// Upcoming lessons
const upcomingLessons = [
    {
        subject: "Mathematics",
        title: "Quadratic Equations",
        time: "Today, 4:00 PM",
        duration: "45 min",
        difficulty: "Advanced" as const
    },
    {
        subject: "Science",
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
];

export default function DashboardPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // Implement search functionality here
        console.log("Searching for:", query);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <DashboardHeader user={mockUser} onSearch={handleSearch} />

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">

                    {/* Sidebar - Hidden on mobile, shown as drawer or full width on larger screens */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 lg:top-24">
                            <DashboardSidebar user={mockUser} recentActivities={recentActivities} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <DashboardMainContent
                            user={mockUser}
                            subjectProgress={subjectProgress}
                            upcomingLessons={upcomingLessons}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}