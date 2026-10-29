import type { Batch } from "../../types/content";
export function batchJourney(
  batch: Pick<Batch, "startDate" | "expectedGraduationDate">,
  now = Date.now(),
) {
  const start = Date.parse(batch.startDate || ""),
    end = Date.parse(batch.expectedGraduationDate || "");
  return Number.isFinite(start) && Number.isFinite(end) && end > start
    ? {
        progress: Math.round(
          Math.max(0, Math.min(1, (now - start) / (end - start))) * 100,
        ),
        days: Math.max(0, Math.ceil((end - now) / 86400000)),
      }
    : null;
}
