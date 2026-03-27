'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen,
    Search,
    Bell,
    Settings,
    Wifi,
    Battery,
    X,
    LogOut,
    User,
    ChevronDown,
    Clock,
    Lock,
    Loader2,
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, User as BackendUser } from '@/lib/api/auth';
import { contentApi, type SearchResult } from '@/lib/api/content';
import { progressApi } from '@/lib/api/progress';

interface HeaderProps {
    onSearch?: (query: string) => void;
}

const TIER_COLOR: Record<string, string> = {
    primary: 'bg-blue-600',
    junior: 'bg-green-600',
    senior: 'bg-red-600',
};

const TIER_BADGE: Record<string, string> = {
    primary: 'bg-blue-100 text-blue-800',
    junior: 'bg-green-100 text-green-800',
    senior: 'bg-red-100 text-red-800',
};

// ── Search dropdown ───────────────────────────────────────────────────────────

function SearchDropdown({
    query,
    results,
    loading,
    onSelect,
    onClose,
}: {
    query: string;
    results: SearchResult[];
    loading: boolean;
    onSelect: (r: SearchResult) => void;
    onClose: () => void;
}) {
    if (!query || query.length < 2) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
            {loading ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching…
                </div>
            ) : results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">
                    No lessons found for &quot;{query}&quot;
                </div>
            ) : (
                <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                        {results.length} result{results.length !== 1 ? 's' : ''}
                    </div>
                    {results.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => onSelect(r)}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded font-medium">
                                        {r.subject_name}
                                    </span>
                                    {!r.is_free_preview && (
                                        <Lock className="h-3 w-3 text-gray-300 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                                {r.description && (
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{r.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 mt-1">
                                <Clock className="h-3 w-3" />
                                {r.duration_minutes}m
                            </div>
                        </button>
                    ))}
                </>
            )}
        </div>
    );
}

// ── Main header ───────────────────────────────────────────────────────────────

