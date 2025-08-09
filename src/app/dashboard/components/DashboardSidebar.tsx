'use client'

import React from 'react';
import {
    Trophy,
    Download,
    Phone,
    Calendar,
    Play,
    CheckCircle,
    Award,
    Target
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

interface Activity {
    type: 'lesson' | 'quiz' | 'milestone' | 'streak';
    subject: string;
    title: string;
    time: string;
    points: number;
}

interface SidebarProps {
    user: User;
    recentActivities: Activity[];
}

// Content access configuration
const contentAccess = {
    primary: { color: "blue" },
    junior: { color: "green" },
    senior: { color: "red" }
};

export default function DashboardSidebar({ user, recentActivities }: SidebarProps) {
    const tierColor = contentAccess[user.tier].color;

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
                            <span className="font-semibold text-green-600 text-sm">{user.totalPoints}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">Lessons Done</span>
                            <span className="font-semibold text-blue-600 text-sm">{user.completedLessons}</span>
                        </div>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-1 sm:mb-2">Overall Progress</p>
                        <Progress value={68} className="h-1.5 sm:h-2" />
                        <p className="text-xs text-gray-500 mt-1">68% complete this term</p>
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
                                <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                            <span className="text-xs font-medium text-green-600">+{activity.points}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}