'use client'

import { BookOpen, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"

// Types for the different steps
type Step = 'email' | 'otp' | 'reset' | 'success';

function ForgotPasswordPage() {
    const [currentStep, setCurrentStep] = useState<Step>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Timer for OTP resend
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(timer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Step 1: Send OTP to email
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call to send OTP
        setTimeout(() => {
            setIsLoading(false);
            setCurrentStep('otp');
            setTimer(60); // 60 seconds timer
            console.log('OTP sent to:', formData.email);
            // In real implementation, you'd call your API here
            // await sendOTPToEmail(formData.email);
        }, 2000);
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate OTP verification
        setTimeout(() => {
            setIsLoading(false);
            // In real implementation, verify OTP with backend
            // For demo, we'll assume any 6-digit code is valid
            if (formData.otp.length === 6) {
                setCurrentStep('reset');
                console.log('OTP verified:', formData.otp);
            } else {
                alert('Invalid OTP. Please try again.');
            }
        }, 1500);
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (formData.newPassword.length < 8) {
            alert('Password must be at least 8 characters long!');
            return;
        }

        setIsLoading(true);

        // Simulate password reset
        setTimeout(() => {
            setIsLoading(false);
            setCurrentStep('success');
            console.log('Password reset successful');
            // In real implementation, call your API to reset password
            // await resetPassword(formData.email, formData.newPassword);
        }, 2000);
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setTimer(60);
            console.log('OTP resent to:', formData.email);
            // In real implementation: await sendOTPToEmail(formData.email);
        }, 1000);
    };

    const renderEmailStep = () => (
        <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                size="lg"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending OTP...</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center space-x-2">
                        <span>Send OTP</span>
                        <ArrowRight className="h-4 w-4" />
                    </div>
                )}
            </Button>
        </form>
    );

    const renderOTPStep = () => (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                    We've sent a 6-digit code to <span className="font-semibold">{formData.email}</span>
                </p>
            </div>

            <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 block text-center">
                    Enter OTP Code
                </Label>
                <div className="flex justify-center">
                    <InputOTP
                        maxLength={6}
                        value={formData.otp}
                        onChange={(value) => handleInputChange('otp', value)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="border-gray-200 focus:border-green-500 focus:ring-green-500" />
                            <InputOTPSlot index={1} className="border-gray-200 focus:border-green-500 focus:ring-green-500" />
                            <InputOTPSlot index={2} className="border-gray-200 focus:border-green-500 focus:ring-green-500" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} className="border-gray-200 focus:border-green-500 focus:ring-green-500" />
                            <InputOTPSlot index={4} className="border-gray-200 focus:border-green-500 focus:ring-green-500" />
                            <InputOTPSlot index={5} className="border-gray-200 focus:border-green-500 focus:ring-green-500" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading || formData.otp.length !== 6}
                className="w-full bg-green-600 text-white py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                size="lg"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                    </div>
                ) : (
                    'Verify OTP'
                )}
            </Button>

            <div className="text-center">
                {timer > 0 ? (
                    <p className="text-sm text-gray-600">
                        Resend OTP in {timer} seconds
                    </p>
                ) : (
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-300"
                    >
                        Resend OTP
                    </button>
                )}
            </div>
        </form>
    );

    const renderResetStep = () => (
        <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    New Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        required
                    />
                </div>
            </div>

            {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match</p>
            )}

            <Button
                type="submit"
                disabled={isLoading || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 8}
                className="w-full bg-green-600 text-white py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                size="lg"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Resetting Password...</span>
                    </div>
                ) : (
                    'Reset Password'
                )}
            </Button>
        </form>
    );

    const renderSuccessStep = () => (
        <div className="text-center space-y-4">
            <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Password Reset Successful!</h3>
            <p className="text-sm text-gray-600">
                Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Button
                onClick={() => window.location.href = '/auth/signin'}
                className="w-full bg-green-600 text-white py-3 hover:bg-green-700 transition-all duration-300 font-semibold"
                size="lg"
            >
                Back to Sign In
            </Button>
        </div>
    );

    const getStepTitle = () => {
        switch (currentStep) {
            case 'email': return 'Forgot Password';
            case 'otp': return 'Verify Email';
            case 'reset': return 'Reset Password';
            case 'success': return 'Success';
            default: return 'Forgot Password';
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case 'email': return 'Enter your email address to receive a verification code';
            case 'otp': return 'Enter the verification code sent to your email';
            case 'reset': return 'Create a new password for your account';
            case 'success': return 'Your password has been reset successfully';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2 pb-6">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-green-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Tusome</span>
                        </div>
                    </div>

                    <CardTitle className="text-2xl font-bold text-gray-900">{getStepTitle()}</CardTitle>
                    <CardDescription className="text-gray-600">
                        {getStepDescription()}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {currentStep === 'email' && renderEmailStep()}
                    {currentStep === 'otp' && renderOTPStep()}
                    {currentStep === 'reset' && renderResetStep()}
                    {currentStep === 'success' && renderSuccessStep()}

                    {/* Back Button (except on success step) */}
                    {currentStep !== 'success' && currentStep !== 'email' && (
                        <div className="text-center">
                            <button
                                onClick={() => {
                                    if (currentStep === 'otp') setCurrentStep('email');
                                    if (currentStep === 'reset') setCurrentStep('otp');
                                }}
                                className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 flex items-center justify-center space-x-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back</span>
                            </button>
                        </div>
                    )}

                    {/* Sign In Link */}
                    {currentStep === 'email' && (
                        <div className="text-center pt-4">
                            <span className="text-gray-600">Remember your password? </span>
                            <a
                                href="/auth/signin"
                                className="text-green-600 hover:text-green-700 font-medium transition-colors duration-300"
                            >
                                Sign in
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default ForgotPasswordPage;