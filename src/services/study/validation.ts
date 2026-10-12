import {
  StudyError,
  type PageAnchor,
  type ClaimInput,
  type RecallGrade,
} from "../../types/study-hub";
export function text(value: unknown, min: number, max: number) {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    throw new StudyError("INVALID");
  return value.trim();
}
export function integer(value: number, min: number, max: number) {
  if (!Number.isInteger(value) || value < min || value > max)
    throw new StudyError("INVALID");
  return value;
}
export function anchor(value: PageAnchor): PageAnchor {
  text(value.resourceId, 1, 180);
  text(value.resourceRevision, 1, 180);
  integer(value.page, 1, 20000);
  for (const n of [value.x, value.y])
    if (!Number.isFinite(n) || n < 0 || n > 1) throw new StudyError("INVALID");
  return {
    ...value,
    quote: value.quote ? text(value.quote, 1, 1000) : undefined,
  };
}
export function claim(input: ClaimInput) {
  if (
    !["activity", "publication", "leadership", "volunteering"].includes(
      input.kind,
    )
  )
    throw new StudyError("INVALID");
  text(input.title, 3, 160);
  text(input.description, 1, 2000);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.occurredAt) ||
    !Number.isFinite(Date.parse(input.occurredAt)) ||
    new Date(input.occurredAt).toISOString().slice(0, 10) !==
      input.occurredAt ||
    input.occurredAt > new Date().toISOString().slice(0, 10)
  )
    throw new StudyError("INVALID");
  if (
    input.hours !== undefined &&
    (!Number.isFinite(input.hours) || input.hours < 0 || input.hours > 10000)
  )
    throw new StudyError("INVALID");
  if (input.kind === "volunteering" && (!input.hours || input.hours <= 0))
    throw new StudyError("INVALID");
  try {
    const url = new URL(input.evidenceUrl);
    if (url.protocol !== "https:" || url.username || url.password) throw 0;
  } catch {
    throw new StudyError("INVALID");
  }
}
export function nextRecall(interval: number, grade: RecallGrade, now: number) {
  if (!["again", "hard", "good", "easy"].includes(grade))
    throw new StudyError("INVALID");
  const days =
    grade === "again"
      ? 0
      : grade === "hard"
        ? Math.max(1, Math.round(interval * 1.2))
        : grade === "good"
          ? Math.max(3, Math.round(interval * 2))
          : Math.max(7, Math.round(interval * 2.5));
  return {
    intervalDays: Math.min(365, days),
    dueAt: new Date(
      now + (days ? Math.min(365, days) * 86400000 : 600000),
    ).toISOString(),
  };
}
