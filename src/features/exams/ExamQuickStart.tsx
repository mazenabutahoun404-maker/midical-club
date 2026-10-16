import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { useExams, useExamQuery, useExamError } from "./useExams";
import type { Course } from "../../types/content";
export function ExamQuickStart({
  courses,
  quick,
  close,
}: {
  courses: Course[];
  quick: boolean;
  close: () => void;
}) {
  const { service, base, refresh } = useExams(),
    { t } = useLocale(),
    navigate = useNavigate(),
    errorText = useExamError();
  const [courseId, setCourse] = useState(""),
    [count, setCount] = useState(quick ? 5 : 20),
    [mode, setMode] = useState<"practice" | "self-test" | "recall">(
      quick ? "practice" : "self-test",
    ),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const pool = useExamQuery(
    "quick-options",
    (signal) =>
      service.customOptions(
        courseId,
        { chapters: [], lectures: [], doctors: [] },
        signal,
      ),
    courseId,
    !!courseId,
  );
  const total = pool.data?.matchedCount || 0,
    amount = Math.min(count, total);
  async function start(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !amount || pending) return;
    setPending(true);
    setError("");
    try {
      const set = await service.custom({
        courseId,
        count: amount,
        chapters: [],
        lectures: [],
        doctors: [],
        shuffle: true,
        title: t(
          quick
            ? { en: "My quick review", ar: "مراجعتي السريعة" }
            : { en: "My exam preparation", ar: "استعدادي للامتحان" },
        ),
      });
      if (mode === "recall") {
        await refresh();
        navigate(`${base}/set/${set.id}/recall`);
      } else {
        const attempt = await service.start(set.id, mode, false);
        await refresh();
        navigate(`${base}/attempt/${attempt.id}`);
      }
      close();
    } catch (e) {
      setError(errorText(e));
      setPending(false);
    }
  }
  return (
    <Modal
      open
      onClose={() => !pending && close()}
      title={t(
        quick
          ? {
              en: "A little time. A clear next step.",
              ar: "وقت قصير. وخطوة واضحة.",
            }
          : { en: "Prepare for your exam", ar: "استعد لامتحانك" },
      )}
      description={t({
        en: "Choose a course and the way you want to think.",
        ar: "اختر مساقك وطريقة مراجعتك.",
      })}
      className="exam-quick-dialog"
    >
      <form className="exam-form" onSubmit={(e) => void start(e)}>
        <label>
          <span>{t({ en: "Course", ar: "المساق" })}</span>
          <select
            required
            value={courseId}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="">
              {t({ en: "Choose your course", ar: "اختر مساقك" })}
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.title)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t({ en: "Questions", ar: "الأسئلة" })}</span>
          <input
            type="number"
            min={1}
            max={Math.min(total || 100, 100)}
            value={total ? amount : count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
            }
          />
        </label>
        <fieldset className="exam-quick-modes">
          <legend>{t({ en: "Review style", ar: "طريقة المراجعة" })}</legend>
          {(["practice", "self-test", "recall"] as const).map((v, i) => (
            <label key={v}>
              <input
                type="radio"
                name="quick-mode"
                checked={mode === v}
                onChange={() => setMode(v)}
              />
              <span>
                {t(
                  [
                    { en: "Practice with explanations", ar: "تدريب مع الشرح" },
                    {
                      en: "Self test, then review",
                      ar: "اختبار ذاتي ثم مراجعة",
                    },
                    {
                      en: "Recall cards · think and flip",
                      ar: "بطاقات استرجاع · فكّر واقلب",
                    },
                  ][i],
                )}
              </span>
            </label>
          ))}
        </fieldset>
        {courseId && (
          <p role="status">
            {pool.isError
              ? errorText(pool.error)
              : pool.isPending
                ? t({
                    en: "Finding your questions…",
                    ar: "جارٍ البحث عن أسئلتك…",
                  })
                : `${total} ${t({ en: "questions available. Session length depends on your pace.", ar: "سؤال متاح. مدة الجلسة تعتمد على وتيرتك." })}`}
          </p>
        )}
        {pool.isError && (
          <button
            type="button"
            className="text-link"
            onClick={() => void pool.refetch()}
          >
            {t({ en: "Retry", ar: "إعادة المحاولة" })}
          </button>
        )}
        {error && (
          <p className="exam-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="button button-primary"
          disabled={pending || !amount || pool.isFetching}
        >
          {t(
            pending
              ? { en: "Preparing…", ar: "جارٍ التجهيز…" }
              : { en: "Begin my session", ar: "بدء جلستي" },
          )}
        </button>
      </form>
    </Modal>
  );
}
