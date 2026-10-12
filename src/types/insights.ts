import type { Text } from "./content";

export type AnalyticsRange = "7d" | "30d" | "90d";
export interface AnalyticsPoint {
  date: string;
  activeStudents: number;
  resourceOpens: number;
  searches: number;
  saves: number;
}
export interface AnalyticsBreakdown {
  id: string;
  label: Text;
  value: number;
  secondary: number;
}
export interface AdminAnalyticsSnapshot {
  mode: "illustrative";
  generatedAt: string;
  range: AnalyticsRange;
  points: AnalyticsPoint[];
  totals: {
    activeStudents: number;
    resourceOpens: number;
    searches: number;
    saves: number;
    saveRate: number;
  };
  funnel: { id: string; label: Text; value: number }[];
  topContent: AnalyticsBreakdown[];
  courseDemand: AnalyticsBreakdown[];
}

export type ContentHealthIssueCode =
  | "missing-file"
  | "missing-reviewer"
  | "missing-references"
  | "missing-translation"
  | "rights-unconfirmed"
  | "stale";
export interface ContentHealthRecord {
  id: string;
  sourceId: string;
  kind:
    | "resource"
    | "article"
    | "contribution"
    | "homepage"
    | "event"
    | "opportunity";
  title: Text;
  context: Text;
  updatedAt: string;
  score: number;
  severity: "critical" | "attention" | "healthy";
  issues: ContentHealthIssueCode[];
  href: string;
}
export interface ContentHealthSnapshot {
  mode: "illustrative";
  generatedAt: string;
  score: number;
  records: ContentHealthRecord[];
  counts: Record<ContentHealthRecord["severity"], number>;
}

export interface ConfidenceRecord {
  courseId: string;
  value: 1 | 2 | 3 | 4 | 5;
  updatedAt: string;
}
export interface AssessmentAttempt {
  id: string;
  studentId: string;
  courseId: string;
  title: string;
  correct: number;
  total: number;
  completedAt: string;
  createdAt: string;
}
export interface AssessmentInput {
  courseId: string;
  title: string;
  correct: number;
  total: number;
  completedAt: string;
}
export interface AcademicInsightRecord {
  studentId: string;
  confidence: ConfidenceRecord[];
  attempts: AssessmentAttempt[];
  persistent: boolean;
}
export interface InsightsService {
  getAdminAnalytics: (range: AnalyticsRange) => Promise<AdminAnalyticsSnapshot>;
  getContentHealth: () => Promise<ContentHealthSnapshot>;
  getAcademicRecord: (studentId: string) => Promise<AcademicInsightRecord>;
  setConfidence: (
    studentId: string,
    courseId: string,
    value: number,
  ) => Promise<AcademicInsightRecord>;
  recordAssessment: (
    studentId: string,
    input: AssessmentInput,
  ) => Promise<AcademicInsightRecord>;
  deleteAssessment: (
    studentId: string,
    attemptId: string,
  ) => Promise<AcademicInsightRecord>;
  restoreAssessment?: (
    studentId: string,
    attempt: AssessmentAttempt,
  ) => Promise<AcademicInsightRecord>;
  restoreConfidence?: (
    studentId: string,
    courseId: string,
    before: ConfidenceRecord | null,
    expected: ConfidenceRecord,
  ) => Promise<AcademicInsightRecord>;
  subscribe: (studentId: string, listener: () => void) => () => void;
}
