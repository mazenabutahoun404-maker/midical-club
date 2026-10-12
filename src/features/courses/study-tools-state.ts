export type TimerMode = "focus" | "relax";
export interface StudyTimer {
  minutes: number;
  restMinutes: number;
  mode: TimerMode;
  phase: TimerMode | "rest";
  remaining: number;
  startedAt: number | null;
}
export interface StudyToolState {
  notes: string;
  bookmarks: Record<string, number[]>;
  timer: StudyTimer;
}
export const emptyStudyTools = (): StudyToolState => ({
  notes: "",
  bookmarks: {},
  timer: {
    minutes: 25,
    restMinutes: 5,
    mode: "focus",
    phase: "focus",
    remaining: 1500,
    startedAt: null,
  },
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
    const { minutes, restMinutes, mode, phase, remaining, startedAt } =
      value.timer;
    if (
      typeof minutes === "number" &&
      Number.isFinite(minutes) &&
      minutes >= 1 &&
      minutes <= 180
    )
      next.timer.minutes = Math.round(minutes);
    if (
      typeof restMinutes === "number" &&
      Number.isFinite(restMinutes) &&
      restMinutes >= 0 &&
      restMinutes <= 60
    )
      next.timer.restMinutes = Math.round(restMinutes);
    next.timer.mode = mode === "relax" ? "relax" : "focus";
    next.timer.phase =
      phase === "rest" && next.timer.restMinutes > 0 ? "rest" : next.timer.mode;
    const duration =
      next.timer.phase === "rest" ? next.timer.restMinutes : next.timer.minutes;
    next.timer.remaining =
      typeof remaining === "number" && Number.isFinite(remaining)
        ? Math.max(0, Math.min(duration * 60, remaining))
        : duration * 60;
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

/** One completed phase becomes a paused rest or a completed session, never an unseen auto-start. */
export function finishStudyTimer(
  timer: StudyTimer,
  now: number,
): { timer: StudyTimer; ended: StudyTimer["phase"] } | null {
  if (timer.startedAt === null || timerRemaining(timer, now) > 0) return null;
  const rest = timer.phase !== "rest" && timer.restMinutes > 0;
  return {
    ended: timer.phase,
    timer: {
      ...timer,
      phase: rest ? "rest" : timer.mode,
      remaining: rest ? timer.restMinutes * 60 : 0,
      startedAt: null,
    },
  };
}
