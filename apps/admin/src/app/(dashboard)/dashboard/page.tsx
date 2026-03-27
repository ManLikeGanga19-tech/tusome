"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, CreditCard, BookOpen, TrendingUp, AlertTriangle, XCircle,
  Brain, FileText, Star, Megaphone, HelpCircle, CheckCircle, Clock,
} from "lucide-react";
import { adminAPI, type DashboardStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// ── Shared Stat Card ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  warn,
  danger,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  sub?: string;
  warn?: boolean;
  danger?: boolean;
}) {
  const borderCls = danger ? "border-red-300" : warn ? "border-amber-300" : "border-gray-200";
  const iconBg = danger ? "bg-red-50" : warn ? "bg-amber-50" : "bg-green-50";
  const iconColor = danger ? "text-red-500" : warn ? "text-amber-500" : "text-green-600";
  const valueCls = danger ? "text-red-600" : warn ? "text-amber-600" : "text-gray-900";
  return (
    <div className={`bg-white border rounded-xl p-6 ${borderCls}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueCls}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
    >
      <Icon size={16} className="text-gray-400" />
      {label}
    </Link>
  );
}

// ── Super Admin Dashboard ──────────────────────────────────────────────────────

function SuperAdminDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          label="Total Users"
          value={stats.total_users.toLocaleString()}
          icon={Users}
          sub={`+${stats.new_users_this_week} this week`}
        />
        <StatCard
          label="Active Subscribers"
          value={stats.active_subscribers.toLocaleString()}
          icon={CreditCard}
          sub={`${stats.trial_users} on trial`}
        />
        <StatCard
          label="Published Lessons"
          value={stats.total_lessons.toLocaleString()}
          icon={BookOpen}
          sub={`${stats.total_subjects} subjects`}
        />
        <StatCard
          label="Revenue (this month)"
          value={`KSh ${stats.revenue_this_month_ksh.toLocaleString()}`}
          icon={TrendingUp}
        />
        <StatCard
          label="Trials Expiring Soon"
          value={stats.expiring_trials_soon}
          icon={AlertTriangle}
          sub="within 3 days"
          warn={stats.expiring_trials_soon > 0}
        />
        <StatCard
          label="Failed Payments Today"
          value={stats.failed_payments_today}
          icon={XCircle}
          sub="M-Pesa failures"
          danger={stats.failed_payments_today > 0}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Subscription Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: "Active", value: stats.active_subscribers, color: "bg-green-500" },
            { label: "Trial", value: stats.trial_users, color: "bg-blue-500" },
            { label: "Expired", value: stats.expired_users, color: "bg-gray-400" },
          ].map(({ label, value, color }) => {
            const pct = stats.total_users > 0 ? Math.round((value / stats.total_users) * 100) : 0;
            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{label}</span>
                  <span>{value.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Content Editor Dashboard ───────────────────────────────────────────────────

function ContentEditorDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          label="Published Lessons"
          value={stats.total_lessons.toLocaleString()}
          icon={BookOpen}
          sub={`${stats.total_subjects} subjects`}
        />
        <StatCard
          label="Total Students"
          value={stats.total_users.toLocaleString()}
          icon={Users}
          sub="across all grades"
        />
        <StatCard
          label="Active Learners"
          value={stats.active_subscribers.toLocaleString()}
          icon={CheckCircle}
          sub="with active subscriptions"
        />
        <StatCard
          label="Trials Running"
          value={stats.trial_users.toLocaleString()}
          icon={Clock}
          sub="exploring content"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <QuickLink href="/content" icon={BookOpen} label="Manage Content" />
          <QuickLink href="/quizzes" icon={Brain} label="Manage Quizzes" />
          <QuickLink href="/blog" icon={FileText} label="Blog Posts" />
          <QuickLink href="/stories" icon={Star} label="Success Stories" />
          <QuickLink href="/announcements" icon={Megaphone} label="Announcements" />
          <QuickLink href="/faqs" icon={HelpCircle} label="FAQs" />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        <strong>Tip:</strong> Students can only see lessons and quizzes you&apos;ve marked as
        published. Drafts are invisible until published.
      </div>
    </>
  );
}

// ── Support Agent Dashboard ────────────────────────────────────────────────────

function SupportAgentDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          label="Total Users"
          value={stats.total_users.toLocaleString()}
          icon={Users}
          sub={`+${stats.new_users_this_week} this week`}
        />
        <StatCard
          label="Active Subscribers"
          value={stats.active_subscribers.toLocaleString()}
          icon={CheckCircle}
          sub="paying users"
        />
        <StatCard
          label="Trials Expiring Soon"
          value={stats.expiring_trials_soon}
          icon={AlertTriangle}
          sub="within 3 days — reach out"
          warn={stats.expiring_trials_soon > 0}
        />
        <StatCard
          label="Failed Payments Today"
          value={stats.failed_payments_today}
          icon={XCircle}
          sub="M-Pesa failures"
          danger={stats.failed_payments_today > 0}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <QuickLink href="/users" icon={Users} label="User Accounts" />
          <QuickLink href="/payments" icon={CreditCard} label="Payments" />
          <QuickLink href="/blog" icon={FileText} label="Blog Posts" />
          <QuickLink href="/announcements" icon={Megaphone} label="Announcements" />
          <QuickLink href="/faqs" icon={HelpCircle} label="FAQs" />
          <QuickLink href="/stories" icon={Star} label="Success Stories" />
        </div>
      </div>

      {stats.expiring_trials_soon > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-4">
          <strong>{stats.expiring_trials_soon} trial{stats.expiring_trials_soon !== 1 ? 's' : ''}</strong> expiring
          within 3 days — consider reaching out to convert them.{' '}
          <Link href="/users" className="underline font-medium">View users →</Link>
        </div>
      )}
      {stats.failed_payments_today > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>{stats.failed_payments_today} M-Pesa payment{stats.failed_payments_today !== 1 ? 's' : ''}</strong>{' '}
          failed today — check the payments log for details.{' '}
          <Link href="/payments" className="underline font-medium">View payments →</Link>
        </div>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const ROLE_TITLES: Record<string, { title: string; subtitle: string }> = {
  super_admin:    { title: "Dashboard",         subtitle: "Platform overview" },
  content_editor: { title: "Content Dashboard", subtitle: "Manage lessons, quizzes, and learning content" },
  support_agent:  { title: "Support Dashboard", subtitle: "Monitor users, trials, and payments" },
};

export default function DashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminAPI.stats().then(setStats).catch((e) => setError(e.message));
  }, []);

  const role = admin?.role ?? "super_admin";
  const { title, subtitle } = ROLE_TITLES[role] ?? ROLE_TITLES.super_admin;

  if (error)
    return <div className="p-8"><p className="text-red-600 text-sm">{error}</p></div>;

  if (!stats)
    return <div className="p-8"><p className="text-sm text-gray-400">Loading…</p></div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {role === "content_editor" ? (
        <ContentEditorDashboard stats={stats} />
      ) : role === "support_agent" ? (
        <SupportAgentDashboard stats={stats} />
      ) : (
        <SuperAdminDashboard stats={stats} />
      )}
    </div>
  );
}
