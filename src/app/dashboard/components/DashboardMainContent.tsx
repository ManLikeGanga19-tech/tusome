'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    Wrench,
    Smile,
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

// Generate subject progress based on user's grade category
const generateSubjectProgress = (gradeCategory: 'primary' | 'junior' | 'senior'): SubjectProgress[] => {
    const subjectData: Record<string, { icon: any; baseProgress: number; lessons: number }> = {
        Mathematics: { icon: Calculator, baseProgress: 75, lessons: 24 },
        English: { icon: Book, baseProgress: 68, lessons: 20 },
        Kiswahili: { icon: Languages, baseProgress: 72, lessons: 18 },
        'Science and Technology': { icon: Beaker, baseProgress: 65, lessons: 22 },
        'Creative Arts': { icon: Palette, baseProgress: 80, lessons: 16 },
        Languages: { icon: Globe, baseProgress: 70, lessons: 20 },
        'Religious Education': { icon: Book, baseProgress: 85, lessons: 12 },
        'Pure Sciences': { icon: Beaker, baseProgress: 62, lessons: 28 },
        'Technical Studies': { icon: Wrench, baseProgress: 58, lessons: 24 },
        Humanities: { icon: Globe, baseProgress: 73, lessons: 20 },
        'English Literature': { icon: Book, baseProgress: 67, lessons: 18 }
    };

    const subjectsByTier = {
        primary: ['Mathematics', 'English', 'Kiswahili', 'Science and Technology', 'Creative Arts'],
        junior: ['Mathematics', 'English', 'Kiswahili', 'Science and Technology', 'Creative Arts', 'Languages', 'Religious Education'],
        senior: ['Mathematics', 'English', 'Kiswahili', 'Science and Technology', 'Pure Sciences', 'Technical Studies', 'Languages', 'Humanities', 'English Literature']
    };

    const nextLessons = [
        'Introduction to Algebra',
        'Creative Writing',
        'Mazungumzo ya Kila Siku',
        'Basic Chemistry',
        'Digital Art Basics',
        'French Basics',
        'World Religions',
        'Advanced Physics',
        'Programming Fundamentals',
        'World History',
        'Poetry Analysis'
    ];

    return subjectsByTier[gradeCategory].map((subject, index) => {
        const data = subjectData[subject];
        const progress = Math.max(0, Math.min(100, data.baseProgress + Math.random() * 20 - 10));
        const completed = Math.floor((progress / 100) * data.lessons);

        return {
            name: subject,
            progress: Math.round(progress),
            icon: data.icon,
            lessons: data.lessons,
            completed,
            nextLesson: nextLessons[index] || 'Next Topic Overview'
        };
    });
};

// Generate upcoming lessons based on user's grade category
const generateUpcomingLessons = (gradeCategory: 'primary' | 'junior' | 'senior'): UpcomingLesson[] => {
    const lessonsByTier = {
        primary: [
            { subject: 'Mathematics', title: 'Addition and Subtraction', time: 'Today at 10:00 AM', duration: '30 min', difficulty: 'Beginner' as const },
            { subject: 'English', title: 'Reading Comprehension', time: 'Today at 2:00 PM', duration: '25 min', difficulty: 'Beginner' as const },
            { subject: 'Science and Technology', title: 'Plants and Animals', time: 'Tomorrow at 11:00 AM', duration: '35 min', difficulty: 'Beginner' as const }
        ],
        junior: [
            { subject: 'Mathematics', title: 'Linear Equations', time: 'Today at 9:00 AM', duration: '45 min', difficulty: 'Intermediate' as const },
            { subject: 'Science and Technology', title: 'Chemical Reactions', time: 'Today at 1:00 PM', duration: '40 min', difficulty: 'Intermediate' as const },
            { subject: 'English', title: 'Essay Writing Skills', time: 'Tomorrow at 10:00 AM', duration: '50 min', difficulty: 'Intermediate' as const }
        ],
        senior: [
            { subject: 'Mathematics', title: 'Calculus Applications', time: 'Today at 8:00 AM', duration: '60 min', difficulty: 'Advanced' as const },
            { subject: 'Pure Sciences', title: 'Organic Chemistry', time: 'Today at 11:00 AM', duration: '55 min', difficulty: 'Advanced' as const },
            { subject: 'English Literature', title: 'Shakespeare Analysis', time: 'Tomorrow at 9:00 AM', duration: '50 min', difficulty: 'Advanced' as const }
        ]
    };

    return lessonsByTier[gradeCategory];
};

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

// Check if user is a demo account
const isDemoAccount = (email: string): boolean => {
    return email.includes('demo.') && email.includes('@test.com');
};

