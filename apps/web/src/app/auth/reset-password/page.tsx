'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { BookOpen, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { authAPI } from '@/lib/api/auth';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Redirect to forgot-password if no token in URL
    useEffect(() => {
        if (!token) {
            router.replace('/auth/forgot-password');
        }
    }, [token, router]);

    if (!token) return null;

    const passwordsMatch = confirmPassword === '' || newPassword === confirmPassword;
    const canSubmit = newPassword.length >= 8 && newPassword === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError(null);
        setLoading(true);
        try {
            await authAPI.resetPassword(token, newPassword);
            setSuccess(true);
        } catch (err: any) {
            setError(err?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2 pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-green-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Tusome</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        {success ? 'Password Reset!' : 'Set New Password'}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {success
                            ? 'Your password has been updated successfully'
                            : 'Choose a strong password for your account'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {success ? (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                You can now sign in with your new password.
                            </p>
                            <Button
                                onClick={() => router.push('/auth/signin')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                                size="lg"
                            >
                                Sign In
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="newPassword"
                                        type={showNew ? 'text' : 'password'}
                                        placeholder="At least 8 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-10 pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {newPassword.length > 0 && newPassword.length < 8 && (
                                    <p className="text-xs text-red-500">Password must be at least 8 characters</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repeat your new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {!passwordsMatch && (
                                    <p className="text-xs text-red-500">Passwords do not match</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !canSubmit}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50"
                                size="lg"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Resetting...</span>
                                    </div>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => router.push('/auth/signin')}
                                    className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-1 mx-auto"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Sign In
                                </button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
