'use client';

import React, { useEffect, useState } from 'react';
import { Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/lib/api/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

interface Announcement {
  id: string;
  title: string;
  message: string;
  announcement_type: 'info' | 'warning' | 'success';
  target_audience: 'all' | 'trial' | 'active' | 'expired';
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

const TYPE_STYLES = {
  info:    { bg: 'bg-blue-600',   icon: Info,          btn: 'bg-white text-blue-600 hover:bg-blue-50' },
  warning: { bg: 'bg-amber-500',  icon: AlertTriangle, btn: 'bg-white text-amber-600 hover:bg-amber-50' },
  success: { bg: 'bg-green-700',  icon: CheckCircle,   btn: 'bg-white text-green-700 hover:bg-green-50' },
};

export default function AnnouncementBanner() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const audience = user?.subscription_status ?? 'all';
    fetch(`${API_BASE}/public/announcements?audience=${audience}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Announcement[]) => {
        // Restore per-session dismissals
        const key = 'dismissed_announcements';
        const stored: string[] = JSON.parse(sessionStorage.getItem(key) ?? '[]');
        setDismissed(new Set(stored));
        setAnnouncements(data);
      })
      .catch(() => {/* silently fail — don't break the page */});
  }, [user?.subscription_status]);

  function dismiss(id: string) {
    const next = new Set([...dismissed, id]);
    setDismissed(next);
    sessionStorage.setItem('dismissed_announcements', JSON.stringify([...next]));
  }

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((a) => {
        const style = TYPE_STYLES[a.announcement_type] ?? TYPE_STYLES.info;
        const Icon = style.icon;
        return (
          <div key={a.id} className={`${style.bg} text-white px-4 py-2.5`}>
            <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
              <div className="flex items-start gap-2 text-sm min-w-0">
                <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-semibold">{a.title}: </span>
                  <span className="opacity-90">{a.message}</span>
                </div>
              </div>
              <button
                onClick={() => dismiss(a.id)}
                className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                aria-label="Dismiss announcement"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
