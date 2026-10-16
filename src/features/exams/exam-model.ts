import type {
  ExamChoice,
  ExamProgress,
  ExamQuestion,
  ExamSummary,
} from "../../types/exams";
import { ExamError } from "../../types/exams";

export const freshProgress = (): ExamProgress => ({
  current: 0,
  answers: {},
  flagged: [],
  viewed: [],
  elapsedSeconds: 0,
});
export function validateQuestion(q: ExamQuestion) {
  if (
    !q.id ||
    !q.courseId ||
    !q.stem?.en?.trim() ||
    !q.stem?.ar?.trim() ||
    q.stem.en.length > 10000 ||
    q.stem.ar.length > 10000 ||
    q.choices.length < 2 ||
    q.choices.length > 5 ||
    new Set(q.choices.map((c) => c.key)).size !== q.choices.length ||
    q.choices.some(
      (c) =>
        !["a", "b", "c", "d", "e"].includes(c.key) ||
        !c.text?.en?.trim() ||
        !c.text?.ar?.trim(),
    ) ||
    (q.correct && !q.choices.some((c) => c.key === q.correct))
  )
    throw new ExamError(
      "INVALID",
      "Question text and two to five distinct choices are required.",
    );
}
export function normalizeProgress(
  raw: unknown,
  questions: ExamQuestion[],
): ExamProgress {
  const result = freshProgress();
  if (!raw || typeof raw !== "object") return result;
  const input = raw as Partial<ExamProgress>;
  result.current = Math.max(
    0,
    Math.min(
      questions.length - 1,
      Number.isInteger(input.current) ? input.current! : 0,
    ),
  );
  result.elapsedSeconds =
    typeof input.elapsedSeconds === "number" &&
    Number.isFinite(input.elapsedSeconds)
      ? Math.min(604800, Math.max(0, Math.floor(input.elapsedSeconds)))
      : 0;
  const ids = new Set(questions.map((q) => q.id));
  result.flagged = Array.isArray(input.flagged)
    ? [
        ...new Set(
          input.flagged.filter((id) => typeof id === "string" && ids.has(id)),
        ),
      ]
    : [];
  result.viewed = Array.isArray(input.viewed)
    ? [
        ...new Set(
          input.viewed.filter((id) => typeof id === "string" && ids.has(id)),
        ),
      ]
    : [];
  if (input.answers && typeof input.answers === "object")
    for (const q of questions) {
      const value = input.answers[q.id];
      if (q.choices.some((c) => c.key === value)) result.answers[q.id] = value;
    }
  if (input.pendingAnswers && typeof input.pendingAnswers === "object") {
    result.pendingAnswers = {};
    for (const q of questions) {
      const value = input.pendingAnswers[q.id];
      if (!result.answers[q.id] && q.choices.some((c) => c.key === value))
        result.pendingAnswers[q.id] = value;
    }
  }
  if (input.confidence && typeof input.confidence === "object") {
    result.confidence = {};
    for (const q of questions) {
      const value = input.confidence[q.id];
      if (value === "confident" || value === "unsure" || value === "guessing")
        result.confidence[q.id] = value;
    }
  }
  return result;
}
export function needsReview(q: ExamQuestion, progress: ExamProgress) {
  const answer = progress.answers[q.id],
    confidence = progress.confidence?.[q.id];
  return (
    !answer ||
    (!!q.correct && answer !== q.correct) ||
    confidence === "unsure" ||
    confidence === "guessing" ||
    progress.flagged.includes(q.id)
  );
}
export function summarize(
  progress: ExamProgress,
  questions: ExamQuestion[],
): ExamSummary {
  let correct = 0,
    incorrect = 0,
    skipped = 0;
  for (const q of questions) {
    const answer = progress.answers[q.id];
    if (!answer) skipped++;
    else if (answer === q.correct) correct++;
    else incorrect++;
  }
  const graded = questions.every((q) => !!q.correct);
  return {
    total: questions.length,
    correct: graded ? correct : 0,
    incorrect: graded ? incorrect : 0,
    skipped,
    percentage:
      graded && questions.length
        ? Math.round((correct / questions.length) * 100)
        : null,
    timeSeconds: progress.elapsedSeconds,
  };
}
export function shuffleQuestions<T>(values: T[]): T[] {
  const next = values.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
export const durationLabel = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(
      2,
      "0",
    )}:${(Math.floor(seconds) % 60).toString().padStart(2, "0")}`;
export const bilingual = (value: string) => ({ en: value, ar: value });
export const choiceKeys: ExamChoice["key"][] = ["a", "b", "c", "d", "e"];
export function safeExamImage(url: string) {
  if (
    /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(url) &&
    url.length < 800_000
  )
    return url;
  try {
    const parsed = new URL(url, window.location.origin);
    return ["https:", "http:"].includes(parsed.protocol)
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
}
