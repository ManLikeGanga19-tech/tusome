"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { adminAPI, type Subject, type Lesson } from "@/lib/api";

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
        checked ? "bg-gray-900" : "bg-gray-300"
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

function SubjectRow({ subject: initial }: { subject: Subject }) {
  const [subject, setSubject] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoaded, setLessonsLoaded] = useState(false);
  const [toggling, setToggling] = useState(false);

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
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? updated : l))
    );
  }

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-4 py-3">
          <button
            onClick={handleExpand}
            className="flex items-center gap-2 text-sm font-medium text-gray-900"
          >
            {expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
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
      </tr>

      {expanded &&
        lessons.map((lesson) => (
          <tr
            key={lesson.id}
            className="border-b border-gray-50 bg-gray-50/50"
          >
            <td className="px-4 py-2 pl-12 text-sm text-gray-700">
              {lesson.order}. {lesson.title}
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
          </tr>
        ))}
    </>
  );
}

export default function ContentPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "junior" | "senior">("all");

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

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage subjects and lessons
          </p>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["all", "junior", "senior"] as const).map((f) => (
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
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Loading…
          </div>
        ) : (
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <SubjectRow key={s.id} subject={s} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
