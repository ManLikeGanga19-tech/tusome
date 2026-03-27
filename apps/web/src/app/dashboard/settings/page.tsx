
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Mail,
    Shield,
    CreditCard,
    Bell,
    Eye,
    EyeOff,
    Save,
    ArrowLeft,
    AlertTriangle,
    CheckCircle,
    Clock,
    Loader2,
    Zap,
    Trash2,
    AlertCircle,
} from 'lucide-react';
import { useAuth, authAPI } from '@/lib/api/auth';
import { paymentsApi, type PaymentStatus, type PaymentHistoryItem, PLAN_LABELS } from '@/lib/api/payments';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-blue-100 text-blue-700',
    expired: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
};

export default function AccountSettingsPage() {
    const router = useRouter();
    const { user: authUser, logout, refreshAuth } = useAuth();

    // ── Profile state ──────────────────────────────────────────────────────
    const [profileData, setProfileData] = useState({ firstName: '', lastName: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // ── Password state ─────────────────────────────────────────────────────
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ── Billing state ──────────────────────────────────────────────────────
    const [billingStatus, setBillingStatus] = useState<PaymentStatus | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
    const [billingLoading, setBillingLoading] = useState(false);

    // ── Notification / privacy UI state (not yet persisted) ───────────────
    const [notifications, setNotifications] = useState({
        emailNotifications: true, smsNotifications: false,
        lessonReminders: true, quizResults: true,
        achievements: true, weeklyProgress: true,
    });
    const [privacy, setPrivacy] = useState({
        profileVisibility: 'private', showProgress: false,
        shareAchievements: true, allowMessages: false,
    });

    // Seed form from authenticated user on mount / user change
    useEffect(() => {
        if (authUser) {
            setProfileData({
                firstName: authUser.first_name,
                lastName: authUser.last_name,
            });
        }
    }, [authUser]);

    // Fetch billing data
    useEffect(() => {
        setBillingLoading(true);
        Promise.all([
            paymentsApi.getStatus().catch(() => null),
            paymentsApi.getHistory().catch(() => []),
        ]).then(([status, history]) => {
            setBillingStatus(status);
            setPaymentHistory(history as PaymentHistoryItem[]);
        }).finally(() => setBillingLoading(false));
    }, []);

    const getTierColor = (tier: string) => {
        if (tier === 'primary') return 'bg-blue-600';
        if (tier === 'senior') return 'bg-red-600';
        return 'bg-green-600';
    };

    const getTierBadgeColor = (tier: string) => {
        if (tier === 'primary') return 'bg-blue-100 text-blue-800';
        if (tier === 'senior') return 'bg-red-100 text-red-800';
        return 'bg-green-100 text-green-800';
    };

    // ── Handlers ──────────────────────────────────────────────────────────

    async function handleProfileUpdate() {
        if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
            setProfileError('First name and last name are required.');
            return;
        }
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');
        try {
            await authAPI.updateProfile({
                first_name: profileData.firstName.trim(),
                last_name: profileData.lastName.trim(),
            });
            await refreshAuth();
            setProfileSuccess('Profile updated successfully.');
        } catch (err: any) {
            setProfileError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setProfileLoading(false);
        }
    }

    async function handlePasswordChange() {
        setPasswordError('');
        setPasswordSuccess('');
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All password fields are required.');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters.');
            return;
        }
        setPasswordLoading(true);
        try {
            await authAPI.changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
            });
            setPasswordSuccess('Password changed successfully.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to change password. Please try again.');
        } finally {
            setPasswordLoading(false);
        }
    }

    const handleDeleteAccount = () => {
        logout().finally(() => router.replace('/auth/signin'));
    };

    if (!authUser) return null;

    const initials = `${authUser.first_name[0]}${authUser.last_name[0]}`.toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex-shrink-0">
                                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                                <span className="hidden xs:inline">Back to Dashboard</span>
                                <span className="xs:hidden">Back</span>
                            </Button>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Account Settings</h1>
                                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Manage your account information and preferences</p>
                            </div>
                        </div>
                        <Badge className={`${getTierBadgeColor(authUser.grade_category)} flex-shrink-0 text-xs sm:text-sm`}>
                            {authUser.grade_tier}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
                    <div className="overflow-x-auto">
                        <TabsList className="grid grid-cols-5 w-full min-w-[480px] sm:min-w-0">
                            <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-4">Profile</TabsTrigger>
                            <TabsTrigger value="security" className="text-xs sm:text-sm px-2 sm:px-4">Security</TabsTrigger>
                            <TabsTrigger value="billing" className="text-xs sm:text-sm px-2 sm:px-4">Billing</TabsTrigger>
                            <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-4">
                                <span className="hidden sm:inline">Notifications</span>
                                <span className="sm:hidden">Notifs</span>
                            </TabsTrigger>
                            <TabsTrigger value="privacy" className="text-xs sm:text-sm px-2 sm:px-4">Privacy</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ── Profile Tab ────────────────────────────────────────────── */}
                    <TabsContent value="profile" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Update your display name. Email and grade level can be changed by contacting support.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar */}
                                <div className="flex items-center space-x-5">
                                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                                        <AvatarFallback className={`text-xl text-white ${getTierColor(authUser.grade_category)}`}>
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {authUser.first_name} {authUser.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{authUser.grade_tier}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Member since {new Date(authUser.created_at).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Feedback banners */}
                                {profileSuccess && (
                                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                        {profileSuccess}
                                    </div>
                                )}
                                {profileError && (
                                    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        {profileError}
                                    </div>
                                )}

                                {/* Editable fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={profileData.firstName}
                                            onChange={(e) => {
                                                setProfileData({ ...profileData, firstName: e.target.value });
                                                setProfileSuccess('');
                                                setProfileError('');
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={profileData.lastName}
                                            onChange={(e) => {
                                                setProfileData({ ...profileData, lastName: e.target.value });
                                                setProfileSuccess('');
                                                setProfileError('');
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Read-only fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                            Email Address
                                        </Label>
                                        <Input value={authUser.email} disabled className="bg-gray-50 text-gray-500" />
                                        <p className="text-xs text-gray-400">Contact support to change your email</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Grade Level</Label>
                                        <Input value={authUser.grade_tier} disabled className="bg-gray-50 text-gray-500" />
                                        <p className="text-xs text-gray-400">Contact support to change your grade</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleProfileUpdate}
                                    disabled={profileLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {profileLoading ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Security Tab ───────────────────────────────────────────── */}
                    <TabsContent value="security" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Password & Security</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Update your password. Choose something strong and unique.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                {/* Feedback banners */}
                                {passwordSuccess && (
                                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                        {passwordSuccess}
                                    </div>
                                )}
                                {passwordError && (
                                    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        {passwordError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Current password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => {
                                                    setPasswordData({ ...passwordData, currentPassword: e.target.value });
                                                    setPasswordError('');
                                                    setPasswordSuccess('');
                                                }}
                                                className="pr-10"
                                            />
                                            <Button type="button" variant="ghost" size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* New password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={(e) => {
                                                    setPasswordData({ ...passwordData, newPassword: e.target.value });
                                                    setPasswordError('');
                                                    setPasswordSuccess('');
                                                }}
                                                className="pr-10"
                                            />
                                            <Button type="button" variant="ghost" size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}>
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-400">Minimum 8 characters</p>
                                    </div>

                                    {/* Confirm password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => {
                                                    setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                                                    setPasswordError('');
                                                    setPasswordSuccess('');
                                                }}
                                                className="pr-10"
                                            />
                                            <Button type="button" variant="ghost" size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handlePasswordChange} disabled={passwordLoading}>
                                    {passwordLoading ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Changing...</>
                                    ) : (
                                        <><Shield className="h-4 w-4 mr-2" /> Change Password</>
                                    )}
                                </Button>

                                <Separator />

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
                                <CardDescription>These actions cannot be undone. Please proceed with caution.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="mx-4 sm:mx-0 max-w-lg">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center">
                                                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                                                Are you absolutely sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete your account and all data including lesson progress,
                                                achievements, and payment history.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAccount}
                                                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                                                Yes, delete my account
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Billing Tab ────────────────────────────────────────────── */}
                    <TabsContent value="billing" className="space-y-4 sm:space-y-6">
                        {billingLoading ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-green-600" />
                                            Subscription Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {billingStatus ? (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Status</span>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[billingStatus.subscription_status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {billingStatus.subscription_status}
                                                    </span>
                                                </div>

                                                {billingStatus.subscription_status === 'trial' && billingStatus.trial_end_date && (() => {
                                                    const daysLeft = Math.max(0, Math.ceil((new Date(billingStatus.trial_end_date).getTime() - Date.now()) / 86400000));
                                                    return (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                            <div className="flex items-start gap-3">
                                                                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-semibold text-blue-800">
                                                                        {daysLeft === 0 ? 'Trial expires today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in trial`}
                                                                    </p>
                                                                    <p className="text-xs text-blue-600 mt-0.5">
                                                                        Expires {new Date(billingStatus.trial_end_date).toLocaleDateString()}
                                                                    </p>
                                                                    <Button size="sm"
                                                                        className="bg-green-600 hover:bg-green-700 text-white mt-2 h-8 text-xs"
                                                                        onClick={() => router.push('/dashboard/subscribe')}>
                                                                        <Zap className="h-3 w-3 mr-1.5" /> Upgrade Now
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {billingStatus.subscription_status === 'active' && billingStatus.subscription && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                        <div className="flex items-start gap-3">
                                                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                            <div className="flex-1 space-y-1">
                                                                <p className="text-sm font-semibold text-green-800">Active subscription</p>
                                                                <div className="grid grid-cols-2 gap-x-4 text-xs text-green-700">
                                                                    <span>Plan</span>
                                                                    <span className="font-medium capitalize">{PLAN_LABELS[billingStatus.subscription.plan as keyof typeof PLAN_LABELS] ?? billingStatus.subscription.plan}</span>
                                                                    <span>Amount</span>
                                                                    <span className="font-medium">KSh {billingStatus.subscription.amount_ksh.toLocaleString()}</span>
                                                                    <span>Renews</span>
                                                                    <span className="font-medium">{new Date(billingStatus.subscription.ends_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {(billingStatus.subscription_status === 'expired' || billingStatus.subscription_status === 'cancelled') && (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                                        <p className="text-sm text-gray-600 mb-3">Your subscription has ended. Re-subscribe to continue learning.</p>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-9"
                                                            onClick={() => router.push('/dashboard/subscribe')}>
                                                            <Zap className="h-4 w-4 mr-2" /> Subscribe Now
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400">Could not load billing info.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Payment History</CardTitle>
                                        <CardDescription>Your past subscription payments</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {paymentHistory.length === 0 ? (
                                            <p className="text-sm text-gray-400">No payments yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {paymentHistory.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 capitalize">
                                                                {PLAN_LABELS[item.plan as keyof typeof PLAN_LABELS] ?? item.plan} plan
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(item.starts_at).toLocaleDateString()} – {new Date(item.ends_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-gray-900">KSh {item.amount_ksh.toLocaleString()}</p>
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </TabsContent>

                    {/* ── Notifications Tab ──────────────────────────────────────── */}
                    <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
                                <CardDescription>Choose how you want to be notified about your learning progress.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-4">
                                    {[
                                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                                        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                                        { key: 'lessonReminders', label: 'Lesson Reminders', desc: 'Get reminded about upcoming lessons' },
                                        { key: 'quizResults', label: 'Quiz Results', desc: 'Notifications when quiz results are available' },
                                        { key: 'achievements', label: 'Achievements', desc: 'Get notified about new achievements' },
                                        { key: 'weeklyProgress', label: 'Weekly Progress', desc: 'Weekly summary of your learning progress' },
                                    ].map(({ key, label, desc }, i, arr) => (
                                        <React.Fragment key={key}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 pr-4">
                                                    <p className="font-medium text-sm sm:text-base">{label}</p>
                                                    <p className="text-xs sm:text-sm text-gray-500">{desc}</p>
                                                </div>
                                                <Switch
                                                    checked={notifications[key as keyof typeof notifications]}
                                                    onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })}
                                                />
                                            </div>
                                            {i < arr.length - 1 && <Separator />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Privacy Tab ────────────────────────────────────────────── */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy Settings</CardTitle>
                                <CardDescription>Control how your information is shared and displayed.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="profileVisibility">Profile Visibility</Label>
                                        <Select value={privacy.profileVisibility}
                                            onValueChange={(v) => setPrivacy({ ...privacy, profileVisibility: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">Public — Visible to everyone</SelectItem>
                                                <SelectItem value="friends">Friends only</SelectItem>
                                                <SelectItem value="private">Private — Only me</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    {[
                                        { key: 'showProgress', label: 'Show Progress to Others', desc: 'Allow others to see your learning progress' },
                                        { key: 'shareAchievements', label: 'Share Achievements', desc: 'Share your achievements on social platforms' },
                                        { key: 'allowMessages', label: 'Allow Messages', desc: 'Allow other students to send you messages' },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{label}</p>
                                                <p className="text-sm text-gray-500">{desc}</p>
                                            </div>
                                            <Switch
                                                checked={privacy[key as keyof typeof privacy] as boolean}
                                                onCheckedChange={(checked) => setPrivacy({ ...privacy, [key]: checked })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
