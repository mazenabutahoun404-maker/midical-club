import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Flag } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useExams, useExamQuery, useExamError } from "./useExams";
import type { ExamNotebook, ExamReport } from "../../types/exams";
export function QuestionTools({ questionId }: { questionId: string }) {
  const { t } = useLocale(),
    { service, owner } = useExams(),
    client = useQueryClient(),
    errorText = useExamError();
  const notebook = useExamQuery("notebook", (signal) =>
    service.notebook(signal),
  );
  const saved = notebook.data?.bookmarkedIds.includes(questionId) || false;
  const [pending, setPending] = useState(false),
    [reportOpen, setReportOpen] = useState(false),
    [category, setCategory] = useState<ExamReport["category"]>("answer"),
    [body, setBody] = useState(""),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false);
  useEffect(() => {
    setBody("");
    setCategory("answer");
    setError("");
    setSent(false);
    setReportOpen(false);
  }, [questionId]);
  async function toggle() {
    if (pending || !notebook.data) return;
    const before = notebook.data;
    setPending(true);
    setError("");
    client.setQueryData<ExamNotebook>(["exams", owner, "notebook", ""], {
      ...before,
      bookmarkedIds: saved
        ? before.bookmarkedIds.filter((id) => id !== questionId)
        : [...before.bookmarkedIds, questionId],
    });
    try {
      const next = await service.bookmark(questionId, !saved);
      client.setQueryData(["exams", owner, "notebook", ""], next);
    } catch (e) {
      client.setQueryData(["exams", owner, "notebook", ""], before);
      setError(errorText(e));
      toast.error(errorText(e));
    } finally {
      setPending(false);
    }
  }
  async function report(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      setError(
        t({
          en: "Describe the issue before sending.",
          ar: "صف المشكلة قبل الإرسال.",
        }),
      );
      return;
    }
    setPending(true);
    setError("");
    try {
      await service.report({ questionId, category, body });
      setSent(true);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="exam-question-tools">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={pending || !notebook.data}
        aria-pressed={saved}
        aria-label={t(
          saved
            ? { en: "Remove saved question", ar: "إزالة السؤال المحفوظ" }
            : { en: "Save question", ar: "حفظ السؤال" },
        )}
      >
        <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        <span>
          {t(saved ? { en: "Saved", ar: "محفوظ" } : { en: "Save", ar: "حفظ" })}
        </span>
      </button>
      <button
        type="button"
        onClick={() => {
          setReportOpen(true);
          setError("");
          setSent(false);
        }}
      >
        <Flag size={17} />
        <span>{t({ en: "Report an issue", ar: "الإبلاغ عن مشكلة" })}</span>
      </button>
      {error && !reportOpen && (
        <p role="alert" className="exam-error">
          {error}
        </p>
      )}
      {reportOpen && (
        <Modal
          open
          onClose={() => setReportOpen(false)}
          title={t({
            en: "Help improve this question",
            ar: "ساعد في تحسين السؤال",
          })}
          description={t({
            en: "Describe what needs attention so a reviewer can check it.",
            ar: "صف ما يحتاج اهتماماً ليتحقق منه المراجع.",
          })}
          className="exam-report-dialog"
        >
          {sent ? (
            <div className="exam-report-sent" role="status">
              <p>
                {t(
                  service.source === "preview"
                    ? {
                        en: "Your report is saved in this device's preview.",
                        ar: "حُفظ البلاغ في معاينة هذا الجهاز.",
                      }
                    : {
                        en: "Your report has been sent for review.",
                        ar: "أُرسل البلاغ للمراجعة.",
                      },
                )}
              </p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setReportOpen(false)}
              >
                {t({ en: "Done", ar: "تم" })}
              </button>
            </div>
          ) : (
            <form className="exam-form" onSubmit={report}>
              <label>
                <span>{t({ en: "Category", ar: "الفئة" })}</span>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ExamReport["category"])
                  }
                >
                  {(
                    [
                      "answer",
                      "wording",
                      "explanation",
                      "image",
                      "other",
                    ] as const
                  ).map((c) => (
                    <option key={c} value={c}>
                      {t({
                        en: c,
                        ar: {
                          answer: "الإجابة",
                          wording: "الصياغة",
                          explanation: "الشرح",
                          image: "الصورة",
                          other: "أخرى",
                        }[c],
                      })}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  {t({
                    en: "What needs attention?",
                    ar: "ما الذي يحتاج مراجعة؟",
                  })}
                </span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  required
                />
              </label>
              {error && (
                <p className="exam-error" role="alert">
                  {error}
                </p>
              )}
              <footer>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setReportOpen(false)}
                >
                  {t({ en: "Cancel", ar: "إلغاء" })}
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={pending}
                >
                  {t(
                    pending
                      ? { en: "Saving…", ar: "جارٍ الحفظ…" }
                      : { en: "Send report", ar: "إرسال البلاغ" },
                  )}
                </button>
              </footer>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
