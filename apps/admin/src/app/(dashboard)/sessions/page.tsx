"use client";
import { useEffect, useState, useCallback } from "react";
import { Monitor, RefreshCw, LogOut, Shield, Clock, Globe, Laptop } from "lucide-react";
import { adminAPI, AdminSession } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatExpiry(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

function parseUA(ua: string | null): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };
  let browser = "Unknown";
  let os = "Unknown";

  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { browser, os };
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  content_editor: "bg-blue-100 text-blue-700",
  support_agent: "bg-teal-100 text-teal-700",
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  support_agent: "Support Agent",
};

export default function SessionsPage() {
  const { admin } = useAuth();
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.listSessions(!showAll);
      setSessions(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => { load(); }, [load]);

  async function handleRevoke(sessionId: string) {
    if (!confirm("Force-logout this session?")) return;
    setRevoking(sessionId);
    try {
      await adminAPI.forceLogout(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  }

  // Group by admin
  const grouped = sessions.reduce<Record<string, { adminInfo: AdminSession; sessions: AdminSession[] }>>(
    (acc, s) => {
      if (!acc[s.admin_id]) {
        acc[s.admin_id] = { adminInfo: s, sessions: [] };
      }
      acc[s.admin_id].sessions.push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Monitor size={22} className="text-green-700" />
            Active Sessions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage all active admin sessions. Force-logout any suspicious session.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
            Show expired
          </label>
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active Sessions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {sessions.filter((s) => s.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Admins Online</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Object.keys(grouped).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{sessions.length}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Sessions grouped by admin */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No active sessions found.</div>
      ) : (
        <div className="space-y-4">
          {Object.values(grouped).map(({ adminInfo, sessions: adminSessions }) => {
            const isCurrentAdmin = adminInfo.admin_id === admin?.id;
            return (
              <div key={adminInfo.admin_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Admin header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Shield size={14} className="text-green-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {adminInfo.admin_name}
                        </span>
                        {isCurrentAdmin && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{adminInfo.admin_email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[adminInfo.admin_role] ?? "bg-gray-100 text-gray-600"}`}>
                    {ROLE_LABELS[adminInfo.admin_role] ?? adminInfo.admin_role}
                  </span>
                </div>

                {/* Session rows */}
                <div className="divide-y divide-gray-50">
                  {adminSessions.map((session) => {
                    const { browser, os } = parseUA(session.user_agent);
                    const isExpired = new Date(session.expires_at) < new Date();
                    return (
                      <div
                        key={session.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3 gap-2 ${!session.is_active || isExpired ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <Laptop size={16} className="text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800">
                              {browser} on {os}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Globe size={11} />
                                {session.ip_address ?? "unknown IP"}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock size={11} />
                                Last active {timeAgo(session.last_active_at)}
                              </span>
                              <span className="text-xs text-gray-400">
                                Expires {formatExpiry(session.expires_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 sm:ml-4">
                          {!session.is_active || isExpired ? (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              {!session.is_active ? "Revoked" : "Expired"}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRevoke(session.id)}
                              disabled={revoking === session.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <LogOut size={12} />
                              {revoking === session.id ? "Revoking…" : "Force Logout"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
