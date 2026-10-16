import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { ArrowUpRight, Check, X, Minus, RotateCcw, Clock3 } from "lucide-react";
import { AppLink } from "../../components/navigation/AppLink";
import { useLocale } from "../../app/providers/LocaleProvider";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useExams, useExamQuery, useExamError } from "./useExams";
import { ExamHeading, ExamEmpty, ExamFailure } from "./ExamFrame";
import { QuestionView } from "./QuestionView";
import { QuestionTools } from "./QuestionTools";
import { durationLabel, needsReview } from "./exam-model";
export default function ExamResults() {
  const { attemptId = "" } = useParams(),
    { service, base } = useExams(),
    { t } = useLocale(),
    errorText = useExamError();
  const attempt = useExamQuery(
      "attempt",
      (signal) => service.attempt(attemptId, signal),
      attemptId,
    ),
    [filter, setFilter] = useState("all"),
    [limit, setLimit] = useState(10);
  if (attempt.isPending) return <LoadingState />;
  if (attempt.isError)
    return (
      <ExamFailure
        message={errorText(attempt.error)}
        retry={() => void attempt.refetch()}
      />
    );
  if (!attempt.data)
    return (
      <ExamEmpty
        title={t({ en: "No results here yet", ar: "لا توجد نتائج هنا بعد" })}
        body={t({
          en: "Open a finished session from your attempts.",
          ar: "افتح جلسة مكتملة من محاولاتك.",
        })}
        href={base + "/history"}
        action={t({ en: "My attempts", ar: "محاولاتي" })}
      />
    );
  const a = attempt.data;
  if (a.status === "active")
    return <Navigate replace to={`${base}/attempt/${a.id}`} />;
  if (a.status === "abandoned")
    return <Navigate replace to={`${base}/history`} />;
  const summary = a.summary,
    filtered = a.questions.filter(
      (q) =>
        filter === "all" ||
        (filter === "correct"
          ? !!q.correct && a.progress.answers[q.id] === q.correct
          : filter === "incorrect"
            ? !!q.correct &&
              !!a.progress.answers[q.id] &&
              a.progress.answers[q.id] !== q.correct
            : filter === "skipped"
              ? !a.progress.answers[q.id]
              : a.progress.flagged.includes(q.id)),
    );
  const focusQuestions = a.questions.filter((q) => needsReview(q, a.progress));
  const chapters = [...new Set(a.questions.map((q) => t(q.chapter)))].map(
    (chapter) => {
      const items = a.questions.filter((q) => t(q.chapter) === chapter);
      return {
        chapter,
        total: items.length,
        missed: items.filter(
          (q) => !!q.correct && a.progress.answers[q.id] !== q.correct,
        ).length,
        uncertain: items.filter(
          (q) =>
            a.progress.confidence?.[q.id] === "unsure" ||
            a.progress.confidence?.[q.id] === "guessing",
        ).length,
      };
    },
  );
  return (
    <>
      <ExamHeading
        eyebrow={t({
          en: "A session worth learning from",
          ar: "جلسة تستحق أن تتعلم منها",
        })}
        title={t({
          en: "Keep the reasoning.\nTake the next step.",
          ar: "احتفظ بالأسباب.\nوانتقل للخطوة التالية.",
        })}
        body={t({
          en: "This result describes this question set. Use the review to find what deserves another look.",
          ar: "تصف هذه النتيجة مجموعة الأسئلة الحالية. راجع ما يستحق العودة إليه.",
        })}
      />
      <section className="exam-results-summary">
        <div className="exam-result-score">
          <span>{t({ en: "This session", ar: "هذه الجلسة" })}</span>
          <strong>
            {summary?.percentage === null || !summary
              ? "—"
              : `${summary.percentage}%`}
          </strong>
          <p>
            {summary
              ? `${summary.correct}/${summary.total} ${t({ en: "correct", ar: "صحيحة" })}`
              : t({
                  en: "Results are not available.",
                  ar: "النتائج غير متاحة.",
                })}
          </p>
          <AppLink
            className="button button-primary"
            href={`${base}/set/${a.examId}`}
          >
            <RotateCcw size={17} />
            {t({ en: "Practice again", ar: "تدرب مجدداً" })}
          </AppLink>
        </div>
        <div className="exam-result-stats">
          {[
            {
              icon: Check,
              number: summary?.correct ?? "—",
              label: { en: "Correct", ar: "صحيحة" },
              state: "correct",
            },
            {
              icon: X,
              number: summary?.incorrect ?? "—",
              label: { en: "Incorrect", ar: "خاطئة" },
              state: "incorrect",
            },
            {
              icon: Minus,
              number: summary?.skipped ?? "—",
              label: { en: "Skipped", ar: "متروكة" },
              state: "skipped",
            },
            {
              icon: Clock3,
              number: durationLabel(
                summary?.timeSeconds ?? a.progress.elapsedSeconds,
              ),
              label: { en: "Session time", ar: "وقت الجلسة" },
              state: "time",
            },
          ].map(({ icon: Icon, number, label, state }) => (
            <div key={state} data-result-state={state}>
              <Icon size={21} />
              <strong>{number}</strong>
              <span>{t(label)}</span>
            </div>
          ))}
          <div
            className="exam-result-split"
            aria-label={t({ en: "Answer distribution", ar: "توزيع الإجابات" })}
          >
            {summary &&
              [summary.correct, summary.incorrect, summary.skipped].map(
                (n, i) => (
                  <i
                    key={i}
                    data-kind={i}
                    style={{
                      flexGrow: n || 0,
                      display: n ? undefined : "none",
                    }}
                  />
                ),
              )}
          </div>
          <AppLink href={base + "/wrong"} className="text-link">
            {t({ en: "Keep revisiting mistakes", ar: "تابع مراجعة أخطائك" })}
            <ArrowUpRight className="directional" size={16} />
          </AppLink>
        </div>
      </section>
      <section className="exam-results-review">
        <div className="exam-next-step">
          <div>
            <span className="exam-kicker">
              {t({ en: "Your next useful step", ar: "خطوتك المفيدة التالية" })}
            </span>
            <h2>
              {focusQuestions.length
                ? `${focusQuestions.length} ${t({ en: "questions deserve another look", ar: "سؤالاً يستحق مراجعة أخرى" })}`
                : t({ en: "Keep the reasoning close", ar: "احتفظ بالأسباب" })}
            </h2>
            <p>
              {t({
                en: "Review missed, skipped, flagged and uncertain answers together. Recall ratings stay separate from this exam result.",
                ar: "راجع الإجابات الخاطئة والمتروكة والمعلّمة وغير المؤكدة معاً. تقييم الاسترجاع منفصل عن نتيجة الامتحان.",
              })}
            </p>
          </div>
          <AppLink
            className="button button-primary"
            href={`${base}/attempt/${a.id}/recall${focusQuestions.length ? "?filter=focus" : ""}`}
          >
            {t({
              en: "Review with recall cards",
              ar: "المراجعة ببطاقات الاسترجاع",
            })}
          </AppLink>
        </div>
        <div className="exam-topic-review">
          {chapters.map((c) => (
            <article key={c.chapter}>
              <strong>{c.chapter}</strong>
              <span>
                {c.missed}/{c.total}{" "}
                {t({ en: "missed or skipped", ar: "خاطئة أو متروكة" })}
              </span>
              <small>
                {c.uncertain}{" "}
                {t({
                  en: "marked uncertain or guessing",
                  ar: "غير مؤكدة أو تخمين",
                })}
              </small>
            </article>
          ))}
        </div>
        <header>
          <h2>
            {t({
              en: "Review with a little intention",
              ar: "مراجعة بخطوة واضحة",
            })}
          </h2>
          <select
            aria-label={t({ en: "Review filter", ar: "مرشح المراجعة" })}
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setLimit(10);
            }}
          >
            {(
              ["all", "incorrect", "skipped", "flagged", "correct"] as const
            ).map((value) => (
              <option key={value} value={value}>
                {t({
                  en: value === "all" ? "All questions" : value,
                  ar: {
                    all: "كل الأسئلة",
                    incorrect: "الخاطئة",
                    skipped: "المتروكة",
                    flagged: "عليها علامة",
                    correct: "الصحيحة",
                  }[value],
                })}
              </option>
            ))}
          </select>
        </header>
        {filtered.slice(0, limit).map((q) => (
          <article key={q.id} className="exam-review-card">
            <QuestionView
              question={q}
              chosen={a.progress.answers[q.id]}
              reveal
              locked
              number={a.questions.findIndex((item) => item.id === q.id) + 1}
            />
            <QuestionTools questionId={q.id} />
          </article>
        ))}
        {!filtered.length && (
          <ExamEmpty
            title={t({
              en: "Nothing in this filter",
              ar: "لا توجد أسئلة في هذا المرشح",
            })}
            body={t({
              en: "Choose another review filter to see your questions.",
              ar: "اختر مرشحاً آخر لعرض أسئلتك.",
            })}
          />
        )}
        {filtered.length > limit && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setLimit((n) => n + 10)}
          >
            {t({ en: "Show more questions", ar: "عرض أسئلة أخرى" })}
          </button>
        )}
      </section>
    </>
  );
}
