import { useState } from "react";
import type { ExamSet, ExamQuestion } from "../../types/exams";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useExams, useExamError } from "./useExams";
import { parseBulkImport, type ParseResult } from "./portable/bulk-import";
import { bilingual, choiceKeys } from "./exam-model";
const example =
  "1. Example question?\nA. First choice\nB. Correct choice *\nC. Third choice\nD. Fourth choice\nChapter: Chapter name\nLecture: Lecture name\nExplanation: Explain the reasoning here.";
export function ExamImport({
  exam,
  close,
}: {
  exam: ExamSet;
  close: () => void;
}) {
  const { t } = useLocale(),
    { service, refresh } = useExams(),
    errorText = useExamError();
  const [text, setText] = useState(""),
    [parsed, setParsed] = useState<ParseResult | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function validate() {
    setPending(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 0));
    setParsed(parseBulkImport(text));
    setPending(false);
  }
  async function save() {
    if (!parsed?.questions.length || parsed.errors.length) return;
    setPending(true);
    setError("");
    const questions: ExamQuestion[] = parsed.questions.map((q) => ({
      id: crypto.randomUUID(),
      courseId: exam.courseId,
      stem: bilingual(q.questionText),
      choices: choiceKeys
        .filter((key) => q.choices[key]?.trim())
        .map((key) => ({
          key,
          text: bilingual(q.choices[key]!),
          ...(q.wrongExplanations?.[key]
            ? { explanation: bilingual(q.wrongExplanations[key]!) }
            : {}),
        })),
      correct: q.correctAnswer,
      chapter: bilingual(q.chapterName || "General"),
      lecture: q.lectureName ? bilingual(q.lectureName) : undefined,
      doctor: q.doctorName,
      explanation: q.explanation ? bilingual(q.explanation) : undefined,
      version: "new",
    }));
    try {
      await service.admin.saveQuestions(exam.id, questions, exam.version);
      await refresh();
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
      title={t({ en: "Import questions", ar: "استيراد الأسئلة" })}
      description={t(exam.title)}
      className="exam-import-dialog"
    >
      <div className="exam-form">
        <details>
          <summary>
            {t({ en: "See the expected format", ar: "عرض صيغة الاستيراد" })}
          </summary>
          <pre dir="ltr">{example}</pre>
        </details>
        <label>
          <span>
            {t({ en: "Paste up to 500 questions", ar: "ألصق حتى ٥٠٠ سؤال" })}
          </span>
          <textarea
            rows={12}
            value={text}
            maxLength={200000}
            onChange={(e) => {
              setText(e.target.value);
              setParsed(null);
            }}
            aria-label={t({
              en: "Questions to import",
              ar: "الأسئلة المراد استيرادها",
            })}
          />
        </label>
        <button
          type="button"
          className="button button-secondary"
          disabled={pending || !text.trim()}
          onClick={() => void validate()}
        >
          {t({ en: "Validate and preview", ar: "التحقق والمعاينة" })}
        </button>
        {parsed && (
          <section className="exam-import-result" role="status">
            <strong>
              {parsed.questions.length}{" "}
              {t({ en: "valid questions", ar: "أسئلة صالحة" })} ·{" "}
              {parsed.errors.length} {t({ en: "errors", ar: "أخطاء" })}
            </strong>
            {parsed.errors.slice(0, 20).map((e, i) => (
              <p key={i} className="exam-error">
                {e.questionNumber ? `${e.questionNumber}: ` : ""}
                {e.message}
              </p>
            ))}
            {parsed.warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
            <ol>
              {parsed.questions.slice(0, 5).map((q) => (
                <li key={q.questionNumber}>
                  {q.questionText}{" "}
                  <small>({q.correctAnswer.toUpperCase()})</small>
                </li>
              ))}
            </ol>
            <p>
              {t({
                en: "All errors must be fixed before import. Questions are added only when saving succeeds.",
                ar: "يجب تصحيح كل الأخطاء قبل الاستيراد. تُضاف الأسئلة بعد نجاح الحفظ.",
              })}
            </p>
          </section>
        )}
        {error && (
          <p className="exam-error" role="alert">
            {error}
          </p>
        )}
        <footer>
          <button
            type="button"
            className="button button-secondary"
            disabled={pending}
            onClick={close}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </button>
          <button
            type="button"
            className="button button-primary"
            disabled={
              pending || !parsed?.questions.length || !!parsed.errors.length
            }
            onClick={() => void save()}
          >
            {t(
              pending
                ? { en: "Importing…", ar: "جارٍ الاستيراد…" }
                : {
                    en: "Import validated questions",
                    ar: "استيراد الأسئلة الصالحة",
                  },
            )}
          </button>
        </footer>
      </div>
    </Modal>
  );
}
