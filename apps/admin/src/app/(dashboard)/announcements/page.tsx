"use client";
import { useEffect, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { adminAPI, type Announcement } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const TYPE_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  success: "bg-green-100 text-green-700",
};

const BLANK: Partial<Announcement> = {
  title: "", message: "", announcement_type: "info",
  target_audience: "all", is_active: true,
};

export default function AnnouncementsPage() {
  const { admin } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<Partial<Announcement>>(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canWrite = admin?.role === "super_admin" || admin?.role === "support_agent";

  async function load() {
    setLoading(true);
    try {
      setAnnouncements(await adminAPI.listAnnouncements());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(BLANK); setError(""); setShowForm(true); }
  function openEdit(a: Announcement) { setEditing(a); setForm(a); setError(""); setShowForm(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await adminAPI.updateAnnouncement(editing.id, form);
        setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await adminAPI.createAnnouncement(form);
        setAnnouncements((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(a: Announcement) {
    const updated = await adminAPI.updateAnnouncement(a.id, { is_active: !a.is_active });
    setAnnouncements((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function handleDelete(a: Announcement) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    await adminAPI.deleteAnnouncement(a.id);
    setAnnouncements((prev) => prev.filter((x) => x.id !== a.id));
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Push messages to students on the web app</p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors">
            <Plus size={14} /> New Announcement
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-gray-400">No announcements yet</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className={`bg-white border rounded-xl p-4 ${a.is_active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[a.announcement_type] ?? "bg-gray-100 text-gray-600"}`}>
                      {a.announcement_type}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                      → {a.target_audience}
                    </span>
                    <span className={`text-xs font-medium ${a.is_active ? "text-green-600" : "text-gray-400"}`}>
                      {a.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{a.message}</p>
                  {(a.starts_at || a.ends_at) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {a.starts_at && `From ${new Date(a.starts_at).toLocaleDateString()}`}
                      {a.ends_at && ` until ${new Date(a.ends_at).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
                {canWrite && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleActive(a)} className={`text-xs underline ${a.is_active ? "text-gray-500 hover:text-red-500" : "text-gray-400 hover:text-green-700"}`}>
                      {a.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => openEdit(a)} className="text-xs text-gray-500 hover:text-green-700 underline">Edit</button>
                    <button onClick={() => handleDelete(a)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? "Edit Announcement" : "New Announcement"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea required rows={3} value={form.message ?? ""} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.announcement_type ?? "info"} onChange={(e) => setForm((f) => ({ ...f, announcement_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select value={form.target_audience ?? "all"} onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700">
                    <option value="all">All users</option>
                    <option value="trial">Trial only</option>
                    <option value="active">Active only</option>
                    <option value="expired">Expired only</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-green-700" />
                Active immediately
              </label>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 disabled:opacity-50">
                  {submitting ? "Saving…" : editing ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
