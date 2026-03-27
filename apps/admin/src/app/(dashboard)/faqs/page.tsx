"use client";
import { useEffect, useState } from "react";
import { Plus, X, Trash2, GripVertical } from "lucide-react";
import { adminAPI, type Faq } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const FAQ_CATEGORIES = ["general", "technical", "billing", "partnership", "feedback"];

const BLANK: Partial<Faq> = {
  question: "", answer: "", category: "general", display_order: 0, is_published: true,
};

export default function FaqsPage() {
  const { admin } = useAuth();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState<Partial<Faq>>(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const canWrite = admin?.role === "super_admin" || admin?.role === "content_editor";

  async function load() {
    setLoading(true);
    try {
      setFaqs(await adminAPI.listFaqs());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(BLANK); setError(""); setShowForm(true); }
  function openEdit(f: Faq) { setEditing(f); setForm(f); setError(""); setShowForm(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await adminAPI.updateFaq(editing.id, form);
        setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } else {
        const created = await adminAPI.createFaq(form);
        setFaqs((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(faq: Faq) {
    const updated = await adminAPI.updateFaq(faq.id, { is_published: !faq.is_published });
    setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }

  async function handleDelete(faq: Faq) {
    if (!confirm("Delete this FAQ?")) return;
    await adminAPI.deleteFaq(faq.id);
    setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
  }

  const filtered = filterCategory === "all"
    ? faqs
    : faqs.filter((f) => f.category === filterCategory);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
          <p className="text-sm text-gray-500 mt-1">{faqs.length} questions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
            {(["all", ...FAQ_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  filterCategory === c
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {canWrite && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
            >
              <Plus size={14} /> Add FAQ
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400">No FAQs in this category</p>
        ) : (
          filtered.map((faq) => (
            <div
              key={faq.id}
              className={`bg-white border rounded-xl p-4 ${faq.is_published ? "border-gray-200" : "border-gray-100 opacity-60"}`}
            >
              <div className="flex items-start gap-3">
                <GripVertical size={16} className="text-gray-300 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded capitalize">
                      {faq.category}
                    </span>
                    <span className="text-xs text-gray-400">#{faq.display_order}</span>
                    {!faq.is_published && (
                      <span className="text-xs text-gray-400 italic">hidden</span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{faq.question}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
                </div>
                {canWrite && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => togglePublish(faq)}
                      className={`text-xs underline ${faq.is_published ? "text-gray-400 hover:text-gray-700" : "text-green-600 hover:text-green-800"}`}
                    >
                      {faq.is_published ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => openEdit(faq)}
                      className="text-xs text-gray-500 hover:text-green-700 underline"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(faq)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? "Edit FAQ" : "Add FAQ"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  required
                  value={form.question ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea
                  required
                  rows={4}
                  value={form.answer ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category ?? "general"}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                  >
                    {FAQ_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={form.display_order ?? 0}
                    onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                  className="accent-green-700"
                />
                Published (visible on website)
              </label>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
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
