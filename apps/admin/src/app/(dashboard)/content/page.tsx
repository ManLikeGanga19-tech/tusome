"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, X } from "lucide-react";
import { adminAPI, type Subject, type Lesson } from "@/lib/api";

// ── Shared helpers ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? "bg-green-700" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";
const textareaCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-y min-h-[80px]";

// ── Subject Modal ─────────────────────────────────────────────────────────────

type SubjectForm = {
  name: string;
  grade_category: string;
  description: string;
  icon: string;
  color: string;
  order: number;
};

function SubjectModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Subject;
  onClose: () => void;
  onSave: (s: Subject) => void;
}) {
  const [form, setForm] = useState<SubjectForm>({
    name: initial?.name ?? "",
    grade_category: initial?.grade_category ?? "primary",
    description: initial?.description ?? "",
    icon: initial?.icon ?? "",
    color: initial?.color ?? "",
    order: initial?.order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof SubjectForm, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        grade_category: form.grade_category,
        description: form.description || undefined,
        icon: form.icon || undefined,
        color: form.color || undefined,
        order: form.order,
      };
      const saved = initial
        ? await adminAPI.updateSubject(initial.id, payload)
        : await adminAPI.createSubject(payload);
      onSave(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {initial ? "Edit Subject" : "New Subject"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <Field label="Name *">
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
              placeholder="e.g. Mathematics"
            />
          </Field>
          <Field label="Grade Category *">
            <select
              value={form.grade_category}
              onChange={(e) => set("grade_category", e.target.value)}
              className={inputCls}
            >
              <option value="primary">Primary</option>
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={textareaCls}
              placeholder="Brief description of the subject"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Icon (emoji / text)">
              <input
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                className={inputCls}
                placeholder="📚"
              />
            </Field>
            <Field label="Color (hex)">
              <input
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                className={inputCls}
                placeholder="#22c55e"
              />
            </Field>
          </div>
          <Field label="Sort Order">
            <input
              type="number"
              value={form.order}
              onChange={(e) => set("order", parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Lesson Modal ──────────────────────────────────────────────────────────────

type LessonForm = {
  title: string;
  description: string;
  content: string;
  order: number;
  duration_minutes: number;
  is_free_preview: boolean;
  is_published: boolean;
};

function LessonModal({
  initial,
  subjectId,
  onClose,
  onSave,
}: {
  initial?: Lesson;
  subjectId: string;
  onClose: () => void;
  onSave: (l: Lesson) => void;
}) {
  const [form, setForm] = useState<LessonForm>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    content: initial?.content ?? "",
    order: initial?.order ?? 0,
    duration_minutes: initial?.duration_minutes ?? 0,
    is_free_preview: initial?.is_free_preview ?? false,
    is_published: initial?.is_published ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof LessonForm>(k: K, v: LessonForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        subject_id: subjectId,
        title: form.title,
        description: form.description || undefined,
        content: form.content || undefined,
        order: form.order,
        duration_minutes: form.duration_minutes,
        is_free_preview: form.is_free_preview,
        is_published: form.is_published,
      };
      const saved = initial
        ? await adminAPI.updateLesson(initial.id, payload)
        : await adminAPI.createLesson(payload);
      onSave(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">
            {initial ? "Edit Lesson" : "New Lesson"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <Field label="Title *">
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder="e.g. Introduction to Fractions"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={textareaCls}
              placeholder="Short description of this lesson"
            />
          </Field>
          <Field label="Content (markdown / HTML)">
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-y min-h-[120px] font-mono"
              placeholder="Lesson body content…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sort Order">
              <input
                type="number"
                value={form.order}
                onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
            <Field label="Duration (minutes)">
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) =>
                  set("duration_minutes", parseInt(e.target.value) || 0)
                }
                className={inputCls}
              />
            </Field>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.is_free_preview}
                onChange={(e) => set("is_free_preview", e.target.checked)}
                className="rounded"
              />
              Free Preview
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
                className="rounded"
              />
              Published
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────

function ConfirmDelete({
  label,
  onConfirm,
  onCancel,
}: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Delete {label}?</h2>
        <p className="text-sm text-gray-500 mb-5">
          This action cannot be undone. All related data will be permanently
          removed.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Subject Row (with lessons) ────────────────────────────────────────────────

function SubjectRow({
  subject: initial,
  onEdit,
  onDelete,
}: {
  subject: Subject;
  onEdit: (s: Subject) => void;
  onDelete: (s: Subject) => void;
}) {
  const [subject, setSubject] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoaded, setLessonsLoaded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [lessonModal, setLessonModal] = useState<
    "create" | Lesson | null
  >(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  // keep in sync when parent passes updated subject after edit
  useEffect(() => {
    setSubject(initial);
  }, [initial]);

  async function handleExpand() {
    if (!expanded && !lessonsLoaded) {
      const data = await adminAPI.listLessons(subject.slug);
      setLessons(data);
      setLessonsLoaded(true);
    }
    setExpanded((v) => !v);
  }

  async function toggleSubject(val: boolean) {
    setToggling(true);
    try {
      const updated = await adminAPI.toggleSubject(subject.id, val);
      setSubject(updated);
    } finally {
      setToggling(false);
    }
  }

  async function toggleLesson(lessonId: string, val: boolean) {
    const updated = await adminAPI.toggleLesson(lessonId, val);
    setLessons((prev) => prev.map((l) => (l.id === lessonId ? updated : l)));
  }

  function handleLessonSaved(lesson: Lesson) {
    if (lessonModal === "create") {
      setLessons((prev) => [...prev, lesson]);
      setSubject((s) => ({ ...s, lesson_count: s.lesson_count + 1 }));
    } else {
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? lesson : l)));
    }
    setLessonModal(null);
    if (!expanded) setExpanded(true);
  }

  async function confirmDeleteLesson() {
    if (!deletingLesson) return;
    await adminAPI.deleteLesson(deletingLesson.id);
    setLessons((prev) => prev.filter((l) => l.id !== deletingLesson.id));
    setSubject((s) => ({ ...s, lesson_count: Math.max(0, s.lesson_count - 1) }));
    setDeletingLesson(null);
  }

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-4 py-3">
          <button
            onClick={handleExpand}
            className="flex items-center gap-2 text-sm font-medium text-gray-900"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {subject.name}
          </button>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 capitalize">
          {subject.grade_category}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {subject.lesson_count} lessons
        </td>
        <td className="px-4 py-3">
          <Toggle
            checked={subject.is_active}
            onChange={toggleSubject}
            disabled={toggling}
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(subject)}
              className="p-1.5 text-gray-400 hover:text-green-700 rounded hover:bg-green-50 transition-colors"
              title="Edit subject"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(subject)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
              title="Delete subject"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <>
          {lessons.map((lesson) => (
            <tr key={lesson.id} className="border-b border-gray-50 bg-gray-50/50">
              <td className="px-4 py-2 pl-12 text-sm text-gray-700">
                {lesson.order}. {lesson.title}
                {lesson.is_free_preview && (
                  <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                    Free
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-xs text-gray-400">
                {lesson.duration_minutes ? `${lesson.duration_minutes} min` : "—"}
              </td>
              <td />
              <td className="px-4 py-2">
                <Toggle
                  checked={lesson.is_published}
                  onChange={(val) => toggleLesson(lesson.id, val)}
                />
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLessonModal(lesson)}
                    className="p-1.5 text-gray-400 hover:text-green-700 rounded hover:bg-green-50 transition-colors"
                    title="Edit lesson"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeletingLesson(lesson)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Delete lesson"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          <tr className="border-b border-gray-50 bg-gray-50/30">
            <td colSpan={5} className="px-4 py-2 pl-12">
              <button
                onClick={() => setLessonModal("create")}
                className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 font-medium"
              >
                <Plus size={13} />
                Add lesson
              </button>
            </td>
          </tr>
        </>
      )}

      {lessonModal !== null && (
        <LessonModal
          initial={typeof lessonModal === "string" ? undefined : lessonModal}
          subjectId={subject.id}
          onClose={() => setLessonModal(null)}
          onSave={handleLessonSaved}
        />
      )}

      {deletingLesson && (
        <ConfirmDelete
          label={`lesson "${deletingLesson.title}"`}
          onConfirm={confirmDeleteLesson}
          onCancel={() => setDeletingLesson(null)}
        />
      )}
    </>
  );
}

// ── Content Page ──────────────────────────────────────────────────────────────

export default function ContentPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "primary" | "junior" | "senior">("all");
  const [subjectModal, setSubjectModal] = useState<"create" | Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    adminAPI
      .listSubjects()
      .then(setSubjects)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all"
      ? subjects
      : subjects.filter((s) => s.grade_category === filter);

  function handleSubjectSaved(subject: Subject) {
    if (subjectModal === "create") {
      setSubjects((prev) => [...prev, subject]);
    } else {
      setSubjects((prev) =>
        prev.map((s) => (s.id === subject.id ? { ...subject, lesson_count: s.lesson_count } : s))
      );
    }
    setSubjectModal(null);
  }

  async function confirmDeleteSubject() {
    if (!deletingSubject) return;
    await adminAPI.deleteSubject(deletingSubject.id);
    setSubjects((prev) => prev.filter((s) => s.id !== deletingSubject.id));
    setDeletingSubject(null);
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage subjects and lessons
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(["all", "primary", "junior", "senior"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  filter === f
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSubjectModal("create")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            <Plus size={15} />
            New Subject
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            No subjects found.{" "}
            <button
              onClick={() => setSubjectModal("create")}
              className="text-green-700 hover:underline"
            >
              Create one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Subject
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Grade
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Lessons
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Active
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <SubjectRow
                    key={s.id}
                    subject={s}
                    onEdit={(sub) => setSubjectModal(sub)}
                    onDelete={setDeletingSubject}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {subjectModal !== null && (
        <SubjectModal
          initial={typeof subjectModal === "string" ? undefined : subjectModal}
          onClose={() => setSubjectModal(null)}
          onSave={handleSubjectSaved}
        />
      )}

      {deletingSubject && (
        <ConfirmDelete
          label={`subject "${deletingSubject.name}"`}
          onConfirm={confirmDeleteSubject}
          onCancel={() => setDeletingSubject(null)}
        />
      )}
    </div>
  );
}
