'use client'

import React from 'react';
import {
    BookOpen,
    ChevronRight,
    Play,
    Clock,
    TrendingUp,
    Award,
    BarChart3,
    Calculator,
    Book,
    Globe,
    Beaker,
    Palette,
    Languages,
    Wrench
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface User {
    name: string;
    email: string;
    subscription: string;
    tier: 'primary' | 'junior' | 'senior';
    grade: string;
    profileImage: string;
    joinDate: string;
    streakDays: number;
    totalPoints: number;
    completedLessons: number;
    currentLevel: string;
}

interface SubjectProgress {
    name: string;
    progress: number;
    icon: any;
    lessons: number;
    completed: number;
    nextLesson: string;
}

interface UpcomingLesson {
    subject: string;
    title: string;
    time: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface MainContentProps {
    user: User;
    subjectProgress: SubjectProgress[];
    upcomingLessons: UpcomingLesson[];
}

// Content access configuration
const contentAccess = {
    primary: {
        grades: ["Grade 4", "Grade 5", "Grade 6"],
        subjects: ["Mathematics", "English", "Kiswahili", "Science and Technology", "Creative Arts"],
        color: "blue",
        maxSubjects: 5
    },
    junior: {
        grades: ["Grade 7", "Grade 8", "Grade 9"],
        subjects: ["Mathematics", "English", "Kiswahili", "Science and Technology", "Creative Arts", "Languages", "Religious Education"],
        color: "green",
        maxSubjects: 8
    },
    senior: {
        grades: ["Grade 10", "Grade 11", "Grade 12"],
        subjects: ["Mathematics", "English", "Kiswahili", "Science and Technology", "Pure Sciences", "Technical Studies", "Languages", "Humanities", "English Literature"],
        color: "red",
        maxSubjects: 12
    }
};

export default function DashboardMainContent({ user, subjectProgress, upcomingLessons }: MainContentProps) {
    const userAccess = contentAccess[user.tier];
    const tierColor = userAccess.color;

    // Filter subjects based on user's tier
    const accessibleSubjects = subjectProgress.filter(subject =>
        userAccess.subjects.includes(subject.name)
    );

    const getTierColorClasses = (color: string, type: 'bg' | 'text' | 'border' = 'bg', shade: string = '600') => {
        const colorMap = {
            blue: { bg: 'bg-blue', text: 'text-blue', border: 'border-blue' },
            green: { bg: 'bg-green', text: 'text-green', border: 'border-green' },
            red: { bg: 'bg-red', text: 'text-red', border: 'border-red' }
        };
        return `${colorMap[color as keyof typeof colorMap][type]}-${shade}`;
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Advanced': return 'bg-red-100 text-red-700';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
            case 'Beginner': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Welcome Section */}
            <div className={`${tierColor === 'blue' ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                    tierColor === 'green' ? 'bg-gradient-to-r from-green-50 to-green-100' :
                        'bg-gradient-to-r from-red-50 to-red-100'
                } rounded-xl p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            Welcome back, {user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                            Ready to continue your {user.subscription} journey? You have {upcomingLessons.length} lessons waiting.
                        </p>
                        <Button className={`${tierColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                tierColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                    'bg-red-600 hover:bg-red-700'
                            } text-white text-sm sm:text-base h-9 sm:h-10`}>
                            Continue Learning
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                    <div className="hidden sm:block ml-4">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 ${tierColor === 'blue' ? 'bg-blue-200' :
                                tierColor === 'green' ? 'bg-green-200' :
                                    'bg-red-200'
                            } rounded-full flex items-center justify-center`}>
                            <BookOpen className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 ${tierColor === 'blue' ? 'text-blue-600' :
                                    tierColor === 'green' ? 'text-green-600' :
                                        'text-red-600'
                                }`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject Progress */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Subjects</h2>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm w-fit">
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        View Analytics
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {accessibleSubjects.map((subject, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${tierColor === 'blue' ? 'bg-blue-100' :
                                                tierColor === 'green' ? 'bg-green-100' :
                                                    'bg-red-100'
                                            } rounded-lg flex items-center justify-center`}>
                                            <subject.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${tierColor === 'blue' ? 'text-blue-600' :
                                                    tierColor === 'green' ? 'text-green-600' :
                                                        'text-red-600'
                                                }`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{subject.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500">{subject.completed}/{subject.lessons} lessons</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="font-medium">{subject.progress}%</span>
                                        </div>
                                        <Progress value={subject.progress} className="h-1.5 sm:h-2" />
                                    </div>

                                    <div className={`${tierColor === 'blue' ? 'bg-blue-50' :
                                            tierColor === 'green' ? 'bg-green-50' :
                                                'bg-red-50'
                                        } rounded-lg p-2 sm:p-3`}>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Next Lesson</p>
                                        <p className="text-xs text-gray-600">{subject.nextLesson}</p>
                                    </div>

                                    <Button className={`w-full ${tierColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                            tierColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                                'bg-red-600 hover:bg-red-700'
                                        } text-white text-xs sm:text-sm h-8 sm:h-9`} size="sm">
                                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                        Continue
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Upcoming Lessons */}
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Upcoming Lessons</h2>

                <div className="space-y-3 sm:space-y-4">
                    {upcomingLessons.map((lesson, index) => (
                        <Card key={index}>
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${tierColor === 'blue' ? 'bg-blue-100' :
                                                tierColor === 'green' ? 'bg-green-100' :
                                                    'bg-red-100'
                                            } rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <Play className={`h-5 w-5 sm:h-6 sm:w-6 ${tierColor === 'blue' ? 'text-blue-600' :
                                                    tierColor === 'green' ? 'text-green-600' :
                                                        'text-red-600'
                                                }`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{lesson.title}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500">{lesson.subject} • {lesson.duration}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm text-gray-600 truncate">{lesson.time}</span>
                                                <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex-shrink-0 ${getDifficultyColor(lesson.difficulty)}`}>
                                                    {lesson.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button className={`${tierColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                            tierColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                                'bg-red-600 hover:bg-red-700'
                                        } text-white text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4 ml-3 flex-shrink-0`}>
                                        <span className="hidden sm:inline">Join Lesson</span>
                                        <span className="sm:hidden">Join</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">This Week</h3>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">87%</p>
                        <p className="text-xs sm:text-sm text-gray-500">Average Score</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Study Time</h3>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">12.5</p>
                        <p className="text-xs sm:text-sm text-gray-500">Hours This Week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Rank</h3>
                        <p className="text-xl sm:text-2xl font-bold text-purple-600">Top 15%</p>
                        <p className="text-xs sm:text-sm text-gray-500">In Your Grade</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}