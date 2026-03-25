"use client";
import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { adminAPI, type StudentUser } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trial: "bg-blue-100 text-blue-700",
  expired: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

const SUB_OPTIONS = ["active", "trial", "expired", "cancelled"];

export default function UsersPage() {
  const { admin } = useAuth();
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [overriding, setOverriding] = useState<string | null>(null);

  const limit = 50;

  const load = useCallback(
    async (s = skip, q = search) => {
      setLoading(true);
      try {
        const data = await adminAPI.listUsers(s, limit, q || undefined);
        setUsers(data.results);
        setTotal(data.total);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [skip, search]
  );

  useEffect(() => {
    load(0, search);
    setSkip(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    load(skip, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  async function handleOverride(userId: string, status: string) {
    setOverriding(userId);
    try {
      const updated = await adminAPI.overrideSubscription(userId, status);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, subscription_status: updated.subscription_status } : u))
      );
    } catch {
      /* ignore */
    } finally {
      setOverriding(null);
    }
  }

  const canOverride =
    admin?.role === "super_admin" || admin?.role === "support_agent";

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total.toLocaleString()} total
          </p>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Grade
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Joined
              </th>
              {canOverride && (
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Override
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {u.grade_category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[u.subscription_status] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.subscription_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  {canOverride && (
                    <td className="px-4 py-3">
                      <select
                        value={u.subscription_status}
                        disabled={overriding === u.id}
                        onChange={(e) => handleOverride(u.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
                      >
                        {SUB_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {skip + 1}–{Math.min(skip + limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={skip === 0}
                onClick={() => setSkip((s) => Math.max(0, s - limit))}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={skip + limit >= total}
                onClick={() => setSkip((s) => s + limit)}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
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
