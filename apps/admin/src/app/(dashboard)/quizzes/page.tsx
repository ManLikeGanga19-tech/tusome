"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, X, BookOpen, CheckCircle, Clock } from "lucide-react";
import { adminAPI, type Quiz, type Subject } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";
const textareaCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-y min-h-[72px]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ── Quiz Modal ────────────────────────────────────────────────────────────────

type QuizForm = {
  title: string;
  description: string;
  subject_id: string;
  lesson_id: string;
  pass_score: number;
  xp_reward: number;
  time_limit_seconds: string;
  grade_category: string;
  is_published: boolean;
  randomise_order: boolean;
  max_attempts_per_day: string;
  show_correct_answers: boolean;
};

function QuizModal({
  initial,
  subjects,
  onClose,
  onSave,
}: {
  initial?: Quiz;
  subjects: Subject[];
  onClose: () => void;
  onSave: (q: Quiz) => void;
}) {
  // Pre-compute initial subject_id by searching subjects for the initial lesson
  const [form, setForm] = useState<QuizForm>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    subject_id: "",
    lesson_id: initial?.lesson_id ?? "",
    pass_score: initial?.pass_score ?? 60,
    xp_reward: initial?.xp_reward ?? 20,
    time_limit_seconds: initial?.time_limit_seconds
      ? String(initial.time_limit_seconds)
      : "",
    grade_category: initial?.grade_category ?? "",
    is_published: initial?.is_published ?? false,
    randomise_order: initial?.randomise_order ?? true,
    max_attempts_per_day: initial?.max_attempts_per_day
      ? String(initial.max_attempts_per_day)
      : "",
    show_correct_answers: initial?.show_correct_answers ?? true,
  });
  const [lessons, setLessons] = useState<import("@/lib/api").Lesson[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load lessons when subject changes
  useEffect(() => {
    if (!form.subject_id) {
      setLessons([]);
      return;
    }
    const subject = subjects.find((s) => s.id === form.subject_id);
    if (!subject) return;
    adminAPI.listLessons(subject.slug).then(setLessons).catch(() => setLessons([]));
  }, [form.subject_id, subjects]);

  const set = <K extends keyof QuizForm>(k: K, v: QuizForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        lesson_id: form.lesson_id || undefined,
        pass_score: form.pass_score,
        xp_reward: form.xp_reward,
        time_limit_seconds: form.time_limit_seconds
          ? parseInt(form.time_limit_seconds)
          : undefined,
        grade_category: form.grade_category || undefined,
        is_published: form.is_published,
        randomise_order: form.randomise_order,
        max_attempts_per_day: form.max_attempts_per_day
          ? parseInt(form.max_attempts_per_day)
          : null,
        show_correct_answers: form.show_correct_answers,
      };
      const saved = initial
        ? await adminAPI.updateQuiz(initial.id, payload)
        : await adminAPI.createQuiz(payload);
      onSave(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // Filter subjects by selected grade category for the cascading selector
  const subjectsForGrade = form.grade_category
    ? subjects.filter((s) => s.grade_category === form.grade_category)
    : subjects;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">
            {initial ? "Edit Quiz" : "New Quiz"}
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
              placeholder="e.g. Chapter 3 Quiz"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={textareaCls}
              placeholder="Optional description shown before the quiz starts"
            />
          </Field>
          <Field label="Grade Category">
            <select
              value={form.grade_category}
              onChange={(e) => {
                set("grade_category", e.target.value);
                set("subject_id", "");
                set("lesson_id", "");
              }}
              className={inputCls}
            >
              <option value="">— None —</option>
              <option value="primary">Primary</option>
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
            </select>
          </Field>

          {/* Cascading Subject → Lesson selector */}
          <div className="border border-gray-100 rounded-lg p-3 space-y-3 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Link to Lesson (optional)</p>
            <Field label="Subject">
              <select
                value={form.subject_id}
                onChange={(e) => {
                  set("subject_id", e.target.value);
                  set("lesson_id", "");
                }}
                className={inputCls}
              >
                <option value="">— No subject —</option>
                {subjectsForGrade.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lesson">
              <select
                value={form.lesson_id}
                onChange={(e) => set("lesson_id", e.target.value)}
                className={inputCls}
                disabled={!form.subject_id}
              >
                <option value="">— No lesson —</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Pass Score (%)">
              <input
                type="number"
                min={0}
                max={100}
                value={form.pass_score}
                onChange={(e) =>
                  set("pass_score", parseInt(e.target.value) || 0)
                }
                className={inputCls}
              />
            </Field>
            <Field label="XP Reward">
              <input
                type="number"
                min={0}
                value={form.xp_reward}
                onChange={(e) =>
                  set("xp_reward", parseInt(e.target.value) || 0)
                }
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Time Limit (seconds)">
              <input
                type="number"
                min={0}
                value={form.time_limit_seconds}
                onChange={(e) => set("time_limit_seconds", e.target.value)}
                className={inputCls}
                placeholder="blank = unlimited"
              />
            </Field>
            <Field label="Attempts/day (blank = unlimited)">
              <input
                type="number"
                min={1}
                value={form.max_attempts_per_day}
                onChange={(e) => set("max_attempts_per_day", e.target.value)}
                className={inputCls}
                placeholder="e.g. 3"
              />
            </Field>
          </div>

          {/* Anti-cheat toggles */}
          <div className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Anti-cheat</p>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.randomise_order}
                onChange={(e) => set("randomise_order", e.target.checked)}
                className="rounded"
              />
              Randomise question &amp; choice order
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.show_correct_answers}
                onChange={(e) => set("show_correct_answers", e.target.checked)}
                className="rounded"
              />
              Show correct answers after submission
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => set("is_published", e.target.checked)}
              className="rounded"
            />
            Published (visible to students)
          </label>
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

