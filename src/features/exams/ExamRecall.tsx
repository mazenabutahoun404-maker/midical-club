import { useEffect, useState } from "react";
import { useParams, useSearchParams, Navigate } from "react-router-dom";
import { ArrowLeft, Check, RotateCcw, Layers } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { LoadingState } from "../../components/feedback/LoadingState";
import { RecallFlipCard } from "../study-hub/RecallFlipCard";
import { useExams, useExamQuery, useExamError } from "./useExams";
import { ExamHeading, ExamEmpty, ExamFailure } from "./ExamFrame";
import { Explanation } from "./Explanation";
import { SessionTools } from "./SessionTools";
import { needsReview, safeExamImage } from "./exam-model";
import type { ExamQuestion } from "../../types/exams";
type Rating = "again" | "hard" | "good" | "easy";
export default function ExamRecall() {
  const { examId = "", attemptId = "" } = useParams();
  const [params] = useSearchParams();
  const { service, base, owner } = useExams(),
    { t } = useLocale(),
    error = useExamError();
  const attempt = useExamQuery(
    "attempt",
    (signal) => service.attempt(attemptId, signal),
    attemptId,
    !!attemptId,
  );
  const bank = useExamQuery(
    "questions",
    (signal) => service.questions(examId, signal),
    examId,
    !!examId,
  );
  const query = attemptId ? attempt : bank;
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return (
      <ExamFailure
        message={error(query.error)}
        retry={() => void query.refetch()}
      />
    );
  if (attemptId && attempt.data && attempt.data.status !== "finished")
    return (
      <Navigate
        replace
        to={
          attempt.data.status === "active"
            ? `${base}/attempt/${attemptId}`
            : base + "/history"
        }
      />
    );
  const questions =
    (attemptId
      ? attempt.data?.questions.filter(
          (q) =>
            params.get("filter") !== "focus" ||
            needsReview(q, attempt.data!.progress),
        )
      : bank.data
    )?.filter((q) => !!q.correct) || [];
  if (!questions.length)
    return (
      <ExamEmpty
        title={t({
          en: "No recall cards in this selection",
          ar: "لا توجد بطاقات في هذا الاختيار",
        })}
        body={t({
          en: "Try the complete set, or choose another finished session.",
          ar: "جرّب المجموعة كاملة أو اختر جلسة مكتملة أخرى.",
        })}
        href={base}
        action={t({ en: "Browse courses", ar: "تصفح المساقات" })}
      />
    );
  const key = [
    owner,
    attemptId || examId,
    params.get("filter") || "all",
    ...questions.map((q) => q.id + ":" + q.version),
  ].join("|");
  return (
    <RecallDeck
      key={key}
      questions={questions}
      storageKey={
        "medclub.exam-recall.v1." +
        encodeURIComponent(owner) +
        "." +
        encodeURIComponent(attemptId || examId) +
        "." +
        (params.get("filter") === "focus" ? "focus" : "all")
      }
      fingerprint={key}
      back={
        attemptId
          ? `${base}/attempt/${attemptId}/results`
          : `${base}/set/${examId}`
      }
    />
  );
}
function RecallDeck({
  questions,
  storageKey,
  fingerprint,
  back,
}: {
  questions: ExamQuestion[];
  storageKey: string;
  fingerprint: string;
  back: string;
}) {
  const { t } = useLocale();
  const [ratings, setRatings] = useState<Record<string, Rating>>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (
        raw?.fingerprint === fingerprint &&
        raw.ratings &&
        typeof raw.ratings === "object"
      )
        return Object.fromEntries(
          questions
            .filter((q) =>
              ["again", "hard", "good", "easy"].includes(raw.ratings[q.id]),
            )
            .map((q) => [q.id, raw.ratings[q.id]]),
        );
    } catch {}
    return {};
  });
  const [flipped, setFlipped] = useState(false),
    [persistent, setPersistent] = useState(true);
  const current = questions.find((q) => !ratings[q.id]),
    completed = Object.keys(ratings).length;
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ fingerprint, ratings }),
      );
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }, [ratings, storageKey, fingerprint]);
  function rate(rating: Rating) {
    if (!current || !flipped) return;
    setRatings((r) => ({ ...r, [current.id]: rating }));
    setFlipped(false);
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>(".recall-flip-card, .recall-complete h2")
        ?.focus(),
    );
  }
  const answer = current?.choices.find((c) => c.key === current.correct);
  return (
    <div className="exam-recall-page studio-recall">
      <header className="studio-topbar">
        <AppLink className="studio-recall-exit text-link" href={back}>
          <ArrowLeft className="directional" size={17} />
          {t({ en: "Exit recall", ar: "خروج من الاسترجاع" })}
        </AppLink>
        <div className="studio-recall-brand">
          <span className="studio-brand-name">MedClub</span>
          <h1 data-page-heading tabIndex={-1}>
            {t({ en: "Recall", ar: "الاسترجاع" })}
          </h1>
        </div>
        <SessionTools />
      </header>
      <div className="studio-recall-desk">
        <div className="exam-recall-progress">
          <Layers size={18} />
          <span>
            {completed}/{questions.length}{" "}
            {t({ en: "cards reviewed", ar: "بطاقة مراجعة" })}
          </span>
          <progress
            max={questions.length}
            value={completed}
            aria-label={t({
              en: "Recall session progress",
              ar: "تقدم جلسة الاسترجاع",
            })}
          />
        </div>
        {!persistent && (
          <p className="exam-error" role="status">
            {t({
              en: "Your recall progress is available for this session only.",
              ar: "تقدم الاسترجاع متاح لهذه الجلسة فقط.",
            })}
          </p>
        )}
        {current && answer ? (
          <section className="recall-review-stage">
            <RecallFlipCard
              cardId={current.id}
              index={completed + 1}
              total={questions.length}
              nextCards={questions
                .filter((q) => !ratings[q.id] && q.id !== current.id)
                .slice(0, 3)
                .map((q) => ({
                  id: q.id,
                  prompt: t(q.stem),
                  course: t(q.chapter),
                }))}
              prompt={t(current.stem)}
              answer={t(answer.text)}
              course={t(current.chapter)}
              image={
                current.images?.[0] && safeExamImage(current.images[0].url)
                  ? {
                      url: safeExamImage(current.images[0].url)!,
                      alt: t(current.images[0].alt),
                    }
                  : undefined
              }
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
            />
            {flipped && (
              <>
                <div className="recall-grades">
                  {(["again", "hard", "good", "easy"] as const).map((r, i) => (
                    <button type="button" key={r} onClick={() => rate(r)}>
                      {t(
                        [
                          { en: "Again", ar: "مرة أخرى" },
                          { en: "Hard", ar: "صعب" },
                          { en: "Good", ar: "جيد" },
                          { en: "Easy", ar: "سهل" },
                        ][i],
                      )}
                    </button>
                  ))}
                </div>
                {current.explanation && (
                  <details className="exam-reasoning">
                    <summary>
                      {t({ en: "Why this answer?", ar: "لماذا هذه الإجابة؟" })}
                    </summary>
                    <Explanation
                      content={t(current.explanation)}
                      images={current.explanationImages}
                    />
                  </details>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="recall-complete exam-empty">
            <Check size={32} />
            <h2 tabIndex={-1}>
              {t({ en: "A round well spent.", ar: "جولة تستحق وقتك." })}
            </h2>

            <div className="exam-recall-actions">
              {questions.some(
                (q) => ratings[q.id] === "again" || ratings[q.id] === "hard",
              ) && (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    setRatings((r) =>
                      Object.fromEntries(
                        Object.entries(r).filter(
                          ([, v]) => v === "good" || v === "easy",
                        ),
                      ),
                    );
                    setFlipped(false);
                  }}
                >
                  {t({
                    en: "Revisit the difficult cards",
                    ar: "مراجعة البطاقات الصعبة",
                  })}
                </button>
              )}
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setRatings({});
                  setFlipped(false);
                }}
              >
                <RotateCcw size={17} />
                {t({ en: "Start another round", ar: "بدء جولة أخرى" })}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
