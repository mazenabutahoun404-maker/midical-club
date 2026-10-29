import { useId } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import type { Field } from "./academic-fields";
import { recordName } from "./academic-fields";
export function AcademicFields({
  fields,
  value,
  onChange,
  disabled,
  choices = {},
}: {
  fields: Field[];
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  disabled?: boolean;
  choices?: Record<string, Record<string, unknown>[]>;
}) {
  const { t } = useLocale(),
    prefix = useId();
  return (
    <div className="academic-form-grid">
      {fields.map((field) => {
        const id = prefix + field.key,
          raw = value[field.key];
        let display = String(raw ?? "");
        if (field.type === "datetime-local" && display) {
          const d = new Date(display);
          if (!Number.isNaN(d.getTime()))
            display = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
        }
        const update = (text: string) =>
          onChange({
            ...value,
            [field.key]:
              text === ""
                ? null
                : field.type === "number"
                  ? Number(text)
                  : field.type === "datetime-local"
                    ? new Date(text).toISOString()
                    : text,
          });
        const control =
          field.type === "checkbox" ? (
            <input
              id={id}
              type="checkbox"
              checked={raw === true}
              onChange={(e) =>
                onChange({ ...value, [field.key]: e.target.checked })
              }
              disabled={disabled}
            />
          ) : field.options ? (
            <select
              id={id}
              value={display}
              required={field.required}
              disabled={disabled}
              onChange={(e) => update(e.target.value)}
            >
              <option value="">{t({ en: "Choose…", ar: "اختر…" })}</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {t({
                    en: option.replace(/([a-z])([A-Z])/g, "$1 $2"),
                    ar:
                      (
                        {
                          First: "الأول",
                          Second: "الثاني",
                          Summer: "الصيفي",
                          Draft: "مسودة",
                          Active: "نشط",
                          Archived: "مؤرشف",
                          Published: "منشور",
                          Basic: "أساسية",
                          Clinical: "سريرية",
                          BasicBatch: "دفعة العلوم الأساسية",
                          ClinicalYear: "سنة سريرية",
                          Registration: "تسجيل",
                          AutomaticPromotion: "ترفيع تلقائي",
                          ManualPromotion: "ترفيع يدوي",
                          Transfer: "نقل",
                          Correction: "تصحيح",
                          Graduation: "تخرج",
                        } as Record<string, string>
                      )[option] || option,
                  })}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              id={id}
              value={display}
              required={field.required}
              disabled={disabled}
              onChange={(e) => update(e.target.value)}
            />
          ) : (
            <input
              id={id}
              type={field.type || "text"}
              value={display}
              required={field.required}
              disabled={disabled}
              min={field.min}
              max={field.max}
              step={field.step ?? (field.key === "credits" ? "any" : undefined)}
              list={field.reference ? id + "-list" : undefined}
              onChange={(e) => update(e.target.value)}
            />
          );
        return (
          <label
            key={field.key}
            className={field.type === "checkbox" ? "academic-checkbox" : ""}
            htmlFor={id}
          >
            <span>
              {t(field.label)}
              {field.required ? " *" : ""}
            </span>
            {control}
            {field.reference && (
              <>
                <datalist id={id + "-list"}>
                  {(choices[field.reference] || []).map((row) => (
                    <option value={String(row.id)} key={String(row.id)}>
                      {recordName(row)}
                    </option>
                  ))}
                </datalist>
                <small>
                  {t({
                    en: "Choose a suggestion or enter the record reference.",
                    ar: "اختر اقتراحًا أو أدخل معرّف السجل.",
                  })}
                </small>
              </>
            )}
          </label>
        );
      })}
    </div>
  );
}
export function AcademicPager({
  page,
  totalPages,
  onChange,
  disabled = false,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  const { t } = useLocale();
  return (
    <div className="academic-pager account-security-actions">
      <Button
        variant="outline"
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t({ en: "Previous", ar: "السابق" })}
      </Button>
      <span>
        {page} / {Math.max(1, totalPages)}
      </span>
      <Button
        variant="outline"
        disabled={disabled || page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        {t({ en: "Next", ar: "التالي" })}
      </Button>
    </div>
  );
}
export function downloadAcademicFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
