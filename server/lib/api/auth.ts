// lib/api/auth.ts - FINAL WORKING VERSION
'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Types that match your backend exactly
export interface User {
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
    trial_start_date?: string;
    trial_end_date?: string;
    subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
    created_at: string;
    updated_at: string;
    last_login_at?: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    grade: string;
    gradeLevel: string;
    gradeTier: string;
    gradeCategory: string;
    password: string;
    confirmPassword: string;
    agreeTerms: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refresh_token: string;
    expires_in: number;
    message: string;
}

export interface ApiError {
    code: string;
    message: string;
    field?: string;
}

// Safe browser storage functions
function getStorageItem(key: string): string | null {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
        }
        return null;
    } catch {
        return null;
    }
}

function setStorageItem(key: string, value: string): void {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
        }
    } catch {
        // Silently fail
    }
}

function removeStorageItem(key: string): void {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
    } catch {
        // Silently fail
    }
}

class AuthAPI {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        // Add auth token if available
        const token = this.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data: unknown = await response.json();

            if (!response.ok) {
                const errorData = data as any;
                throw {
                    code: errorData?.code || 'API_ERROR',
                    message: errorData?.message || 'Something went wrong',
                    field: errorData?.field,
                } as ApiError;
            }

            return data as T;
        } catch (error) {
            if (error instanceof Error) {
                throw {
                    code: 'NETWORK_ERROR',
                    message: 'Unable to connect to server. Please check your internet connection.',
                } as ApiError;
            }
            throw error;
        }
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        this.setTokens(response.token, response.refresh_token);
        return response;
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        this.setTokens(response.token, response.refresh_token);
        return response;
    }

    async getProfile(): Promise<User> {
        return this.request<User>('/auth/profile');
    }

    async updateProfile(userData: Partial<User>): Promise<User> {
        return this.request<User>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async refreshToken(): Promise<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw {
                code: 'NO_REFRESH_TOKEN',
                message: 'No refresh token available',
            } as ApiError;
        }

        const response = await this.request<AuthResponse>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });

        this.setTokens(response.token, response.refresh_token);
        return response;
    }

    async logout(): Promise<void> {
        const refreshToken = this.getRefreshToken();

        try {
            await this.request<void>('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });
        } catch (error) {
            console.warn('Logout API call failed:', error);
        }

        this.clearTokens();
    }

    async forgotPassword(email: string): Promise<void> {
        await this.request<void>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async verifyEmail(token: string): Promise<void> {
        await this.request<void>('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    }

    private getToken(): string | null {
        return getStorageItem('tusome_token');
    }

    private getRefreshToken(): string | null {
        return getStorageItem('tusome_refresh_token');
    }

    private setTokens(token: string, refreshToken: string): void {
        setStorageItem('tusome_token', token);
        setStorageItem('tusome_refresh_token', refreshToken);
    }

    private clearTokens(): void {
        removeStorageItem('tusome_token');
        removeStorageItem('tusome_refresh_token');
        removeStorageItem('tusome_user');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export const authAPI = new AuthAPI(API_BASE_URL);

// Auth Context
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            if (authAPI.isAuthenticated()) {
                const userProfile = await authAPI.getProfile();
                setUser(userProfile);
            }
        } catch (error) {
            try {
                await authAPI.refreshToken();
                const userProfile = await authAPI.getProfile();
                setUser(userProfile);
            } catch (refreshError) {
                authAPI['clearTokens']();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authAPI.login(credentials);
            setUser(response.user);
        } catch (error) {
            const apiError = error as ApiError;
            setError(apiError.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: RegisterRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authAPI.register(userData);
            setUser(response.user);
        } catch (error) {
            const apiError = error as ApiError;
            setError(apiError.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.warn('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const refreshAuth = async () => {
        try {
            if (authAPI.isAuthenticated()) {
                const userProfile = await authAPI.getProfile();
                setUser(userProfile);
            }
        } catch (error) {
            console.warn('Refresh auth error:', error);
            setUser(null);
        }
    };

    const clearError = () => setError(null);

    return React.createElement(
        AuthContext.Provider,
        {
            value: {
                user,
                loading,
                error,
                login,
                register,
                logout,
                refreshAuth,
                clearError,
            }
        },
        children
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useSignupForm() {
    const { register, loading, error, clearError } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        grade: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (fieldErrors[field]) {
            setFieldErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!formData.grade) {
            errors.grade = 'Please select your grade level';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.agreeTerms) {
            errors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!validateForm()) {
            return;
        }

        const gradeOptions = [
            { value: "grade-4", label: "Grade 4", category: "primary", tier: "Primary CBC" },
            { value: "grade-5", label: "Grade 5", category: "primary", tier: "Primary CBC" },
            { value: "grade-6", label: "Grade 6", category: "primary", tier: "Primary CBC" },
            { value: "grade-7", label: "Grade 7", category: "junior", tier: "Junior Secondary" },
            { value: "grade-8", label: "Grade 8", category: "junior", tier: "Junior Secondary" },
            { value: "grade-9", label: "Grade 9", category: "junior", tier: "Junior Secondary" },
            { value: "grade-10", label: "Grade 10", category: "senior", tier: "Senior Secondary" },
            { value: "grade-11", label: "Grade 11", category: "senior", tier: "Senior Secondary" },
            { value: "grade-12", label: "Grade 12", category: "senior", tier: "Senior Secondary" },
        ];

        const selectedGrade = gradeOptions.find(g => g.value === formData.grade);
        if (!selectedGrade) {
            setFieldErrors({ grade: 'Invalid grade selection' });
            return;
        }

        const registrationData: RegisterRequest = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            grade: formData.grade,
            gradeLevel: selectedGrade.value,
            gradeTier: selectedGrade.tier,
            gradeCategory: selectedGrade.category,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            agreeTerms: formData.agreeTerms,
        };

        try {
            await register(registrationData);
        } catch (error) {
            const apiError = error as ApiError;
            if (apiError.field) {
                setFieldErrors({ [apiError.field]: apiError.message });
            }
        }
    };

    return {
        formData,
        fieldErrors,
        loading,
        error,
        handleInputChange,
        handleSubmit,
        clearError,
    };
}

export function useLoginForm() {
    const { login, loading, error, clearError } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (fieldErrors[field]) {
            setFieldErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!validateForm()) {
            return;
        }

        const loginData: LoginRequest = {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
        };

        try {
            await login(loginData);
        } catch (error) {
            const apiError = error as ApiError;
            if (apiError.field) {
                setFieldErrors({ [apiError.field]: apiError.message });
            }
        }
    };

    return {
        formData,
        fieldErrors,
        loading,
        error,
        handleInputChange,
        handleSubmit,
        clearError,
    };
}

export function useForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const sendResetEmail = async (email: string) => {
        try {
            setLoading(true);
            setError(null);
            await authAPI.forgotPassword(email);
            setSuccess(true);
        } catch (error) {
            const apiError = error as ApiError;
            setError(apiError.message);
        } finally {
            setLoading(false);
        }
    };

    const clearState = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        loading,
        error,
        success,
        sendResetEmail,
        clearState,
    };
}

export function useEmailVerification() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const verifyEmail = async (token: string) => {
        try {
            setLoading(true);
            setError(null);
            await authAPI.verifyEmail(token);
            setSuccess(true);
        } catch (error) {
            const apiError = error as ApiError;
            setError(apiError.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        success,
        verifyEmail,
    };
}