// ── Confirm Delete ────────────────────────────────────────────────────────────

function ConfirmDelete({
  label,
  onConfirm,
  onCancel,
}: {
  label: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Delete {label}?</h2>
        <p className="text-sm text-gray-500 mb-5">
          This will permanently delete the quiz and all its questions and
          attempts.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={go}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quiz Row ──────────────────────────────────────────────────────────────────

function QuizRow({
  quiz,
  onEdit,
  onDelete,
}: {
  quiz: Quiz;
  onEdit: (q: Quiz) => void;
  onDelete: (q: Quiz) => void;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">
        <Link
          href={`/quizzes/${quiz.id}`}
          className="font-medium text-gray-900 hover:text-green-700"
        >
          {quiz.title}
        </Link>
        {quiz.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
            {quiz.description}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 capitalize">
        {quiz.grade_category ?? "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <BookOpen size={13} />
          {quiz.question_count}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <CheckCircle size={13} />
          {quiz.pass_score}%
        </div>
      </td>
      <td className="px-4 py-3">
        {quiz.time_limit_seconds ? (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock size={13} />
            {Math.round(quiz.time_limit_seconds / 60)} min
          </div>
        ) : (
          <span className="text-xs text-gray-400">No limit</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            quiz.is_published
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {quiz.is_published ? "Published" : "Draft"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link
            href={`/quizzes/${quiz.id}`}
            className="p-1.5 text-gray-400 hover:text-green-700 rounded hover:bg-green-50 transition-colors"
            title="Edit questions"
          >
            <BookOpen size={14} />
          </Link>
          <button
            onClick={() => onEdit(quiz)}
            className="p-1.5 text-gray-400 hover:text-green-700 rounded hover:bg-green-50 transition-colors"
            title="Edit quiz settings"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(quiz)}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
            title="Delete quiz"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | Quiz | null>(null);
  const [deleting, setDeleting] = useState<Quiz | null>(null);
  const [filterGrade, setFilterGrade] = useState<string>("all");

  useEffect(() => {
    Promise.all([adminAPI.listQuizzes(), adminAPI.listSubjects()])
      .then(([q, s]) => {
        setQuizzes(q);
        setSubjects(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filterGrade === "all"
      ? quizzes
      : quizzes.filter((q) => q.grade_category === filterGrade);

  function handleSaved(quiz: Quiz) {
    if (modal === "create") {
      setQuizzes((prev) => [quiz, ...prev]);
    } else {
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? quiz : q)));
    }
    setModal(null);
  }

  async function confirmDelete() {
    if (!deleting) return;
    await adminAPI.deleteQuiz(deleting.id);
    setQuizzes((prev) => prev.filter((q) => q.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage quizzes linked to lessons
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(["all", "primary", "junior", "senior"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setFilterGrade(g)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  filterGrade === g
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <button
            onClick={() => setModal("create")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            <Plus size={15} />
            New Quiz
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            No quizzes found.{" "}
            <button
              onClick={() => setModal("create")}
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Quiz</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Grade</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Questions</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Pass</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <QuizRow
                    key={q.id}
                    quiz={q}
                    onEdit={(quiz) => setModal(quiz)}
                    onDelete={setDeleting}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <QuizModal
          initial={typeof modal === "string" ? undefined : modal}
          subjects={subjects}
          onClose={() => setModal(null)}
          onSave={handleSaved}
        />
      )}

      {deleting && (
        <ConfirmDelete
          label={`"${deleting.title}"`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
