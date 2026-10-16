import { useEffect, useState, useCallback, useId } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Grid2X2,
  Save,
  CheckCheck,
  Clock3,
  Eye,
  Type,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useExams, useExamError } from "./useExams";
import { ExamEmpty, ExamFailure } from "./ExamFrame";
import { QuestionView } from "./QuestionView";
import { QuestionTools } from "./QuestionTools";
import { useAttemptSession } from "./useAttemptSession";
import type { ExamAttempt, ChoiceKey } from "../../types/exams";
import { durationLabel } from "./exam-model";
import { SessionTools } from "./SessionTools";
import medclubLogo from "../../assets/brand/medclub-logo.png";
function SessionClock({ elapsed }: { elapsed: () => number }) {
  const [value, setValue] = useState(elapsed);
  const { t } = useLocale();
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      setValue(elapsed());
      if (!document.hidden)
        timer = setInterval(() => setValue(elapsed()), 1000);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [elapsed]);
  return (
    <span
      className="exam-clock"
      aria-label={t({ en: "Session time", ar: "وقت الجلسة" })}
    >
      <Clock3 size={16} />
      <time>{durationLabel(value)}</time>
    </span>
  );
}
export default function ExamPlay() {
  const { attemptId = "" } = useParams(),
    { service, owner, base } = useExams(),
    { t } = useLocale(),
    errorText = useExamError();
  const attempt = useQuery({
    queryKey: ["exams", owner, "attempt", attemptId],
    queryFn: ({ signal }) => service.attempt(attemptId, signal),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
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
        title={t({
          en: "This attempt is unavailable",
          ar: "هذه المحاولة غير متاحة",
        })}
        body={t({
          en: "Return to your attempts or choose another set.",
          ar: "عد إلى محاولاتك أو اختر مجموعة أخرى.",
        })}
        href={base + "/history"}
        action={t({ en: "My attempts", ar: "محاولاتي" })}
      />
    );
  if (attempt.data.status === "finished")
    return <Navigate replace to={`${base}/attempt/${attemptId}/results`} />;
  if (attempt.data.status === "abandoned")
    return <Navigate replace to={base + "/history"} />;
  if (!attempt.data.questions.length)
    return (
      <ExamEmpty
        title={t({
          en: "No questions are available in this attempt",
          ar: "لا توجد أسئلة متاحة في المحاولة",
        })}
        body={t({
          en: "Return to the question sets to start another session.",
          ar: "عد إلى مجموعات الأسئلة لبدء جلسة أخرى.",
        })}
        href={base}
        action={t({ en: "Browse courses", ar: "تصفح المساقات" })}
      />
    );
  return (
    <Session
      key={`${attempt.data.id}:${attempt.data.version}`}
      initial={attempt.data}
      reload={() => void attempt.refetch()}
    />
  );
}
function Session({
  initial,
  reload,
}: {
  initial: ExamAttempt;
  reload: () => void;
}) {
  const { service, base, owner } = useExams(),
    { t, dir } = useLocale(),
    navigate = useNavigate(),
    errorText = useExamError();
  const client = useQueryClient();
  const session = useAttemptSession(initial, service),
    { progress } = session;
  const [mapOpen, setMapOpen] = useState(false),
    [confirm, setConfirm] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const [clockVisible, setClockVisible] = useState(true),
    [largeText, setLargeText] = useState(false);
  const current = Math.min(progress.current, initial.questions.length - 1),
    question = initial.questions[current];
  const answered = Object.keys(progress.answers).length,
    flagged = progress.flagged.includes(question.id),
    reveal = initial.mode === "practice" && !!progress.answers[question.id];
  const go = useCallback(
    (index: number) => {
      if (pending) return;
      const next = Math.max(0, Math.min(initial.questions.length - 1, index));
      const q = initial.questions[next];
      session.commit((p) => ({
        ...p,
        current: next,
        viewed: [...new Set([...p.viewed, q.id])],
      }));
      setMapOpen(false);
      requestAnimationFrame(() => {
        const heading = document.getElementById("exam-question-stem");
        heading?.focus({ preventScroll: true });
        heading?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
      });
    },
    [session.commit, initial.questions, pending],
  );
  const select = useCallback(
    (key: ChoiceKey) => {
      if (
        pending ||
        (initial.mode === "practice" && progress.answers[question.id])
      )
        return;
      session.commit((p) => ({
        ...p,
        ...(initial.mode === "practice"
          ? { pendingAnswers: { ...p.pendingAnswers, [question.id]: key } }
          : { answers: { ...p.answers, [question.id]: key } }),
        viewed: [...new Set([...p.viewed, question.id])],
      }));
    },
    [session.commit, question.id, initial.mode, progress.answers, pending],
  );
  const checkAnswer = useCallback(() => {
    const candidate = progress.pendingAnswers?.[question.id];
    if (!candidate || pending || reveal) return;
    session.commit((p) => ({
      ...p,
      answers: { ...p.answers, [question.id]: candidate },
      pendingAnswers: Object.fromEntries(
        Object.entries(p.pendingAnswers || {}).filter(
          ([id]) => id !== question.id,
        ),
      ),
    }));
  }, [progress.pendingAnswers, question.id, pending, reveal, session.commit]);
  const flag = useCallback(
    () =>
      session.commit((p) => ({
        ...p,
        flagged: p.flagged.includes(question.id)
          ? p.flagged.filter((id) => id !== question.id)
          : [...p.flagged, question.id],
      })),
    [session.commit, question.id],
  );
  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      if (
        pending ||
        e.defaultPrevented ||
        document.querySelector("dialog[open]") ||
        (e.target as HTMLElement)?.closest(
          "input, textarea, select, [contenteditable=true]",
        )
      )
        return;
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        go(current + (dir === "rtl" ? -1 : 1));
      } else if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        go(current + (dir === "rtl" ? 1 : -1));
      } else if (
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        /^[1-5]$/.test(e.key)
      ) {
        const choice = question.choices[Number(e.key) - 1];
        if (choice) {
          e.preventDefault();
          select(choice.key);
        }
      } else if (
        e.key === "Enter" &&
        initial.mode === "practice" &&
        progress.pendingAnswers?.[question.id] &&
        !reveal &&
        !(e.target as HTMLElement)?.closest("button,a")
      ) {
        e.preventDefault();
        checkAnswer();
      } else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        flag();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  }, [
    pending,
    current,
    question,
    go,
    select,
    flag,
    dir,
    checkAnswer,
    initial.mode,
    progress.pendingAnswers,
    reveal,
  ]);
  async function exit() {
    setPending(true);
    setError("");
    try {
      const saved = await session.saveAndExit();
      client.setQueryData(["exams", owner, "attempt", initial.id], saved);
      void client.invalidateQueries({
        queryKey: ["exams", owner],
        refetchType: "none",
      });
      navigate(base + "/history");
    } catch (e) {
      setError(errorText(e));
      setPending(false);
    }
  }
  async function finish() {
    setPending(true);
    setError("");
    try {
      const finished = await session.finish();
      client.setQueryData(["exams", owner, "attempt", initial.id], finished);
      void client.invalidateQueries({
        queryKey: ["exams", owner],
        refetchType: "none",
      });
      navigate(`${base}/attempt/${initial.id}/results`);
    } catch (e) {
      setError(errorText(e));
      setPending(false);
    }
  }
  const map = (
    <QuestionMap
      attempt={initial}
      progress={progress}
      current={current}
      go={go}
    />
  );
  return (
    <div
      className="exam-session"
      data-exam-mode={initial.mode}
      data-large-text={largeText || undefined}
    >
      <header className="exam-session-heading studio-topbar">
        <div className="studio-identity">
          <img
            className="studio-brand-mark"
            src={medclubLogo}
            alt=""
            width={40}
            height={40}
          />
          <div>
            <span className="studio-brand-name">MedClub</span>
            <h1 data-page-heading tabIndex={-1}>
              {t(
                initial.mode === "practice"
                  ? { en: "Practice", ar: "تدريب" }
                  : { en: "Self test", ar: "اختبار ذاتي" },
              )}
            </h1>
          </div>
        </div>
        <div className="studio-topbar-status">
          <span className="exam-clock-slot" hidden={!clockVisible}>
            <SessionClock elapsed={session.elapsed} />
          </span>
        </div>
        <div className="studio-topbar-actions">
          <SessionTools />
          <button
            type="button"
            className="button button-secondary studio-exit"
            disabled={pending}
            onClick={() => void exit()}
          >
            <Save size={17} />
            <span>{t({ en: "Save & exit", ar: "حفظ وخروج" })}</span>
          </button>
        </div>
      </header>
      <div className="studio-workspace">
        <div className="studio-session-strip">
          <span className="studio-section-label">{t(question.chapter)}</span>
          <div className="studio-strip-actions">
            <details className="studio-preferences">
              <summary>
                <Type size={17} />
                {t({ en: "Reading", ar: "القراءة" })}
              </summary>
              <div className="exam-session-preferences">
                <button
                  type="button"
                  className="text-link"
                  aria-pressed={!clockVisible}
                  onClick={() => setClockVisible((v) => !v)}
                >
                  <Eye size={16} />
                  {t(
                    clockVisible
                      ? { en: "Hide timer", ar: "إخفاء الوقت" }
                      : { en: "Show timer", ar: "إظهار الوقت" },
                  )}
                </button>
                <button
                  type="button"
                  className="text-link"
                  aria-pressed={largeText}
                  onClick={() => setLargeText((v) => !v)}
                >
                  <Type size={16} />
                  {t({ en: "Larger text", ar: "نص أكبر" })}
                </button>
              </div>
            </details>
            <button
              type="button"
              className="exam-map-toggle"
              onClick={() => setMapOpen(true)}
            >
              <Grid2X2 size={17} />
              {t({ en: "Questions", ar: "الأسئلة" })}
            </button>
            <button
              type="button"
              className="studio-finish text-link"
              disabled={pending}
              onClick={() => setConfirm(true)}
            >
              {t({ en: "Finish", ar: "إنهاء" })}
              <CheckCheck size={17} />
            </button>
          </div>
        </div>
        <div className="exam-progress-row">
          <span>
            {answered}/{initial.questions.length}{" "}
            {t({ en: "answered", ar: "تمت الإجابة عنها" })}
          </span>
          <progress
            value={answered}
            max={initial.questions.length}
            aria-label={t({
              en: "Answered questions",
              ar: "الأسئلة المجاب عنها",
            })}
          />
          <span className="exam-save-status" role="status">
            {t(
              session.status === "saving"
                ? { en: "Saving…", ar: "جارٍ الحفظ…" }
                : session.status === "saved"
                  ? { en: "Saved", ar: "محفوظ" }
                  : { en: "Unsaved changes", ar: "تغييرات غير محفوظة" },
            )}
          </span>
        </div>
        {Boolean(error || session.error) && (
          <div className="exam-error" role="alert">
            {error || errorText(session.error)}
            <button
              className="text-link"
              type="button"
              onClick={() => void session.flush().catch(() => {})}
            >
              {t({ en: "Retry save", ar: "إعادة الحفظ" })}
            </button>
            <button type="button" className="text-link" onClick={reload}>
              {t({
                en: "Reload saved attempt",
                ar: "إعادة تحميل المحاولة المحفوظة",
              })}
            </button>
          </div>
        )}
        {!session.draftPersistent && (
          <p className="exam-error" role="status">
            {t({
              en: "The recovery draft could not be stored on this device. Save successfully before leaving.",
              ar: "تعذر تخزين نسخة الاستعادة على الجهاز. تأكد من نجاح الحفظ قبل المغادرة.",
            })}
          </p>
        )}
        <div className="exam-session-grid">
          <article className="exam-question-panel">
            <header>
              <span className="studio-question-index" aria-hidden="true">{String(current+1).padStart(2,"0")}</span>
              <strong>
                {t({ en: "Question", ar: "السؤال" })} {current + 1}/
                {initial.questions.length}
              </strong>
              <button
                type="button"
                className="exam-flag-button"
                aria-pressed={flagged}
                disabled={pending}
                onClick={flag}
              >
                <Flag size={17} fill={flagged ? "currentColor" : "none"} />
                <span>
                  {t(
                    flagged
                      ? { en: "Flagged", ar: "عليه علامة" }
                      : { en: "Flag for review", ar: "علامة للمراجعة" },
                  )}
                </span>
              </button>
            </header>
            <div className="exam-paper-transition" key={question.id}>
              <QuestionView
                key={question.id}
                question={question}
                chosen={
                  progress.answers[question.id] ||
                  progress.pendingAnswers?.[question.id]
                }
                reveal={reveal}
                locked={pending || reveal}
                select={select}
                number={current + 1}
                studyTools
              />
              <div
                className="exam-confidence"
                role="group"
                aria-label={t({
                  en: "Confidence in this answer (optional)",
                  ar: "الثقة بالإجابة (اختياري)",
                })}
              >
                <span>
                  {t({ en: "How sure are you?", ar: "ما مدى ثقتك؟" })}
                  <small>{t({ en: "Optional", ar: "اختياري" })}</small>
                </span>
                {(["confident", "unsure", "guessing"] as const).map(
                  (level, i) => (
                    <button
                      type="button"
                      key={level}
                      disabled={pending || reveal}
                      aria-pressed={
                        progress.confidence?.[question.id] === level
                      }
                      onClick={() =>
                        session.commit((p) => ({
                          ...p,
                          confidence: { ...p.confidence, [question.id]: level },
                        }))
                      }
                    >
                      {t(
                        [
                          { en: "Confident", ar: "واثق" },
                          { en: "Unsure", ar: "غير متأكد" },
                          { en: "Guessing", ar: "أخمن" },
                        ][i],
                      )}
                    </button>
                  ),
                )}
              </div>
              {initial.mode === "practice" && !reveal && (
                <div className="exam-answer-confirm">
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={
                      pending || !progress.pendingAnswers?.[question.id]
                    }
                    onClick={checkAnswer}
                  >
                    {t({ en: "Check answer", ar: "تحقق من الإجابة" })}
                  </button>
                </div>
              )}
            </div>
            <QuestionTools questionId={question.id} />
            <footer className="exam-question-navigation">
              <button
                type="button"
                className="button button-secondary"
                disabled={current === 0 || pending}
                onClick={() => go(current - 1)}
              >
                <ArrowLeft className="directional" size={18} />
                {t({ en: "Previous", ar: "السابق" })}
              </button>
              {current === initial.questions.length - 1 ? (
                <button
                  className="button button-primary"
                  disabled={pending}
                  type="button"
                  onClick={() => setConfirm(true)}
                >
                  {t({ en: "Finish & review", ar: "إنهاء ومراجعة" })}
                  <CheckCheck size={18} />
                </button>
              ) : (
                <button
                  className="button button-primary"
                  disabled={pending}
                  type="button"
                  onClick={() => go(current + 1)}
                >
                  {t({ en: "Next question", ar: "السؤال التالي" })}
                  <ArrowRight className="directional" size={18} />
                </button>
              )}
            </footer>
          </article>
        </div>
        <div className="studio-session-footer">
          <span>
            {t(
              service.source === "preview"
                ? {
                    en: "Sample questions · saved on this device",
                    ar: "أسئلة توضيحية · تحفظ على هذا الجهاز",
                  }
                : {
                    en: "Your session is saved as you go",
                    ar: "تحفظ جلستك أثناء تقدمك",
                  },
            )}
          </span>
          <span>
            {t({
              en: "1–5 select · Alt + arrows navigate",
              ar: "١–٥ للاختيار · Alt والأسهم للتنقل",
            })}
          </span>
        </div>
      </div>
      {mapOpen && (
        <Modal
          open
          onClose={() => setMapOpen(false)}
          title={t({ en: "Your question map", ar: "خريطة أسئلتك" })}
          description={`${answered}/${initial.questions.length}`}
          className="exam-map-dialog"
        >
          {map}
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setMapOpen(false);
              setConfirm(true);
            }}
          >
            {t({ en: "Finish this session", ar: "إنهاء الجلسة" })}
          </button>
        </Modal>
      )}
      {confirm && (
        <Modal
          open
          onClose={() => !pending && setConfirm(false)}
          title={t({ en: "Finish and review?", ar: "إنهاء ومراجعة؟" })}
          description={t({
            en: "Your answers will be saved, then you can review the reasoning.",
            ar: "ستُحفظ إجاباتك ثم يمكنك مراجعة أسبابها.",
          })}
          className="exam-finish-dialog"
        >
          <p>
            {initial.questions.length - answered}{" "}
            {t({ en: "questions are unanswered.", ar: "أسئلة دون إجابة." })}
          </p>
          {error && (
            <p role="alert" className="exam-error">
              {error}
            </p>
          )}
          <div className="exam-dialog-actions">
            <button
              className="button button-secondary"
              type="button"
              disabled={pending}
              onClick={() => setConfirm(false)}
            >
              {t({ en: "Keep studying", ar: "متابعة الدراسة" })}
            </button>
            <button
              className="button button-primary"
              type="button"
              disabled={pending}
              onClick={() => void finish()}
            >
              {t(
                pending
                  ? { en: "Saving results…", ar: "جارٍ حفظ النتائج…" }
                  : { en: "Finish session", ar: "إنهاء الجلسة" },
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function QuestionMap({
  attempt,
  progress,
  current,
  go,
}: {
  attempt: ExamAttempt;
  progress: ExamAttempt["progress"];
  current: number;
  go: (n: number) => void;
}) {
  const jumpId = useId();
  const { t } = useLocale(),
    [page, setPage] = useState(Math.floor(current / 50)),
    [filter, setFilter] = useState("all"),
    [jump, setJump] = useState("");
  const questions = attempt.questions
    .map((q, i) => ({ q, i }))
    .filter(
      ({ q }) =>
        filter === "all" ||
        (filter === "unanswered"
          ? !progress.answers[q.id]
          : progress.flagged.includes(q.id)),
    );
  const maxPage = Math.max(0, Math.ceil(questions.length / 50) - 1),
    shown = questions.slice(
      Math.min(page, maxPage) * 50,
      (Math.min(page, maxPage) + 1) * 50,
    );
  return (
    <div className="exam-question-map">
      <header>
        <h2>{t({ en: "Question map", ar: "خريطة الأسئلة" })}</h2>
        <span>
          {progress.flagged.length} {t({ en: "flagged", ar: "عليها علامة" })}
        </span>
      </header>
      <select
        aria-label={t({ en: "Filter question map", ar: "ترشيح خريطة الأسئلة" })}
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setPage(0);
        }}
      >
        <option value="all">
          {t({ en: "All questions", ar: "كل الأسئلة" })}
        </option>
        <option value="unanswered">
          {t({ en: "Unanswered", ar: "دون إجابة" })}
        </option>
        <option value="flagged">
          {t({ en: "Flagged", ar: "عليها علامة" })}
        </option>
      </select>
      <div className="exam-map-numbers">
        {shown.map(({ q, i }) => (
          <button
            type="button"
            key={q.id}
            aria-current={current === i ? "step" : undefined}
            data-answered={!!progress.answers[q.id] || undefined}
            data-flagged={progress.flagged.includes(q.id) || undefined}
            onClick={() => go(i)}
            aria-label={`${t({ en: "Question", ar: "السؤال" })} ${i + 1}${progress.answers[q.id] ? ` · ${t({ en: "Answered", ar: "مجابة" })}` : ""}${progress.flagged.includes(q.id) ? ` · ${t({ en: "Flagged", ar: "عليها علامة" })}` : ""}`}
          >
            {i + 1}
            {progress.flagged.includes(q.id) && <Flag size={10} />}
          </button>
        ))}
      </div>
      {!shown.length && (
        <p>
          {t({
            en: "No questions in this filter.",
            ar: "لا توجد أسئلة تطابق المرشح.",
          })}
        </p>
      )}
      {maxPage > 0 && (
        <div className="exam-map-pages">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            {t({ en: "Previous", ar: "السابق" })}
          </button>
          <span>
            {Math.min(page, maxPage) + 1}/{maxPage + 1}
          </span>
          <button
            type="button"
            disabled={page >= maxPage}
            onClick={() => setPage((p) => p + 1)}
          >
            {t({ en: "Next", ar: "التالي" })}
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(jump);
          if (Number.isInteger(n) && n > 0 && n <= attempt.questions.length)
            go(n - 1);
        }}
        className="exam-question-jump"
      >
        <label htmlFor={jumpId}>{t({ en: "Go to", ar: "انتقل إلى" })}</label>
        <input
          id={jumpId}
          type="number"
          min={1}
          max={attempt.questions.length}
          value={jump}
          onChange={(e) => setJump(e.target.value)}
        />
        <button type="submit">{t({ en: "Go", ar: "انتقل" })}</button>
      </form>
      <div className="exam-map-legend">
        <span>{t({ en: "Filled = answered", ar: "ممتلئة = مجابة" })}</span>
        <span>
          <Flag size={12} />
          {t({ en: "Review later", ar: "راجع لاحقاً" })}
        </span>
      </div>
    </div>
  );
}
