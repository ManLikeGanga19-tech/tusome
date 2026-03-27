"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, BookOpen } from "lucide-react";
import { adminAPI, type AnalyticsOverview, type DailyMetric, type ContentGapReport, type SubjectGapItem } from "@/lib/api";

// ── Simple SVG line chart ─────────────────────────────────────────────────────

function LineChart({ data, color = "#15803d", height = 120 }: {
  data: DailyMetric[];
  color?: string;
  height?: number;
}) {
  if (!data.length) return <div className="h-32 flex items-center justify-center text-xs text-gray-400">No data</div>;

  const W = 600;
  const H = height;
  const pad = { top: 8, right: 8, bottom: 24, left: 40 };
  const vals = data.map((d) => d.value);
  const maxV = Math.max(...vals, 1);
  const minV = Math.min(...vals, 0);
  const range = maxV - minV || 1;
  const xStep = (W - pad.left - pad.right) / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * xStep,
    y: H - pad.bottom - ((d.value - minV) / range) * (H - pad.top - pad.bottom),
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${path} L${points[points.length - 1].x},${H - pad.bottom} L${points[0].x},${H - pad.bottom} Z`;

  // Tick labels: first, middle, last
  const tickIdxs = [0, Math.floor(data.length / 2), data.length - 1].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Area */}
      <path d={areaPath} fill={color} fillOpacity={0.08} />
      {/* Line */}
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {/* X labels */}
      {tickIdxs.map((idx) => (
        <text
          key={idx}
          x={points[idx].x}
          y={H - 4}
          textAnchor="middle"
          fontSize={9}
          fill="#9ca3af"
        >
          {data[idx].date.slice(5)}
        </text>
      ))}
      {/* Y max label */}
      <text x={pad.left - 4} y={pad.top + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
        {maxV >= 1000 ? `${(maxV / 1000).toFixed(1)}k` : maxV}
      </text>
    </svg>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

function BarChart({ data, color = "#15803d", height = 120 }: {
  data: DailyMetric[];
  color?: string;
  height?: number;
}) {
  if (!data.length) return <div className="h-32 flex items-center justify-center text-xs text-gray-400">No data</div>;

  const W = 600;
  const H = height;
  const pad = { top: 8, right: 8, bottom: 24, left: 44 };
  const vals = data.map((d) => d.value);
  const maxV = Math.max(...vals, 1);
  const barW = Math.max(2, (W - pad.left - pad.right) / data.length - 2);
  const gap = (W - pad.left - pad.right - barW * data.length) / Math.max(data.length - 1, 1);
  const chartH = H - pad.top - pad.bottom;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = (d.value / maxV) * chartH;
        const x = pad.left + i * (barW + gap);
        const y = H - pad.bottom - barH;
        return (
          <rect key={i} x={x} y={y} width={barW} height={Math.max(barH, 1)} fill={color} rx={2} fillOpacity={0.85} />
        );
      })}
      {/* Y max */}
      <text x={pad.left - 4} y={pad.top + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
        {maxV >= 1000 ? `${(maxV / 1000).toFixed(1)}k` : maxV}
      </text>
      {/* X tick labels */}
      {[0, Math.floor(data.length / 2), data.length - 1]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((idx) => (
          <text
            key={idx}
            x={pad.left + idx * (barW + gap) + barW / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="#9ca3af"
          >
            {data[idx].date.slice(5)}
          </text>
        ))}
    </svg>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ── Content Gap Tab ───────────────────────────────────────────────────────────

const GRADE_LABELS: Record<string, string> = {
  primary: "Primary (Gr 4–6)",
  junior: "Junior Secondary (Gr 7–9)",
  senior: "Senior Secondary (Gr 10–12)",
};
const GRADE_COLORS: Record<string, string> = {
  primary: "bg-green-500",
  junior: "bg-blue-500",
  senior: "bg-purple-500",
};

function SubjectRow({ s }: { s: SubjectGapItem }) {
  const pubPct = s.total_lessons > 0 ? Math.round((s.published_lessons / s.total_lessons) * 100) : 0;
  return (
    <tr className={`border-b border-gray-50 ${!s.is_active ? "opacity-40" : ""}`}>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-800">{s.name}</span>
          {s.is_under_served && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
              needs content
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600">{s.total_lessons}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${pubPct}%` }} />
          </div>
          <span className="text-xs text-gray-500 w-16 shrink-0">
            {s.published_lessons}/{s.total_lessons}
          </span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600">{s.unique_completions.toLocaleString()}</td>
      <td className="px-4 py-2.5 text-sm text-gray-600">{s.completion_rate}%</td>
    </tr>
  );
}

