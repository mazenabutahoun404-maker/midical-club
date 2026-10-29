import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { publicationInputSchemas } from "../../services/api/publication-inputs.generated";
import { record, string } from "../../services/api/mapping";
import { Button } from "../../components/ui/button";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { objectJson } from "../../features/publications/shared";
const labels: Record<string, { en: string; ar: string }> = {
  slug: { en: "Address name", ar: "اسم الرابط" },
  title: { en: "Title", ar: "العنوان" },
  name: { en: "Name", ar: "الاسم" },
  fullName: { en: "Full name", ar: "الاسم الكامل" },
  summary: { en: "Summary", ar: "الملخص" },
  description: { en: "Description", ar: "الوصف" },
  isFeatured: { en: "Featured", ar: "مميز" },
  featuredOrder: { en: "Featured order", ar: "ترتيب العناصر المميزة" },
  displayOrder: { en: "Display order", ar: "ترتيب العرض" },
  sortOrder: { en: "Sort order", ar: "ترتيب الفرز" },
  timezoneId: { en: "Time zone", ar: "المنطقة الزمنية" },
  participantCount: { en: "Participants", ar: "المشاركون" },
  impact: { en: "Impact", ar: "الأثر" },
  startsAt: {
    en: "Starts at (with UTC offset)",
    ar: "البداية (مع فرق التوقيت)",
  },
  endsAt: { en: "Ends at (with UTC offset)", ar: "النهاية (مع فرق التوقيت)" },
  locationName: { en: "Location", ar: "المكان" },
  organizer: { en: "Organizer", ar: "الجهة المنظمة" },
  issueNumber: { en: "Issue number", ar: "رقم العدد" },
  volumeNumber: { en: "Volume number", ar: "رقم المجلد" },
  releaseDate: { en: "Release date", ar: "تاريخ الإصدار" },
  startsOn: { en: "Start date", ar: "تاريخ البداية" },
  endsOn: { en: "End date", ar: "تاريخ النهاية" },
  termStartDate: { en: "Term start", ar: "بداية الدورة" },
  termEndDate: { en: "Term end", ar: "نهاية الدورة" },
  honoreeType: { en: "Honoree type", ar: "نوع المكرّم" },
  honorTitle: { en: "Honor title", ar: "لقب التكريم" },
  achievement: { en: "Achievement", ar: "الإنجاز" },
  honoredOn: { en: "Honor date", ar: "تاريخ التكريم" },
  grantingEntity: { en: "Granting body", ar: "الجهة المانحة" },
  graduationYear: { en: "Graduation year", ar: "سنة التخرج" },
  batchLabel: { en: "Batch", ar: "الدفعة" },
  specialty: { en: "Specialty", ar: "التخصص" },
  workplace: { en: "Workplace", ar: "مكان العمل" },
  jobTitle: { en: "Job title", ar: "المسمى الوظيفي" },
  bio: { en: "Biography", ar: "السيرة" },
  mentorshipOptIn: { en: "Available for mentorship", ar: "متاح للإرشاد" },
  role: { en: "Asset role", ar: "دور الملف" },
  linkType: { en: "Link type", ar: "نوع الرابط" },
  url: { en: "Address", ar: "الرابط" },
  altText: { en: "Alternative text", ar: "النص البديل" },
  position: { en: "Position", ar: "المنصب" },
  caption: { en: "Caption", ar: "التعليق" },
  dayNumber: { en: "Day number", ar: "رقم اليوم" },
  itemType: { en: "Item type", ar: "نوع العنصر" },
  organization: { en: "Organization", ar: "المؤسسة" },
  tier: { en: "Sponsor tier", ar: "فئة الراعي" },
  location: { en: "Location", ar: "المكان" },
  capturedAt: {
    en: "Captured at (with UTC offset)",
    ar: "تاريخ الالتقاط (مع فرق التوقيت)",
  },
};
export function fieldLabel(key: string, locale: string) {
  const stem = key.replace(/(En|Ar)$/, ""),
    lang = key.endsWith("En")
      ? " (English)"
      : key.endsWith("Ar")
        ? " (العربية)"
        : "";
  return (
    (labels[stem]?.[locale === "ar" ? "ar" : "en"] ||
      key.replace(/([a-z])([A-Z])/g, "$1 $2")) + lang
  );
}
export function Fields({
  schema,
  keys,
  value,
  onChange,
  disabled = false,
}: {
  schema: string;
  keys?: string[];
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const { locale } = useLocale(),
    props = record(record(publicationInputSchemas[schema]).properties);
  return (
    <div className="publication-fields">
      {(keys || Object.keys(props))
        .filter((k) => k !== "id" && k !== "version")
        .map((key) => {
          const s = record(props[key]);
          if (
            !["string", "integer", "boolean", "number"].includes(string(s.type))
          )
            return null;
          const val = value[key];
          return (
            <label
              key={key}
              className={s.type === "boolean" ? "publication-check" : ""}
            >
              {s.type === "boolean" ? (
                <>
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={val === true}
                    onChange={(e) =>
                      onChange({ ...value, [key]: e.target.checked })
                    }
                  />
                  {fieldLabel(key, locale)}
                </>
              ) : (
                <>
                  {fieldLabel(key, locale)}
                  {[
                    "summary",
                    "description",
                    "bio",
                    "achievement",
                    "impact",
                  ].some((x) => key.startsWith(x)) ? (
                    <textarea
                      dir={
                        key.endsWith("Ar")
                          ? "rtl"
                          : key.endsWith("En")
                            ? "ltr"
                            : undefined
                      }
                      disabled={disabled}
                      value={string(val)}
                      onChange={(e) =>
                        onChange({ ...value, [key]: e.target.value || null })
                      }
                    />
                  ) : (
                    <input
                      disabled={disabled}
                      dir={
                        key.endsWith("Ar")
                          ? "rtl"
                          : key.endsWith("En")
                            ? "ltr"
                            : undefined
                      }
                      type={
                        s.format === "date"
                          ? "date"
                          : s.type === "integer" || s.type === "number"
                            ? "number"
                            : "text"
                      }
                      step={s.type === "integer" ? 1 : undefined}
                      value={typeof val === "number" ? val : string(val)}
                      placeholder={
                        s.format === "date-time"
                          ? "2026-11-01T09:00:00+03:00"
                          : s.format === "uuid"
                            ? "UUID"
                            : undefined
                      }
                      onChange={(e) =>
                        onChange({
                          ...value,
                          [key]:
                            e.target.value === ""
                              ? s.nullable
                                ? null
                                : undefined
                              : s.type === "integer" || s.type === "number"
                                ? Number(e.target.value)
                                : e.target.value,
                        })
                      }
                    />
                  )}
                </>
              )}
            </label>
          );
        })}
    </div>
  );
}
export function DocumentJson({
  value,
  onApply,
}: {
  value: Record<string, unknown>;
  onApply: (v: Record<string, unknown>) => void;
}) {
  const { t } = useLocale(),
    [text, setText] = useState(JSON.stringify(value, null, 2)),
    [error, setError] = useState<unknown>(null);
  return (
    <details className="publication-json">
      <summary>
        {t({
          en: "Advanced: complete document JSON",
          ar: "متقدم: مستند JSON الكامل",
        })}
      </summary>
      <p>
        {t({
          en: "Applying replaces this editor draft. Existing fields are retained until you apply the complete edited document.",
          ar: "يستبدل التطبيق مسودة المحرر. تبقى الحقول الحالية حتى تطبّق المستند الكامل المعدّل.",
        })}
      </p>
      <Button
        variant="outline"
        type="button"
        onClick={() => setText(JSON.stringify(value, null, 2))}
      >
        {t({
          en: "Load current editor draft",
          ar: "تحميل مسودة المحرر الحالية",
        })}
      </Button>
      <textarea
        aria-label={t({
          en: "Complete document JSON",
          ar: "مستند JSON الكامل",
        })}
        dir="ltr"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          try {
            onApply(objectJson(text));
            setError(null);
          } catch (e) {
            setError(e);
          }
        }}
      >
        {t({ en: "Apply JSON to draft", ar: "تطبيق JSON على المسودة" })}
      </Button>
      <ApiActionError error={error} />
    </details>
  );
}
