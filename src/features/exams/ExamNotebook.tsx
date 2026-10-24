import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useExams, useExamQuery, useExamError } from "./useExams";
import { ExamHeading, ExamEmpty, ExamFailure } from "./ExamFrame";
import { QuestionView } from "./QuestionView";
import { QuestionTools } from "./QuestionTools";
export default function ExamNotebook({
  wrong = false,
  review = false,
}: {
  wrong?: boolean;
  review?: boolean;
}) {
  const { t } = useLocale(),
    { service, base } = useExams(),
    { examId = "" } = useParams(),
    errorText = useExamError();
  const [course, setCourse] = useState(""),
    [query, setQuery] = useState(""),
    [settledQuery, setSettledQuery] = useState(""),
    [reveal, setReveal] = useState(true),
    [page, setPage] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettledQuery(query);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  const request = {
    wrong,
    courseId: course || undefined,
    query: settledQuery,
    page,
    pageSize: 10,
  };
  const bank = useExamQuery(
    "notebook-page",
    (signal) => service.notebookQuestions(request, signal),
    JSON.stringify(request),
    !review,
  );
  const full = useExamQuery(
    "questions",
    (signal) => service.questions(examId, signal),
    examId,
    review,
  );
  const catalog = useExamQuery("catalog", (signal) => service.catalog(signal));
  const all = review
    ? (full.data || []).filter(
        (q) =>
          (!course || q.courseId === course) &&
          `${q.stem.en} ${q.stem.ar}`
            .toLowerCase()
            .includes(settledQuery.toLowerCase()),
      )
    : [];
  const questions = review
      ? all.slice(page * 10, (page + 1) * 10)
      : bank.data?.items || [],
    total = review ? all.length : bank.data?.total || 0;
  const loading = review ? full.isPending : bank.isPending,
    failed = review ? full.isError : bank.isError;
  return (
    <>
      <ExamHeading
        eyebrow=""
        title={t(
          review
            ? { en: "Review questions", ar: "مراجعة الأسئلة" }
            : wrong
              ? { en: "Revisit mistakes", ar: "مراجعة الأخطاء" }
              : { en: "Saved questions", ar: "الأسئلة المحفوظة" },
        )}
        body={
          wrong
            ? t({
                en: "Questions missed in your completed sessions appear here.",
                ar: "تظهر هنا الأسئلة التي أخطأت فيها في جلساتك المكتملة.",
              })
            : undefined
        }
      />
      {(total > 0 || !!query || !!course || loading || failed) && (
        <div className="exam-filters">
          <input
            aria-label={t({ en: "Filter questions", ar: "ترشيح الأسئلة" })}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t({ en: "Find a question", ar: "ابحث عن سؤال" })}
          />
          <select
            aria-label={t({ en: "Course filter", ar: "مرشح المساق" })}
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              setPage(0);
            }}
          >
            <option value="">
              {t({ en: "All courses", ar: "كل المساقات" })}
            </option>
            {catalog.data?.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.title)}
              </option>
            ))}
          </select>
          <label className="exam-check">
            <input
              type="checkbox"
              checked={reveal}
              onChange={(e) => setReveal(e.target.checked)}
            />
            <span>{t({ en: "Show answers", ar: "عرض الإجابات" })}</span>
          </label>
        </div>
      )}
      {loading ? (
        <LoadingState />
      ) : failed ? (
        <ExamFailure
          message={errorText(full.error || bank.error)}
          retry={() => void (review ? full : bank).refetch()}
        />
      ) : questions.length ? (
        <>
          <p className="exam-search-count" role="status">
            {Math.min(total, page * 10 + 1)}–
            {Math.min(total, page * 10 + questions.length)} / {total}
          </p>
          <div className="exam-review-list">
            {questions.map((q, i) => (
              <article key={q.id} className="exam-review-card">
                <QuestionView
                  question={q}
                  reveal={reveal}
                  locked
                  number={page * 10 + i + 1}
                />
                <QuestionTools questionId={q.id} />
              </article>
            ))}
          </div>
        </>
      ) : (
        <ExamEmpty
          title={t({ en: "A quiet shelf for now", ar: "رف هادئ الآن" })}
          body={t(
            wrong
              ? {
                  en: "No missed questions match this view. Finish a session to build your review list.",
                  ar: "لا توجد أسئلة خاطئة تطابق العرض. أكمل جلسة لتكوين قائمة المراجعة.",
                }
              : {
                  en: "Save a useful question during a session, or clear the current filters.",
                  ar: "احفظ سؤالاً مفيداً أثناء الجلسة أو امسح المرشحات الحالية.",
                },
          )}
          href={base}
          action={t({ en: "Browse courses", ar: "تصفح المساقات" })}
        />
      )}
      {total > 10 && (
        <div className="exam-question-navigation">
          <button
            type="button"
            className="button button-secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            {t({ en: "Previous page", ar: "الصفحة السابقة" })}
          </button>
          <button
            type="button"
            className="button button-secondary"
            disabled={(page + 1) * 10 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            {t({ en: "Next page", ar: "الصفحة التالية" })}
          </button>
        </div>
      )}
    </>
  );
}
