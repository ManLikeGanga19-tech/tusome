'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen,
    Search,
    Bell,
    Settings,
    Wifi,
    Battery,
    X,
    Menu,
    LogOut,
    User,
    ChevronDown
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface HeaderProps {
    onSearch?: (query: string) => void;
}

// Transform backend user data to display format
const transformUserData = (backendUser: BackendUser): User => {
    // Calculate days since joining
    const joinDate = new Date(backendUser.created_at);
    const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

    // Format subscription status
    const getSubscriptionDisplay = (status: string, tier: string) => {
        if (status === 'trial') return `${tier} - Free Trial`;
        if (status === 'active') return `${tier} - Active`;
        if (status === 'expired') return `${tier} - Expired`;
        if (status === 'cancelled') return `${tier} - Cancelled`;
        return tier;
    };

    // Get grade display (e.g., "Grade 8" from "grade-8")
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
        streakDays: Math.min(daysSinceJoin, 99), // Simulate streak (you can implement real streak logic)
        totalPoints: daysSinceJoin * 25, // Simulate points (you can implement real points system)
        completedLessons: Math.floor(daysSinceJoin * 1.5), // Simulate completed lessons
        currentLevel: `Level ${Math.floor(daysSinceJoin / 7) + 1}` // Simulate current level
    };
};