function ContentGapTab() {
  const [report, setReport] = useState<ContentGapReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminAPI.contentGaps()
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-gray-400 py-8">Loading…</div>;
  if (error) return <div className="text-sm text-red-500 py-8">{error}</div>;
  if (!report) return null;

  const grades = ["primary", "junior", "senior"] as const;

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Subjects</p>
          <p className="text-2xl font-bold text-gray-900">{report.total_subjects}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Under-served Subjects</p>
          <p className={`text-2xl font-bold ${report.under_served_count > 0 ? "text-amber-600" : "text-gray-900"}`}>
            {report.under_served_count}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">fewer than 5 published lessons</p>
        </div>
        {grades.slice(0, 2).map((g) => {
          const t = report.grade_totals[g];
          return t ? (
            <div key={g} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-1">{GRADE_LABELS[g]}</p>
              <p className="text-2xl font-bold text-gray-900">{t.published_lessons}</p>
              <p className="text-xs text-gray-400 mt-0.5">published lessons</p>
            </div>
          ) : null;
        })}
      </div>

      {/* Grade sections */}
      {grades.map((grade) => {
        const subjects = report.subjects_by_grade[grade] ?? [];
        const totals = report.grade_totals[grade];
        if (subjects.length === 0) return null;
        return (
          <div key={grade} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 gap-1">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${GRADE_COLORS[grade]}`} />
                <span className="text-sm font-semibold text-gray-800">{GRADE_LABELS[grade]}</span>
              </div>
              {totals && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>{totals.subjects} subjects</span>
                  <span>{totals.published_lessons}/{totals.total_lessons} lessons published</span>
                  <span>{totals.unique_completions.toLocaleString()} completions</span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Subject</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Total Lessons</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Published</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Unique Completions</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => <SubjectRow key={s.id} s={s} />)}
              </tbody>
            </table></div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

const TABS = [
  { id: "growth", label: "Growth & Revenue" },
  { id: "content", label: "Content Gaps" },
] as const;

export default function AnalyticsPage() {
  const [tab, setTab] = useState<"growth" | "content">("growth");
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tab !== "growth") return;
    setLoading(true);
    setError("");
    adminAPI
      .analyticsOverview(days)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days, tab]);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Platform growth, revenue, and content health</p>
        </div>
        {tab === "growth" && (
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  days === opt.value ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-green-700 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.id === "content" && <BookOpen size={13} className="inline mr-1.5 -mt-0.5" />}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "content" ? (
        <ContentGapTab />
      ) : (
        <>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          {loading || !data ? (
            <div className="text-sm text-gray-400">Loading…</div>
          ) : (
            <>
              {/* Summary pills */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatPill
                  label="Trial Conversion Rate"
                  value={`${data.trial_conversion_rate}%`}
                  color="text-green-700"
                />
                <StatPill
                  label="Churn Rate (this month)"
                  value={`${data.churn_rate}%`}
                  color={data.churn_rate > 10 ? "text-red-600" : "text-gray-900"}
                />
                <StatPill
                  label="Total Revenue"
                  value={`KSh ${data.total_revenue_ksh.toLocaleString()}`}
                  color="text-green-700"
                />
                <StatPill
                  label="Avg Revenue / User"
                  value={`KSh ${data.avg_revenue_per_user_ksh.toLocaleString()}`}
                  color="text-gray-900"
                />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">New Registrations</h2>
                  <LineChart data={data.registrations_by_day} color="#15803d" height={140} />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">Revenue (KSh)</h2>
                  <BarChart data={data.revenue_by_day} color="#15803d" height={140} />
                </div>
              </div>

              {/* Grade breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Active Users by Grade Tier</h2>
                <div className="space-y-3">
                  {(
                    [
                      { label: "Primary (Gr 4–6)", value: data.grade_breakdown.primary, color: "bg-green-500" },
                      { label: "Junior Secondary (Gr 7–9)", value: data.grade_breakdown.junior, color: "bg-blue-500" },
                      { label: "Senior Secondary (Gr 10–12)", value: data.grade_breakdown.senior, color: "bg-purple-500" },
                    ] as const
                  ).map(({ label, value, color }) => {
                    const total =
                      data.grade_breakdown.primary +
                      data.grade_breakdown.junior +
                      data.grade_breakdown.senior;
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{label}</span>
                          <span>{value.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
