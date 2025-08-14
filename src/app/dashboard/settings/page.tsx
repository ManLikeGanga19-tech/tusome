
'use client'

import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    CreditCard,
    Bell,
    Eye,
    EyeOff,
    Save,
    ArrowLeft,
    Camera,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock user data
const mockUser = {
    name: "Grace Wanjiku",
    email: "grace.wanjiku@student.ke",
    phone: "+254 712 345 678",
    location: "Nairobi, Kenya",
    grade: "Grade 8",
    tier: "junior" as const,
    subscription: "Junior Secondary",
    profileImage: "/api/placeholder/120/120",
    joinDate: "January 2025",
    parentEmail: "parent@example.com",
    parentPhone: "+254 712 345 679",
    schoolName: "Nairobi Secondary School",
    studentId: "NSS2025001"
};

export default function AccountSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form states
    const [profileData, setProfileData] = useState({
        firstName: mockUser.name.split(' ')[0],
        lastName: mockUser.name.split(' ')[1],
        email: mockUser.email,
        phone: mockUser.phone,
        location: mockUser.location,
        parentEmail: mockUser.parentEmail,
        parentPhone: mockUser.parentPhone,
        schoolName: mockUser.schoolName,
        studentId: mockUser.studentId,
        bio: "Passionate learner focused on excelling in CBC curriculum."
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: false,
        lessonReminders: true,
        quizResults: true,
        achievements: true,
        weeklyProgress: true
    });

    const [privacy, setPrivacy] = useState({
        profileVisibility: 'private',
        showProgress: false,
        shareAchievements: true,
        allowMessages: false
    });

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'primary': return 'bg-blue-600';
            case 'junior': return 'bg-green-600';
            case 'senior': return 'bg-red-600';
            default: return 'bg-green-600';
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

    const handleProfileUpdate = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            console.log('Profile updated:', profileData);
        }, 1500);
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            console.log('Password changed');
        }, 1500);
    };

    const handleDeleteAccount = () => {
        // Navigate to login after account deletion
        window.location.href = '/auth/signin';
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Button variant="ghost" size="sm" onClick={goBack} className="flex-shrink-0">
                                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                                <span className="hidden xs:inline">Back to Dashboard</span>
                                <span className="xs:hidden">Back</span>
                            </Button>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Account Settings</h1>
                                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Manage your account information and preferences</p>
                            </div>
                        </div>
                        <Badge className={`${getTierBadgeColor(mockUser.tier)} flex-shrink-0 text-xs sm:text-sm`}>
                            {mockUser.subscription}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
                    {/* Mobile: Scrollable tabs, Desktop: Grid */}
                    <div className="overflow-x-auto">
                        <TabsList className="grid grid-cols-4 w-full min-w-[400px] sm:min-w-0">
                            <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-4">Profile</TabsTrigger>
                            <TabsTrigger value="security" className="text-xs sm:text-sm px-2 sm:px-4">Security</TabsTrigger>
                            <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-4">
                                <span className="hidden sm:inline">Notifications</span>
                                <span className="sm:hidden">Notifs</span>
                            </TabsTrigger>
                            <TabsTrigger value="privacy" className="text-xs sm:text-sm px-2 sm:px-4">Privacy</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Update your personal information and profile details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                {/* Profile Picture */}
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                    <div className="relative flex justify-center sm:justify-start">
                                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                                            <AvatarImage src={mockUser.profileImage} alt={mockUser.name} />
                                            <AvatarFallback className={`text-lg sm:text-xl text-white ${getTierColor(mockUser.tier)}`}>
                                                {mockUser.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            size="sm"
                                            className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-lg font-medium text-gray-900">{mockUser.name}</h3>
                                        <p className="text-sm sm:text-base text-gray-500">{mockUser.grade} • Member since {mockUser.joinDate}</p>
                                        <Button variant="outline" size="sm" className="mt-2">
                                            Change Photo
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-sm sm:text-base">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                            className="text-sm sm:text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                            className="text-sm sm:text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="text-sm sm:text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="text-sm sm:text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-sm sm:text-base">Location</Label>
                                        <Input
                                            id="location"
                                            value={profileData.location}
                                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                            className="text-sm sm:text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="grade" className="text-sm sm:text-base">Current Grade</Label>
                                        <Select defaultValue={mockUser.grade} disabled>
                                            <SelectTrigger className="text-sm sm:text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Grade 7">Grade 7</SelectItem>
                                                <SelectItem value="Grade 8">Grade 8</SelectItem>
                                                <SelectItem value="Grade 9">Grade 9</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">Contact support to change your grade level</p>
                                    </div>
                                </div>

                                {/* School Information */}
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-medium">School Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="schoolName" className="text-sm sm:text-base">School Name</Label>
                                            <Input
                                                id="schoolName"
                                                value={profileData.schoolName}
                                                onChange={(e) => setProfileData({ ...profileData, schoolName: e.target.value })}
                                                className="text-sm sm:text-base"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="studentId" className="text-sm sm:text-base">Student ID</Label>
                                            <Input
                                                id="studentId"
                                                value={profileData.studentId}
                                                onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                                                className="text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Parent/Guardian Information */}
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-medium">Parent/Guardian Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="parentEmail" className="text-sm sm:text-base">Parent/Guardian Email</Label>
                                            <Input
                                                id="parentEmail"
                                                type="email"
                                                value={profileData.parentEmail}
                                                onChange={(e) => setProfileData({ ...profileData, parentEmail: e.target.value })}
                                                className="text-sm sm:text-base"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="parentPhone" className="text-sm sm:text-base">Parent/Guardian Phone</Label>
                                            <Input
                                                id="parentPhone"
                                                value={profileData.parentPhone}
                                                onChange={(e) => setProfileData({ ...profileData, parentPhone: e.target.value })}
                                                className="text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-sm sm:text-base">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself..."
                                        value={profileData.bio}
                                        onChange={(e: { target: { value: any; }; }) => setProfileData({ ...profileData, bio: e.target.value })}
                                        rows={3}
                                        className="text-sm sm:text-base"
                                    />
                                </div>

                                <Button onClick={handleProfileUpdate} disabled={isLoading} className="w-full sm:w-auto text-sm sm:text-base">
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Password & Security</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Manage your password and security settings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword" className="text-sm sm:text-base">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="text-sm sm:text-base pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-sm sm:text-base">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="text-sm sm:text-base pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="text-sm sm:text-base pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handlePasswordChange} disabled={isLoading} className="text-sm sm:text-base">
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-4 w-4 mr-2" />
                                            Change Password
                                        </>
                                    )}
                                </Button>

                                <Separator />

                                {/* Two-Factor Authentication */}
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-medium">Two-Factor Authentication</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">SMS Authentication</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Receive verification codes via SMS</p>
                                        </div>
                                        <Switch defaultChecked={false} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Email Authentication</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Receive verification codes via email</p>
                                        </div>
                                        <Switch defaultChecked={true} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="border-red-200">
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-red-600 text-lg sm:text-xl">Danger Zone</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    These actions cannot be undone. Please proceed with caution.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="text-sm sm:text-base">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="mx-4 sm:mx-0 max-w-lg">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center text-base sm:text-lg">
                                                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                                                Are you absolutely sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-sm sm:text-base">
                                                This action cannot be undone. This will permanently delete your
                                                account and remove all your data from our servers, including:
                                                <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm">
                                                    <li>All lesson progress and achievements</li>
                                                    <li>Quiz scores and performance data</li>
                                                    <li>Personal profile information</li>
                                                    <li>Subscription and payment history</li>
                                                </ul>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                            <AlertDialogCancel className="w-full sm:w-auto text-sm sm:text-base">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteAccount}
                                                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm sm:text-base"
                                            >
                                                Yes, delete my account
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Choose how you want to be notified about your learning progress.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Email Notifications</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Receive notifications via email</p>
                                        </div>
                                        <Switch
                                            checked={notifications.emailNotifications}
                                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, emailNotifications: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">SMS Notifications</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Receive notifications via SMS</p>
                                        </div>
                                        <Switch
                                            checked={notifications.smsNotifications}
                                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, smsNotifications: checked })}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Lesson Reminders</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Get reminded about upcoming lessons</p>
                                        </div>
                                        <Switch
                                            checked={notifications.lessonReminders}
                                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, lessonReminders: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Quiz Results</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Notifications when quiz results are available</p>
                                        </div>
                                        <Switch
                                            checked={notifications.quizResults}
                                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, quizResults: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Achievements</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Get notified about new achievements</p>
                                        </div>
                                        <Switch
                                            checked={notifications.achievements}
                                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, achievements: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Weekly Progress</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Weekly summary of your learning progress</p>
                                        </div>
                                        <Switch
                                            checked={notifications.weeklyProgress}
                                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, weeklyProgress: checked })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Privacy Tab */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy Settings</CardTitle>
                                <CardDescription>
                                    Control how your information is shared and displayed.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="profileVisibility">Profile Visibility</Label>
                                        <Select
                                            value={privacy.profileVisibility}
                                            onValueChange={(value) => setPrivacy({ ...privacy, profileVisibility: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">Public - Visible to everyone</SelectItem>
                                                <SelectItem value="friends">Friends only</SelectItem>
                                                <SelectItem value="private">Private - Only me</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Show Progress to Others</p>
                                            <p className="text-sm text-gray-500">Allow others to see your learning progress</p>
                                        </div>
                                        <Switch
                                            checked={privacy.showProgress}
                                            onCheckedChange={(checked: any) => setPrivacy({ ...privacy, showProgress: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Share Achievements</p>
                                            <p className="text-sm text-gray-500">Share your achievements on social platforms</p>
                                        </div>
                                        <Switch
                                            checked={privacy.shareAchievements}
                                            onCheckedChange={(checked: any) => setPrivacy({ ...privacy, shareAchievements: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Allow Messages</p>
                                            <p className="text-sm text-gray-500">Allow other students to send you messages</p>
                                        </div>
                                        <Switch
                                            checked={privacy.allowMessages}
                                            onCheckedChange={(checked: any) => setPrivacy({ ...privacy, allowMessages: checked })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}