import {
  analyticsCourseDemand,
  analyticsPoints,
  analyticsTopContent,
  insightGeneratedAt,
} from "../data/mock/insights";
import {
  buildContentHealth,
  INSIGHT_NOW,
  insightStorageKey,
  normalizeAcademicRecord,
} from "../lib/insights";
import { text } from "../lib/localize";
import type { AdminContentItem } from "../types/admin";
import type { Course, Resource } from "../types/content";
import type {
  AcademicInsightRecord,
  AnalyticsRange,
  AssessmentInput,
  InsightsService,
} from "../types/insights";

const eventName = "medclub:insights-change";

const seed = (studentId: string): AcademicInsightRecord =>
  normalizeAcademicRecord(
    studentId === "demo-student"
      ? {
          studentId,
          confidence: [
            { courseId: "physiology", value: 4, updatedAt: "2026-09-08T08:10:00+03:00" },
            { courseId: "pathology", value: 3, updatedAt: "2026-09-07T17:20:00+03:00" },
            { courseId: "pharmacology", value: 2, updatedAt: "2026-09-06T15:30:00+03:00" },
            { courseId: "microbiology", value: 3, updatedAt: "2026-09-05T11:00:00+03:00" },
          ],
          attempts: [
            { id: "attempt-physiology-1", studentId, courseId: "physiology", title: "Cardiac cycle check", correct: 17, total: 20, completedAt: "2026-09-08T08:00:00+03:00", createdAt: "2026-09-08T08:00:00+03:00" },
            { id: "attempt-pathology-1", studentId, courseId: "pathology", title: "Inflammation review", correct: 13, total: 18, completedAt: "2026-09-07T17:00:00+03:00", createdAt: "2026-09-07T17:00:00+03:00" },
            { id: "attempt-pharmacology-1", studentId, courseId: "pharmacology", title: "Dose response practice", correct: 10, total: 16, completedAt: "2026-09-06T15:00:00+03:00", createdAt: "2026-09-06T15:00:00+03:00" },
            { id: "attempt-microbiology-1", studentId, courseId: "microbiology", title: "Bacterial structure recall", correct: 12, total: 15, completedAt: "2026-09-05T10:30:00+03:00", createdAt: "2026-09-05T10:30:00+03:00" },
          ],
          persistent: true,
        }
      : { studentId, confidence: [], attempts: [], persistent: true },
    studentId,
  );

const rangeDays: Record<AnalyticsRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

function scaled(value: number, range: AnalyticsRange) {
  return Math.max(1, Math.round(value * rangeDays[range] / 30));
}

function analytics(range: AnalyticsRange) {
  const points = analyticsPoints.slice(-rangeDays[range]);
  const totals = points.reduce(
    (result, point) => ({
      activeStudents: result.activeStudents + point.activeStudents,
      resourceOpens: result.resourceOpens + point.resourceOpens,
      searches: result.searches + point.searches,
      saves: result.saves + point.saves,
    }),
    { activeStudents: 0, resourceOpens: 0, searches: 0, saves: 0 },
  );
  const dailyActive = Math.round(totals.activeStudents / Math.max(1, points.length));
  return {
    mode: "illustrative" as const,
    generatedAt: insightGeneratedAt,
    range,
    points,
    totals: {
      ...totals,
      activeStudents: dailyActive,
      saveRate: Math.round((totals.saves / Math.max(1, totals.resourceOpens)) * 100),
    },
    funnel: [
      { id: "visit", label: text("Visited learning", "زاروا التعلّم"), value: scaled(524, range) },
      { id: "open", label: text("Opened a resource", "فتحوا مصدراً"), value: scaled(402, range) },
      { id: "return", label: text("Returned this period", "عادوا خلال الفترة"), value: scaled(291, range) },
      { id: "save", label: text("Saved for later", "حفظوا للمراجعة"), value: scaled(128, range) },
    ],
    topContent: analyticsTopContent.map((item) => ({ ...item, value: scaled(item.value, range), secondary: scaled(item.secondary, range) })),
    courseDemand: analyticsCourseDemand.map((item) => ({ ...item, value: scaled(item.value, range), secondary: scaled(item.secondary, range) })),
  };
}

