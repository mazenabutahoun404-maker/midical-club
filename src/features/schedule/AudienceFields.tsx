import { useLocale } from "../../app/providers/LocaleProvider";
import type { Schemas } from "../../services/api/schema.generated";
import { invalid } from "../../services/api/schedule-contracts";
export type AudienceDraft = {
  kind: string;
  ids: string;
  studyYears: string;
  permission: string;
};
export const emptyAudience = (): AudienceDraft => ({
  kind: "",
  ids: "",
  studyYears: "",
  permission: "",
});
export function audienceRequest(
  value: AudienceDraft,
): Schemas["AudienceRequest"] {
  if (!value.kind.trim())
    invalid("Enter the audience kind required by the service.");
  const split = (v: string) => v.split(/[\s,]+/).filter(Boolean),
    years = split(value.studyYears).map(Number);
  if (years.some((v) => !Number.isInteger(v) || v < 1))
    invalid("Study years must be positive whole numbers.");
  return {
    kind: value.kind.trim(),
    ids: split(value.ids),
    studyYears: years,
    permission: value.permission.trim() || null,
  };
}
export function AudienceFields({
  value,
  onChange,
}: {
  value: AudienceDraft;
  onChange: (v: AudienceDraft) => void;
}) {
  const { t } = useLocale();
  return (
    <fieldset className="schedule-fields">
      <legend>{t({ en: "Audience", ar: "الجمهور" })}</legend>
      <label>
        {t({ en: "Audience kind", ar: "نوع الجمهور" })}
        <input
          required
          value={value.kind}
          onChange={(e) => onChange({ ...value, kind: e.target.value })}
        />
      </label>
      <p className="schedule-note">
        {t({
          en: "Use a service-supported audience kind. No recipients are selected by default.",
          ar: "استخدم نوع جمهور تدعمه الخدمة. لا يُحدد أي مستلم افتراضياً.",
        })}
      </p>
      <label>
        {t({
          en: "Audience IDs (separated by commas)",
          ar: "معرّفات الجمهور (مفصولة بفواصل)",
        })}
        <textarea
          value={value.ids}
          onChange={(e) => onChange({ ...value, ids: e.target.value })}
        />
      </label>
      <label>
        {t({ en: "Study years (optional)", ar: "السنوات الدراسية (اختياري)" })}
        <input
          value={value.studyYears}
          onChange={(e) => onChange({ ...value, studyYears: e.target.value })}
        />
      </label>
      <label>
        {t({
          en: "Permission filter (optional)",
          ar: "تصفية بالصلاحية (اختياري)",
        })}
        <input
          value={value.permission}
          onChange={(e) => onChange({ ...value, permission: e.target.value })}
        />
      </label>
    </fieldset>
  );
}
