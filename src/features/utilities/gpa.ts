export interface GpaRow {
  id: string;
  name: string;
  credits: string;
  points: string;
  excluded: boolean;
}
export interface GpaDraft {
  scale: string;
  priorCredits: string;
  priorGpa: string;
  rows: GpaRow[];
}
export const emptyGpa = (): GpaDraft => ({
  scale: "4",
  priorCredits: "",
  priorGpa: "",
  rows: [{ id: "first", name: "", credits: "", points: "", excluded: false }],
});
const numeric = (value: string) =>
  value.trim() !== "" && Number.isFinite(Number(value));
export function calculateGpa(draft: GpaDraft) {
  const max = Number(draft.scale),
    errors: string[] = [];
  if (!numeric(draft.scale) || max < 1 || max > 10) errors.push("scale");
  let credits = 0,
    weighted = 0;
  for (const row of draft.rows.filter((item) => !item.excluded)) {
    if (!row.credits.trim() && !row.points.trim() && !row.name.trim()) continue;
    const weight = Number(row.credits),
      points = Number(row.points);
    if (
      !numeric(row.credits) ||
      weight <= 0 ||
      weight > 100 ||
      !numeric(row.points) ||
      points < 0 ||
      points > max
    )
      errors.push(row.id);
    else {
      credits += weight;
      weighted += weight * points;
    }
  }
  const prior = draft.priorCredits.trim() ? Number(draft.priorCredits) : 0;
  if (
    !Number.isFinite(prior) ||
    prior < 0 ||
    prior > 10000 ||
    (prior > 0 &&
      (!numeric(draft.priorGpa) ||
        Number(draft.priorGpa) < 0 ||
        Number(draft.priorGpa) > max))
  )
    errors.push("prior");
  return {
    valid: errors.length === 0,
    errors,
    credits,
    term: !errors.length && credits > 0 ? weighted / credits : null,
    cumulative:
      !errors.length && credits + prior > 0
        ? (weighted + (prior > 0 ? prior * Number(draft.priorGpa) : 0)) /
          (credits + prior)
        : null,
  };
}
export function normalizeGpa(value: unknown): GpaDraft {
  const fallback = emptyGpa();
  if (!value || typeof value !== "object") return fallback;
  const data = value as Partial<GpaDraft>;
  const text = (item: unknown, max = 12) =>
    typeof item === "string" ? item.slice(0, max) : "";
  return {
    scale: text(data.scale) || "4",
    priorCredits: text(data.priorCredits),
    priorGpa: text(data.priorGpa),
    rows: Array.isArray(data.rows)
      ? data.rows
          .slice(0, 100)
          .flatMap((row, index) =>
            row && typeof row === "object"
              ? [
                  {
                    id: "row-" + index,
                    name: text(row.name, 150),
                    credits: text(row.credits),
                    points: text(row.points),
                    excluded: row.excluded === true,
                  },
                ]
              : [],
          )
      : fallback.rows,
  };
}
