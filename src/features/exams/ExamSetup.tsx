import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Brain,
  BookOpen,
  Clock3,
  FileText,
  Play,
  RotateCcw,
} from "lucide-react";
import { AppLink } from "../../components/navigation/AppLink";
import { useLocale } from "../../app/providers/LocaleProvider";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ExamHeading, ExamEmpty, ExamFailure } from "./ExamFrame";
import { useExams, useExamQuery, useExamError } from "./useExams";
import type { ExamMode } from "../../types/exams";
export default function ExamSetup() {
  const { examId = "" } = useParams(),
    { service, base, refresh } = useExams(),
    { t } = useLocale(),
    navigate = useNavigate(),
    errorText = useExamError();
  const exam = useExamQuery(
      "set",
      (signal) => service.getExam(examId, signal),
      examId,
    ),
    catalog = useExamQuery("catalog", (signal) => service.catalog(signal)),
    attempts = useExamQuery("attempts", (signal) => service.attempts(signal));
  const [mode, setMode] = useState<ExamMode | "recall">("practice"),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  if (exam.isPending) return <LoadingState />;
  if (exam.isError)
    return (
      <ExamFailure
        message={errorText(exam.error)}
        retry={() => void exam.refetch()}
      />
    );
  if (!exam.data)
    return (
      <ExamEmpty
        title={t({
          en: "This set is unavailable",
          ar: "هذه المجموعة غير متاحة",
        })}
        body={t({
          en: "It may have changed or is not published. Choose another set.",
          ar: "قد تكون تغيّرت أو لم تُنشر. اختر مجموعة أخرى.",
        })}
        href={base}
        action={t({ en: "Browse courses", ar: "تصفح المساقات" })}
      />
    );
  const set = exam.data,
    course = catalog.data?.courses.find((c) => c.id === set.courseId),
    active = attempts.data?.find(
      (a) => a.examId === set.id && a.mode === mode && a.status === "active",
    );
  async function start(resume: boolean) {
    setPending(true);
    setError("");
    try {
      if (mode === "recall") {
        navigate(`${base}/set/${examId}/recall`);
        return;
      }
      const a = await service.start(examId, mode, resume);
      await refresh();
      navigate(`${base}/attempt/${a.id}`);
    } catch (e) {
      setError(errorText(e));
      setPending(false);
    }
  }
  return (
    <>
      <AppLink
        href={`${base}?course=${encodeURIComponent(set.courseId)}`}
        className="text-link"
      >
        <ArrowLeft className="directional" size={17} />
        {course
          ? t(course.title)
          : t({ en: "Back to sets", ar: "العودة للمجموعات" })}
      </AppLink>
      <ExamHeading
        eyebrow={t(set.batch)}
        title={t(set.title)}
        body={t(set.description)}
      />
      <div className="exam-prep-layout">
        <section className="exam-prep-panel">
          <span className="exam-kicker">
            {t({ en: "Make the session yours", ar: "اجعل الجلسة مناسبة لك" })}
          </span>
          <h2>
            {t({ en: "How do you want to review?", ar: "كيف تريد أن تراجع؟" })}
          </h2>
          <div className="exam-mode-options">
            {(["practice", "self-test", "recall"] as const).map((value) => (
              <button
                type="button"
                key={value}
                data-mode={value}
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
              >
                {value === "practice" ? (
                  <BookOpen size={25} />
                ) : value === "recall" ? (
                  <RotateCcw size={25} />
                ) : (
                  <Brain size={25} />
                )}
                <strong>
                  {t(
                    value === "practice"
                      ? { en: "Practice", ar: "تدريب" }
                      : value === "recall"
                        ? { en: "Recall cards", ar: "بطاقات الاسترجاع" }
                        : { en: "Self test", ar: "اختبار ذاتي" },
                  )}
                </strong>
                <span>
                  {t(
                    value === "practice"
                      ? {
                          en: "Select, then check your answer. Feedback and explanations appear after you confirm.",
                          ar: "اختر ثم تحقق من إجابتك. يظهر الشرح بعد التأكيد.",
                        }
                      : value === "recall"
                        ? {
                            en: "Think of the answer, then tap to flip. Nothing to type, no answer choices.",
                            ar: "أجب في ذهنك ثم اضغط لقلب البطاقة. دون كتابة أو خيارات إجابة.",
                          }
                        : {
                            en: "Change answers as you go. See the reasoning after you finish.",
                            ar: "عدّل إجاباتك أثناء الحل. يظهر الشرح بعد إنهاء الجلسة.",
                          },
                  )}
                </span>
              </button>
            ))}
          </div>
          {active && (
            <div className="exam-resume-callout">
              <RotateCcw size={20} />
              <span>
                {Object.keys(active.progress.answers).length}/
                {active.questions.length}{" "}
                {t({
                  en: "answered in your saved session",
                  ar: "إجابة في جلستك المحفوظة",
                })}
              </span>
            </div>
          )}
          <div className="exam-prep-actions">
            <button
              type="button"
              className="button button-primary"
              disabled={pending || !set.questionIds.length}
              onClick={() => void start(!!active)}
            >
              <Play size={18} />
              {t(
                pending
                  ? { en: "Preparing…", ar: "جارٍ التجهيز…" }
                  : active
                    ? { en: "Continue this session", ar: "متابعة الجلسة" }
                    : { en: "Begin my session", ar: "بدء جلستي" },
              )}
            </button>
            {active && (
              <button
                type="button"
                className="button button-secondary"
                disabled={pending}
                onClick={() => void start(false)}
              >
                {t({ en: "Start a separate attempt", ar: "بدء محاولة منفصلة" })}
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className="exam-error">
              {error}
            </p>
          )}
        </section>
        <aside className="exam-prep-summary">
          <h2>{t({ en: "Before you begin", ar: "قبل أن تبدأ" })}</h2>
          <dl>
            <div>
              <dt>{t({ en: "Questions", ar: "الأسئلة" })}</dt>
              <dd>{set.questionIds.length}</dd>
            </div>
            <div>
              <dt>{t({ en: "Suggested pace", ar: "الوقت المقترح" })}</dt>
              <dd>
                <Clock3 size={16} />
                {set.suggestedMinutes} {t({ en: "min", ar: "دقيقة" })}
              </dd>
            </div>
            <div>
              <dt>{t({ en: "Course", ar: "المساق" })}</dt>
              <dd>{course ? t(course.title) : set.courseId}</dd>
            </div>
          </dl>
          <p>
            {t({
              en: "Flag what needs another look. Bookmark what you want to keep. Save and exit whenever you need a break.",
              ar: "ضع علامة على ما يحتاج مراجعة واحفظ ما تريد الاحتفاظ به. احفظ واخرج عندما تحتاج استراحة.",
            })}
          </p>
          <AppLink href={`${base}/set/${set.id}/review`} className="text-link">
            {t({ en: "Read all questions", ar: "قراءة كل الأسئلة" })}
            <ArrowUpRight className="directional" size={16} />
          </AppLink>
          <AppLink
            href={`${base}/set/${set.id}/recall`}
            className="button button-secondary"
          >
            <RotateCcw size={17} />
            {t({
              en: "Recall cards · answer in your mind",
              ar: "بطاقات الاسترجاع · أجب في ذهنك",
            })}
          </AppLink>
          <AppLink href={`${base}/set/${set.id}/print`} className="text-link">
            <FileText size={16} />
            {t({ en: "Print / save as PDF", ar: "طباعة / حفظ PDF" })}
          </AppLink>
        </aside>
      </div>
    </>
  );
}
