import type { Course, Resource, Text } from "../../types/content";
import type { CalendarItem } from "../../types/workspace";
import { personalCoursePath } from "../../constants/routes";
import { readStudyState, studyStorageKey } from "../courses/study-state";

export type PersonalExam = {
  title: string;
  courseId: string;
  startsAt: string;
};
export type HomePreferences = { shortcuts: string[]; exam?: PersonalExam };
export const shortcutChoices = [
  {
    id: "learning",
    href: "/my/learning",
    label: { en: "My courses", ar: "مساقاتي" },
  },
  {
    id: "library",
    href: "/my/library",
    label: { en: "My library", ar: "مكتبتي" },
  },
  {
    id: "recall",
    href: "/my/study/recall",
    label: { en: "Recall cards", ar: "بطاقات المراجعة" },
  },
  {
    id: "notes",
    href: "/my/focus?tool=notes",
    label: { en: "My notes", ar: "ملاحظاتي" },
  },
  {
    id: "calendar",
    href: "/my/calendar",
    label: { en: "My calendar", ar: "تقويمي" },
  },
  {
    id: "focus",
    href: "/my/focus",
    label: { en: "Focus timer", ar: "مؤقت التركيز" },
  },
  {
    id: "offline",
    href: "/my/study/offline",
    label: { en: "Offline packs", ar: "الحزم المحفوظة" },
  },
  {
    id: "exams",
    href: "/my/exams",
    label: { en: "Exam practice", ar: "تدريب الامتحانات" },
  },
] satisfies Array<{ id: string; href: string; label: Text }>;
export const homePreferencesKey = (owner: string) =>
  `medclub:personal-home:${encodeURIComponent(owner)}:v1`;
export function readHomePreferences(owner: string): HomePreferences {
  const defaults = { shortcuts: ["learning", "library", "recall"] };
  try {
    const raw = JSON.parse(
      localStorage.getItem(homePreferencesKey(owner)) || "null",
    );
    if (!raw || typeof raw !== "object") return defaults;
    const selected = Array.isArray(raw.shortcuts)
      ? [
          ...new Set<string>(
            raw.shortcuts.filter(
              (id: unknown) =>
                typeof id === "string" &&
                shortcutChoices.some((c) => c.id === id),
            ),
          ),
        ].slice(0, 3)
      : [];
    const exam = raw.exam;
    return {
      shortcuts: selected.length === 3 ? selected : defaults.shortcuts,
      ...(exam &&
      typeof exam.title === "string" &&
      exam.title.trim() &&
      typeof exam.courseId === "string" &&
      typeof exam.startsAt === "string" &&
      Number.isFinite(Date.parse(exam.startsAt))
        ? {
            exam: {
              title: exam.title.slice(0, 100),
              courseId: exam.courseId,
              startsAt: exam.startsAt,
            },
          }
        : {}),
    };
  } catch {
    return defaults;
  }
}
export function resourceResumeHref(
  course: Course,
  resource: Resource,
  page = 1,
) {
  if (!resource.fileUrl)
    return `${personalCoursePath(course.slug)}?section=${encodeURIComponent(resource.kind)}`;
  return `${personalCoursePath(course.slug)}?pdf=${encodeURIComponent(resource.id)}&page=${Math.max(1, Math.trunc(page))}&revision=${encodeURIComponent(resource.updatedAt)}&resume=1`;
}
export function findResume(
  owner: string,
  courses: Course[],
  resources: Resource[],
  recent: { resourceId: string; viewedAt: string }[],
) {
  const importedHref = (course: Course, id: string, page: number) =>
    `${personalCoursePath(course.slug)}?pdf=${encodeURIComponent(id)}&page=${page}&resume=1`;
  for (const entry of recent) {
    const resource = resources.find((r) => r.id === entry.resourceId);
    const course = resource && courses.find((c) => c.id === resource.courseId);
    if (!resource || !course) {
      for (const importedCourse of courses) {
        const state = readStudyState(studyStorageKey(owner, importedCourse.id));
        if (
          state.lastResourceId === entry.resourceId &&
          state.resources[entry.resourceId]
        )
          return {
            course: importedCourse,
            resource: undefined,
            page: state.resources[entry.resourceId].page,
            href: importedHref(
              importedCourse,
              entry.resourceId,
              state.resources[entry.resourceId].page,
            ),
          };
      }
      continue;
    }
    const position = readStudyState(studyStorageKey(owner, course.id))
      .resources[resource.id];
    return {
      course,
      resource,
      page: position?.page || 1,
      href: resourceResumeHref(course, resource, position?.page),
    };
  }
  // Imported durable PDFs are not in the global resource catalogue. Reopen their saved reader state.
  for (const course of courses) {
    const state = readStudyState(studyStorageKey(owner, course.id));
    if (state.lastResourceId && state.resources[state.lastResourceId]) {
      const resource = resources.find((r) => r.id === state.lastResourceId);
      return {
        course,
        resource,
        page: state.resources[state.lastResourceId].page,
        href: resource
          ? resourceResumeHref(
              course,
              resource,
              state.resources[state.lastResourceId].page,
            )
          : importedHref(
              course,
              state.lastResourceId,
              state.resources[state.lastResourceId].page,
            ),
      };
    }
  }
  return null;
}
export function nextHomeExam(
  exam: PersonalExam | undefined,
  calendar: CalendarItem[],
  courses: Course[],
  now: number,
  allowCalendar: boolean,
) {
  const items = allowCalendar ? calendar.filter((i) => i.kind === "exam") : [];
  if (exam && courses.some((c) => c.id === exam.courseId))
    items.push({
      id: "personal-next-exam",
      kind: "exam",
      title: { en: exam.title, ar: exam.title },
      courseId: exam.courseId,
      startsAt: exam.startsAt,
      description: { en: "Your saved exam", ar: "امتحانك المحفوظ" },
    });
  return items
    .filter(
      (i) =>
        Number.isFinite(Date.parse(i.startsAt)) &&
        Date.parse(i.startsAt) > now &&
        courses.some((c) => c.id === i.courseId),
    )
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];
}
