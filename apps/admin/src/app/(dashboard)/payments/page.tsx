"use client";
import { useEffect, useState, useCallback } from "react";
import { adminAPI, type PaymentTransaction } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-600",
};

const PLAN_LABELS: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  weekly: "Weekly",
  daily: "Daily",
};

const STATUS_OPTIONS = ["", "success", "pending", "failed"];

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 50;

  const load = useCallback(
    async (s: number, st: string) => {
      setLoading(true);
      try {
        const data = await adminAPI.listPayments(s, limit, st || undefined);
        setTransactions(data.results);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setSkip(0);
    load(0, statusFilter);
  }, [statusFilter, load]);

  useEffect(() => {
    load(skip, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} transactions total</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All statuses"}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">M-Pesa Receipt</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading…</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No transactions found</td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium text-xs">{t.user_name ?? "—"}</p>
                    <p className="text-gray-400 text-xs">{t.user_email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {PLAN_LABELS[t.plan ?? ""] ?? t.plan ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{t.phone_number}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    KSh {t.amount_ksh.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[t.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                    {t.mpesa_receipt_number ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>

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
