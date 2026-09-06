import { text } from "../../lib/localize";
import type { StudentContribution } from "../../types/content";

/** Illustrative workflow records. They are not published club submissions. */
export const demoContributions: StudentContribution[] = [
  {
    id: "contribution-cardiac-summary",
    studentId: "demo-student",
    kind: "resource",
    title: "Cardiac cycle concept summary",
    topic: "Physiology",
    summary:
      "A one-page concept map connecting pressure, volume and valve state across the cardiac cycle.",
    courseId: "physiology",
    sourceUrl: "",
    assetName: "cardiac-cycle-summary.pdf",
    rightsConfirmed: true,
    references: [
      "Approved physiology course notes · Cardiac cycle unit",
      "Faculty lecture · Week 6",
    ],
    status: "changes-requested",
    createdAt: "2026-08-20T10:00:00+03:00",
    updatedAt: "2026-09-01T14:00:00+03:00",
    submittedAt: "2026-08-21T09:00:00+03:00",
    reviewer: text("Scientific Review Team", "فريق المراجعة العلمية"),
    reviewerFeedback: text(
      "Clarify that the pressure values are illustrative and add the exact edition or lecture date for each reference.",
      "وضّح أن قيم الضغط توضيحية وأضف الطبعة الدقيقة أو تاريخ المحاضرة لكل مرجع.",
    ),
    history: [
      {
        id: "ch-1",
        status: "draft",
        at: "2026-08-20T10:00:00+03:00",
        note: text("Draft created", "تم إنشاء المسودة"),
      },
      {
        id: "ch-2",
        status: "under-review",
        at: "2026-08-21T09:00:00+03:00",
        note: text(
          "Submitted for scientific review",
          "أُرسلت للمراجعة العلمية",
        ),
      },
      {
        id: "ch-3",
        status: "changes-requested",
        at: "2026-09-01T14:00:00+03:00",
        note: text(
          "Reviewer requested two clarifications",
          "طلب المراجع توضيحين",
        ),
      },
    ],
  },
  {
    id: "contribution-study-reflection",
    studentId: "demo-student",
    kind: "article",
    title: "What peer explanation reveals",
    topic: "Student learning",
    summary:
      "A short reflection on using peer explanation to discover gaps before revision.",
    sourceUrl: "",
    assetName: "",
    rightsConfirmed: true,
    references: ["Original student reflection"],
    status: "approved",
    createdAt: "2026-08-08T12:00:00+03:00",
    updatedAt: "2026-08-26T15:30:00+03:00",
    submittedAt: "2026-08-11T11:00:00+03:00",
    reviewer: text("Journal Editorial Team", "فريق تحرير المجلة"),
    history: [
      {
        id: "ch-4",
        status: "draft",
        at: "2026-08-08T12:00:00+03:00",
        note: text("Draft created", "تم إنشاء المسودة"),
      },
      {
        id: "ch-5",
        status: "under-review",
        at: "2026-08-11T11:00:00+03:00",
        note: text(
          "Submitted for editorial review",
          "أُرسلت للمراجعة التحريرية",
        ),
      },
      {
        id: "ch-6",
        status: "approved",
        at: "2026-08-26T15:30:00+03:00",
        note: text(
          "Approved; publishing remains a separate step",
          "تمت الموافقة؛ ويبقى النشر خطوة منفصلة",
        ),
      },
    ],
  },
];
