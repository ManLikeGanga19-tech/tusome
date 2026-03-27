"use client";
import { useEffect, useState } from "react";
import { Plus, X, Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { adminAPI, type SuccessStory } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const ROLE_OPTIONS = ["student", "teacher", "parent"];

const BLANK: Partial<SuccessStory> = {
  student_name: "", role: "student", grade_level: "", location: "",
  story_text: "", achievement: "", impact: "", is_published: false, is_featured: false,
};

const ROLE_COLORS: Record<string, string> = {
  student: "bg-blue-100 text-blue-700",
  teacher: "bg-purple-100 text-purple-700",
  parent: "bg-orange-100 text-orange-700",
};

export default function StoriesPage() {
  const { admin } = useAuth();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SuccessStory | null>(null);
  const [form, setForm] = useState<Partial<SuccessStory>>(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canWrite = admin?.role === "super_admin" || admin?.role === "content_editor";

  async function load() {
    setLoading(true);
    try {
      const data = await adminAPI.listStories();
      setStories(data.results);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(BLANK); setError(""); setShowForm(true); }
  function openEdit(s: SuccessStory) { setEditing(s); setForm(s); setError(""); setShowForm(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await adminAPI.updateStory(editing.id, form);
        setStories((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await adminAPI.createStory(form);
        setStories((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(s: SuccessStory) {
    const updated = await adminAPI.updateStory(s.id, { is_published: !s.is_published });
    setStories((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function toggleFeatured(s: SuccessStory) {
    const updated = await adminAPI.updateStory(s.id, { is_featured: !s.is_featured });
    setStories((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function handleDelete(s: SuccessStory) {
    if (!confirm(`Delete story from "${s.student_name}"?`)) return;
    await adminAPI.deleteStory(s.id);
    setStories((prev) => prev.filter((x) => x.id !== s.id));
    setTotal((t) => t - 1);
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Success Stories</h1>
          <p className="text-sm text-gray-500 mt-1">{total} stories</p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
          >
            <Plus size={14} /> Add Story
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : stories.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">No stories yet</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Published</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Featured</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.student_name}</p>
                    {s.grade_level && <p className="text-xs text-gray-400">{s.grade_level}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[s.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    {canWrite ? (
                      <button onClick={() => togglePublish(s)}>
                        {s.is_published ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-gray-400" />}
                      </button>
                    ) : (
                      <span className={`text-xs font-medium ${s.is_published ? "text-green-600" : "text-gray-400"}`}>
                        {s.is_published ? "Yes" : "No"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {canWrite ? (
                      <button onClick={() => toggleFeatured(s)}>
                        <Star size={16} className={s.is_featured ? "text-amber-500 fill-amber-400" : "text-gray-300"} />
                      </button>
                    ) : (
                      <Star size={16} className={s.is_featured ? "text-amber-500 fill-amber-400" : "text-gray-300"} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {canWrite && (
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="text-xs text-gray-500 hover:text-green-700 underline">Edit</button>
                        <button onClick={() => handleDelete(s)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? "Edit Story" : "Add Story"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-3 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required value={form.student_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role ?? "student"} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700">
                    {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <input value={form.grade_level ?? ""} onChange={(e) => setForm((f) => ({ ...f, grade_level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={form.location ?? ""} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Story</label>
                  <textarea required rows={4} value={form.story_text ?? ""} onChange={(e) => setForm((f) => ({ ...f, story_text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achievement</label>
                  <input value={form.achievement ?? ""} onChange={(e) => setForm((f) => ({ ...f, achievement: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                  <input value={form.impact ?? ""} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
                </div>
                <div className="flex items-center gap-4 col-span-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.is_published ?? false} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} className="accent-green-700" />
                    Publish
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured ?? false} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="accent-green-700" />
                    Feature
                  </label>
                </div>
              </div>
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
