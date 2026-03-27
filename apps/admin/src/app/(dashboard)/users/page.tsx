"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, X, Download, UserCheck, UserX, CheckCircle, Clock, Flame, Trophy } from "lucide-react";
import { adminAPI, type StudentUser, type UserProfile, type UserProgressStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-700",
  trial:     "bg-blue-100 text-blue-700",
  expired:   "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

const SUB_OPTIONS = ["active", "trial", "expired", "cancelled"];

// ── User Profile Drawer ───────────────────────────────────────────────────────

// XP level thresholds (mirrors backend)
const LEVELS = [
  { level: 1, xp: 0 }, { level: 2, xp: 50 }, { level: 3, xp: 150 },
  { level: 4, xp: 300 }, { level: 5, xp: 550 }, { level: 6, xp: 850 },
  { level: 7, xp: 1200 }, { level: 8, xp: 1700 }, { level: 9, xp: 2300 },
  { level: 10, xp: 3000 },
];
function currentLevelXp(level: number) {
  return LEVELS.find(l => l.level === level)?.xp ?? 0;
}

function ProfileDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setProfile(null);
    setProgress(null);
    Promise.all([
      adminAPI.userProfile(userId),
      adminAPI.userProgress(userId).catch(() => null),
    ]).then(([prof, prog]) => {
      setProfile(prof);
      setProgress(prog);
    }).finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">User Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : !profile ? (
            <p className="text-sm text-red-500">Failed to load profile</p>
          ) : (
            <>
              {/* Identity */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                    {profile.first_name[0]}{profile.last_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{profile.first_name} {profile.last_name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Grade", value: profile.grade_tier, cls: "" },
                    { label: "Status", value: profile.subscription_status, cls: STATUS_COLORS[profile.subscription_status] ?? "" },
                    { label: "Joined", value: new Date(profile.created_at).toLocaleDateString(), cls: "" },
                    { label: "Last seen", value: profile.last_login_at ? new Date(profile.last_login_at).toLocaleDateString() : "Never", cls: "" },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400 mb-0.5">{label}</p>
                      <p className={`font-medium text-gray-700 capitalize ${cls ? `px-1.5 py-0.5 rounded-full text-xs ${cls}` : ""}`}>{value}</p>
                    </div>
                  ))}
                  {profile.trial_end_date && (
                    <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                      <p className="text-gray-400 mb-0.5">Trial ends</p>
                      <p className="font-medium text-gray-700">{new Date(profile.trial_end_date).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${profile.email_verified ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {profile.email_verified ? "Email verified" : "Unverified"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${profile.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {profile.is_active ? "Active account" : "Deactivated"}
                  </span>
                </div>
              </div>

              {/* Learning Progress */}
              {progress && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Learning Progress</h3>
                  {/* XP bar */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Trophy size={14} className="text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{progress.level_name}</p>
                        <p className="text-xs text-gray-400">Level {progress.level}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{progress.total_xp.toLocaleString()} XP</span>
                      <span>{progress.next_level_xp ? `${progress.next_level_xp.toLocaleString()} XP` : "Max level"}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{
                          width: `${progress.next_level_xp
                            ? Math.min(100, Math.round(((progress.total_xp - currentLevelXp(progress.level)) / (progress.next_level_xp - currentLevelXp(progress.level))) * 100))
                            : 100}%`
                        }}
                      />
                    </div>
                  </div>
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                    {[
                      { label: "Total XP", value: progress.total_xp.toLocaleString() },
                      { label: "Lessons done", value: String(progress.lessons_completed) },
                      { label: "Current streak", value: `${progress.current_streak}d 🔥` },
                      { label: "Best streak", value: `${progress.longest_streak}d` },
                      { label: "Subjects mastered", value: String(progress.subjects_mastered) },
                      { label: "Last active", value: progress.last_activity_date ? new Date(progress.last_activity_date).toLocaleDateString() : "Never" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-400 mb-0.5">{label}</p>
                        <p className="font-medium text-gray-700">{value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Badges */}
                  {progress.badges.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{progress.badges.length} badge{progress.badges.length !== 1 ? "s" : ""} earned</p>
                      <div className="flex flex-wrap gap-1.5">
                        {progress.badges.map(({ badge, earned_at }) => (
                          <div
                            key={badge.id}
                            title={`${badge.name} — earned ${new Date(earned_at).toLocaleDateString()}`}
                            className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-xs font-medium"
                          >
                            {badge.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payments */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment History</h3>
                {profile.payment_history.length === 0 ? (
                  <p className="text-xs text-gray-400">No payments yet</p>
                ) : (
                  <div className="space-y-2">
                    {profile.payment_history.map((p, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs font-medium text-gray-700 capitalize">{p.plan} plan</p>
                          <p className="text-xs text-gray-400">{p.phone_number}</p>
                          {p.mpesa_receipt_number && <p className="text-xs text-gray-400 font-mono">{p.mpesa_receipt_number}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-900">KSh {p.amount_ksh.toLocaleString()}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-500"}`}>{p.status}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Activity</h3>
                {profile.recent_activities.length === 0 ? (
                  <p className="text-xs text-gray-400">No activity recorded</p>
                ) : (
                  <div className="space-y-1.5">
                    {profile.recent_activities.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{a.activity_type}</span>
                        <span className="text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Bulk action bar (floating) ────────────────────────────────────────────────

function BulkBar({
  count, onAction, onClear, loading,
}: {
  count: number;
  onAction: (action: string, value?: string) => void;
  onClear: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)] overflow-x-auto">
      <div className="flex items-center gap-2 bg-gray-900 text-white px-3 sm:px-4 py-2.5 rounded-xl shadow-2xl text-sm whitespace-nowrap">
        <span className="font-medium mr-1">{count} selected</span>
        <div className="w-px h-4 bg-white/20 mx-1 shrink-0" />

        <button
          onClick={() => onAction("set_status", "active")}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          <CheckCircle size={12} />
          <span className="hidden xs:inline">Set </span>Active
        </button>

        <button
          onClick={() => onAction("set_status", "trial")}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          <Clock size={12} />
          <span className="hidden xs:inline">Set </span>Trial
        </button>

        <button
          onClick={() => onAction("set_status", "expired")}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          Expired
        </button>

        <button
          onClick={() => onAction("deactivate")}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          <UserX size={12} />
          <span className="hidden sm:inline">Deactivate</span>
          <span className="sm:hidden">Off</span>
        </button>

        <button
          onClick={() => onAction("reactivate")}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          <UserCheck size={12} />
          <span className="hidden sm:inline">Reactivate</span>
          <span className="sm:hidden">On</span>
        </button>

        <div className="w-px h-4 bg-white/20 mx-1 shrink-0" />
        <button onClick={onClear} className="text-white/50 hover:text-white transition-colors shrink-0" aria-label="Clear selection">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { admin } = useAuth();
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [overriding, setOverriding] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulking, setBulking] = useState(false);
  const limit = 50;

  const isSuperAdmin = admin?.role === "super_admin";
  const canOverride = isSuperAdmin || admin?.role === "support_agent";

  const load = useCallback(async (s = skip, q = search) => {
    setLoading(true);
    try {
      const data = await adminAPI.listUsers(s, limit, q || undefined);
      setUsers(data.results);
      setTotal(data.total);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [skip, search]);

  useEffect(() => { load(0, search); setSkip(0); }, [search]); // eslint-disable-line
  useEffect(() => { load(skip, search); }, [skip]); // eslint-disable-line

  async function handleOverride(userId: string, status: string) {
    setOverriding(userId);
    try {
      const updated = await adminAPI.overrideSubscription(userId, status);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, subscription_status: updated.subscription_status } : u));
    } catch { /* ignore */ }
    finally { setOverriding(null); }
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(selected.size === users.length ? new Set() : new Set(users.map((u) => u.id)));
  }

  async function handleBulkAction(action: string, value?: string) {
    const label =
      action === "set_status" ? `Set ${selected.size} users to "${value}"` :
      action === "deactivate" ? `Deactivate ${selected.size} accounts` :
      `Reactivate ${selected.size} accounts`;

    if (!confirm(`${label}? This will be logged.`)) return;
    setBulking(true);
    try {
      const res = await adminAPI.bulkUserAction([...selected], action, value);
      setSelected(new Set());
      load(skip, search);
      const msg = document.createElement("div");
      msg.textContent = `✓ ${res.affected} users updated`;
      Object.assign(msg.style, {
        position: "fixed", bottom: "24px", right: "24px", background: "#15803d",
        color: "#fff", padding: "10px 18px", borderRadius: "10px", fontSize: "14px",
        zIndex: "9999", boxShadow: "0 4px 12px rgba(0,0,0,.15)",
      });
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setBulking(false);
    }
  }

  async function handleExport() {
    try {
      const blob = await adminAPI.exportUsersCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Export failed"); }
  }

  const allSelected = users.length > 0 && selected.size === users.length;
  const someSelected = selected.size > 0 && selected.size < users.length;

  return (
    <div className="p-4 sm:p-8">
      {selectedUserId && (
        <ProfileDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}

      {/* Floating bulk bar */}
      {selected.size > 0 && isSuperAdmin && (
        <BulkBar
          count={selected.size}
          onAction={handleBulkAction}
          onClear={() => setSelected(new Set())}
          loading={bulking}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} total</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
          )}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {isSuperAdmin && (
                  <th className="pl-4 pr-2 py-3 w-8">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-green-700 focus:ring-green-700 cursor-pointer"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected; }}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Grade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Progress</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Trial ends</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Joined</th>
                {canOverride && (
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Override</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
              ) : (
                users.map((u) => {
                  const isSelected = selected.has(u.id);
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`border-b border-gray-50 cursor-pointer transition-colors ${
                        isSelected ? "bg-green-50 hover:bg-green-50" : "hover:bg-gray-50"
                      }`}
                    >
                      {isSuperAdmin && (
                        <td className="pl-4 pr-2 py-3" onClick={(e) => toggleSelect(u.id, e)}>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-700 focus:ring-green-700 cursor-pointer"
                            checked={isSelected}
                            onChange={() => {}}
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize hidden md:table-cell">{u.grade_category}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[u.subscription_status] ?? "bg-gray-100 text-gray-600"}`}>
                          {u.subscription_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {u.level != null ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span className="font-medium text-green-700">Lv{u.level}</span>
                            <span className="text-gray-400">·</span>
                            <span>{(u.total_xp ?? 0).toLocaleString()} XP</span>
                            {(u.current_streak ?? 0) > 0 && (
                              <>
                                <span className="text-gray-400">·</span>
                                <Flame size={11} className="text-orange-500" />
                                <span>{u.current_streak}d</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                        {u.trial_end_date ? new Date(u.trial_end_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      {canOverride && (
                        <td className="px-4 py-3 hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={u.subscription_status}
                            disabled={overriding === u.id}
                            onChange={(e) => handleOverride(u.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-700 disabled:opacity-50 bg-white"
                          >
                            {SUB_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {skip + 1}–{Math.min(skip + limit, total)} of {total.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button
                disabled={skip === 0}
                onClick={() => setSkip((s) => Math.max(0, s - limit))}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={skip + limit >= total}
                onClick={() => setSkip((s) => s + limit)}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