export default function DashboardMainContent() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
    const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
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

                        // Generate content based on user's grade category
                        setSubjectProgress(generateSubjectProgress(backendUser.grade_category));
                        setUpcomingLessons(generateUpcomingLessons(backendUser.grade_category));

                        // For demo accounts, don't try to fetch from backend
                        if (isDemoAccount(backendUser.email)) {
                            console.log('Demo account detected, using stored data only');
                            setIsLoading(false);
                            return;
                        }
                    } catch (parseError) {
                        console.error('Error parsing stored user data:', parseError);
                    }
                }

                // Only fetch from backend for non-demo accounts
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    if (!isDemoAccount(userData.email)) {
                        try {
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

                                // Generate content based on user's grade category
                                setSubjectProgress(generateSubjectProgress(backendUser.grade_category));
                                setUpcomingLessons(generateUpcomingLessons(backendUser.grade_category));

                                console.log('Successfully fetched user profile for dashboard');
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
                        } catch (fetchError) {
                            console.error('Backend fetch error:', fetchError);
                            // For real users, show error
                            setError('Unable to connect to server');
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                const storedUser = localStorage.getItem('user');

                // For demo accounts, don't show error - just use stored data
                if (storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
                        if (isDemoAccount(userData.email)) {
                            console.log('Demo account - using stored data, ignoring fetch error');
                            const transformedUser = transformUserData(userData);
                            setUser(transformedUser);
                            setSubjectProgress(generateSubjectProgress(userData.grade_category));
                            setUpcomingLessons(generateUpcomingLessons(userData.grade_category));
                        } else {
                            setError('Error loading dashboard data');
                        }
                    } catch (parseError) {
                        setError('Error loading dashboard data');
                    }
                } else {
                    setError('Error loading dashboard data');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Advanced': return 'bg-red-100 text-red-700';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
            case 'Beginner': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Loading state
    if (isLoading || !user) {
        return (
            <div className="space-y-6 sm:space-y-8">
                <div className="bg-gray-100 rounded-xl p-4 sm:p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-4 sm:p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-2 bg-gray-200 rounded mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading your dashboard...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6 sm:space-y-8">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 sm:p-6 text-center">
                        <div className="text-red-600 mb-2">
                            <h3 className="font-semibold">Error Loading Dashboard</h3>
                            <p className="text-sm">{error}</p>
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const userAccess = contentAccess[user.tier];
    const tierColor = userAccess.color;

    // Filter subjects based on user's tier
    const accessibleSubjects = subjectProgress.filter(subject =>
        userAccess.subjects.includes(subject.name)
    );

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Welcome Section */}
            <div className={`${tierColor === 'blue' ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                tierColor === 'green' ? 'bg-gradient-to-r from-green-50 to-green-100' :
                    'bg-gradient-to-r from-red-50 to-red-100'
                } rounded-xl p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center">
                            Welcome back, {user.name.split(' ')[0]}! <Smile className="h-5 w-5 ml-2 text-yellow-500" />
                            {isDemoAccount(user.email) && (
                                <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    Demo Mode
                                </span>
                            )}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                            Ready to continue your {user.subscription} journey? You have {upcomingLessons.length} lessons waiting.
                            {isDemoAccount(user.email) && (
                                <span className="block text-xs text-blue-600 mt-1">
                                    You're exploring sample content. Sign up for real to track your actual progress!
                                </span>
                            )}
                        </p>
                        <Button className={`${tierColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                            tierColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                'bg-red-600 hover:bg-red-700'
                            } text-white text-sm sm:text-base h-9 sm:h-10`}>
                            {isDemoAccount(user.email) ? 'Try Sample Lesson' : 'Continue Learning'}
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
                                        {isDemoAccount(user.email) ? 'Try Sample' : 'Continue'}
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
                                        <span className="hidden sm:inline">{isDemoAccount(user.email) ? 'Try Sample' : 'Join Lesson'}</span>
                                        <span className="sm:hidden">{isDemoAccount(user.email) ? 'Try' : 'Join'}</span>
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
                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                            {isDemoAccount(user.email) ? '87%' : '87%'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                            {isDemoAccount(user.email) ? 'Sample Score' : 'Average Score'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Study Time</h3>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">
                            {isDemoAccount(user.email) ? '12.5' : '12.5'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                            {isDemoAccount(user.email) ? 'Sample Hours' : 'Hours This Week'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Rank</h3>
                        <p className="text-xl sm:text-2xl font-bold text-purple-600">
                            {isDemoAccount(user.email) ? 'Demo' : 'Top 15%'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                            {isDemoAccount(user.email) ? 'Sample Data' : 'In Your Grade'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Demo Account Notice */}
            {isDemoAccount(user.email) && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4 sm:p-6 text-center">
                        <div className="text-blue-600 mb-2">
                            <h3 className="font-semibold"> Demo Mode Active</h3>
                            <p className="text-sm">You're exploring sample content. Sign up for a real account to:</p>
                        </div>
                        <div className="text-xs text-blue-700 mb-4 space-y-1">
                            <p>• Track your actual progress</p>
                            <p>• Access personalized content</p>
                            <p>• Sync across devices</p>
                            <p>• Get certificates</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Create Real Account
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}