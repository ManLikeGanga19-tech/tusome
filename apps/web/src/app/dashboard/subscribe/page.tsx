'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    Smartphone,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Zap,
    Shield,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/api/auth';
import {
    paymentsApi,
    TIER_PRICES,
    PLAN_LABELS,
    type Plan,
    type Tier,
    type StkPushResponse,
} from '@/lib/api/payments';
import DashboardHeader from '../components/DashboardHeader';

type Step = 'plans' | 'phone' | 'pending' | 'success' | 'failed';

const PLAN_ORDER: Plan[] = ['daily', 'weekly', 'monthly', 'yearly'];

const PLAN_SAVINGS: Record<Plan, string | null> = {
    daily: null,
    weekly: 'Save 14%',
    monthly: 'Most Popular',
    yearly: 'Best Value — Save 43%',
};

export default function SubscribePage() {
    const router = useRouter();
    const { user, loading: authLoading, refreshAuth } = useAuth();

    const [step, setStep] = useState<Step>('plans');
    const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [stkData, setStkData] = useState<StkPushResponse | null>(null);
    const [pollError, setPollError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollCount = useRef(0);

    // Redirect if already subscribed
    useEffect(() => {
        if (authLoading || !user) return;
        if (user.subscription_status === 'active') {
            router.replace(`/dashboard/${user.grade_category}`);
        }
    }, [user, authLoading, router]);

    // Polling logic
    useEffect(() => {
        if (step !== 'pending' || !stkData) return;

        pollCount.current = 0;
        pollRef.current = setInterval(async () => {
            pollCount.current += 1;

            // Stop after 60 polls = 3 minutes
            if (pollCount.current > 60) {
                clearInterval(pollRef.current!);
                setStep('failed');
                setPollError('Payment timed out. Please try again.');
                return;
            }

            try {
                const result = await paymentsApi.poll(stkData.checkout_request_id);
                if (result.status === 'success') {
                    clearInterval(pollRef.current!);
                    await refreshAuth();
                    setStep('success');
                } else if (result.status === 'failed') {
                    clearInterval(pollRef.current!);
                    setStep('failed');
                    setPollError('Payment was cancelled or failed. Please try again.');
                }
                // 'pending' → keep polling
            } catch {
                // Network hiccup — keep polling
            }
        }, 3000);

        return () => clearInterval(pollRef.current!);
    }, [step, stkData]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!user) return null;

    const tier = user.grade_category as Tier;
    const prices = TIER_PRICES[tier];

    // ── Phone validation ──────────────────────────────────────────────────

    function validatePhone(value: string): string {
        const cleaned = value.replace(/\s/g, '');
        // Accept: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX
        if (/^0[71]\d{8}$/.test(cleaned)) return '254' + cleaned.slice(1);
        if (/^254[71]\d{8}$/.test(cleaned)) return cleaned;
        if (/^\+254[71]\d{8}$/.test(cleaned)) return cleaned.slice(1);
        return '';
    }

    async function handleSubmitPayment() {
        const formatted = validatePhone(phone);
        if (!formatted) {
            setPhoneError('Enter a valid Safaricom number (07XX or 01XX)');
            return;
        }
        setPhoneError('');
        setSubmitting(true);

        try {
            const data = await paymentsApi.subscribe({
                phone_number: formatted,
                plan: selectedPlan,
            });
            setStkData(data);
            setStep('pending');
        } catch (err: any) {
            setPhoneError(err.message || 'Could not initiate payment. Try again.');
        } finally {
            setSubmitting(false);
        }
    }

    // ── Step: Plan selection ──────────────────────────────────────────────

    if (step === 'plans') {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader onSearch={setSearchQuery} />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </button>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
                        <p className="text-gray-600">
                            {user.grade_tier} · Flexible plans, cancel anytime
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {PLAN_ORDER.map((plan) => {
                            const price = prices[plan];
                            const isSelected = selectedPlan === plan;
                            const badge = PLAN_SAVINGS[plan];

                            return (
                                <div
                                    key={plan}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${isSelected
                                        ? 'border-green-600 bg-green-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-green-300'
                                        }`}
                                >
                                    {badge && (
                                        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${plan === 'monthly' ? 'bg-green-600 text-white' : 'bg-amber-400 text-amber-900'
                                            }`}>
                                            {badge}
                                        </span>
                                    )}
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">{PLAN_LABELS[plan]}</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            KSh {price.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            per {plan === 'yearly' ? 'year' : plan === 'monthly' ? 'month' : plan}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-3 right-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* What's included */}
                    <Card className="mb-6">
                        <CardContent className="p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">What's included</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                    'All CBC subjects for your grade level',
                                    'Unlimited lesson access',
                                    'Progress tracking & streaks',
                                    'Downloadable study materials',
                                    'Works offline after first load',
                                    'Cancel anytime',
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white px-10 h-12 text-base"
                            onClick={() => setStep('phone')}
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Continue with {PLAN_LABELS[selectedPlan]} — KSh {prices[selectedPlan].toLocaleString()}
                        </Button>
                        <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                            <Shield className="h-3 w-3" />
                            Secured by M-Pesa · Instant activation
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Step: Enter phone ─────────────────────────────────────────────────

    if (step === 'phone') {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader onSearch={setSearchQuery} />
                <div className="max-w-md mx-auto px-4 py-12">
                    <button
                        onClick={() => setStep('plans')}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Change plan
                    </button>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pay with M-Pesa</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Summary */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Plan</span>
                                    <span className="font-semibold">{PLAN_LABELS[selectedPlan]}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Amount</span>
                                    <span className="font-bold text-green-700 text-lg">
                                        KSh {prices[selectedPlan].toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                    Safaricom phone number
                                </label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="07XX XXX XXX"
                                        value={phone}
                                        onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                                        className="pl-9"
                                        type="tel"
                                        inputMode="numeric"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitPayment()}
                                    />
                                </div>
                                {phoneError && (
                                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {phoneError}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    You will receive an M-Pesa prompt on this number
                                </p>
                            </div>

                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
                                onClick={handleSubmitPayment}
                                disabled={submitting || !phone}
                            >
                                {submitting ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending STK push...</>
                                ) : (
                                    <>Pay KSh {prices[selectedPlan].toLocaleString()} via M-Pesa</>
                                )}
                            </Button>

                            <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                                <Shield className="h-3 w-3" />
                                Your payment is processed securely by Safaricom
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // ── Step: Pending / polling ───────────────────────────────────────────

    if (step === 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-sm w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Smartphone className="h-10 w-10 text-green-600 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Check your phone</h2>
                    <p className="text-gray-600 text-sm mb-4">
                        An M-Pesa prompt has been sent to your phone.
                        Enter your <strong>M-Pesa PIN</strong> to complete payment.
                    </p>
                    <div className="bg-white border rounded-lg p-4 mb-6 text-sm text-left space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount</span>
                            <span className="font-semibold">KSh {stkData?.amount_ksh.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Plan</span>
                            <span className="font-semibold">{stkData ? PLAN_LABELS[stkData.plan as Plan] : ''}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Payee</span>
                            <span className="font-semibold">Tusome</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Waiting for confirmation...
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                        Prompt expires in 60 seconds. Didn't receive it?
                    </p>
                    <button
                        className="text-green-600 text-xs underline mt-1"
                        onClick={() => setStep('phone')}
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    // ── Step: Success ─────────────────────────────────────────────────────

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-sm w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Confirmed! 🎉</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Your subscription is now active. A confirmation has been sent to your email.
                    </p>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white w-full h-11"
                        onClick={() => router.push(`/dashboard/${user.grade_category}`)}
                    >
                        Continue Learning
                    </Button>
                </div>
            </div>
        );
    }

    // ── Step: Failed ──────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-sm w-full text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-600 text-sm mb-6">
                    {pollError || 'Something went wrong. Please try again.'}
                </p>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white w-full h-11"
                    onClick={() => { setStep('plans'); setPollError(''); setStkData(null); }}
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
