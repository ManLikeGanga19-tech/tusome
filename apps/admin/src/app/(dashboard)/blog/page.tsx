"use client";
import { useEffect, useState } from "react";
import { Plus, X, Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { adminAPI, type BlogPost } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const CATEGORY_OPTIONS = [
  "general", "study-tips", "cbc-guide", "career-advice", "student-life", "exam-prep",
];

const BLANK: Partial<BlogPost> = {
  title: "", slug: "", excerpt: "", content: "", author_name: "Tusome Team",
  category: "general", read_time_minutes: 5, is_published: false, is_featured: false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BlogPage() {
  const { admin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<Partial<BlogPost>>(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canWrite = admin?.role === "super_admin" || admin?.role === "content_editor";

  async function load() {
    setLoading(true);
    try {
      const data = await adminAPI.listBlogPosts();
      setPosts(data.results);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(BLANK);
    setError("");
    setShowForm(true);
  }

  function openEdit(post: BlogPost) {
    setEditing(post);
    setForm(post);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await adminAPI.updateBlogPost(editing.id, form);
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await adminAPI.createBlogPost(form);
        setPosts((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(post: BlogPost) {
    const updated = await adminAPI.updateBlogPost(post.id, { is_published: !post.is_published });
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function toggleFeatured(post: BlogPost) {
    const updated = await adminAPI.updateBlogPost(post.id, { is_featured: !post.is_featured });
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    await adminAPI.deleteBlogPost(post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setTotal((t) => t - 1);
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-1">{total} articles</p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
          >
            <Plus size={14} /> New Article
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">No blog posts yet</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Author</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Views</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Published</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Featured</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-xs">{p.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.author_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.view_count}</td>
                  <td className="px-4 py-3">
                    {canWrite ? (
                      <button onClick={() => togglePublish(p)} title={p.is_published ? "Unpublish" : "Publish"}>
                        {p.is_published ? (
                          <Eye size={16} className="text-green-600" />
                        ) : (
                          <EyeOff size={16} className="text-gray-400" />
                        )}
                      </button>
                    ) : (
                      <span className={`text-xs font-medium ${p.is_published ? "text-green-600" : "text-gray-400"}`}>
                        {p.is_published ? "Yes" : "No"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {canWrite ? (
                      <button onClick={() => toggleFeatured(p)} title={p.is_featured ? "Unfeature" : "Feature"}>
                        <Star size={16} className={p.is_featured ? "text-amber-500 fill-amber-400" : "text-gray-300"} />
                      </button>
                    ) : (
                      <Star size={16} className={p.is_featured ? "text-amber-500 fill-amber-400" : "text-gray-300"} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {canWrite && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs text-gray-500 hover:text-green-700 underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="text-gray-300 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? "Edit Article" : "New Article"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    required
                    value={form.title ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    required
                    value={form.slug ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category ?? "general"}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    value={form.author_name ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Read time (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.read_time_minutes ?? 5}
                    onChange={(e) => setForm((f) => ({ ...f, read_time_minutes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    rows={2}
                    value={form.excerpt ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
                  <textarea
                    rows={8}
                    value={form.content ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-700 resize-y"
                  />
                </div>
                <div className="flex items-center gap-4 col-span-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_published ?? false}
                      onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                      className="accent-green-700"
                    />
                    Publish immediately
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured ?? false}
                      onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                      className="accent-green-700"
                    />
                    Feature on homepage
                  </label>
                </div>
              </div>

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
                  {submitting ? "Saving…" : editing ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
