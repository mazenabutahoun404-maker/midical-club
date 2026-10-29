import { Facts as ApiFacts } from "../../admin/operations/UI";
import { useState, type ReactNode } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { record, string, array } from "../../services/api/mapping";
import { MembershipEditor } from "./Forms";
import {
  type MembershipOperation,
  questionOptions,
  answersPayload,
  type Question,
} from "./model";
export { Table, JsonDetails, CountCards } from "../../admin/operations/UI";
export type Edit = {
  operation: MembershipOperation;
  title: string;
  path?: Record<string, string>;
  initial?: Record<string, unknown>;
  description?: string;
  requireFields?: string[];
  manualVersion?: boolean;
  hiddenFields?: string[];
};
export function EditDialog({
  edit,
  onClose,
  onSaved,
}: {
  edit: Edit;
  onClose: () => void;
  onSaved?: (v: unknown, body?: Record<string, unknown>) => void;
}) {
  return <MembershipEditor {...edit} onClose={onClose} onSaved={onSaved} />;
}
export function Localized({ row, field }: { row: unknown; field: string }) {
  const { locale } = useLocale(),
    r = record(row);
  return (
    <>
      {string(r[field + (locale === "ar" ? "Ar" : "En")]) ||
        string(r[field + "Ar"]) ||
        string(r[field + "En"])}
    </>
  );
}
export function SectionHeading({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <header className="engagement-heading">
      <span className="eyebrow">medClub</span>
      <h1 tabIndex={-1} data-page-heading>
        {title}
      </h1>
      {body && <p>{body}</p>}
      {children}
    </header>
  );
}
export function PrivateText({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  const [show, setShow] = useState(false),
    { t } = useLocale();
  return (
    <section className="membership-private">
      <Button variant="outline" onClick={() => setShow(!show)}>
        {show ? t({ en: "Hide", ar: "إخفاء" }) : t({ en: "Show", ar: "إظهار" })}{" "}
        {label}
      </Button>
      {show && <p>{string(value) || "—"}</p>}
    </section>
  );
}
export function QuestionFields({
  questions,
  values,
  onChange,
}: {
  questions: Question[];
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const { locale, t } = useLocale();
  return (
    <>
      {questions.map((q) => {
        const id = string(q.id),
          type = string(q.type || q.questionType)
            .replace(/[-_ ]/g, "")
            .toLowerCase(),
          options = questionOptions(q),
          value = values[id],
          required = q.required === true || q.isRequired === true,
          label =
            string(q[locale === "ar" ? "textAr" : "textEn"]) ||
            string(q.textAr) ||
            string(q.textEn),
          set = (v: unknown) => onChange({ ...values, [id]: v });
        return (
          <label key={id}>
            {label}
            {required ? " *" : ""}
            {options.length && /multi|check/.test(type) ? (
              <select
                multiple
                value={Array.isArray(value) ? value.map(String) : []}
                onChange={(e) =>
                  set(Array.from(e.target.selectedOptions, (v) => v.value))
                }
              >
                {options.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            ) : options.length ? (
              <select
                value={string(value)}
                onChange={(e) => set(e.target.value)}
              >
                <option value="">{t({ en: "Choose", ar: "اختر" })}</option>
                {options.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            ) : /bool|yesno/.test(type) ? (
              <select
                value={value === undefined ? "" : String(value)}
                onChange={(e) =>
                  set(
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  )
                }
              >
                <option value="">{t({ en: "Choose", ar: "اختر" })}</option>
                <option value="true">{t({ en: "Yes", ar: "نعم" })}</option>
                <option value="false">{t({ en: "No", ar: "لا" })}</option>
              </select>
            ) : /number|integer|rating/.test(type) ? (
              <input
                type="number"
                value={typeof value === "number" ? value : ""}
                onChange={(e) =>
                  set(
                    e.target.value === "" ? undefined : e.target.valueAsNumber,
                  )
                }
              />
            ) : !type || /text|paragraph|short|long/.test(type) ? (
              <textarea
                value={string(value)}
                onChange={(e) => set(e.target.value)}
              />
            ) : (
              <UnknownAnswer value={value} onChange={set} />
            )}
          </label>
        );
      })}
    </>
  );
}
function UnknownAnswer({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [raw, setRaw] = useState(
    value === undefined ? "" : JSON.stringify(value),
  );
  return (
    <textarea
      dir="ltr"
      value={raw}
      placeholder="JSON"
      onChange={(e) => {
        setRaw(e.target.value);
        try {
          onChange(JSON.parse(e.target.value));
        } catch {
          onChange(undefined);
        }
      }}
    />
  );
}
export function AnswersForm({
  title,
  questions,
  onSubmit,
  onClose,
  children,
  busy,
  feedback,
}: {
  title: string;
  questions: Question[];
  onSubmit: (
    answers: { questionId: string; value: unknown }[],
  ) => Promise<unknown> | void;
  onClose: () => void;
  children?: ReactNode;
  busy: boolean;
  feedback: ReactNode;
}) {
  const { t } = useLocale(),
    [values, setValues] = useState<Record<string, unknown>>({}),
    [ack, setAck] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal
      open
      title={title}
      description={t({
        en: "Review your answers before sending.",
        ar: "راجع إجاباتك قبل الإرسال.",
      })}
      onClose={() => {
        if (!busy) onClose();
      }}
      className="engagement-modal membership-editor"
    >
      <form
        className="engagement-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ack) return;
          try {
            const answers = answersPayload(questions, values);
            setError("");
            void onSubmit(answers);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Invalid answers");
          }
        }}
      >
        <fieldset disabled={busy}>
          <QuestionFields
            questions={questions}
            values={values}
            onChange={setValues}
          />
          {children}
          <label className="engagement-check">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            {t({
              en: "I reviewed these answers and want to send them.",
              ar: "راجعت هذه الإجابات وأرغب في إرسالها.",
            })}
          </label>
        </fieldset>
        {error && <p role="alert">{error}</p>}
        {feedback}
        <div className="membership-actions">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onClose}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </Button>
          <Button disabled={busy || !ack}>{title}</Button>
        </div>
      </form>
    </Modal>
  );
}

const factArabic: Record<string, string> = {
  id: "المعرّف",
  name: "الاسم",
  status: "الحالة",
  capacity: "السعة",
  activeMentees: "الطلاب الحاليون",
  supportsIndividual: "الجلسات الفردية",
  supportsGroup: "الجلسات الجماعية",
  supportsOnline: "عن بعد",
  supportsInPerson: "بالحضور",
  startsAt: "وقت البدء",
  endsAt: "وقت الانتهاء",
  mode: "طريقة الحضور",
  sessionType: "نوع الجلسة",
  available: "المتاح",
  registeredCount: "عدد المسجلين",
  participantStatus: "حالة المشاركة",
  registeredAt: "وقت التسجيل",
  cancelledAt: "وقت الإلغاء",
  submittedAt: "وقت الإرسال",
  studentMessage: "رسالة الطالب",
  decisionReason: "سبب القرار",
  count: "العدد",
  averageRating: "متوسط التقييم",
  applicationCount: "عدد الطلبات",
  opensAt: "فتح التقديم",
  closesAt: "إغلاق التقديم",
  motivation: "الدافع",
  experience: "الخبرة",
  availability: "التفرغ",
  consentConfirmed: "تأكيد الموافقة",
  scheduledAt: "موعد المقابلة",
  durationMinutes: "المدة بالدقائق",
  isRequired: "مطلوب",
  completedAt: "وقت الإكمال",
  waiverReason: "سبب الإعفاء",
  joinedAt: "وقت الانضمام",
  publicVisibility: "العرض العام",
  displayOrder: "ترتيب العرض",
  category: "الفئة",
  publishedAt: "وقت النشر",
  answererNameSnapshot: "صاحب الإجابة",
  commitmentHoursPerWeek: "ساعات الالتزام أسبوعياً",
  openings: "الشواغر",
};
const statesArabic: Record<string, string> = {
  Active: "نشط",
  Published: "منشور",
  Draft: "مسودة",
  Pending: "معلق",
  Submitted: "مرسل",
  Accepted: "مقبول",
  Rejected: "مرفوض",
  Onboarding: "قيد التهيئة",
  Claimed: "أقرّه المتقدم",
  Completed: "مكتمل",
  Cancelled: "ملغى",
  Registered: "مسجل",
  Public: "عام",
  Private: "خاص",
  Online: "عن بعد",
  InPerson: "حضوري",
  Individual: "فردي",
  Group: "جماعي",
  Open: "مفتوح",
  Closed: "مغلق",
};
export function Facts({ value }: { value: unknown }) {
  const { locale, t } = useLocale();
  return (
    <ApiFacts
      value={Object.fromEntries(
        Object.entries(record(value)).map(([k, v]) => [
          locale === "ar" ? factArabic[k] || k : k,
          typeof v === "boolean"
            ? t(v ? { en: "Yes", ar: "نعم" } : { en: "No", ar: "لا" })
            : locale === "ar" &&
                typeof v === "string" &&
                [
                  "status",
                  "mode",
                  "sessionType",
                  "participantStatus",
                  "publicVisibility",
                ].includes(k)
              ? statesArabic[v] || v
              : v,
        ]),
      )}
    />
  );
}
