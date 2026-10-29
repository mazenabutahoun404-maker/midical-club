import { ApiError } from "../../services/api/client";
import type { Field } from "../academics/academic-fields";
export const blockTypes = [
  "Text",
  "Heading",
  "Button",
  "ExternalLink",
  "Image",
  "Video",
  "File",
  "Divider",
  "Spacer",
  "Group",
  "TrustedEmbed",
  "ReusableReference",
];
export const pageFields: Field[] = [
  {
    key: "pageType",
    label: { en: "Page type", ar: "نوع الصفحة" },
    options: ["Homepage", "Subject", "Examination", "Custom", "AboutUs"],
    required: true,
  },
  {
    key: "slug",
    label: { en: "Page address", ar: "عنوان الصفحة" },
    required: true,
  },
  { key: "titleAr", label: { en: "Arabic title", ar: "العنوان بالعربية" } },
  { key: "titleEn", label: { en: "English title", ar: "العنوان بالإنجليزية" } },
  {
    key: "descriptionAr",
    label: { en: "Arabic description", ar: "الوصف بالعربية" },
    type: "textarea",
  },
  {
    key: "descriptionEn",
    label: { en: "English description", ar: "الوصف بالإنجليزية" },
    type: "textarea",
  },
  {
    key: "subjectOfferingId",
    label: {
      en: "Course offering reference (subject pages)",
      ar: "معرّف المساق المطروح (صفحات المواد)",
    },
  },
  {
    key: "teamId",
    label: { en: "Team reference (optional)", ar: "معرّف الفريق (اختياري)" },
  },
];
export const sectionFields: Field[] = [
  {
    key: "sectionKey",
    label: { en: "Section key", ar: "مفتاح القسم" },
    required: true,
  },
  {
    key: "sectionType",
    label: { en: "Section type", ar: "نوع القسم" },
    required: true,
  },
  { key: "titleAr", label: { en: "Arabic title", ar: "العنوان بالعربية" } },
  { key: "titleEn", label: { en: "English title", ar: "العنوان بالإنجليزية" } },
  {
    key: "position",
    label: { en: "Position", ar: "الترتيب" },
    type: "number",
    min: 0,
    required: true,
  },
  { key: "isPinned", label: { en: "Pinned", ar: "مثبّت" }, type: "checkbox" },
  {
    key: "pinnedFrom",
    label: { en: "Pin from (local time)", ar: "التثبيت من (التوقيت المحلي)" },
    type: "datetime-local",
  },
  {
    key: "pinnedUntil",
    label: { en: "Pin until (local time)", ar: "التثبيت حتى (التوقيت المحلي)" },
    type: "datetime-local",
  },
  {
    key: "status",
    label: { en: "Section state", ar: "حالة القسم" },
    required: true,
  },
];
export const reasonField: Field = {
  key: "reason",
  label: { en: "Reason", ar: "السبب" },
  type: "textarea",
  required: true,
};
export function localizedBody(draft: Record<string, unknown>) {
  return {
    title: { ar: String(draft.titleAr || ""), en: String(draft.titleEn || "") },
    description: {
      ar: String(draft.descriptionAr || ""),
      en: String(draft.descriptionEn || ""),
    },
  };
}
export function parseObject(text: string) {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ApiError(
      "Invalid JSON. Correct the document before saving.",
      422,
      "INVALID_JSON",
    );
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ApiError("Enter a JSON object.", 422, "JSON_OBJECT_REQUIRED");
  return value as Record<string, unknown>;
}
export function parseArray(text: string) {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ApiError(
      "Invalid JSON. Correct the document before saving.",
      422,
      "INVALID_JSON",
    );
  }
  if (!Array.isArray(value))
    throw new ApiError("Enter a JSON array.", 422, "JSON_ARRAY_REQUIRED");
  return value as unknown[];
}
