import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Calculator, Undo2, Redo2 } from "lucide-react";
import { throwToTrash } from "../../components/feedback/action-flight";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { calculateGpa, emptyGpa, normalizeGpa, type GpaDraft } from "./gpa";
import "../../styles/student-tools.css";
export function GpaCalculator() {
  const { snapshot } = useAuth();
  const userId =
    snapshot.status === "authenticated" ? snapshot.user?.id : undefined;
  return <CalculatorForm key={userId || "guest"} userId={userId} />;
}
function CalculatorForm({ userId }: { userId?: string }) {
  const { t } = useLocale(),
    key = userId ? "medclub:gpa:v1:" + encodeURIComponent(userId) : null;
  const [draft, setDraft] = useState<GpaDraft>(() => {
    try {
      return key
        ? normalizeGpa(JSON.parse(localStorage.getItem(key) || "null"))
        : emptyGpa();
    } catch {
      return emptyGpa();
    }
  });
  const [storageFailed, setStorageFailed] = useState(false),
    [dirty, setDirty] = useState(false);
  const current = useRef(draft),
    alive = useRef(true);
  current.current = draft;
  const past = useRef<GpaDraft[]>([]),
    future = useRef<GpaDraft[]>([]);
  const beforeFocus = useRef<GpaDraft | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const removing = useRef(new Set<string>());
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const checkpoint = (before: GpaDraft) => {
    past.current = [...past.current.slice(-19), structuredClone(before)];
    future.current = [];
    setHistoryVersion((value) => value + 1);
  };
  const apply = (next: GpaDraft) => {
    current.current = next;
    setDraft(next);
    setDirty(true);
  };
  const result = calculateGpa(draft);
  useEffect(() => {
    if (!key || !dirty) return;
    const save = () => {
      try {
        localStorage.setItem(key, JSON.stringify(current.current));
        setStorageFailed(false);
      } catch {
        setStorageFailed(true);
      }
    };
    const timer = setTimeout(save, 400);
    return () => {
      clearTimeout(timer);
      try {
        localStorage.setItem(key, JSON.stringify(current.current));
      } catch {
        /* Failure is shown while mounted. */
      }
    };
  }, [key, draft, dirty]);
  const update = (change: Partial<GpaDraft>) => {
    apply({ ...current.current, ...change });
  };
  const pendingEdit =
    !!beforeFocus.current &&
    JSON.stringify(beforeFocus.current) !== JSON.stringify(draft);
  return (
    <section
      className="gpa-calculator"
      data-history-version={historyVersion}
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLInputElement)
          beforeFocus.current = structuredClone(current.current);
      }}
      onBlurCapture={(event) => {
        if (!(event.target instanceof HTMLInputElement)) return;
        if (
          beforeFocus.current &&
          JSON.stringify(beforeFocus.current) !==
            JSON.stringify(current.current)
        )
          checkpoint(beforeFocus.current);
        beforeFocus.current = null;
      }}
      aria-label={t({ en: "GPA calculator", ar: "حاسبة المعدّل" })}
    >
      <header>
        <Calculator size={22} />
        <h3>{t({ en: "GPA calculator", ar: "حاسبة المعدّل" })}</h3>
        <button
          type="button"
          className="notebook-icon-button"
          disabled={!past.current.length && !pendingEdit}
          aria-label={t({
            en: "Undo GPA change",
            ar: "تراجع عن تعديل المعدّل",
          })}
          onClick={() => {
            if (
              beforeFocus.current &&
              JSON.stringify(beforeFocus.current) !==
                JSON.stringify(current.current)
            )
              checkpoint(beforeFocus.current);
            beforeFocus.current = null;
            const previous = past.current.pop();
            if (!previous) return;
            future.current.push(structuredClone(current.current));
            apply(previous);
            setHistoryVersion((value) => value + 1);
          }}
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          className="notebook-icon-button"
          disabled={!future.current.length || pendingEdit}
          aria-label={t({ en: "Redo GPA change", ar: "إعادة تعديل المعدّل" })}
          onClick={() => {
            const next = future.current.pop();
            if (!next) return;
            past.current.push(structuredClone(current.current));
            apply(next);
            setHistoryVersion((value) => value + 1);
          }}
        >
          <Redo2 size={16} />
        </button>
      </header>
      <p>
        {t({
          en: "Enter grade points from your institution’s scale. This is a planning estimate, not an official transcript.",
          ar: "أدخل نقاط الدرجات بحسب نظام جامعتك. هذه حاسبة للتخطيط وليست كشف درجات رسمياً.",
        })}
      </p>
      <label>
        {t({ en: "Maximum grade points", ar: "أعلى نقاط للدرجة" })}
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={10}
          step="any"
          value={draft.scale}
          onChange={(event) => update({ scale: event.target.value })}
          aria-invalid={result.errors.includes("scale") || undefined}
        />
      </label>
      <div className="gpa-rows">
        {draft.rows.map((row, index) => (
          <fieldset
            key={row.id}
            className="gpa-row"
            data-gpa-course={row.id}
            disabled={false}
          >
            <legend>
              {t({ en: "Course ", ar: "مساق " })}
              {index + 1}
            </legend>
            <label>
              {t({ en: "Name (optional)", ar: "الاسم (اختياري)" })}
              <input
                value={row.name}
                maxLength={150}
                onChange={(event) =>
                  update({
                    rows: draft.rows.map((item) =>
                      item.id === row.id
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </label>
            <label>
              {t({ en: "Credits", ar: "الساعات" })}
              <input
                type="number"
                inputMode="decimal"
                min={0.01}
                max={100}
                step="any"
                value={row.credits}
                disabled={row.excluded}
                aria-invalid={result.errors.includes(row.id) || undefined}
                onChange={(event) =>
                  update({
                    rows: draft.rows.map((item) =>
                      item.id === row.id
                        ? { ...item, credits: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </label>
            <label>
              {t({ en: "Grade points", ar: "نقاط الدرجة" })}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={Number(draft.scale) || 4}
                step="any"
                value={row.points}
                disabled={row.excluded}
                aria-invalid={result.errors.includes(row.id) || undefined}
                onChange={(event) =>
                  update({
                    rows: draft.rows.map((item) =>
                      item.id === row.id
                        ? { ...item, points: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </label>
            <label className="gpa-exclude">
              <input
                type="checkbox"
                checked={row.excluded}
                onChange={(event) =>
                  update({
                    rows: draft.rows.map((item) =>
                      item.id === row.id
                        ? { ...item, excluded: event.target.checked }
                        : item,
                    ),
                  })
                }
              />
              {t({
                en: "Exclude (pass/fail, withdrawn)",
                ar: "استبعاد (ناجح/راسب، منسحب)",
              })}
            </label>
            <button
              type="button"
              aria-label={
                t({ en: "Remove course ", ar: "حذف المساق " }) + (index + 1)
              }
              onClick={async (event) => {
                if (removing.current.has(row.id)) return;
                removing.current.add(row.id);
                const flight = throwToTrash(
                  event.currentTarget.closest<HTMLElement>(".gpa-row"),
                  row.name || t({ en: "GPA course", ar: "مساق المعدّل" }),
                );
                if (flight.animated) await flight.finished;
                if (!alive.current) return;
                removing.current.delete(row.id);
                if (!current.current.rows.some((item) => item.id === row.id))
                  return;
                checkpoint(current.current);
                update({
                  rows: current.current.rows.filter(
                    (item) => item.id !== row.id,
                  ),
                });
              }}
            >
              <Trash2 size={16} />
            </button>
          </fieldset>
        ))}
      </div>
      <button
        type="button"
        className="student-tool-primary"
        disabled={draft.rows.length >= 100}
        onClick={() => {
          checkpoint(current.current);
          update({
            rows: [
              ...draft.rows,
              {
                id: crypto.randomUUID(),
                name: "",
                credits: "",
                points: "",
                excluded: false,
              },
            ],
          });
        }}
      >
        <Plus size={16} />
        {t({ en: "Add course", ar: "إضافة مساق" })}
      </button>
      <details className="gpa-prior">
        <summary>
          {t({
            en: "Include previous cumulative GPA",
            ar: "إضافة المعدّل التراكمي السابق",
          })}
        </summary>
        <label>
          {t({ en: "Previous credits", ar: "الساعات السابقة" })}
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={10000}
            step="any"
            value={draft.priorCredits}
            onChange={(event) => update({ priorCredits: event.target.value })}
          />
        </label>
        <label>
          {t({ en: "Previous GPA", ar: "المعدّل السابق" })}
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={Number(draft.scale) || 4}
            step="any"
            value={draft.priorGpa}
            onChange={(event) => update({ priorGpa: event.target.value })}
          />
        </label>
      </details>
      {!result.valid && (
        <p role="alert">
          {t({
            en: "Check the marked values. Credits must be positive and points within your selected scale.",
            ar: "تحقق من القيم المحددة. يجب أن تكون الساعات موجبة والنقاط ضمن المقياس المختار.",
          })}
        </p>
      )}
      <div className="gpa-results" aria-live="polite">
        <span>
          {t({ en: "Term GPA", ar: "المعدّل الفصلي" })}
          <output>{result.term?.toFixed(3) ?? "—"}</output>
        </span>
        <span>
          {t({ en: "Cumulative GPA", ar: "المعدّل التراكمي" })}
          <output>{result.cumulative?.toFixed(3) ?? "—"}</output>
        </span>
      </div>
      <small role="status">
        {t(
          storageFailed
            ? {
                en: "Storage unavailable. Copy your result before leaving.",
                ar: "التخزين غير متاح. انسخ نتيجتك قبل المغادرة.",
              }
            : key
              ? {
                  en: "Planning inputs stay private to your account on this device.",
                  ar: "مدخلات التخطيط خاصة بحسابك على هذا الجهاز.",
                }
              : {
                  en: "Try the calculator here. Sign in to keep your inputs on this device.",
                  ar: "جرّب الحاسبة هنا. سجّل الدخول لحفظ مدخلاتك على هذا الجهاز.",
                },
        )}
      </small>
    </section>
  );
}
