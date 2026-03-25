'use client';

import { apiRequest } from './client';

export interface StkPushRequest {
    phone_number: string;  // 2547XXXXXXXX
    plan: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface StkPushResponse {
    message: string;
    checkout_request_id: string;
    amount_ksh: number;
    plan: string;
}

export interface PollResponse {
    status: 'pending' | 'success' | 'failed';
    receipt: string | null;
    plan: string;
    amount_ksh: number;
    ends_at: string | null;
}

export interface PaymentStatus {
    subscription: {
        id: string;
        plan: string;
        grade_tier: string;
        amount_ksh: number;
        status: string;
        starts_at: string;
        ends_at: string;
    } | null;
    subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
    trial_end_date: string | null;
}

export const paymentsApi = {
    subscribe: (body: StkPushRequest) =>
        apiRequest<StkPushResponse>('/payments/subscribe', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    poll: (checkoutRequestId: string) =>
        apiRequest<PollResponse>(`/payments/poll/${checkoutRequestId}`),

    getStatus: () =>
        apiRequest<PaymentStatus>('/payments/status'),
};

// ── Pricing table (mirrors backend TIER_PRICES) ──────────────────────────

export const TIER_PRICES = {
    primary: { daily: 25, weekly: 150, monthly: 499, yearly: 4_999 },
    junior:  { daily: 40, weekly: 250, monthly: 899, yearly: 8_990 },
    senior:  { daily: 60, weekly: 400, monthly: 1_499, yearly: 14_999 },
} as const;

export const PLAN_LABELS = {
    daily:   'Daily',
    weekly:  'Weekly',
    monthly: 'Monthly',
    yearly:  'Yearly',
} as const;

export type Plan = keyof typeof PLAN_LABELS;
export type Tier = keyof typeof TIER_PRICES;
