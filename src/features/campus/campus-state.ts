export type CampusMode = "active" | "dormant";
export const campusDestinations = [
  { id: "LEARNING", en: "Learning", ar: "التعلّم", href: "/learn" },
  { id: "MEDIA", en: "Media", ar: "الإعلام", href: "/community/media" },
  { id: "COMMUNITY", en: "Community", ar: "المجتمع", href: "/community" },
  { id: "MENTORSHIP", en: "Mentorship", ar: "الإرشاد", href: "/mentorship" },
  { id: "CONTRIBUTION", en: "Contribution", ar: "المساهمات", href: "/contribute" },
  { id: "JOURNALS", en: "Journals", ar: "المجلة", href: "/journal" },
] as const;

/** These are presentation states, never a substitute for earned progress. */
export function campusLayerVisible(layer: unknown, mode: CampusMode) {
  return layer !== "active" && layer !== "dormant" || layer === mode;
}
