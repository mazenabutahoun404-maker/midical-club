import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../../types/content";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useExamQuery, useExams, useExamError } from "./useExams";
export function CustomExamBuilder({
  course,
  close,
}: {
  course: Course;
  close: () => void;
}) {
  const { t } = useLocale(),
    { base, service, refresh } = useExams(),
    navigate = useNavigate(),
    errorText = useExamError();
  const [title, setTitle] = useState(
      t({ en: "My focused practice", ar: "تدريبي المركز" }),
    ),
    [count, setCount] = useState(1),
    [shuffle, setShuffle] = useState(true),
    [batch, setBatch] = useState("");
  const [chapters, setChapters] = useState<string[]>([]),
    [lectures, setLectures] = useState<string[]>([]),
    [doctors, setDoctors] = useState<string[]>([]),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const filters = { batch, chapters, lectures, doctors };
  const pool = useExamQuery(
    "custom-options",
    (signal) => service.customOptions(course.id, filters, signal),
    `${course.id}:${JSON.stringify(filters)}`,
  );
  const total = pool.data?.matchedCount || 0;
  const choices = [
    {
      label: { en: "Chapters", ar: "الفصول" },
      values: pool.data?.chapters || [],
      selected: chapters,
      set: setChapters,
    },
    {
      label: { en: "Lectures", ar: "المحاضرات" },
      values: pool.data?.lectures || [],
      selected: lectures,
      set: setLectures,
    },
    {
      label: { en: "Doctors", ar: "المحاضرون" },
      values: pool.data?.doctors || [],
      selected: doctors,
      set: setDoctors,
    },
  ];
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || count < 1 || count > Math.min(total, 100)) {
      setError(
        t({
          en: "Choose a title and a question count within the matching pool.",
          ar: "اختر اسماً وعدد أسئلة ضمن المجموعة المطابقة.",
        }),
      );
      return;
    }
    setPending(true);
    setError("");
    try {
      const set = await service.custom({
        courseId: course.id,
        count,
        chapters,
        lectures,
        doctors,
        batch,
        shuffle,
        title,
      });
      await refresh();
      close();
      navigate(`${base}/set/${set.id}`);
    } catch (e) {
      setError(errorText(e));
      setPending(false);
    }
  }
  return (
    <Modal
      open
      onClose={close}
      title={t({ en: "Build a focused session", ar: "إنشاء جلسة مركزة" })}
      description={t(course.title)}
      className="exam-builder-dialog"
      initialFocus="#exam-custom-title"
    >
      <form className="exam-form" onSubmit={submit}>
        <label>
          <span>{t({ en: "Session title", ar: "اسم الجلسة" })}</span>
          <input
            id="exam-custom-title"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <div className="exam-form-pair">
          <label>
            <span>{t({ en: "Questions", ar: "عدد الأسئلة" })}</span>
            <input
              type="number"
              min={1}
              max={Math.min(total, 100)}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              required
            />
          </label>
          <label>
            <span>{t({ en: "Batch", ar: "الدفعة" })}</span>
            <select value={batch} onChange={(e) => setBatch(e.target.value)}>
              <option value="">
                {t({ en: "All batches", ar: "كل الدفعات" })}
              </option>
              {pool.data?.batches.map((b) => (
                <option key={b.en} value={b.en}>
                  {t(b)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="exam-pool-count" role="status">
          {pool.isPending
            ? t({
                en: "Finding matching questions…",
                ar: "جارٍ البحث عن الأسئلة المطابقة…",
              })
            : `${total} ${t({ en: "questions match your filters", ar: "سؤالاً يطابق مرشحاتك" })}`}
        </p>
        {choices
          .filter((group) => group.values.length)
          .map((group) => (
            <details key={group.label.en} className="exam-filter-group">
              <summary>
                {t(group.label)} ·{" "}
                {group.selected.length || t({ en: "All", ar: "الكل" })}
              </summary>
              <div>
                {group.values.map(({ value, label }) => (
                  <label key={value}>
                    <input
                      type="checkbox"
                      checked={group.selected.includes(value)}
                      onChange={() =>
                        group.set((previous) =>
                          previous.includes(value)
                            ? previous.filter((v) => v !== value)
                            : [...previous, value],
                        )
                      }
                    />
                    <span>{t(label)}</span>
                  </label>
                ))}
              </div>
            </details>
          ))}
        <label className="exam-check">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
          />
          <span>
            {t({ en: "Shuffle the questions", ar: "ترتيب الأسئلة عشوائياً" })}
          </span>
        </label>
        {(error || pool.isError) && (
          <p className="exam-error" role="alert">
            {error || errorText(pool.error)}
          </p>
        )}
        <footer>
          <button
            type="button"
            className="button button-secondary"
            onClick={close}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={pending || pool.isPending || !total || count > total}
          >
            {t(
              pending
                ? { en: "Preparing…", ar: "جارٍ التجهيز…" }
                : { en: "Prepare my session", ar: "تجهيز جلستي" },
            )}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
