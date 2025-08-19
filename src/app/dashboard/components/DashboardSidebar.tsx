'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Trophy,
    Download,
    Phone,
    Calendar,
    Play,
    CheckCircle,
    Award,
    Target,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Backend user interface matching your Encore types
interface BackendUser {
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

// Display user interface for component
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

interface Activity {
    type: 'lesson' | 'quiz' | 'milestone' | 'streak';
    subject: string;
    title: string;
    time: string;
    points: number;
}

// Transform backend user data to display format
const transformUserData = (backendUser: BackendUser): User => {
    const joinDate = new Date(backendUser.created_at);
    const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

    const getSubscriptionDisplay = (status: string, tier: string) => {
        if (status === 'trial') return `${tier} - Free Trial`;
        if (status === 'active') return `${tier} - Active`;
        if (status === 'expired') return `${tier} - Expired`;
        if (status === 'cancelled') return `${tier} - Cancelled`;
        return tier;
    };

    const getGradeDisplay = (grade: string) => {
        const gradeNumber = grade.replace('grade-', '');
        return `Grade ${gradeNumber}`;
    };

    return {
        name: `${backendUser.first_name} ${backendUser.last_name}`,
        email: backendUser.email,
        subscription: getSubscriptionDisplay(backendUser.subscription_status, backendUser.grade_tier),
        tier: backendUser.grade_category,
        grade: getGradeDisplay(backendUser.grade),
        profileImage: backendUser.profile_image || '',
        joinDate: joinDate.toLocaleDateString(),
        streakDays: Math.min(daysSinceJoin, 99),
        totalPoints: daysSinceJoin * 25,
        completedLessons: Math.floor(daysSinceJoin * 1.5),
        currentLevel: `Level ${Math.floor(daysSinceJoin / 7) + 1}`
    };
};

// Generate recent activities based on user data
const generateRecentActivities = (user: User): Activity[] => {
    const activityTemplates = {
        primary: [
            { type: 'lesson', subject: 'Mathematics', title: 'Completed Addition & Subtraction', time: '2 hours ago', points: 25 },
            { type: 'quiz', subject: 'English', title: 'Reading Quiz - Perfect Score!', time: '4 hours ago', points: 50 },
            { type: 'milestone', subject: 'Science', title: 'Plants & Animals Module Complete', time: '1 day ago', points: 100 },
            { type: 'streak', subject: 'General', title: '7-Day Learning Streak!', time: '2 days ago', points: 75 },
            { type: 'lesson', subject: 'Kiswahili', title: 'Mazungumzo ya Kila Siku', time: '3 days ago', points: 30 }
        ],
        junior: [
            { type: 'lesson', subject: 'Mathematics', title: 'Linear Equations Mastered', time: '1 hour ago', points: 35 },
            { type: 'quiz', subject: 'Science', title: 'Chemistry Quiz - 85% Score', time: '3 hours ago', points: 60 },
            { type: 'milestone', subject: 'English', title: 'Essay Writing Skills Complete', time: '6 hours ago', points: 120 },
            { type: 'streak', subject: 'General', title: '12-Day Learning Streak!', time: '1 day ago', points: 100 },
            { type: 'lesson', subject: 'Languages', title: 'French Basics Lesson 5', time: '2 days ago', points: 40 }
        ],
        senior: [
            { type: 'lesson', subject: 'Mathematics', title: 'Calculus Applications Complete', time: '30 min ago', points: 45 },
            { type: 'quiz', subject: 'Chemistry', title: 'Organic Chemistry - 92% Score', time: '2 hours ago', points: 80 },
            { type: 'milestone', subject: 'Literature', title: 'Shakespeare Module Finished', time: '5 hours ago', points: 150 },
            { type: 'streak', subject: 'General', title: '15-Day Learning Streak!', time: '1 day ago', points: 125 },
            { type: 'lesson', subject: 'Physics', title: 'Quantum Mechanics Intro', time: '2 days ago', points: 50 }
        ]
    };

    return activityTemplates[user.tier] as Activity[];
};

// Content access configuration
const contentAccess = {
    primary: { color: "blue" },
    junior: { color: "green" },
    senior: { color: "red" }
};

export default function DashboardSidebar() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Fetch user data from Encore backend
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);

                // Check if user data is in localStorage first
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');

                if (!storedToken) {
                    router.push('/auth/signin');
                    return;
                }

                if (storedUser) {
                    try {
                        const backendUser: BackendUser = JSON.parse(storedUser);
                        const transformedUser = transformUserData(backendUser);
                        setUser(transformedUser);
                        setRecentActivities(generateRecentActivities(transformedUser));
                    } catch (parseError) {
                        console.error('Error parsing stored user data:', parseError);
                    }
                }

                // Fetch fresh user data from backend
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const backendUser: BackendUser = await response.json();

                    // Update localStorage with fresh data
                    localStorage.setItem('user', JSON.stringify(backendUser));

                    // Transform and set user data
                    const transformedUser = transformUserData(backendUser);
                    setUser(transformedUser);
                    setRecentActivities(generateRecentActivities(transformedUser));

                    console.log('Successfully fetched user profile for sidebar');
                } else {
                    console.error('Failed to fetch user profile:', response.status);

                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        localStorage.removeItem('refresh_token');
                        router.push('/auth/signin');
                    } else {
                        setError('Failed to load user profile');
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Error loading sidebar data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'lesson': return <Play className="h-4 w-4 text-blue-600" />;
            case 'quiz': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'milestone': return <Award className="h-4 w-4 text-purple-600" />;
            case 'streak': return <Target className="h-4 w-4 text-orange-600" />;
            default: return <Play className="h-4 w-4 text-blue-600" />;
        }
    };

    const getActivityBgColor = (type: string) => {
        switch (type) {
            case 'lesson': return 'bg-blue-100';
            case 'quiz': return 'bg-green-100';
            case 'milestone': return 'bg-purple-100';
            case 'streak': return 'bg-orange-100';
            default: return 'bg-blue-100';
        }
    };

    // Loading state
    if (isLoading || !user) {
        return (
            <div className="space-y-4 sm:space-y-6">
                {/* Loading User Stats Card */}
                <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-base sm:text-lg">Learning Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                        <div className="text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Loading indicator */}
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Loading...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 text-center">
                        <div className="text-red-600 mb-2">
                            <h3 className="font-semibold text-sm">Error Loading Sidebar</h3>
                            <p className="text-xs">{error}</p>
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const tierColor = contentAccess[user.tier].color;

    // Calculate overall progress based on user data
    const calculateOverallProgress = () => {
        // Base progress on days since joining, completed lessons, and streak
        const baseProgress = Math.min(user.streakDays * 2, 60); // Streak contributes up to 60%
        const lessonProgress = Math.min(user.completedLessons * 0.5, 30); // Lessons contribute up to 30%
        const timeProgress = Math.min(Math.floor((Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24)) * 0.3, 10); // Time contributes up to 10%

        return Math.min(Math.round(baseProgress + lessonProgress + timeProgress), 100);
    };

    const overallProgress = calculateOverallProgress();

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* User Stats Card */}
            <Card>
                <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                    <div className="text-center">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 ${tierColor === 'blue' ? 'bg-blue-100' :
                            tierColor === 'green' ? 'bg-green-100' :
                                'bg-red-100'
                            } rounded-full flex items-center justify-center mx-auto mb-2`}>
                            <Trophy className={`h-6 w-6 sm:h-8 sm:w-8 ${tierColor === 'blue' ? 'text-blue-600' :
                                tierColor === 'green' ? 'text-green-600' :
                                    'text-red-600'
                                }`} />
                        </div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{user.currentLevel}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{user.grade}</p>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">Learning Streak</span>
                            <span className="font-semibold text-orange-600 text-sm">{user.streakDays} days</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">Total Points</span>
                            <span className="font-semibold text-green-600 text-sm">{user.totalPoints.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">Lessons Done</span>
                            <span className="font-semibold text-blue-600 text-sm">{user.completedLessons}</span>
                        </div>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-1 sm:mb-2">Overall Progress</p>
                        <Progress value={overallProgress} className="h-1.5 sm:h-2" />
                        <p className="text-xs text-gray-500 mt-1">{overallProgress}% complete this term</p>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 sm:space-y-2">
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9" size="sm">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Download Lessons
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9" size="sm">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Contact Teacher
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9" size="sm">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        View Schedule
                    </Button>
                </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
                <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                    {recentActivities.slice(0, 4).map((activity, index) => (
                        <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 ${getActivityBgColor(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                                {React.cloneElement(getActivityIcon(activity.type), {
                                    className: "h-3 w-3 sm:h-4 sm:w-4 " + getActivityIcon(activity.type).props.className
                                })}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                <p className="text-xs text-gray-500">{activity.subject} • {activity.time}</p>
                            </div>
                            <span className="text-xs font-medium text-green-600">+{activity.points}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
                <CardContent className="p-3 sm:p-4">
                    <div className="text-center">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">{user.subscription}</p>
                        {user.subscription.includes('Trial') && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Upgrade to unlock more features</p>
                                <Button
                                    size="sm"
                                    className={`w-full text-xs h-7 ${tierColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                            tierColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                                'bg-red-600 hover:bg-red-700'
                                        } text-white`}
                                >
                                    Upgrade Now
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}