import { useState, type FormEvent } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import { ApiError } from "../../services/api/client";
import {
  operationsRoutes,
  operationsSchemas,
} from "../../services/api/operations-contracts.generated";
import { operationsRequest, type OperationsOperation } from "./model";
import { useOperationsConnection, useOperationsAction } from "./shared";
const ar: Record<string, string> = {
  nameAr: "الاسم · العربية",
  nameEn: "الاسم · الإنجليزية",
  descriptionAr: "الوصف · العربية",
  descriptionEn: "الوصف · الإنجليزية",
  slug: "الاسم في الرابط",
  sortOrder: "ترتيب العرض",
  reason: "السبب",
  canonicalTerm: "المصطلح الأساسي",
  terms: "المصطلحات",
  language: "اللغة",
  scope: "النطاق",
  abbreviation: "الاختصار",
  expandedTermAr: "المعنى بالعربية",
  expandedTermEn: "المعنى بالإنجليزية",
  query: "الاستعلام",
  approved: "اعتماد الاستعلام",
  scopeType: "نوع النطاق",
  resourceType: "نوع المورد",
  resourceId: "معرّف المورد",
  backupIdentifier: "معرّف النسخة الاحتياطية",
  reportType: "نوع التقرير",
  date: "التاريخ",
  eventName: "اسم الحدث",
  categoryId: "معرّف الفئة",
  shortDescriptionAr: "وصف مختصر · العربية",
  shortDescriptionEn: "وصف مختصر · الإنجليزية",
  audienceMode: "نمط الجمهور",
  audience: "الجمهور",
  options: "خيارات المنتج",
  defaultPrice: "السعر الافتراضي بالدينار",
  richDescription: "المحتوى المنسّق",
  materials: "الخامات",
  assetId: "معرّف الملف",
  variantId: "معرّف الصنف",
  isCover: "صورة الغلاف",
  altTextAr: "النص البديل · العربية",
  altTextEn: "النص البديل · الإنجليزية",
  sku: "رمز المخزون",
  displayNameAr: "اسم الصنف · العربية",
  displayNameEn: "اسم الصنف · الإنجليزية",
  priceJod: "السعر بالدينار",
  isDefault: "الصنف الافتراضي",
  lowStockThreshold: "حد انخفاض المخزون",
  optionValueIds: "معرّفات قيم الخيارات",
  quantity: "الكمية",
  type: "نوع الحركة",
  unitCostJod: "تكلفة الوحدة بالدينار",
  version: "نسخة سجل المخزون",
  pickupCode: "رمز الاستلام",
  deadlineAt: "الموعد النهائي",
  movementId: "معرّف الحركة النقدية الأصلية",
  amountJod: "المبلغ بالدينار",
  operationsEnabled: "المتجر متاح",
  orderingEnabled: "الطلب متاح",
  pendingConfirmationHours: "ساعات انتظار التأكيد",
  pickupDeadlineDays: "مهلة الاستلام بالأيام",
  returnRequestDays: "مهلة طلب الإرجاع بالأيام",
  approvedReturnHandoverDays: "مهلة تسليم المرتجع المعتمد",
  pickupReminderHours: "ساعات تذكير الاستلام",
  pickupInstructionsAr: "تعليمات الاستلام · العربية",
  pickupInstructionsEn: "تعليمات الاستلام · الإنجليزية",
  defaultLowStockThreshold: "حد انخفاض المخزون الافتراضي",
  maxReturnEvidenceImages: "أقصى عدد لصور الإثبات",
  evidenceRetentionDays: "أيام الاحتفاظ بالإثبات",
  exportRetentionHours: "ساعات الاحتفاظ بالتصدير",
  replacementVariants: "الأصناف البديلة",
  items: "العناصر",
  report: "التقرير",
  format: "صيغة التصدير",
  filters: "المرشحات",
};
export function operationsFieldLabel(key: string, locale: string) {
  return locale === "ar"
    ? ar[key] || key
    : key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (s) => s.toUpperCase());
}
export function OperationsEditor({
  operation,
  title,
  path,
  initial = {},
  onClose,
  onSaved,
  description = "",
  manualVersion = false,
  requireFields = [],
}: {
  operation: OperationsOperation;
  title: string;
  path?: Record<string, string>;
  initial?: Record<string, unknown>;
  onClose: () => void;
  onSaved?: (value: unknown) => void;
  description?: string;
  manualVersion?: boolean;
  requireFields?: string[];
}) {
  const { api } = useOperationsConnection(),
    action = useOperationsAction(),
    { t, locale } = useLocale();
  const ref = string(record(operationsRoutes[operation].body).$ref)
      .split("/")
      .pop()!,
    schema = record(operationsSchemas[ref]),
    props = record(schema.properties);
  const [form, setForm] = useState<Record<string, unknown>>(() =>
      Object.fromEntries(
        Object.entries(props).map(([k, s]) => [
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
        return operationsRequest(api, operation, {
          path,
          body: operationsRoutes[operation].body ? body : undefined,
        });
      },
      (result) => {
        onSaved?.(result);
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
      className="engagement-modal operations-editor"
    >
      <form className="engagement-form" onSubmit={submit}>
        <fieldset disabled={action.busy} className="engagement-fields">
          {Object.entries(props)
            .filter(([k]) => k !== "version" || manualVersion)
            .map(([key, raw]) => {
              const s = record(raw),
                label = operationsFieldLabel(key, locale),
                value = form[key];
              return (
                <label
                  key={key}
                  className={
                    s.type === "array" || s.type === "object" || s.$ref
                      ? "operations-wide"
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
