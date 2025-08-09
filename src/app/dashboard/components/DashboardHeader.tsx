'use client'

import React, { useState } from 'react';
import {
    BookOpen,
    Search,
    Bell,
    Settings,
    Wifi,
    Battery,
    X,
    Menu
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    user: User;
    onSearch?: (query: string) => void;
}

export default function DashboardHeader({ user, onSearch }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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

                        {/* Settings - Hidden on mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Settings className="h-5 w-5 text-gray-600" />
                        </Button>

                        {/* User Profile */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* User info - Hidden on mobile */}
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.subscription}</p>
                            </div>

                            {/* Avatar */}
                            <Button
                                variant="ghost"
                                className={`h-8 w-8 sm:h-9 sm:w-9 ${getTierColor(user.tier)} ${getTierColorHover(user.tier)} rounded-full flex items-center justify-center flex-shrink-0 p-0 transition-all duration-200 hover:scale-105`}
                            >
                                <span className="text-white text-xs sm:text-sm font-medium">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </Button>
                        </div>
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