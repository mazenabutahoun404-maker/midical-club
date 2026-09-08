import { text } from "../../lib/localize";
import type { AnalyticsBreakdown, AnalyticsPoint } from "../../types/insights";

export const insightGeneratedAt = "2026-09-08T09:00:00+03:00";

// Deterministic illustrative telemetry. These values are never described as live traffic.
export const analyticsPoints: AnalyticsPoint[] = Array.from({ length: 90 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 5, 11 + index));
  const weekday = date.getUTCDay();
  const wave = Math.round(Math.sin(index / 5) * 7);
  const activeStudents = 72 + Math.floor(index * 0.45) + wave - (weekday === 5 ? 15 : 0);
  return {
    date: date.toISOString().slice(0, 10),
    activeStudents,
    resourceOpens: activeStudents * 3 + ((index * 13) % 37),
    searches: activeStudents + ((index * 7) % 22),
    saves: Math.max(12, Math.round(activeStudents * 0.38) + (index % 8)),
  };
});

export const analyticsTopContent: AnalyticsBreakdown[] = [
  { id: "r2", label: text("The cardiac cycle", "الدورة القلبية"), value: 486, secondary: 124 },
  { id: "r1", label: text("Upper limb anatomy", "تشريح الطرف العلوي"), value: 421, secondary: 96 },
  { id: "r20", label: text("Dose-response essentials", "أساسيات الجرعة والاستجابة"), value: 338, secondary: 81 },
  { id: "r4", label: text("Neurological examination", "الفحص العصبي"), value: 295, secondary: 62 },
  { id: "r24", label: text("Prioritization practice", "تدريبات ترتيب الأولويات"), value: 274, secondary: 57 },
];

export const analyticsCourseDemand: AnalyticsBreakdown[] = [
  { id: "physiology", label: text("Cardiovascular Physiology", "فسيولوجيا القلب والأوعية"), value: 752, secondary: 41 },
  { id: "anatomy", label: text("Human Anatomy", "تشريح الإنسان"), value: 688, secondary: 36 },
  { id: "pharmacology", label: text("General Pharmacology", "علم الأدوية العام"), value: 523, secondary: 29 },
  { id: "pathology", label: text("General Pathology", "علم الأمراض العام"), value: 491, secondary: 27 },
];
