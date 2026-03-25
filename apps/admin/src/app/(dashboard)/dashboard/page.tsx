"use client";
import { useEffect, useState } from "react";
import { Users, CreditCard, BookOpen, TrendingUp } from "lucide-react";
import { adminAPI, type DashboardStats } from "@/lib/api";

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-gray-600" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminAPI
      .stats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error)
    return (
      <div className="p-8">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );

  if (!stats)
    return (
      <div className="p-8">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
      </div>

      {/* Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Subscription Breakdown
        </h2>
        <div className="space-y-3">
          {[
            { label: "Active", value: stats.active_subscribers, color: "bg-green-500" },
            { label: "Trial", value: stats.trial_users, color: "bg-blue-500" },
            { label: "Expired", value: stats.expired_users, color: "bg-gray-400" },
          ].map(({ label, value, color }) => {
            const pct =
              stats.total_users > 0
                ? Math.round((value / stats.total_users) * 100)
                : 0;
            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{label}</span>
                  <span>
                    {value.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
