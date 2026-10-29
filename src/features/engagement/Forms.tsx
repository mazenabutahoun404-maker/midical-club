import { useState, type ReactNode } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { engagementInputSchemas } from "../../services/api/engagement-inputs.generated";
import {
  validateEngagementSchema,
  engagementVersion,
} from "../../services/api/engagement-contracts";
import { record, string } from "../../services/api/mapping";
import { useEngagementAction, objectJson } from "./shared";
import { fieldLabel } from "../../admin/publications/Fields";
import { questionKind, questionOptions, localizedField } from "./model";
const engagementLabels: Record<string, { en: string; ar: string }> = {
  hours: { en: "Hours", ar: "الساعات" },
  activityDescription: { en: "Volunteer activity", ar: "النشاط التطوعي" },
  serviceDate: { en: "Service date", ar: "تاريخ التطوع" },
  evidenceAssetIds: {
    en: "Existing evidence files",
    ar: "ملفات الإثبات الموجودة",
  },
  userId: { en: "Student ID", ar: "معرّف الطالب" },
  eventId: { en: "Event ID", ar: "معرّف الفعالية" },
  registrationId: { en: "Registration ID", ar: "معرّف التسجيل" },
  sourceUrl: { en: "Original source link", ar: "رابط المصدر الأصلي" },
  sourceName: { en: "Source name", ar: "اسم المصدر" },
  applicationUrl: { en: "Application website", ar: "موقع التقديم" },
  opensAt: {
    en: "Opens at (include UTC offset)",
    ar: "موعد الفتح (مع فرق التوقيت)",
  },
  deadlineAt: {
    en: "Deadline (include UTC offset)",
    ar: "الموعد النهائي (مع فرق التوقيت)",
  },
  audiences: { en: "Complete audience", ar: "الجمهور الكامل" },
  eligibleStudyYears: {
    en: "Eligible study years",
    ar: "السنوات الدراسية المؤهلة",
  },
  registrationQuestions: { en: "Registration questions", ar: "أسئلة التسجيل" },
  evaluationQuestions: { en: "Evaluation questions", ar: "أسئلة التقييم" },
  assets: { en: "Linked files", ar: "الملفات المرتبطة" },
  presentation: { en: "Display information", ar: "معلومات العرض" },
  locationMode: { en: "Location format", ar: "طريقة الحضور" },
  attendanceMode: { en: "Attendance method", ar: "طريقة تسجيل الحضور" },
  certificateRule: {
    en: "Certificate eligibility rule",
    ar: "قاعدة أهلية الشهادة",
  },
  certificateEnabled: { en: "Enable certificates", ar: "تفعيل الشهادات" },
  certificateTemplateId: {
    en: "Certificate template ID",
    ar: "معرّف قالب الشهادة",
  },
  minimumDurationPercentage: {
    en: "Minimum attendance percentage",
    ar: "أدنى نسبة حضور",
  },
  autoIssueCertificates: {
    en: "Automatically issue eligible certificates",
    ar: "إصدار الشهادات المؤهلة تلقائيًا",
  },
  evaluationEnabled: { en: "Enable evaluations", ar: "تفعيل التقييمات" },
  volunteerHoursEnabled: {
    en: "Enable volunteer hours",
    ar: "تفعيل الساعات التطوعية",
  },
  defaultVolunteerHours: {
    en: "Default volunteer hours",
    ar: "الساعات التطوعية الافتراضية",
  },
  promotionConfirmationHours: {
    en: "Hours to confirm an offered seat",
    ar: "مهلة تأكيد المقعد بالساعات",
  },
  waitlistEnabled: { en: "Enable waiting list", ar: "تفعيل قائمة الانتظار" },
  capacity: {
    en: "Capacity (blank: no declared limit)",
    ar: "السعة (فارغ: بلا حد معلن)",
  },
  registrationOpensAt: {
    en: "Registration opens (include UTC offset)",
    ar: "فتح التسجيل (مع فرق التوقيت)",
  },
  registrationClosesAt: {
    en: "Registration closes (include UTC offset)",
    ar: "إغلاق التسجيل (مع فرق التوقيت)",
  },
  cancellationDeadlineAt: {
    en: "Cancellation deadline (include UTC offset)",
    ar: "آخر موعد للإلغاء (مع فرق التوقيت)",
  },
  checkinOpensAt: {
    en: "Check-in opens (include UTC offset)",
    ar: "فتح تسجيل الدخول (مع فرق التوقيت)",
  },
  checkinClosesAt: {
    en: "Check-in closes (include UTC offset)",
    ar: "إغلاق تسجيل الدخول (مع فرق التوقيت)",
  },
  checkoutOpensAt: {
    en: "Check-out opens (include UTC offset)",
    ar: "فتح تسجيل الخروج (مع فرق التوقيت)",
  },
  checkoutClosesAt: {
    en: "Check-out closes (include UTC offset)",
    ar: "إغلاق تسجيل الخروج (مع فرق التوقيت)",
  },
  checkinAt: {
    en: "Check-in time (include UTC offset)",
    ar: "وقت الدخول (مع فرق التوقيت)",
  },
  checkoutAt: {
    en: "Check-out time (include UTC offset)",
    ar: "وقت الخروج (مع فرق التوقيت)",
  },
  eligibleOverride: {
    en: "Override attendance eligibility",
    ar: "تجاوز أهلية الحضور",
  },
  reason: { en: "Reason", ar: "السبب" },
  report: { en: "Report", ar: "التقرير" },
  format: { en: "Format", ar: "الصيغة" },
  backgroundAssetId: { en: "Background file ID", ar: "معرّف ملف الخلفية" },
  layout: { en: "Certificate layout", ar: "تصميم الشهادة" },
  answers: { en: "Submitted question answers", ar: "إجابات الأسئلة" },
  publicOnlineUrl: {
    en: "Public online event link",
    ar: "الرابط العام للفعالية",
  },
  activityId: { en: "Linked activity ID", ar: "معرّف النشاط المرتبط" },
  conferenceId: { en: "Linked conference ID", ar: "معرّف المؤتمر المرتبط" },
  status: { en: "Status", ar: "الحالة" },
  type: { en: "Type", ar: "النوع" },
};
export function EngagementFields({
  schema,
  value,
  onChange,
  disabled = false,
}: {
  schema: string;
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const { locale, t } = useLocale(),
    props = record(record(engagementInputSchemas[schema]).properties);
  return (
    <div className="engagement-fields">
      {Object.entries(props)
        .filter(([key]) => key !== "version")
        .map(([key, spec]) => {
          const s = record(spec),
            val = value[key],
            label = engagementLabels[key]
              ? t(engagementLabels[key])
              : fieldLabel(key, locale);
          if (s.type === "boolean")
            return (
              <label key={key} className="engagement-check">
                <input
                  disabled={disabled}
                  type="checkbox"
                  checked={val === true}
                  onChange={(e) =>
                    onChange({ ...value, [key]: e.target.checked })
                  }
                />
                {label}
              </label>
            );
          if (s.type === "array" || s.type === "object" || s.$ref || s.allOf)
            return (
              <JsonPart
                key={key}
                label={label}
                value={val}
                disabled={disabled}
                onApply={(v) => {
                  validateEngagementSchema(v, spec, key);
                  onChange({ ...value, [key]: v });
                }}
              />
            );
          return (
            <label key={key}>
              {label}
              {/(content|summary|description|reason)/i.test(key) ? (
                <textarea
                  disabled={disabled}
                  value={string(val)}
                  dir={
                    key.endsWith("Ar")
                      ? "rtl"
                      : key.endsWith("En")
                        ? "ltr"
                        : undefined
                  }
                  onChange={(e) =>
                    onChange({ ...value, [key]: e.target.value || null })
                  }
                />
              ) : (
                <input
                  disabled={disabled}
                  type={
                    s.format === "date"
                      ? "date"
                      : s.type === "number" || s.type === "integer"
                        ? "number"
                        : "text"
                  }
                  step={s.type === "integer" ? "1" : "any"}
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
            </label>
          );
        })}
    </div>
  );
}
function JsonPart({
  label,
  value,
  onApply,
  disabled,
}: {
  label: string;
  value: unknown;
  onApply: (v: unknown) => void;
  disabled: boolean;
}) {
  const { t } = useLocale(),
    [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2)),
    [error, setError] = useState<unknown>(null);
  return (
    <details className="engagement-json">
      <summary>{label}</summary>
      <p>
        {t({
          en: "This complete field is replaced only when you apply JSON.",
          ar: "يُستبدل هذا الحقل الكامل فقط عند تطبيق JSON.",
        })}
      </p>
      <textarea
        aria-label={label + " JSON"}
        dir="ltr"
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => {
          try {
            onApply(JSON.parse(text));
            setError(null);
          } catch (e) {
            setError(e);
          }
        }}
      >
        {t({ en: "Apply field", ar: "تطبيق الحقل" })}
      </Button>
      <ApiActionError error={error} />
    </details>
  );
}
export function EngagementEditor({
  title,
  schema,
  initial,
  version,
  onSave,
  onClose,
  description,
  children,
}: {
  title: string;
  schema: string;
  initial: Record<string, unknown>;
  version?: string;
  onSave: (body: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  description?: string;
  children?: ReactNode;
}) {
  const { t } = useLocale(),
    [draft, setDraft] = useState(() => structuredClone(initial)),
    [captured] = useState(version),
    action = useEngagementAction(),
    [json, setJson] = useState(""),
    [reviewed, setReviewed] = useState(false);
  return (
    <Modal
      open
      title={title}
      description={
        description ||
        t({
          en: "Review the complete record before saving.",
          ar: "راجع السجل الكامل قبل الحفظ.",
        })
      }
      className="engagement-modal"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(() => {
            const body = {
              ...draft,
              ...(captured ? { version: engagementVersion(captured) } : {}),
            };
            validateEngagementSchema(body, engagementInputSchemas[schema]);
            return onSave(body);
          }, onClose);
        }}
      >
        <EngagementFields
          schema={schema}
          value={draft}
          onChange={setDraft}
          disabled={action.busy}
        />
        <details className="engagement-json">
          <summary>
            {t({
              en: "Advanced: complete request JSON",
              ar: "متقدم: طلب JSON الكامل",
            })}
          </summary>
          <Button
            type="button"
            variant="outline"
            onClick={() => setJson(JSON.stringify(draft, null, 2))}
          >
            {t({ en: "Load editor draft", ar: "تحميل مسودة المحرر" })}
          </Button>
          <textarea
            aria-label="Complete request JSON"
            dir="ltr"
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              try {
                const v = objectJson(json);
                validateEngagementSchema(v, engagementInputSchemas[schema]);
                setDraft(v);
              } catch (e) {
                action.setError(e);
              }
            }}
          >
            {t({ en: "Apply JSON to draft", ar: "تطبيق JSON على المسودة" })}
          </Button>
        </details>
        {captured && (
          <p className="muted">
            {t({ en: "Captured version", ar: "الإصدار الملتقط" })}:{" "}
            <code>{captured}</code>
          </p>
        )}
        {children}
        <label className="engagement-check">
          <input
            type="checkbox"
            required
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
          />
          {t({
            en:
              schema === "VolunteerRequest"
                ? "I reviewed the hours, date and volunteer activity."
                : "I reviewed this complete record and its audience/linked fields.",
            ar:
              schema === "VolunteerRequest"
                ? "راجعت الساعات والتاريخ والنشاط التطوعي."
                : "راجعت السجل الكامل وحقول الجمهور والروابط.",
          })}
        </label>
        {action.feedback}
        <Button type="submit" disabled={action.busy || !reviewed}>
          {t({ en: "Save", ar: "حفظ" })}
        </Button>
      </form>
    </Modal>
  );
}
export function EngagementConfirm({
  title,
  version,
  onExecute,
  onClose,
  children,
  allowHours = false,
  requireHours = false,
}: {
  title: string;
  version?: string;
  onExecute: (body: {
    version?: string;
    reason: string;
    approvedHours?: number;
  }) => Promise<unknown>;
  onClose: () => void;
  children?: ReactNode;
  allowHours?: boolean;
  requireHours?: boolean;
}) {
  const { t } = useLocale(),
    [captured] = useState(version),
    [reason, setReason] = useState(""),
    [hours, setHours] = useState(""),
    [reviewed, setReviewed] = useState(false),
    action = useEngagementAction();
  return (
    <Modal
      open
      title={title}
      description={t({
        en: "Confirm the selected action on the reviewed record.",
        ar: "أكّد الإجراء المحدد على السجل المراجع.",
      })}
      className="engagement-modal"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(
            () =>
              onExecute({
                ...(captured ? { version: engagementVersion(captured) } : {}),
                reason: reason.trim(),
                ...(hours !== "" ? { approvedHours: Number(hours) } : {}),
              }),
            onClose,
          );
        }}
      >
        {children}
        <label>
          {t({ en: "Reason", ar: "السبب" })}
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        {allowHours && (
          <label>
            {t({
              en: requireHours
                ? "Corrected approved hours"
                : "Approved hours (optional)",
              ar: requireHours
                ? "الساعات المعتمدة المصححة"
                : "الساعات المعتمدة (اختياري)",
            })}
            <input
              type="number"
              required={requireHours}
              min="0"
              step="any"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </label>
        )}
        {captured && (
          <p>
            <code>{captured}</code>
          </p>
        )}
        <label className="engagement-check">
          <input
            required
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
          />
          {t({
            en: "I reviewed the record and this action.",
            ar: "راجعت السجل وهذا الإجراء.",
          })}
        </label>
        {action.feedback}
        <Button
          type="submit"
          disabled={
            action.busy ||
            !reviewed ||
            !reason.trim() ||
            (requireHours && hours === "")
          }
        >
          {t({ en: "Confirm", ar: "تأكيد" })}
        </Button>
      </form>
    </Modal>
  );
}
export function DynamicQuestions({
  questions,
  value,
  onChange,
}: {
  questions: Record<string, unknown>[];
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const { locale, t } = useLocale();
  return (
    <div className="engagement-question-list">
      {questions.map((q) => {
        const id = string(q.id),
          kind = questionKind(q.questionType),
          options = questionOptions(q),
          label =
            localizedField(q, "text", locale) + (q.isRequired ? " *" : "");
        if (
          [
            "multiplechoice",
            "multiselect",
            "multipleselect",
            "multichoice",
            "checkboxes",
          ].includes(kind)
        )
          return (
            <fieldset key={id}>
              <legend>{label}</legend>
              {options.map((option) => (
                <label className="engagement-check" key={option}>
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(value[id]) &&
                      (value[id] as unknown[]).includes(option)
                    }
                    onChange={(e) => {
                      const items = Array.isArray(value[id])
                        ? (value[id] as string[])
                        : [];
                      onChange({
                        ...value,
                        [id]: e.target.checked
                          ? [...items, option]
                          : items.filter((x) => x !== option),
                      });
                    }}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          );
        if (options.length)
          return (
            <label key={id}>
              {label}
              <select
                required={q.isRequired === true}
                value={string(value[id])}
                onChange={(e) => onChange({ ...value, [id]: e.target.value })}
              >
                <option value="">
                  {t({ en: "Choose an answer", ar: "اختر إجابة" })}
                </option>
                {options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          );
        if (["boolean", "yesno", "checkbox"].includes(kind))
          return (
            <label key={id}>
              {label}
              <select
                required={q.isRequired === true}
                value={typeof value[id] === "boolean" ? String(value[id]) : ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    [id]:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true",
                  })
                }
              >
                <option value="">
                  {t({ en: "Choose an answer", ar: "اختر إجابة" })}
                </option>
                <option value="true">{t({ en: "Yes", ar: "نعم" })}</option>
                <option value="false">{t({ en: "No", ar: "لا" })}</option>
              </select>
            </label>
          );
        if (
          [
            "text",
            "shorttext",
            "longtext",
            "textarea",
            "string",
            "number",
            "rating",
            "integer",
            "scale",
          ].includes(kind)
        )
          return (
            <label key={id}>
              {label}
              <input
                required={q.isRequired === true}
                type={
                  ["number", "rating", "integer", "scale"].includes(kind)
                    ? "number"
                    : "text"
                }
                step="any"
                value={
                  typeof value[id] === "number"
                    ? (value[id] as number)
                    : string(value[id])
                }
                onChange={(e) =>
                  onChange({
                    ...value,
                    [id]:
                      e.target.type === "number"
                        ? e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                        : e.target.value,
                  })
                }
              />
            </label>
          );
        return (
          <JsonPart
            key={id}
            label={label + " (" + string(q.questionType) + ")"}
            value={value[id]}
            onApply={(v) => onChange({ ...value, [id]: v })}
            disabled={false}
          />
        );
      })}
    </div>
  );
}
