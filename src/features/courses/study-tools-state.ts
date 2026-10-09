export interface StudyToolState {
  notes: string;
  bookmarks: Record<string, number[]>;
  timer: { minutes: number; remaining: number; startedAt: number | null };
}
export const emptyStudyTools = (): StudyToolState => ({
  notes: "",
  bookmarks: {},
  timer: { minutes: 25, remaining: 1500, startedAt: null },
});
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
export function normalizeStudyTools(value: unknown): StudyToolState {
  const next = emptyStudyTools();
  if (!record(value)) return next;
  if (typeof value.notes === "string") next.notes = value.notes.slice(0, 25000);
  if (record(value.bookmarks))
    for (const [id, pages] of Object.entries(value.bookmarks).slice(-100)) {
      if (
        ["__proto__", "constructor", "prototype"].includes(id) ||
        id.length > 200 ||
        !Array.isArray(pages)
      )
        continue;
      next.bookmarks[id] = [
        ...new Set(
          pages.filter(
            (page) =>
              typeof page === "number" &&
              Number.isInteger(page) &&
              page >= 1 &&
              page <= 10000,
          ) as number[],
        ),
      ]
        .slice(0, 100)
        .sort((a, b) => a - b);
    }
  if (record(value.timer)) {
    const { minutes, remaining, startedAt } = value.timer;
    if ([5, 15, 25, 45].includes(Number(minutes)))
      next.timer.minutes = Number(minutes);
    if (typeof remaining === "number" && Number.isFinite(remaining))
      next.timer.remaining = Math.max(0, Math.min(2700, remaining));
    if (
      typeof startedAt === "number" &&
      Number.isFinite(startedAt) &&
      startedAt > 0
    )
      next.timer.startedAt = startedAt;
  }
  return next;
}
export function timerRemaining(timer: StudyToolState["timer"], now: number) {
  return Math.max(
    0,
    Math.ceil(
      timer.remaining -
        (timer.startedAt === null
          ? 0
          : Math.max(0, now - timer.startedAt) / 1000),
    ),
  );
}
export function togglePageBookmark(
  state: StudyToolState,
  resourceId: string,
  page: number,
): StudyToolState {
  if (
    !resourceId ||
    ["__proto__", "constructor", "prototype"].includes(resourceId) ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > 10000
  )
    return state;
  const existing = state.bookmarks[resourceId] || [];
  return {
    ...state,
    bookmarks: {
      ...state.bookmarks,
      [resourceId]: existing.includes(page)
        ? existing.filter((value) => value !== page)
        : [...existing, page].sort((a, b) => a - b).slice(0, 100),
    },
  };
}
