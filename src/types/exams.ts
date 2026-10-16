import type { Course, Text } from "./content";

export type ExamMode = "practice" | "self-test";
export type ChoiceKey = "a" | "b" | "c" | "d" | "e";
export interface ExamChoice {
  key: ChoiceKey;
  text: Text;
  explanation?: Text;
}
export interface ExamQuestion {
  id: string;
  courseId: string;
  stem: Text;
  choices: ExamChoice[];
  /** For practice/review. A future assessed-exam adapter may omit this until submission. */
  correct?: ChoiceKey;
  explanation?: Text;
  chapter: Text;
  chapterId?: string;
  lectureId?: string;
  doctorId?: string;
  lecture?: Text;
  doctor?: string;
  images?: { url: string; alt: Text }[];
  explanationImages?: Partial<Record<1 | 2 | 3, string>>;
  version: string;
}
export interface ExamSet {
  id: string;
  courseId: string;
  title: Text;
  description: Text;
  batch: Text;
  questionIds: string[];
  kind: "practice" | "midterm" | "final" | "custom";
  year?: number;
  suggestedMinutes: number;
  published: boolean;
  ownerId?: string;
  version: string;
}
export interface ExamCatalog {
  courses: Course[];
  sets: ExamSet[];
}
export interface ExamProgress {
  pendingAnswers?: Record<string, ChoiceKey>;
  confidence?: Record<string, "confident" | "unsure" | "guessing">;
  current: number;
  answers: Record<string, ChoiceKey>;
  flagged: string[];
  viewed: string[];
  elapsedSeconds: number;
}
export interface ExamSummary {
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  percentage: number | null;
  timeSeconds: number;
}
export interface ExamAttempt {
  id: string;
  examId: string;
  ownerId: string;
  mode: ExamMode;
  status: "active" | "finished" | "abandoned";
  progress: ExamProgress;
  questionIds: string[];
  questions: ExamQuestion[];
  startedAt: string;
  updatedAt: string;
  version: number;
  summary?: ExamSummary;
}
export interface ExamNotebook {
  bookmarkedIds: string[];
  wrongIds: string[];
}
export interface ExamQuestionPage {
  items: ExamQuestion[];
  total: number;
}
export interface ExamFacets {
  chapters: { value: string; label: Text }[];
  lectures: { value: string; label: Text }[];
  doctors: { value: string; label: Text }[];
  batches: Text[];
  matchedCount: number;
}
export interface ExamReport {
  id: string;
  questionId: string;
  category: "answer" | "wording" | "explanation" | "image" | "other";
  body: string;
  status: "open" | "resolved";
  createdAt: string;
  ownerId: string;
}
export interface CustomExamInput {
  courseId: string;
  count: number;
  chapters: string[];
  lectures: string[];
  doctors: string[];
  batch?: string;
  shuffle: boolean;
  title: string;
}
export interface ExamService {
  readonly source: "preview" | "live" | "unavailable";
  readonly persistent?: boolean;
  /** Optional notification when device-preview persistence changes. */
  subscribe?(listener: () => void): () => void;
  catalog(signal?: AbortSignal): Promise<ExamCatalog>;
  getExam(id: string, signal?: AbortSignal): Promise<ExamSet | null>;
  questions(examId: string, signal?: AbortSignal): Promise<ExamQuestion[]>;
  questionBank(
    courseId?: string,
    signal?: AbortSignal,
  ): Promise<ExamQuestion[]>;
  search(
    query: string,
    courseId?: string,
    signal?: AbortSignal,
  ): Promise<ExamQuestion[]>;
  start(examId: string, mode: ExamMode, resume: boolean): Promise<ExamAttempt>;
  attempts(signal?: AbortSignal): Promise<ExamAttempt[]>;
  attempt(id: string, signal?: AbortSignal): Promise<ExamAttempt | null>;
  save(
    id: string,
    progress: ExamProgress,
    expectedVersion: number,
  ): Promise<ExamAttempt>;
  finish(
    id: string,
    progress: ExamProgress,
    expectedVersion: number,
  ): Promise<ExamAttempt>;
  abandon(id: string, expectedVersion: number): Promise<void>;
  notebook(signal?: AbortSignal): Promise<ExamNotebook>;
  notebookQuestions(
    input: {
      wrong: boolean;
      courseId?: string;
      query?: string;
      page: number;
      pageSize: number;
    },
    signal?: AbortSignal,
  ): Promise<ExamQuestionPage>;
  customOptions(
    courseId: string,
    filters: Pick<
      CustomExamInput,
      "chapters" | "lectures" | "doctors" | "batch"
    >,
    signal?: AbortSignal,
  ): Promise<ExamFacets>;
  bookmark(questionId: string, saved: boolean): Promise<ExamNotebook>;
  report(
    input: Pick<ExamReport, "questionId" | "category" | "body">,
  ): Promise<ExamReport>;
  custom(input: CustomExamInput): Promise<ExamSet>;
  admin: {
    uploadImage(file: File): Promise<string>;
    saveSet(input: ExamSet, expectedVersion?: string): Promise<ExamSet>;
    saveQuestions(
      examId: string,
      questions: ExamQuestion[],
      expectedVersion: string,
    ): Promise<ExamSet>;
    deleteSet(examId: string, expectedVersion: string): Promise<void>;
    deleteQuestion(
      examId: string,
      questionId: string,
      expectedVersion: string,
    ): Promise<ExamSet>;
    reports(signal?: AbortSignal): Promise<ExamReport[]>;
    resolveReport(id: string): Promise<void>;
  };
}
export class ExamError extends Error {
  constructor(
    public code:
      | "UNAVAILABLE"
      | "NOT_FOUND"
      | "INVALID"
      | "CONFLICT"
      | "FORBIDDEN"
      | "STORAGE",
    message: string = code,
  ) {
    super(message);
  }
}
