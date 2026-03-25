'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getToken(): string | null {
    try {
        if (typeof window !== 'undefined') return localStorage.getItem('tusome_token');
    } catch { /* noop */ }
    return null;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
        const detail = (data as any)?.detail;
        const message = typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
                ? detail[0]?.msg || 'Request failed'
                : 'Request failed';
        throw new Error(message);
    }

    return data as T;
}
