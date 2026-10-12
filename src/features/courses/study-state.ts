import type { CourseSectionKind } from "../../types/content";

const kinds: CourseSectionKind[] = [
  "overview",
  "guidance",
  "slides",
  "notes",
  "summary",
  "recording",
  "book",
  "questions",
  "external",
];
export interface StudyPosition {
  scroll: number;
  page: number;
  seconds: number;
}
export type SectionLayout = "auto" | "horizontal" | "vertical";
export function resolveSectionLayout(
  layout: SectionLayout,
  focus: boolean,
  navigationVisible = !focus,
) {
  // Older stored side layouts are retained as data, but cannot float over the reader.
  return "horizontal" as const;
}
export interface StudyState {
  active: CourseSectionKind;
  sections: Partial<
    Record<CourseSectionKind, { scroll: number; resourceId?: string }>
  >;
  resources: Record<string, StudyPosition>;
  lastResourceId?: string;
  companionId?: string;
  split: boolean;
  width: number;
  sectionLayout: SectionLayout;
}
export const emptyStudyState = (): StudyState => ({
  active: "overview",
  sections: {},
  resources: {},
  split: false,
  width: 55,
  sectionLayout: "auto",
});
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const number = (value: unknown, fallback = 0, max = 1_000_000) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(0, value))
    : fallback;
const id = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= 200 &&
  !["__proto__", "constructor", "prototype"].includes(value);
export function normalizeStudyState(value: unknown): StudyState {
  const result = emptyStudyState();
  if (!object(value)) return result;
  if (kinds.includes(value.active as CourseSectionKind))
    result.active = value.active as CourseSectionKind;
  if (object(value.sections))
    for (const kind of kinds) {
      const item = value.sections[kind];
      if (object(item))
        result.sections[kind] = {
          scroll: number(item.scroll),
          ...(id(item.resourceId) ? { resourceId: item.resourceId } : {}),
        };
    }
  if (object(value.resources))
    for (const [key, item] of Object.entries(value.resources).slice(-100)) {
      if (id(key) && object(item))
        result.resources[key] = {
          scroll: number(item.scroll),
          page: Math.max(1, Math.floor(number(item.page, 1, 10000))),
          seconds: number(item.seconds, 0, 86400),
        };
    }
  if (id(value.lastResourceId)) result.lastResourceId = value.lastResourceId;
  if (id(value.companionId)) result.companionId = value.companionId;
  result.split = value.split === true;
  result.width = Math.max(35, number(value.width, 55, 65));
  if (
    value.sectionLayout === "horizontal" ||
    value.sectionLayout === "vertical"
  )
    result.sectionLayout = value.sectionLayout;
  return result;
}
export const studyStorageKey = (owner: string, course: string) =>
  `medclub:study:v1:${encodeURIComponent(owner)}:${encodeURIComponent(course)}`;
export function readStudyState(key: string): StudyState {
  try {
    return normalizeStudyState(JSON.parse(localStorage.getItem(key) || "null"));
  } catch {
    return emptyStudyState();
  }
}
export function writeStudyState(key: string, state: StudyState): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
export function safeResourceUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(
      value,
      typeof window === "undefined"
        ? "https://medclub.invalid"
        : window.location.origin,
    );
    if (["https:", "http:"].includes(url.protocol)) return url.href;
    if (
      url.protocol === "blob:" &&
      typeof window !== "undefined" &&
      url.origin === window.location.origin
    )
      return url.href;
    return undefined;
  } catch {
    return undefined;
  }
}
export function timeLabel(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