export default function DashboardHeader({ onSearch }: HeaderProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
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
                    // No token - redirect to sign in
                    router.push('/auth/signin');
                    return;
                }

                if (storedUser) {
                    // Use stored user data initially
                    try {
                        const backendUser: BackendUser = JSON.parse(storedUser);
                        setUser(transformUserData(backendUser));
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
                    setUser(transformUserData(backendUser));

                    console.log('Successfully fetched user profile for header');
                } else {
                    console.error('Failed to fetch user profile:', response.status);

                    if (response.status === 401 || response.status === 403) {
                        // Token is invalid - clear storage and redirect
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
                setError('Error loading user profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch?.(query);
    };

    const toggleMobileSearch = () => {
        setIsMobileSearchOpen(!isMobileSearchOpen);
        if (!isMobileSearchOpen) {
            // Focus search input when opening
            setTimeout(() => {
                const searchInput = document.getElementById('mobile-search-input');
                searchInput?.focus();
            }, 100);
        }
    };

    const closeMobileSearch = () => {
        setIsMobileSearchOpen(false);
        setSearchQuery("");
    };

    // Get tier color for user avatar
    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'primary': return 'bg-blue-600';
            case 'junior': return 'bg-green-600';
            case 'senior': return 'bg-red-600';
            default: return 'bg-green-600';
        }
    };

    const getTierColorHover = (tier: string) => {
        switch (tier) {
            case 'primary': return 'hover:bg-blue-700';
            case 'junior': return 'hover:bg-green-700';
            case 'senior': return 'hover:bg-red-700';
            default: return 'hover:bg-green-700';
        }
    };

    const getTierBadgeColor = (tier: string) => {
        switch (tier) {
            case 'primary': return 'bg-blue-100 text-blue-800';
            case 'junior': return 'bg-green-100 text-green-800';
            case 'senior': return 'bg-red-100 text-red-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const handleAccountSettings = () => {
        router.push('/dashboard/settings');
    };

    const handlePreferences = () => {
        router.push('/dashboard/preferences');
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refresh_token');

            // Call logout endpoint if token exists
            if (token) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ refreshToken }),
                    });
                } catch (logoutError) {
                    console.error('Error calling logout endpoint:', logoutError);
                    // Continue with local cleanup even if API call fails
                }
            }

            // Clear all authentication data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userGradeCategory');

            // Redirect to sign in page
            router.push('/auth/signin');
        } catch (error) {
            console.error('Error during logout:', error);
            // Force cleanup and redirect even if there's an error
            localStorage.clear();
            router.push('/auth/signin');
        }
    };

    // Loading state
    if (isLoading || !user) {
        return (
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        {/* Logo */}
                        <div className="flex items-center flex-shrink-0">
                            <div className="relative">
                                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                <div className="absolute inset-0 bg-green-600/10 blur-sm opacity-75 rounded-full"></div>
                            </div>
                            <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Tusome</span>
                        </div>

                        {/* Loading placeholder */}
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    // Error state
    if (error) {
        return (
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center flex-shrink-0">
                            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                            <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Tusome</span>
                        </div>
                        <div className="text-sm text-red-600">{error}</div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0">
                        <div className="relative">
                            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                            <div className="absolute inset-0 bg-green-600/10 blur-sm opacity-75 rounded-full"></div>
                        </div>
                        <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Tusome</span>
                    </div>

                    {/* Desktop Search - Hidden on mobile, shown on tablet+ */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search lessons, subjects..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-10 w-full border-gray-200 focus:border-green-500 focus:ring-green-500 bg-gray-50 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                        {/* Mobile Search Toggle - Shown only on mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMobileSearch}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Search className="h-5 w-5 text-gray-600" />
                        </Button>

                        {/* Connection Status - Hidden on mobile */}
                        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-1.5">
                            <Wifi className="h-4 w-4 text-green-600" />
                            <Battery className="h-4 w-4 text-green-600" />
                            <span className="hidden lg:inline font-medium text-green-600">Online</span>
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="p-2 hover:bg-gray-100 rounded-full relative"
                            >
                                <Bell className="h-5 w-5 text-gray-600" />
                                {/* Notification badge */}
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">3</span>
                                </span>
                            </Button>
                        </div>

                        {/* User Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 rounded-lg px-2 sm:px-3 py-2 transition-colors"
                                >
                                    {/* User info - Hidden on mobile */}
                                    <div className="text-right hidden lg:block">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.subscription}</p>
                                    </div>

                                    {/* Avatar */}
                                    <div className={`h-8 w-8 sm:h-9 sm:w-9 ${getTierColor(user.tier)} rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200`}>
                                        <span className="text-white text-xs sm:text-sm font-medium">
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>

                                    {/* Dropdown arrow */}
                                    <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                {/* User Info Header */}
                                <DropdownMenuLabel>
                                    <div className="flex items-center space-x-3">
                                        <div className={`h-10 w-10 ${getTierColor(user.tier)} rounded-full flex items-center justify-center flex-shrink-0`}>
                                            <span className="text-white text-sm font-medium">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getTierBadgeColor(user.tier)}`}>
                                                    {user.grade}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {user.currentLevel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                {/* Quick Stats */}
                                <div className="px-2 py-2">
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs font-medium text-gray-900">{user.streakDays}</p>
                                            <p className="text-xs text-gray-500">Day Streak</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs font-medium text-gray-900">{user.totalPoints}</p>
                                            <p className="text-xs text-gray-500">Points</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs font-medium text-gray-900">{user.completedLessons}</p>
                                            <p className="text-xs text-gray-500">Lessons</p>
                                        </div>
                                    </div>
                                </div>

                                <DropdownMenuSeparator />

                                {/* Menu Items */}
                                <DropdownMenuItem onClick={handleAccountSettings} className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Account Settings</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={handlePreferences} className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Preferences</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Logout Button */}
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile Search Bar - Conditionally shown */}
                {isMobileSearchOpen && (
                    <div className="md:hidden pb-3 pt-2 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="mobile-search-input"
                                placeholder="Search lessons, subjects..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-10 pr-10 w-full border-gray-200 focus:border-green-500 focus:ring-green-500"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={closeMobileSearch}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                    <div className="absolute right-4 top-16 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            <div className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">New lesson available</p>
                                        <p className="text-xs text-gray-500">Mathematics: Quadratic Equations</p>
                                        <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Quiz completed</p>
                                        <p className="text-xs text-gray-500">English Quiz: Score 85%</p>
                                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Achievement unlocked</p>
                                        <p className="text-xs text-gray-500">12-day learning streak!</p>
                                        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-gray-100">
                            <Button variant="ghost" className="w-full text-sm text-green-600 hover:text-green-700">
                                View all notifications
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay for closing dropdowns */}
            {(isMobileSearchOpen || isNotificationsOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsMobileSearchOpen(false);
                        setIsNotificationsOpen(false);
                    }}
                />
            )}
        </header>
    );
}