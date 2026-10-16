import { memo, useState, useId } from "react";
import { Check, X, Highlighter, Undo2 } from "lucide-react";
import type { ChoiceKey, ExamQuestion } from "../../types/exams";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Explanation } from "./Explanation";
import { safeExamImage } from "./exam-model";
export const QuestionView = memo(function QuestionView({
  question,
  chosen,
  reveal,
  locked,
  select,
  number,
  studyTools = false,
}: {
  question: ExamQuestion;
  chosen?: ChoiceKey;
  reveal: boolean;
  locked: boolean;
  select?: (key: ChoiceKey) => void;
  number: number;
  studyTools?: boolean;
}) {
  const { t, locale } = useLocale(),
    [expanded, setExpanded] = useState<string | null>(null);
  const [eliminated, setEliminated] = useState<string[]>([]),
    [highlight, setHighlight] = useState("");
  const stem = t(question.stem),
    highlightStart = highlight ? stem.indexOf(highlight) : -1;
  const correct = question.choices.find((c) => c.key === question.correct);
  const reviewHeadingId = useId();
  const keyLabel = (key: ChoiceKey) =>
    locale === "ar"
      ? { a: "أ", b: "ب", c: "ج", d: "د", e: "هـ" }[key]
      : key.toUpperCase();
  return (
    <div className="exam-question-content">
      {studyTools && (
        <div className="exam-reading-tools">
          <button
            type="button"
            onClick={() => {
              const selected = window.getSelection();
              const text = selected?.toString().trim() || "";
              const anchor = selected?.anchorNode?.parentElement;
              if (
                text &&
                text.length <= 500 &&
                anchor?.closest("#exam-question-stem") &&
                stem.includes(text)
              )
                setHighlight(text);
            }}
          >
            <Highlighter size={16} />
            {t({ en: "Highlight", ar: "تظليل" })}
          </button>
          {highlight && (
            <button
              type="button"
              aria-label={t({ en: "Clear highlight", ar: "مسح التظليل" })}
              onClick={() => setHighlight("")}
            >
              <Undo2 size={16} />
            </button>
          )}
        </div>
      )}
      <div className="exam-question-meta">
        <span>{t(question.chapter)}</span>
        {question.lecture && <span>{t(question.lecture)}</span>}
        {question.doctor && <span>{question.doctor}</span>}
      </div>
      <h2
        className="exam-question-stem"
        id={select ? "exam-question-stem" : reviewHeadingId}
        tabIndex={-1}
        dir="auto"
      >
        <span className="exam-question-number">{number}</span>
        {highlightStart < 0 ? (
          stem
        ) : (
          <>
            {stem.slice(0, highlightStart)}
            <mark>{highlight}</mark>
            {stem.slice(highlightStart + highlight.length)}
          </>
        )}
      </h2>
      {question.images?.map((image, i) => {
        const source = safeExamImage(image.url);
        return source ? (
          <button
            className="exam-image"
            type="button"
            key={i}
            aria-label={t(image.alt)}
            onClick={() => setExpanded(source)}
          >
            <img
              src={source}
              alt={t(image.alt)}
              loading="lazy"
              decoding="async"
            />
          </button>
        ) : null;
      })}
      <fieldset className="exam-answer-options">
        <legend className="sr-only">
          {t({ en: "Answer choices", ar: "خيارات الإجابة" })}
        </legend>
        {question.choices.map((choice, i) => {
          const right = reveal && question.correct === choice.key,
            wrong = reveal && chosen === choice.key && !right;
          return (
            <div
              key={choice.key}
              className="exam-choice-row"
              data-eliminated={
                (eliminated.includes(choice.key) && !reveal) || undefined
              }
            >
              <button
                type="button"
                key={choice.key}
                className="exam-choice"
                data-choice={choice.key}
                data-selected={chosen === choice.key || undefined}
                data-correct={right || undefined}
                data-wrong={wrong || undefined}
                aria-pressed={chosen === choice.key}
                disabled={locked || !select}
                onClick={() => select?.(choice.key)}
              >
                <span className="exam-choice-letter">
                  {keyLabel(choice.key)}
                </span>
                <span dir="auto">{t(choice.text)}</span>
                {right ? (
                  <>
                    <Check size={19} />
                    <span className="sr-only">
                      {t({ en: "Correct answer", ar: "الإجابة الصحيحة" })}
                    </span>
                  </>
                ) : wrong ? (
                  <>
                    <X size={19} />
                    <span className="sr-only">
                      {t({ en: "Incorrect answer", ar: "إجابة خاطئة" })}
                    </span>
                  </>
                ) : null}
              </button>
              {studyTools && !reveal && (
                <button
                  type="button"
                  className="exam-eliminate"
                  disabled={locked}
                  aria-pressed={eliminated.includes(choice.key)}
                  aria-label={t({
                    en: `Cross out choice ${choice.key.toUpperCase()}`,
                    ar: `استبعاد الخيار ${keyLabel(choice.key)}`,
                  })}
                  onClick={() =>
                    setEliminated((items) =>
                      items.includes(choice.key)
                        ? items.filter((k) => k !== choice.key)
                        : [...items, choice.key],
                    )
                  }
                >
                  <X size={16} />
                </button>
              )}
            </div>
          );
        })}
      </fieldset>
      {reveal && correct && (
        <div
          className="exam-feedback"
          role={select ? "status" : undefined}
          data-correct={chosen === correct.key || undefined}
        >
          <strong>
            {chosen
              ? t(
                  chosen === correct.key
                    ? {
                        en: "Correct. Keep the reasoning close.",
                        ar: "إجابة صحيحة. احتفظ بالسبب.",
                      }
                    : {
                        en: "A useful question to revisit.",
                        ar: "سؤال مفيد للعودة إليه.",
                      },
                )
              : t({ en: "Answer", ar: "الإجابة" })}
          </strong>
          <span>
            {keyLabel(correct.key)} · {t(correct.text)}
          </span>
          {chosen &&
            question.choices.find((c) => c.key === chosen)?.explanation && (
              <p>
                {t(
                  question.choices.find((c) => c.key === chosen)!.explanation!,
                )}
              </p>
            )}
        </div>
      )}
      {reveal && question.explanation && (
        <details className="exam-reasoning" open={!!select}>
          <summary>{t({ en: "The explanation", ar: "الشرح" })}</summary>
          <Explanation
            content={t(question.explanation)}
            images={question.explanationImages}
          />
        </details>
      )}
      {expanded && (
        <Modal
          open
          onClose={() => setExpanded(null)}
          title={t({ en: "Question image", ar: "صورة السؤال" })}
          description=""
          className="exam-image-dialog"
        >
          <img
            src={expanded}
            alt={t({ en: "Question image", ar: "صورة السؤال" })}
          />
        </Modal>
      )}
    </div>
  );
});
