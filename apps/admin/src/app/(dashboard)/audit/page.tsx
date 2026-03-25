"use client";
import { useEffect, useState, useCallback } from "react";
import { adminAPI, type AuditLog } from "@/lib/api";

const ACTION_COLORS: Record<string, string> = {
  "admin.login": "bg-gray-100 text-gray-600",
  "admin.created": "bg-blue-100 text-blue-700",
  "admin.updated": "bg-yellow-100 text-yellow-700",
  "user.subscription_changed": "bg-orange-100 text-orange-700",
  "lesson.published": "bg-green-100 text-green-700",
  "lesson.unpublished": "bg-red-100 text-red-600",
  "subject.active_toggled": "bg-purple-100 text-purple-700",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  const load = useCallback(
    async (s: number) => {
      setLoading(true);
      try {
        const data = await adminAPI.auditLogs(s, limit);
        if (s === 0) {
          setLogs(data);
        } else {
          setLogs((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === limit);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(0);
  }, [load]);

  function loadMore() {
    const next = skip + limit;
    setSkip(next);
    load(next);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          All admin actions, newest first
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                When
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Admin
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Action
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Target
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                IP
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No audit logs yet
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.admin_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                        ACTION_COLORS[log.action] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {log.target_type}/{log.target_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {log.ip_address ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono max-w-xs truncate">
                    {log.extra
                      ? JSON.stringify(log.extra)
                      : "—"}
                  </td>
                </tr>
              ))
            )}
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-sm text-gray-400"
                >
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {hasMore && !loading && (
          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <button
              onClick={loadMore}
              className="text-xs text-gray-500 hover:text-gray-900 underline"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