export default function DashboardHeader({ onSearch }: HeaderProps) {
    const router = useRouter();
    const { user, loading: isLoading, logout } = useAuth();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // UI state
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Real progress stats for dropdown
    const [statsXp, setStatsXp] = useState<number | null>(null);
    const [statsStreak, setStatsStreak] = useState<number | null>(null);
    const [statsLessons, setStatsLessons] = useState<number | null>(null);

    useEffect(() => {
        // Only fetch stats for active subscribers and trial users — not expired/cancelled
        if (!user || !['trial', 'active'].includes(user.subscription_status)) return;
        progressApi.getStats().then((s) => {
            setStatsXp(s.total_xp);
            setStatsStreak(s.current_streak);
            setStatsLessons(s.lessons_completed);
        }).catch(() => {});
    }, [user]);

    // Debounced search
    const runSearch = useCallback((q: string) => {
        if (q.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        setSearchLoading(true);
        setShowResults(true);
        contentApi.search(q)
            .then(setSearchResults)
            .catch(() => setSearchResults([]))
            .finally(() => setSearchLoading(false));
    }, []);

    function handleSearchChange(value: string) {
        setSearchQuery(value);
        onSearch?.(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(value), 350);
        if (value.length < 2) {
            setShowResults(false);
            setSearchResults([]);
        } else {
            setShowResults(true);
        }
    }

    function handleSelectResult(r: SearchResult) {
        setShowResults(false);
        setSearchQuery('');
        setIsMobileSearchOpen(false);
        router.push(`/dashboard/lessons/${r.id}`);
    }

    function handleCloseSearch() {
        setShowResults(false);
        setSearchQuery('');
        setIsMobileSearchOpen(false);
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }

    // Close dropdown on outside click
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') { setShowResults(false); setIsMobileSearchOpen(false); }
        }
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    const tier = (user?.grade_category ?? 'junior') as 'primary' | 'junior' | 'senior';
    const tierColor = TIER_COLOR[tier] ?? TIER_COLOR.junior;
    const tierBadge = TIER_BADGE[tier] ?? TIER_BADGE.junior;
    const initials = user ? `${user.first_name[0]}${user.last_name[0]}` : '?';

    const handleLogout = async () => {
        await logout().catch(() => {});
        router.push('/auth/signin');
    };

    if (isLoading || !user) {
        return (
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center flex-shrink-0">
                            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                            <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Tusome</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0 cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                        <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Tusome</span>
                    </div>

                    {/* Desktop search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8" ref={searchRef}>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input
                                placeholder="Search lessons, subjects…"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                className="pl-10 w-full border-gray-200 focus:border-green-500 focus:ring-green-500 bg-gray-50 focus:bg-white"
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleCloseSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                            <SearchDropdown
                                query={searchQuery}
                                results={searchResults}
                                loading={searchLoading}
                                onSelect={handleSelectResult}
                                onClose={handleCloseSearch}
                            />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Mobile search toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileSearchOpen((v) => !v)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Search className="h-5 w-5 text-gray-600" />
                        </Button>

                        {/* Online indicator */}
                        <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-1.5">
                            <Wifi className="h-4 w-4 text-green-600" />
                            <Battery className="h-4 w-4 text-green-600" />
                            <span className="hidden lg:inline font-medium text-green-600">Online</span>
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsNotificationsOpen((v) => !v)}
                                className="p-2 hover:bg-gray-100 rounded-full relative"
                            >
                                <Bell className="h-5 w-5 text-gray-600" />
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold leading-none">3</span>
                                </span>
                            </Button>
                        </div>

                        {/* User dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 sm:px-3 py-2"
                                >
                                    <div className="text-right hidden lg:block">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.first_name} {user.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {user.grade_tier} · {user.subscription_status}
                                        </p>
                                    </div>
                                    <div className={`h-8 w-8 sm:h-9 sm:w-9 ${tierColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                                        <span className="text-white text-xs sm:text-sm font-medium">{initials}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 ${tierColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                                            <span className="text-white text-sm font-medium">{initials}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{user.first_name} {user.last_name}</p>
                                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${tierBadge} mt-1 inline-block`}>
                                                {user.grade_tier}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                {/* Real stats */}
                                <div className="px-2 py-2">
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs font-semibold text-gray-900">
                                                {statsStreak ?? '—'}
                                            </p>
                                            <p className="text-xs text-gray-500">Streak</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs font-semibold text-gray-900">
                                                {statsXp != null ? statsXp.toLocaleString() : '—'}
                                            </p>
                                            <p className="text-xs text-gray-500">XP</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs font-semibold text-gray-900">
                                                {statsLessons ?? '—'}
                                            </p>
                                            <p className="text-xs text-gray-500">Lessons</p>
                                        </div>
                                    </div>
                                </div>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    Account Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/dashboard/preferences')} className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Preferences
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile search bar */}
                {isMobileSearchOpen && (
                    <div className="md:hidden pb-3 pt-2 border-t border-gray-100" ref={searchRef}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input
                                autoFocus
                                placeholder="Search lessons, subjects…"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 pr-10 w-full border-gray-200 focus:border-green-500"
                            />
                            <button
                                onClick={handleCloseSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <SearchDropdown
                                query={searchQuery}
                                results={searchResults}
                                loading={searchLoading}
                                onSelect={handleSelectResult}
                                onClose={handleCloseSearch}
                            />
                        </div>
                    </div>
                )}

                {/* Notifications panel */}
                {isNotificationsOpen && (
                    <div className="absolute right-4 top-16 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            <div className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">New lesson available</p>
                                        <p className="text-xs text-gray-500">Mathematics: Quadratic Equations</p>
                                        <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Keep your streak!</p>
                                        <p className="text-xs text-gray-500">Study today to maintain your streak</p>
                                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-gray-100">
                            <Button variant="ghost" className="w-full text-sm text-green-600 hover:text-green-700">
                                View all notifications
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Click-away overlay */}
            {(isNotificationsOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                />
            )}
        </header>
    );
}
