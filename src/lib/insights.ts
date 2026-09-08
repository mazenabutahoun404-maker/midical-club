import type { Course, Resource } from "../types/content";
import type { AdminContentItem } from "../types/admin";
import type { AcademicInsightRecord, AssessmentAttempt, ContentHealthIssueCode, ContentHealthRecord } from "../types/insights";
import { STORAGE_KEYS } from "../constants/config";

export const INSIGHT_NOW = "2026-09-08T09:00:00+03:00";
export const insightStorageKey = (studentId: string) => `${STORAGE_KEYS.insights}:${encodeURIComponent(studentId)}`;
const validDate = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value));
const cleanText = (value: unknown, max = 100) => typeof value === "string" ? value.trim().slice(0, max) : "";
const confidenceValue = (value: unknown): 1 | 2 | 3 | 4 | 5 | null => Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5 ? Number(value) as 1 | 2 | 3 | 4 | 5 : null;
export function normalizeAcademicRecord(value: unknown, studentId: string): AcademicInsightRecord {
  const raw = value && typeof value === "object" ? value as Partial<AcademicInsightRecord> : {};
  const confidence = Array.isArray(raw.confidence) ? raw.confidence.flatMap(record => {
    if (!record || typeof record !== "object") return [];
    const source = record as Partial<AcademicInsightRecord["confidence"][number]>;
    const courseId = cleanText(source.courseId, 80), score = confidenceValue(source.value);
    return courseId && score ? [{ courseId, value: score, updatedAt: validDate(source.updatedAt) ? source.updatedAt! : INSIGHT_NOW }] : [];
  }).slice(-40) : [];
  const attempts: AssessmentAttempt[] = Array.isArray(raw.attempts) ? raw.attempts.flatMap(attempt => {
    if (!attempt || typeof attempt !== "object") return [];
    const source = attempt as Partial<AssessmentAttempt>;
    const id = cleanText(source.id, 100), courseId = cleanText(source.courseId, 80), title = cleanText(source.title, 80);
    const total = Math.min(300, Math.max(1, Math.floor(Number(source.total) || 0)));
    const correct = Math.min(total, Math.max(0, Math.floor(Number(source.correct) || 0)));
    if (!id || !courseId || !title || !validDate(source.completedAt)) return [];
    return [{ id, studentId, courseId, title, total, correct, completedAt: source.completedAt!, createdAt: validDate(source.createdAt) ? source.createdAt! : source.completedAt! }];
  }).slice(-100) : [];
  return { studentId, confidence, attempts, persistent: raw.persistent !== false };
}

export const assessmentPercent = (attempt: Pick<AssessmentAttempt, "correct" | "total">) => attempt.total ? Math.round((attempt.correct / attempt.total) * 100) : 0;

export function consecutiveStudyDays(dates: string[]) {
  const days = [...new Set(dates.filter(validDate).map(value => new Date(value).toISOString().slice(0, 10)))].sort().reverse();
  if (!days.length) return 0;
  let count = 1;
  for (let index = 1; index < days.length; index++) {
    const newer = Date.parse(`${days[index - 1]}T00:00:00Z`), older = Date.parse(`${days[index]}T00:00:00Z`);
    if (newer - older !== 86_400_000) break;
    count++;
  }
  return count;
}

const translated = (value: { en: string; ar: string }) => !!value.en.trim() && !!value.ar.trim();
function healthRecord(input: Omit<ContentHealthRecord, "score" | "severity">, issues: ContentHealthIssueCode[]): ContentHealthRecord {
  const weight: Record<ContentHealthIssueCode, number> = { "missing-file": 28, "missing-reviewer": 18, "missing-references": 18, "missing-translation": 22, "rights-unconfirmed": 28, stale: 24 };
  const score = Math.max(0, 100 - issues.reduce((sum, issue) => sum + weight[issue], 0));
  return { ...input, issues, score, severity: score < 55 ? "critical" : score < 85 ? "attention" : "healthy" };
}
export function buildContentHealth(courses: Course[], resources: Resource[], admin: AdminContentItem[]): ContentHealthRecord[] {
  const courseMap = new Map(courses.map(course => [course.id, course]));
  const now = Date.parse(INSIGHT_NOW);
  const resourceRecords = resources.map(resource => {
    const issues: ContentHealthIssueCode[] = [];
    if (!resource.fileUrl) issues.push("missing-file");
    if (!resource.reviewer) issues.push("missing-reviewer");
    if (!resource.references?.length) issues.push("missing-references");
    if (!translated(resource.title) || !translated(resource.description)) issues.push("missing-translation");
    if (now - Date.parse(resource.updatedAt) > 365 * 86_400_000) issues.push("stale");
    const course = courseMap.get(resource.courseId);
    return healthRecord({ id: `resource:${resource.id}`, sourceId: resource.id, kind: "resource", title: resource.title, context: course?.title || { en: resource.courseId, ar: resource.courseId }, updatedAt: resource.updatedAt, issues, href: course ? `/learn/courses/${course.slug}` : "/admin/content" }, issues);
  });
  const adminRecords = admin.map(item => {
    const issues: ContentHealthIssueCode[] = [];
    if (!item.rightsConfirmed) issues.push("rights-unconfirmed");
    if (item.status !== "draft" && !item.reviewer) issues.push("missing-reviewer");
    if (["resource", "article", "contribution"].includes(item.kind) && item.referenceCount < 1) issues.push("missing-references");
    if (!translated(item.title) || !translated(item.summary)) issues.push("missing-translation");
    if (item.staleAfter && Date.parse(item.staleAfter) < now) issues.push("stale");
    return healthRecord({ id: `admin:${item.id}`, sourceId: item.id, kind: item.kind, title: item.title, context: item.topic, updatedAt: item.updatedAt, issues, href: `/admin/content?item=${encodeURIComponent(item.id)}` }, issues);
  });
  return [...resourceRecords, ...adminRecords].sort((a, b) => a.score - b.score || b.updatedAt.localeCompare(a.updatedAt));
}