/** Device-local, deterministic V0.13 preview. Aggregate analytics are illustrative, never live telemetry. */
export function createLocalInsightsService(input: {
  courses: Course[];
  resources: Resource[];
  listAdminContent: () => Promise<AdminContentItem[]>;
}): InsightsService {
  const memory = new Map<string, AcademicInsightRecord>();
  const volatile = new Set<string>();

  const read = (studentId: string) => {
    const fallback = memory.get(studentId) || seed(studentId);
    if (volatile.has(studentId)) return structuredClone({ ...fallback, persistent: false });
    try {
      const stored = localStorage.getItem(insightStorageKey(studentId));
      const record = stored ? normalizeAcademicRecord(JSON.parse(stored), studentId) : fallback;
      memory.set(studentId, record);
      return structuredClone(record);
    } catch {
      volatile.add(studentId);
      return structuredClone({ ...fallback, persistent: false });
    }
  };

  const write = (studentId: string, record: AcademicInsightRecord) => {
    const next = normalizeAcademicRecord(record, studentId);
    memory.set(studentId, next);
    try {
      localStorage.setItem(insightStorageKey(studentId), JSON.stringify(next));
      volatile.delete(studentId);
      window.dispatchEvent(new CustomEvent(eventName, { detail: { studentId } }));
      return structuredClone(next);
    } catch {
      volatile.add(studentId);
      return structuredClone({ ...next, persistent: false });
    }
  };

  const requireCourse = (courseId: string) => {
    if (!input.courses.some((course) => course.id === courseId)) throw new Error("INSIGHT_COURSE_NOT_FOUND");
  };

  return {
    getAdminAnalytics: async (range) => analytics(range),
    getContentHealth: async () => {
      const records = buildContentHealth(input.courses, input.resources, await input.listAdminContent());
      const counts = {
        critical: records.filter((record) => record.severity === "critical").length,
        attention: records.filter((record) => record.severity === "attention").length,
        healthy: records.filter((record) => record.severity === "healthy").length,
      };
      return {
        mode: "illustrative" as const,
        generatedAt: insightGeneratedAt,
        score: records.length ? Math.round(records.reduce((sum, record) => sum + record.score, 0) / records.length) : 100,
        records,
        counts,
      };
    },
    getAcademicRecord: async (studentId) => read(studentId),
    setConfidence: async (studentId, courseId, value) => {
      requireCourse(courseId);
      if (!Number.isInteger(value) || value < 1 || value > 5) throw new Error("INSIGHT_CONFIDENCE_INVALID");
      const current = read(studentId);
      return write(studentId, {
        ...current,
        confidence: [
          ...current.confidence.filter((record) => record.courseId !== courseId),
          { courseId, value: value as 1 | 2 | 3 | 4 | 5, updatedAt: INSIGHT_NOW },
        ],
      });
    },
    recordAssessment: async (studentId, assessment) => {
      requireCourse(assessment.courseId);
      const title = assessment.title.trim().slice(0, 80);
      const total = Math.floor(Number(assessment.total));
      const correct = Math.floor(Number(assessment.correct));
      const completedTime = Date.parse(assessment.completedAt);
      if (!title || !Number.isFinite(total) || total < 1 || total > 300 || !Number.isFinite(correct) || correct < 0 || correct > total || !Number.isFinite(completedTime) || completedTime > Date.parse(INSIGHT_NOW)) {
        throw new Error("INSIGHT_ASSESSMENT_INVALID");
      }
      const current = read(studentId);
      const attempt = {
        id: `assessment-${studentId}-${Date.now().toString(36)}`,
        studentId,
        courseId: assessment.courseId,
        title,
        total,
        correct,
        completedAt: assessment.completedAt,
        createdAt: INSIGHT_NOW,
      };
      return write(studentId, { ...current, attempts: [...current.attempts, attempt] });
    },
    deleteAssessment: async (studentId, attemptId) => {
      const current = read(studentId);
      if (!current.attempts.some((attempt) => attempt.id === attemptId)) throw new Error("INSIGHT_ASSESSMENT_NOT_FOUND");
      return write(studentId, { ...current, attempts: current.attempts.filter((attempt) => attempt.id !== attemptId) });
    },
    subscribe: (studentId, listener) => {
      const onChange = (event: Event) => {
        const changed = (event as CustomEvent<{ studentId?: string }>).detail?.studentId;
        if (!changed || changed === studentId) listener();
      };
      const onStorage = (event: StorageEvent) => {
        if (event.key === insightStorageKey(studentId)) listener();
      };
      window.addEventListener(eventName, onChange);
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener(eventName, onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}
