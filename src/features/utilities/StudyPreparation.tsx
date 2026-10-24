import { useState } from "react";
import { Check, ArrowRight, RotateCcw } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { useLocale } from "../../app/providers/LocaleProvider";
export function StudyPreparation({
  items,
  onStart,
  running,
}: {
  items: string[];
  onStart: () => void;
  running: boolean;
}) {
  const { t, label } = useLocale(),
    [checked, setChecked] = useState<number[]>([]),
    completed = checked.length,
    total = items.length;
  return (
    <section
      className="study-preparation"
      aria-labelledby="study-preparation-title"
      data-ready={total > 0 && completed === total}
    >
      <header>
        <h2 id="study-preparation-title">{label("before")}</h2>
        <span role="status" aria-live="polite">
          {t({
            en: `${completed} of ${total} ready`,
            ar: `${completed} من ${total} جاهزة`,
          })}
        </span>
      </header>
      <div
        className="study-preparation-progress"
        role="progressbar"
        aria-label={t({ en: "Study preparation", ar: "الاستعداد للدراسة" })}
        aria-valuemin={0}
        aria-valuemax={total || 1}
        aria-valuenow={completed}
      >
        <span style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
      </div>
      <div className="study-preparation-items">
        {items.map((item, index) => (
          <label key={index} data-checked={checked.includes(index)}>
            <Checkbox
              checked={checked.includes(index)}
              onCheckedChange={(value) =>
                setChecked((previous) =>
                  value === true
                    ? [...new Set([...previous, index])]
                    : previous.filter((i) => i !== index),
                )
              }
            />
            <span>{item}</span>
            <Check
              className="study-preparation-tick"
              size={18}
              aria-hidden="true"
            />
          </label>
        ))}
      </div>
      <div className="study-preparation-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={onStart}
        >
          {t(
            running
              ? { en: "Return to timer", ar: "العودة إلى المؤقّت" }
              : { en: "Begin focus", ar: "ابدأ التركيز" },
          )}
          <ArrowRight size={17} className="directional" />
        </button>
        {completed > 0 && (
          <button
            type="button"
            className="study-preparation-reset"
            onClick={() => setChecked([])}
            aria-label={t({
              en: "Reset preparation checklist",
              ar: "إعادة ضبط قائمة الاستعداد",
            })}
          >
            <RotateCcw size={17} />
          </button>
        )}
      </div>
    </section>
  );
}
