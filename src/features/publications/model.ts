import type { PublicationSection } from "../../services/api/publication-contracts";
import { record, string } from "../../services/api/mapping";
export const sectionInfo: Record<
  PublicationSection,
  { en: string; ar: string; prefix: string }
> = {
  activities: { en: "Activities", ar: "الأنشطة", prefix: "activities" },
  "journal-issues": {
    en: "Journal issues",
    ar: "أعداد المجلة",
    prefix: "journal",
  },
  conferences: { en: "Conferences", ar: "المؤتمرات", prefix: "conferences" },
  "executive-bodies": {
    en: "Executive bodies",
    ar: "الهيئات الإدارية",
    prefix: "executive_bodies",
  },
  "honor-plate": { en: "Honor plate", ar: "لوحة الشرف", prefix: "honor" },
  alumni: { en: "Alumni", ar: "الخريجون", prefix: "alumni" },
  campaigns: {
    en: "Media campaigns",
    ar: "الحملات الإعلامية",
    prefix: "media",
  },
  albums: { en: "Media albums", ar: "ألبومات الوسائط", prefix: "media" },
};
export const publicationPath = (section: string, slug?: string) =>
  `/community/publications/${encodeURIComponent(section)}${slug ? "/" + encodeURIComponent(slug) : ""}`;
export function publicationTitle(value: unknown, locale: string) {
  const v = record(value);
  return string(
    v.title ||
      v.name ||
      v.fullName ||
      v["title" + (locale === "ar" ? "Ar" : "En")] ||
      v["name" + (locale === "ar" ? "Ar" : "En")] ||
      v["fullName" + (locale === "ar" ? "Ar" : "En")] ||
      v.titleEn ||
      v.titleAr ||
      v.nameEn ||
      v.nameAr ||
      v.fullNameEn ||
      v.fullNameAr ||
      v.slug,
  );
}
export function localValue(value: unknown, locale: string) {
  if (typeof value === "string") return value;
  const v = record(value);
  return string(v.text || v[locale] || v.en || v.ar);
}
export function publicItemSection(
  value: unknown,
): PublicationSection | undefined {
  const v = string(value).replace(/[ _-]/g, "").toLowerCase();
  return (
    {
      activity: "activities",
      activities: "activities",
      journalissue: "journal-issues",
      journalissues: "journal-issues",
      conference: "conferences",
      conferences: "conferences",
      executivebody: "executive-bodies",
      executivebodies: "executive-bodies",
      honor: "honor-plate",
      honoree: "honor-plate",
      honorplate: "honor-plate",
      alumni: "alumni",
      alumniprofile: "alumni",
      mediacampaign: "campaigns",
      campaign: "campaigns",
    } as Record<string, PublicationSection>
  )[v];
}
/** Public detail endpoints wrap localized domain fields in data and page their children. */
export function publicationPublicModel(value: unknown) {
  const v = record(value);
  return {
    ...v,
    ...record(v.data),
    ...record(v.content),
    ...record(v.document),
    ...record(v.collections),
  };
}
export function publicationChildren(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.map(record)
    : Array.isArray(record(value).items)
      ? (record(value).items as unknown[]).map(record)
      : [];
}
export function publicationChildrenTotal(value: unknown) {
  const v = publicationPublicModel(value);
  return Math.max(
    0,
    ...[
      "assets",
      "files",
      "links",
      "members",
      "speakers",
      "scheduleItems",
      "schedule",
      "sponsors",
      "items",
    ].map(
      (key) =>
        Number(record(v[key]).total) || publicationChildren(v[key]).length,
    ),
  );
}
