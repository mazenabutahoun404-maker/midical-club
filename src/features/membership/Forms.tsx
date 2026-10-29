import { useState, type FormEvent } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import { ApiError } from "../../services/api/client";
import {
  membershipRoutes,
  membershipSchemas,
} from "../../services/api/membership-contracts.generated";
import { membershipRequest, type MembershipOperation } from "./model";
import { useMembershipConnection, useMembershipAction } from "./shared";
const ar: Record<string, string> = {
  nameAr: "الاسم بالعربية",
  nameEn: "الاسم بالإنجليزية",
  slug: "الرابط",
  descriptionAr: "الوصف بالعربية",
  descriptionEn: "الوصف بالإنجليزية",
  displayOrder: "ترتيب العرض",
  status: "الحالة",
  bioAr: "النبذة بالعربية",
  bioEn: "النبذة بالإنجليزية",
  userId: "معرّف المستخدم",
  alumniProfileId: "معرّف الخريج",
  specialtyAr: "التخصص بالعربية",
  specialtyEn: "التخصص بالإنجليزية",
  workplaceAr: "مكان العمل بالعربية",
  workplaceEn: "مكان العمل بالإنجليزية",
  supportsIndividual: "يدعم الجلسات الفردية",
  supportsGroup: "يدعم المجموعات",
  supportsOnline: "يدعم الجلسات عن بعد",
  supportsInPerson: "يدعم الحضور",
  defaultCapacity: "السعة الافتراضية",
  areaIds: "معرّفات المجالات",
  presentation: "تفاصيل العرض",
  reason: "السبب",
  revisionId: "معرّف المراجعة",
  reviewerId: "معرّف المراجع",
  feedback: "الملاحظات",
  internalNotes: "ملاحظات داخلية",
  textAr: "السؤال بالعربية",
  textEn: "السؤال بالإنجليزية",
  type: "النوع",
  required: "مطلوب",
  options: "الخيارات",
  active: "نشط",
  category: "الفئة",
  questionAr: "السؤال بالعربية",
  questionEn: "السؤال بالإنجليزية",
  answerAr: "الإجابة بالعربية",
  answerEn: "الإجابة بالإنجليزية",
  mentorProfileId: "معرّف ملف المرشد",
  tags: "الوسوم",
  startsAt: "وقت البدء مع فرق التوقيت",
  endsAt: "وقت الانتهاء مع فرق التوقيت",
  capacity: "السعة",
  mode: "طريقة الحضور",
  sessionType: "نوع الجلسة",
  meetingUrl: "رابط الاجتماع",
  locationInstructions: "تعليمات الموقع",
  overlapOverrideReason: "سبب تجاوز التداخل",
  titleAr: "العنوان بالعربية",
  titleEn: "العنوان بالإنجليزية",
  topicAr: "الموضوع بالعربية",
  topicEn: "الموضوع بالإنجليزية",
  summaryAr: "الملخص بالعربية",
  summaryEn: "الملخص بالإنجليزية",
  audienceAr: "الجمهور بالعربية",
  audienceEn: "الجمهور بالإنجليزية",
  locationLabelAr: "الموقع بالعربية",
  locationLabelEn: "الموقع بالإنجليزية",
  rating: "التقييم",
  comment: "التعليق",
  isVisibleToMentor: "مشاركة التعليق مع المرشد",
  openingId: "معرّف الفرصة",
  motivation: "الدافع",
  experience: "الخبرة",
  availability: "التفرغ",
  consentConfirmed: "تأكيد الموافقة",
  answers: "الإجابات",
  opensAt: "موعد فتح التقديم مع فرق التوقيت",
  closesAt: "موعد إغلاق التقديم مع فرق التوقيت",
  questions: "الأسئلة",
  scheduledAt: "موعد المقابلة مع فرق التوقيت",
  interviewerUserId: "معرّف المحاور",
  durationMinutes: "مدة المقابلة بالدقائق",
  score: "النتيجة",
  memberProfileId: "معرّف ملف العضو",
  publicVisibility: "عرض الملف للعامة",
  consent: "أوافق صراحةً على عرض الملف للعامة",
  photoAssetId: "معرّف الصورة",
  startsOn: "تاريخ البدء",
  endsOn: "تاريخ الانتهاء",
  isRequired: "مطلوب",
  version: "النسخة المعتمدة لهذا السجل",
};
export function membershipFieldLabel(key: string, locale: string) {
  return locale === "ar"
    ? ar[key] || key
    : key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (s) => s.toUpperCase());
}
export function MembershipEditor({
  operation,
  title,
  path,
  initial = {},
  onClose,
  onSaved,
  description = "",
  manualVersion = false,
  requireFields = [],
  hiddenFields = [],
}: {
  operation: MembershipOperation;
  title: string;
  path?: Record<string, string>;
  initial?: Record<string, unknown>;
  onClose: () => void;
  onSaved?: (value: unknown, body?: Record<string, unknown>) => void;
  description?: string;
  manualVersion?: boolean;
  requireFields?: string[];
  hiddenFields?: string[];
}) {
  const { api } = useMembershipConnection(),
    action = useMembershipAction(),
    { t, locale } = useLocale();
  const ref = string(record(membershipRoutes[operation].body).$ref)
      .split("/")
      .pop()!,
    schema = record(membershipSchemas[ref]),
    props = record(schema.properties);
  const [form, setForm] = useState<Record<string, unknown>>(() =>
      Object.fromEntries(
        Object.entries(props)
          .filter(
            ([k]) => !hiddenFields.includes(k) || Object.hasOwn(initial, k),
          )
          .map(([k, s]) => [
            k,
            Object.hasOwn(initial, k)
              ? initial[k]
              : record(s).type === "boolean"
                ? false
                : record(s).nullable
                  ? null
                  : record(s).type === "array"
                    ? []
                    : record(s).type === "string"
                      ? ""
                      : undefined,
          ]),
      ),
    ),
    [json, setJson] = useState<Record<string, string>>(() =>
      Object.fromEntries(
        Object.entries(props)
          .filter(
            ([, s]) =>
              ["object", "array"].includes(string(record(s).type)) ||
              record(s).$ref,
          )
          .map(([k]) => [
            k,
            initial[k] === undefined ? "" : JSON.stringify(initial[k], null, 2),
          ]),
      ),
    ),
    [ack, setAck] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!ack) return;
    let submitted: Record<string, unknown> = {};
    void action.run(
      () => {
        const body = { ...form };
        for (const [k, raw] of Object.entries(json)) {
          if (!raw.trim()) {
            if (requireFields.includes(k))
              throw new ApiError(
                "Supply the complete " + k + " value before saving.",
                422,
                "COMPLETE_DOCUMENT_REQUIRED",
              );
            body[k] = undefined;
          } else
            try {
              body[k] = JSON.parse(raw);
            } catch {
              throw new ApiError(
                "Enter valid JSON for " + k + ".",
                422,
                "INVALID_JSON",
              );
            }
        }
        for (const key of requireFields)
          if (body[key] === undefined)
            throw new ApiError(
              "Supply " + key + " before saving.",
              422,
              "COMPLETE_DOCUMENT_REQUIRED",
            );
        submitted = body;
        return membershipRequest(api, operation, {
          path,
          body: membershipRoutes[operation].body ? body : undefined,
        });
      },
      (result) => {
        onSaved?.(result, submitted);
        onClose();
      },
    );
  }
  return (
    <Modal
      open
      title={title}
      description={description}
      onClose={() => {
        if (!action.busy) onClose();
      }}
      className="engagement-modal membership-editor"
    >
      <form className="engagement-form" onSubmit={submit}>
        <fieldset disabled={action.busy} className="engagement-fields">
          {Object.entries(props)
            .filter(
              ([k]) =>
                !hiddenFields.includes(k) && (k !== "version" || manualVersion),
            )
            .map(([key, raw]) => {
              const s = record(raw),
                label = membershipFieldLabel(key, locale),
                value = form[key];
              return (
                <label
                  key={key}
                  className={
                    s.type === "array" || s.type === "object" || s.$ref
                      ? "membership-wide"
                      : ""
                  }
                >
                  {label}
                  {s.type === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={value === true}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.checked })
                      }
                    />
                  ) : s.type === "array" || s.type === "object" || s.$ref ? (
                    <textarea
                      rows={5}
                      dir="ltr"
                      value={json[key] ?? ""}
                      onChange={(e) =>
                        setJson({ ...json, [key]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      required={
                        requireFields.includes(key) ||
                        (!s.nullable && key !== "version")
                      }
                      type={
                        s.type === "number" || s.type === "integer"
                          ? "number"
                          : s.format === "date"
                            ? "date"
                            : "text"
                      }
                      step={s.type === "integer" ? 1 : "any"}
                      value={typeof value === "number" ? value : string(value)}
                      placeholder={
                        s.format === "date-time"
                          ? "2026-11-01T09:00:00+03:00"
                          : undefined
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [key]:
                            e.target.value === ""
                              ? s.nullable
                                ? null
                                : undefined
                              : s.type === "number" || s.type === "integer"
                                ? e.target.valueAsNumber
                                : e.target.value,
                        })
                      }
                    />
                  )}
                </label>
              );
            })}
        </fieldset>
        <label className="engagement-check">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            disabled={action.busy}
          />
          {t({
            en: "I reviewed these details and want to apply this action.",
            ar: "راجعت هذه التفاصيل وأرغب في تطبيق الإجراء.",
          })}
        </label>
        {action.feedback}
        <div className="workspace-form-actions">
          <Button
            type="button"
            variant="outline"
            disabled={action.busy}
            onClick={onClose}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </Button>
          <Button disabled={!ack || action.busy}>{title}</Button>
        </div>
      </form>
    </Modal>
  );
}
