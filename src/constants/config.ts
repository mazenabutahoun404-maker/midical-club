export const APP_VERSION = "0.13.23";
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
  mentorship: "medclub.mentorship.v6",
  contributions: "medclub.contributions.v6",
  store: "medclub.store.v7",
  auth: "medclub.auth.v8",
  recruitment: "medclub.recruitment.v9",
  admin: "medclub.admin.v10",
  builder: "medclub.builder.v11",
  governance: "medclub.governance.v12",
  insights: "medclub.insights.v13",
  welcomeSeen: "medclub.welcome-seen.v4",
} as const;
export const QUERY_STALE_TIME = 60_000;
