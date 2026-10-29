import type { Text } from "../../types/content";
import { ApiError } from "../../services/api/client";
export type CatalogSection =
  "years" | "semesters" | "batches" | "subjects" | "offerings";
export type Field = {
  key: string;
  label: Text;
  type?: "date" | "datetime-local" | "number" | "checkbox" | "textarea";
  options?: string[];
  required?: boolean;
  step?: number | "any";
  min?: number;
  max?: number;
  reference?: CatalogSection;
};
export const sectionLabels: Record<CatalogSection, Text> = {
  years: { en: "Academic years", ar: "الأعوام الدراسية" },
  semesters: { en: "Semesters", ar: "الفصول الدراسية" },
  batches: { en: "Batches", ar: "الدفعات" },
  subjects: { en: "Subject catalog", ar: "دليل المواد" },
  offerings: { en: "Course offerings", ar: "المساقات المطروحة" },
};
const f = (
  key: string,
  en: string,
  ar: string,
  options: Omit<Field, "key" | "label"> = {},
): Field => ({ key, label: { en, ar }, ...options });
export const catalogFields: Record<CatalogSection, Field[]> = {
  years: [
    f("name", "Name", "الاسم", { required: true }),
    f("startDate", "Start date", "تاريخ البداية", {
      type: "date",
      required: true,
    }),
    f("endDate", "End date", "تاريخ النهاية", { type: "date", required: true }),
    f(
      "automaticPromotionAt",
      "Automatic promotion time (local time)",
      "موعد الترفيع التلقائي (بالتوقيت المحلي)",
      { type: "datetime-local", required: true },
    ),
    f(
      "previousAcademicYearId",
      "Previous academic year",
      "العام الدراسي السابق",
      { reference: "years" },
    ),
    f("teamId", "Team reference (optional)", "معرّف الفريق (اختياري)"),
  ],
  semesters: [
    f("semesterType", "Semester", "الفصل", {
      options: ["First", "Second", "Summer"],
      required: true,
    }),
    f("startDate", "Start date", "تاريخ البداية", {
      type: "date",
      required: true,
    }),
    f("endDate", "End date", "تاريخ النهاية", { type: "date", required: true }),
  ],
  batches: [
    f("nameAr", "Arabic name", "الاسم بالعربية", { required: true }),
    f("nameEn", "English name", "الاسم بالإنجليزية"),
    f("slug", "URL name", "الاسم في الرابط", { required: true }),
    f("startDate", "Start date", "تاريخ البداية", { type: "date" }),
    f("expectedGraduationDate", "Expected graduation", "التخرج المتوقع", {
      type: "date",
    }),
    f("status", "Status", "الحالة", {
      options: ["Draft", "Active", "Archived"],
    }),
    f("primaryColor", "Theme color", "لون الدفعة"),
    f("teamId", "Team reference", "معرّف الفريق"),
    f("logoAssetId", "Logo file reference", "معرّف ملف الشعار"),
    f("coverAssetId", "Cover file reference", "معرّف ملف الغلاف"),
  ],
  subjects: [
    f("nameAr", "Arabic name", "الاسم بالعربية", { required: true }),
    f("nameEn", "English name", "الاسم بالإنجليزية"),
    f("code", "Subject code", "رمز المادة", { required: true }),
    f("externalKey", "External reference", "المرجع الخارجي"),
    f("stage", "Stage", "المرحلة", {
      options: ["Basic", "Clinical"],
      required: true,
    }),
    f("descriptionAr", "Arabic description", "الوصف بالعربية", {
      type: "textarea",
    }),
    f("descriptionEn", "English description", "الوصف بالإنجليزية", {
      type: "textarea",
    }),
    f("credits", "Credits", "الساعات المعتمدة", { type: "number", min: 0 }),
    f("defaultColor", "Color", "اللون"),
    f("defaultIcon", "Icon name", "اسم الأيقونة"),
    f("isActive", "Active", "مفعّلة", { type: "checkbox" }),
    f("teamId", "Team reference", "معرّف الفريق"),
  ],
  offerings: [
    f("subjectCatalogId", "Subject", "المادة", {
      reference: "subjects",
      required: true,
    }),
    f("academicYearId", "Academic year", "العام الدراسي", {
      reference: "years",
    }),
    f("semesterId", "Semester", "الفصل الدراسي", { reference: "semesters" }),
    f("scopeType", "Offering scope", "نطاق المساق", {
      options: ["BasicBatch", "ClinicalYear"],
      required: true,
    }),
    f("studyYear", "Study year", "السنة الدراسية", {
      type: "number",
      min: 1,
      max: 6,
      required: true,
    }),
    f("batchId", "Batch", "الدفعة", { reference: "batches" }),
    f("displayOrder", "Display order", "ترتيب العرض", {
      type: "number",
      min: 0,
      required: true,
    }),
    f("status", "Status", "الحالة", {
      options: ["Draft", "Published", "Archived"],
    }),
    f(
      "batchExceptionReason",
      "Reason for a clinical batch exception",
      "سبب استثناء الدفعة السريرية",
      { type: "textarea" },
    ),
  ],
};
export function recordName(row: Record<string, unknown>) {
  return String(
    row.nameEn ||
      row.nameAr ||
      row.name ||
      row.code ||
      row.semesterType ||
      row.id ||
      "—",
  );
}
export function prepareAcademicDraft(
  section: CatalogSection,
  row?: Record<string, unknown>,
) {
  if (!row)
    return section === "subjects"
      ? { stage: "Basic", isActive: true }
      : section === "offerings"
        ? { scopeType: "BasicBatch", displayOrder: 0, status: "Draft" }
        : section === "semesters"
          ? { semesterType: "First" }
          : {};
  const draft: Record<string, unknown> = {};
  for (const field of catalogFields[section])
    if (field.key in row) draft[field.key] = row[field.key];
  draft.version = row.version;
  // Edit canonical names/status, without resubmitting conflicting legacy name/isActive aliases.
  // Preserve presentation and outcomes that these focused forms do not edit.
  const jsonKey =
    section === "batches"
      ? "presentationJson"
      : section === "subjects"
        ? "outcomesJson"
        : null;
  if (jsonKey && typeof row[jsonKey] === "string") {
    try {
      draft[section === "batches" ? "presentation" : "outcomes"] = JSON.parse(
        row[jsonKey] as string,
      );
    } catch {
      throw new ApiError(
        "This record contains invalid saved content. Correct it before editing.",
        422,
        "INVALID_SAVED_CONTENT",
      );
    }
  }
  return draft;
}
export function validateAcademicDraft(
  section: CatalogSection,
  draft: Record<string, unknown>,
) {
  for (const field of catalogFields[section]) {
    const value = draft[field.key];
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    )
      throw new ApiError(`Complete: ${field.label.en}`, 422, "FIELD_REQUIRED");
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      field.type === "number" &&
      (!Number.isFinite(value) ||
        (field.min !== undefined && Number(value) < field.min) ||
        (field.max !== undefined && Number(value) > field.max))
    )
      throw new ApiError(
        `Invalid value: ${field.label.en}`,
        422,
        "FIELD_INVALID",
      );
  }
  if (
    draft.startDate &&
    draft.endDate &&
    String(draft.startDate) > String(draft.endDate)
  )
    throw new ApiError(
      "End date must follow start date.",
      422,
      "DATE_RANGE_INVALID",
    );
  if (
    draft.startDate &&
    draft.expectedGraduationDate &&
    String(draft.startDate) > String(draft.expectedGraduationDate)
  )
    throw new ApiError(
      "Graduation must follow start date.",
      422,
      "DATE_RANGE_INVALID",
    );
}
