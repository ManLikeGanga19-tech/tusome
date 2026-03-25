'use client'

import React, { useState } from 'react'
import { BookOpen, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await authAPI.forgotPassword(email.trim().toLowerCase());
            setSent(true);
        } catch (err: any) {
            setError(err?.message || 'Something went wrong. Please try again.');
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
                        {sent ? 'Check Your Email' : 'Forgot Password'}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {sent
                            ? `We've sent a password reset link to ${email}`
                            : 'Enter your email address and we\'ll send you a reset link'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {sent ? (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                Click the link in the email to reset your password. The link expires in 1 hour.
                                If you don't see the email, check your spam folder.
                            </p>
                            <Button
                                onClick={() => router.push('/auth/signin')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                                size="lg"
                            >
                                Back to Sign In
                            </Button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => { setSent(false); setEmail(''); }}
                                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Use a different email
                                </button>
                            </div>
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
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50"
                                size="lg"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Sending...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Send Reset Link</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
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
