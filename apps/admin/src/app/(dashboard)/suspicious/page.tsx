"use client";
import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw, ShieldAlert, CreditCard, Clock, Zap, ChevronRight } from "lucide-react";
import { adminAPI, type SuspiciousEvent } from "@/lib/api";
import { useRouter } from "next/navigation";

const EVENT_META: Record<string, {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
}> = {
  payment_failures:         { label: "Payment Failures",       icon: CreditCard,    bg: "bg-red-50",    text: "text-red-600" },
  multiple_ips:             { label: "Multiple IPs",           icon: ShieldAlert,   bg: "bg-amber-50",  text: "text-amber-600" },
  stale_trial:              { label: "Stale Trial",            icon: Clock,         bg: "bg-blue-50",   text: "text-blue-600" },
  high_activity_no_progress:{ label: "No Progress",            icon: Zap,           bg: "bg-purple-50", text: "text-purple-600" },
};

const SEVERITY_BADGE: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-gray-100 text-gray-600",
};

const FILTER_OPTIONS = [
  { value: "all",                     label: "All events" },
  { value: "payment_failures",        label: "Payment failures" },
  { value: "multiple_ips",            label: "Multiple IPs" },
  { value: "stale_trial",             label: "Stale trials" },
  { value: "high_activity_no_progress", label: "No progress" },
];

export default function SuspiciousActivityPage() {
  const router = useRouter();
  const [events, setEvents] = useState<SuspiciousEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.suspiciousActivity();
      setEvents(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? events : events.filter((e) => e.event_type === filter);

  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] ?? 0) + 1;
    acc.all = (acc.all ?? 0) + 1;
    return acc;
  }, {});

  const highCount = events.filter((e) => e.severity === "high").length;
  const medCount  = events.filter((e) => e.severity === "medium").length;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={22} className="text-amber-500" />
            Suspicious Activity
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Automated anomaly detection — payment failures, multi-IP logins, stale trials, inactive users.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">High Severity</p>
          <p className={`text-2xl font-bold mt-1 ${highCount > 0 ? "text-red-600" : "text-gray-900"}`}>
            {highCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Medium Severity</p>
          <p className={`text-2xl font-bold mt-1 ${medCount > 0 ? "text-amber-600" : "text-gray-900"}`}>
            {medCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Flags</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{events.length}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === opt.value
                ? "bg-green-700 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-green-700 hover:text-green-700"
            }`}
          >
            {opt.label}
            {counts[opt.value] != null && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                filter === opt.value ? "bg-white/20" : "bg-gray-100"
              }`}>
                {counts[opt.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Scanning for anomalies…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="text-4xl">✓</div>
          <p className="text-sm font-medium text-gray-700">No issues detected</p>
          <p className="text-xs text-gray-400">
            {filter !== "all" ? "Try changing the filter above" : "Platform looks healthy"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((evt, i) => {
            const meta = EVENT_META[evt.event_type] ?? {
              label: evt.event_type,
              icon: AlertTriangle,
              bg: "bg-gray-50",
              text: "text-gray-600",
            };
            const Icon = meta.icon;
            return (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-gray-300 transition-colors"
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                  <Icon size={16} className={meta.text} />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {evt.user_name}
                    </span>
                    <span className="text-xs text-gray-400 truncate hidden sm:block">
                      {evt.user_email}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${SEVERITY_BADGE[evt.severity]}`}>
                      {evt.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{evt.description}</p>
                </div>

                {/* Type tag + navigate */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full hidden md:block ${meta.bg} ${meta.text}`}>
                    {meta.label}
                  </span>
                  <button
                    onClick={() => router.push(`/users?highlight=${evt.user_id}`)}
                    className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    title="View user"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
