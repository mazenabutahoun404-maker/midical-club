export const APP_VERSION = "0.4.0";
/** Stable demo calendar anchor; APIs can supply a server date later. */
export const DEMO_TODAY = "2026-09-03";
export const DEFAULT_LOCALE = "en" as const;
export const APP_TIMEZONE = "Asia/Amman";
export const STORAGE_KEYS = {
  locale: "medclub.locale.v1",
  appearance: "medclub.appearance.v1",
  saved: "medclub.saved.v1",
  workspace: "medclub.workspace.v3",
  eventRegistrations: "medclub.event-registrations.v4",
  welcomeSeen: "medclub.welcome-seen.v4",
} as const;
export const QUERY_STALE_TIME = 60_000;
