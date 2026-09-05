import type { CalendarItem, StudentNotification } from "../../types/workspace";
import { text } from "../../lib/localize";
/** Illustrative records, not official assessment dates. */
export const academicCalendar: CalendarItem[] = [
  {
    id: "exam-physiology",
    kind: "exam",
    courseId: "physiology",
    title: text(
      "Physiology · practice assessment",
      "الفسيولوجيا · تقييم تدريبي",
    ),
    startsAt: "2026-09-09T10:00:00+03:00",
    endsAt: "2026-09-09T11:00:00+03:00",
    description: text(
      "Sample assessment date. Confirm real dates with your faculty.",
      "موعد توضيحي. تأكد من المواعيد الفعلية لدى الكلية.",
    ),
  },
  {
    id: "exam-pathology",
    kind: "exam",
    courseId: "pathology",
    title: text("Pathology · topic review", "علم الأمراض · مراجعة موضوعية"),
    startsAt: "2026-09-12T11:00:00+03:00",
    endsAt: "2026-09-12T12:00:00+03:00",
    description: text(
      "An illustrative course review session.",
      "جلسة مراجعة توضيحية للمساق.",
    ),
  },
  {
    id: "exam-microbiology",
    kind: "exam",
    courseId: "microbiology",
    title: text(
      "Microbiology · practice assessment",
      "الأحياء الدقيقة · تقييم تدريبي",
    ),
    startsAt: "2026-09-24T09:00:00+03:00",
    endsAt: "2026-09-24T10:00:00+03:00",
    description: text(
      "Sample calendar record; not an official exam.",
      "سجل تقويم تجريبي وليس امتحاناً رسمياً.",
    ),
  },
];
export const studentNotifications: StudentNotification[] = [
  {
    id: "n-physiology",
    kind: "course",
    courseId: "physiology",
    resourceId: "r2",
    title: text(
      "A fresh look at the cardiac cycle",
      "مراجعة جديدة للدورة القلبية",
    ),
    body: text(
      "A summary is ready in your physiology collection.",
      "ملخص متاح ضمن مجموعة الفسيولوجيا.",
    ),
    createdAt: "2026-09-03T09:00:00+03:00",
  },
  {
    id: "n-review",
    kind: "reminder",
    courseId: "pathology",
    title: text(
      "Make room for your next review",
      "خصّص وقتاً لمراجعتك القادمة",
    ),
    body: text(
      "Your sample pathology session is on September 12. Plan a study block in your calendar.",
      "جلسة علم الأمراض التجريبية في ١٢ سبتمبر. أضف فترة دراسة إلى تقويمك.",
    ),
    href: "/my/calendar",
    createdAt: "2026-09-02T15:00:00+03:00",
  },
  {
    id: "n-library",
    kind: "community",
    title: text(
      "Your finds, a little more organized",
      "اكتشافاتك أكثر ترتيباً",
    ),
    body: text(
      "Create collections in your library and keep related resources together.",
      "أنشئ مجموعات في مكتبتك واجمع المصادر المرتبطة معاً.",
    ),
    href: "/my/library",
    createdAt: "2026-09-01T10:00:00+03:00",
  },
];
