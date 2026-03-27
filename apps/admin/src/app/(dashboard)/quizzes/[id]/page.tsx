"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus, Trash2, X, ChevronDown, ChevronRight, ArrowLeft, Check,
} from "lucide-react";
import { adminAPI, type QuizDetail, type QuizQuestion, type QuizChoice } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";
const textareaCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-y";

// ── Add Question Modal ────────────────────────────────────────────────────────

function AddQuestionModal({
  quizId,
  order,
  onClose,
  onSave,
}: {
  quizId: string;
  order: number;
  onClose: () => void;
  onSave: (q: QuizQuestion) => void;
}) {
  const [text, setText] = useState("");
  const [type, setType] = useState<"mcq" | "true_false">("mcq");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const q = await adminAPI.createQuestion(quizId, {
        question_text: text,
        question_type: type,
        explanation: explanation || undefined,
        points,
        order,
      });
      // Initialise with empty choices array
      onSave({ ...q, choices: [] });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Add Question</h2>
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
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`${textareaCls} min-h-[72px]`}
              placeholder="Enter the question…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "mcq" | "true_false")}
                className={inputCls}
              >
                <option value="mcq">Multiple Choice</option>
                <option value="true_false">True / False</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Points
              </label>
              <input
                type="number"
                min={1}
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Explanation (shown after answering)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className={`${textareaCls} min-h-[60px]`}
              placeholder="Why is the correct answer correct?"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
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
              {saving ? "Adding…" : "Add Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Choice Row ────────────────────────────────────────────────────────────────

function ChoiceRow({
  choice,
  quizId,
  questionId,
  onUpdate,
  onDelete,
}: {
  choice: QuizChoice;
  quizId: string;
  questionId: string;
  onUpdate: (c: QuizChoice) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(choice.choice_text);
  const [correct, setCorrect] = useState(choice.is_correct);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await adminAPI.updateChoice(quizId, questionId, choice.id, {
        choice_text: text,
        is_correct: correct,
      });
      onUpdate(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    await adminAPI.deleteChoice(quizId, questionId, choice.id);
    onDelete(choice.id);
  }

  async function toggleCorrect() {
    const updated = await adminAPI.updateChoice(quizId, questionId, choice.id, {
      is_correct: !choice.is_correct,
    });
    onUpdate(updated);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <button
          onClick={() => {
            setCorrect((v) => !v);
          }}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            correct
              ? "border-green-600 bg-green-600"
              : "border-gray-300 bg-white"
          }`}
        >
          {correct && <Check size={11} className="text-white" />}
        </button>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          onClick={save}
          disabled={saving}
          className="text-xs px-2.5 py-1 bg-green-700 text-white rounded-lg disabled:opacity-50"
        >
          {saving ? "…" : "Save"}
        </button>
        <button
          onClick={() => {
            setText(choice.choice_text);
            setCorrect(choice.is_correct);
            setEditing(false);
          }}
          className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1.5 group">
      <button
        onClick={toggleCorrect}
        title={choice.is_correct ? "Mark as incorrect" : "Mark as correct"}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          choice.is_correct
            ? "border-green-600 bg-green-600"
            : "border-gray-300 bg-white hover:border-green-400"
        }`}
      >
        {choice.is_correct && <Check size={11} className="text-white" />}
      </button>
      <span
        className={`flex-1 text-sm ${
          choice.is_correct ? "text-gray-900 font-medium" : "text-gray-600"
        }`}
      >
        {choice.choice_text}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-green-700 px-1"
        >
          Edit
        </button>
        <button
          onClick={remove}
          className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Add Choice Inline ─────────────────────────────────────────────────────────

function AddChoiceInline({
  quizId,
  questionId,
  nextOrder,
  onAdded,
}: {
  quizId: string;
  questionId: string;
  nextOrder: number;
  onAdded: (c: QuizChoice) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [correct, setCorrect] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const c = await adminAPI.createChoice(quizId, questionId, {
        choice_text: text,
        is_correct: correct,
        order: nextOrder,
      });
      onAdded(c);
      setText("");
      setCorrect(false);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 mt-1"
      >
        <Plus size={12} />
        Add choice
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1.5 bg-gray-50 rounded-lg px-3 py-2">
      <button
        onClick={() => setCorrect((v) => !v)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          correct ? "border-green-600 bg-green-600" : "border-gray-300 bg-white"
        }`}
      >
        {correct && <Check size={11} className="text-white" />}
      </button>
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="Choice text…"
        className="flex-1 text-sm bg-transparent border-none outline-none"
      />
      <button
        onClick={save}
        disabled={saving || !text.trim()}
        className="text-xs px-2.5 py-1 bg-green-700 text-white rounded-lg disabled:opacity-50"
      >
        {saving ? "…" : "Add"}
      </button>
      <button
        onClick={() => {
          setOpen(false);
          setText("");
          setCorrect(false);
        }}
        className="text-gray-400 hover:text-gray-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  quizId,
  onDelete,
  onUpdate,
}: {
  question: QuizQuestion;
  quizId: string;
  onDelete: (id: string) => void;
  onUpdate: (q: QuizQuestion) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [choices, setChoices] = useState<QuizChoice[]>(question.choices);

  function updateChoice(c: QuizChoice) {
    setChoices((prev) => prev.map((ch) => (ch.id === c.id ? c : ch)));
    onUpdate({ ...question, choices: choices.map((ch) => (ch.id === c.id ? c : ch)) });
  }

  function deleteChoice(id: string) {
    setChoices((prev) => prev.filter((c) => c.id !== id));
  }

  function addChoice(c: QuizChoice) {
    setChoices((prev) => [...prev, c]);
  }

  async function deleteQuestion() {
    await adminAPI.deleteQuestion(quizId, question.id);
    onDelete(question.id);
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3 bg-white">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{question.question_text}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400 capitalize">
              {question.question_type === "true_false" ? "True / False" : "Multiple Choice"}
            </span>
            <span className="text-xs text-gray-400">
              {question.points} pt{question.points !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-gray-400">
              {choices.length} choice{choices.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <button
          onClick={deleteQuestion}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
          title="Delete question"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/40">
          {choices.length === 0 ? (
            <p className="text-xs text-gray-400 mb-2">No choices yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {choices.map((c) => (
                <ChoiceRow
                  key={c.id}
                  choice={c}
                  quizId={quizId}
                  questionId={question.id}
                  onUpdate={updateChoice}
                  onDelete={deleteChoice}
                />
              ))}
            </div>
          )}
          <AddChoiceInline
            quizId={quizId}
            questionId={question.id}
            nextOrder={choices.length}
            onAdded={addChoice}
          />
          {question.explanation && (
            <p className="mt-3 text-xs text-gray-500 italic border-t border-gray-100 pt-3">
              Explanation: {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Quiz Editor Page ──────────────────────────────────────────────────────────

export default function QuizEditorPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);

  useEffect(() => {
    adminAPI
      .getQuiz(quizId)
      .then(setQuiz)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [quizId]);

  function handleQuestionAdded(q: QuizQuestion) {
    setQuiz((prev) => prev && { ...prev, questions: [...prev.questions, q] });
    setAddingQuestion(false);
  }

  function handleQuestionDeleted(id: string) {
    setQuiz((prev) =>
      prev && { ...prev, questions: prev.questions.filter((q) => q.id !== id) }
    );
  }

  function handleQuestionUpdated(q: QuizQuestion) {
    setQuiz((prev) =>
      prev && { ...prev, questions: prev.questions.map((x) => (x.id === q.id ? q : x)) }
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-sm text-gray-400">Loading quiz…</div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-500 mb-4">{error || "Quiz not found"}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-green-700 hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 mb-4"
        >
          <ArrowLeft size={14} /> Back to quizzes
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>Pass: {quiz.pass_score}%</span>
              <span>XP: {quiz.xp_reward}</span>
              {quiz.time_limit_seconds && (
                <span>{Math.round(quiz.time_limit_seconds / 60)} min limit</span>
              )}
              <span
                className={`font-medium ${
                  quiz.is_published ? "text-green-600" : "text-gray-400"
                }`}
              >
                {quiz.is_published ? "Published" : "Draft"}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-400 flex-shrink-0">
            {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {quiz.questions.length === 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-6 py-10 text-center">
            <p className="text-sm text-gray-400 mb-2">
              No questions yet. Add your first question below.
            </p>
          </div>
        )}
        {quiz.questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            quizId={quizId}
            onDelete={handleQuestionDeleted}
            onUpdate={handleQuestionUpdated}
          />
        ))}
      </div>

      {/* Add Question */}
      <div className="mt-4">
        <button
          onClick={() => setAddingQuestion(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border-2 border-dashed border-green-300 text-green-700 hover:border-green-500 hover:bg-green-50 transition-colors w-full justify-center"
        >
          <Plus size={15} />
          Add Question
        </button>
      </div>

      {addingQuestion && (
        <AddQuestionModal
          quizId={quizId}
          order={quiz.questions.length}
          onClose={() => setAddingQuestion(false)}
          onSave={handleQuestionAdded}
        />
      )}
    </div>
  );
}
