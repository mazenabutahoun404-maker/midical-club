import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, ArrowUpRight, Clock3 } from "lucide-react";
import { AppLink } from "../../components/navigation/AppLink";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import { APP_TIMEZONE } from "../../constants/config";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useExams, useExamQuery, useExamError } from "./useExams";
import { ExamHeading, ExamEmpty, ExamFailure } from "./ExamFrame";
import type { ExamAttempt } from "../../types/exams";
import { durationLabel } from "./exam-model";
export default function ExamHistory() {
  const { t, locale } = useLocale(),
    { service, base, refresh, owner } = useExams(),
    errorText = useExamError(),
    client = useQueryClient();
  const attempts = useExamQuery("attempts", (signal) =>
      service.attempts(signal),
    ),
    catalog = useExamQuery("catalog", (signal) => service.catalog(signal));
  const [filter, setFilter] = useState("active"),
    [limit, setLimit] = useState(20),
    [ending, setEnding] = useState<ExamAttempt | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const filtered =
    attempts.data?.filter((a) => filter === "all" || a.status === filter) || [];
  async function end() {
    if (!ending) return;
    setPending(true);
    setError("");
    try {
      await service.abandon(ending.id, ending.version);
      try {
        localStorage.removeItem(
          `medclub.exam-draft.${encodeURIComponent(owner)}.${ending.id}`,
        );
      } catch {}
      client.removeQueries({
        queryKey: ["exams", owner, "attempt", ending.id],
      });
      setEnding(null);
      await refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <ExamHeading
        eyebrow={t({
          en: "Your personal practice record",
          ar: "سجل تدريبك الشخصي",
        })}
        title={t({
          en: "Pick up a session.\nReflect on the last one.",
          ar: "تابع جلسة.\nوراجع ما أنجزته.",
        })}
      />
      <div
        className="exam-filter-tabs"
        aria-label={t({ en: "Attempt status", ar: "حالة المحاولة" })}
      >
        {["active", "finished", "all"].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
              setLimit(20);
            }}
          >
            {t({
              en:
                value === "active"
                  ? "In progress"
                  : value === "finished"
                    ? "Finished"
                    : "All attempts",
              ar:
                value === "active"
                  ? "جارية"
                  : value === "finished"
                    ? "مكتملة"
                    : "كل المحاولات",
            })}
          </button>
        ))}
      </div>
      {attempts.isPending ? (
        <LoadingState />
      ) : attempts.isError ? (
        <ExamFailure
          message={errorText(attempts.error)}
          retry={() => void attempts.refetch()}
        />
      ) : filtered.length ? (
        <div className="exam-attempt-list">
          {filtered.slice(0, limit).map((a) => {
            const set = catalog.data?.sets.find((e) => e.id === a.examId),
              course =
                set && catalog.data?.courses.find((c) => c.id === set.courseId);
            return (
              <article key={a.id} className="exam-attempt-card">
                <div>
                  <span className="exam-kicker">
                    {course
                      ? t(course.title)
                      : t({ en: "Saved session", ar: "جلسة محفوظة" })}
                  </span>
                  <h2>
                    {set
                      ? t(set.title)
                      : t({
                          en: "Previous question set",
                          ar: "مجموعة أسئلة سابقة",
                        })}
                  </h2>
                  <p>
                    {new Intl.DateTimeFormat(
                      locale === "ar" ? "ar-JO" : "en-GB",
                      { timeZone: APP_TIMEZONE, dateStyle: "medium" },
                    ).format(new Date(a.updatedAt))}{" "}
                    ·{" "}
                    {t(
                      a.mode === "practice"
                        ? { en: "Practice", ar: "تدريب" }
                        : { en: "Self test", ar: "اختبار ذاتي" },
                    )}
                  </p>
                  <small>
                    <Clock3 size={14} />
                    {durationLabel(a.progress.elapsedSeconds)} ·{" "}
                    {Object.keys(a.progress.answers).length}/
                    {a.questions.length} {t({ en: "answered", ar: "مجابة" })}
                    {a.status === "finished" &&
                    a.summary &&
                    a.summary.percentage !== null
                      ? ` · ${a.summary.percentage}%`
                      : ""}
                  </small>
                </div>
                <div className="exam-attempt-actions">
                  {a.status !== "abandoned" && (
                    <AppLink
                      href={`${base}/attempt/${a.id}${a.status === "finished" ? "/results" : ""}`}
                      className="button button-secondary"
                    >
                      {a.status === "active" ? (
                        <Play size={16} />
                      ) : (
                        <ArrowUpRight className="directional" size={16} />
                      )}
                      {t(
                        a.status === "active"
                          ? { en: "Continue", ar: "متابعة" }
                          : { en: "Review", ar: "مراجعة" },
                      )}
                    </AppLink>
                  )}
                  {a.status === "active" && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        setEnding(a);
                        setError("");
                      }}
                    >
                      {t({ en: "End session", ar: "إنهاء الجلسة" })}
                    </button>
                  )}
                  {a.status === "abandoned" && (
                    <span>{t({ en: "Ended", ar: "منتهية" })}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <ExamEmpty
          title={t({
            en: "A fresh page in your practice record",
            ar: "صفحة جديدة في سجل تدريبك",
          })}
          body={t({
            en: "Your sessions will appear here when you start a question set.",
            ar: "تظهر جلساتك هنا عندما تبدأ مجموعة أسئلة.",
          })}
          href={base}
          action={t({ en: "Choose a course", ar: "اختيار مساق" })}
        />
      )}
      {filtered.length > limit && (
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setLimit((n) => n + 20)}
        >
          {t({ en: "Show more", ar: "عرض المزيد" })}
        </button>
      )}
      {ending && (
        <Modal
          open
          onClose={() => !pending && setEnding(null)}
          title={t({
            en: "End this saved session?",
            ar: "إنهاء الجلسة المحفوظة؟",
          })}
          description={t({
            en: "It will leave your in-progress list. Your other attempts and saved questions stay available.",
            ar: "ستُزال من قائمة الجلسات الجارية. تبقى محاولاتك الأخرى والأسئلة المحفوظة متاحة.",
          })}
          className="exam-finish-dialog"
        >
          {error && (
            <p className="exam-error" role="alert">
              {error}
            </p>
          )}
          <div className="exam-dialog-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setEnding(null)}
              disabled={pending}
            >
              {t({ en: "Keep session", ar: "الاحتفاظ بالجلسة" })}
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => void end()}
              disabled={pending}
            >
              {t({ en: "End session", ar: "إنهاء الجلسة" })}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
