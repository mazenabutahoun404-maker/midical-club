import { APP_TIMEZONE } from "../constants/config";
import { text } from "./localize";
import type { CalendarItem, StudyEntry } from "../types/workspace";
import type { ClubEvent, Opportunity } from "../types/content";
export function calendarDate(value: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (key: string) => parts.find((p) => p.type === key)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export const dateAtNoon = (day: string) => day + "T12:00:00+03:00";
export function shiftDay(day: string, count: number): string {
  const value = new Date(day + "T12:00:00Z");
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10);
}
export function shiftMonth(month: string, count: number): string {
  const value = new Date(month + "-01T12:00:00Z");
  value.setUTCMonth(value.getUTCMonth() + count);
  return value.toISOString().slice(0, 7);
}
export function monthDays(month: string): string[] {
  const first = month + "-01";
  const offset = (new Date(first + "T12:00:00Z").getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => shiftDay(first, i - offset));
}
export function buildCalendar(
  academic: CalendarItem[],
  entries: StudyEntry[],
  events: ClubEvent[],
  opportunities: Opportunity[],
  saved: string[],
  courseIds: string[],
  registeredEventIds: string[] = [],
): CalendarItem[] {
  return [
    ...academic.filter(
      (item) => !item.courseId || courseIds.includes(item.courseId),
    ),
    ...entries.map((e) => {
      const startsAt = `${e.date}T${e.time}:00+03:00`;
      return {
        id: e.id,
        title: text(e.title, e.title),
        kind: "study" as const,
        startsAt,
        endsAt: new Date(
          Date.parse(startsAt) + e.durationMinutes * 60_000,
        ).toISOString(),
        description: text(e.notes, e.notes),
        courseId: e.courseId,
        sourceId: e.id,
      };
    }),
    ...events
      .filter((e) => saved.includes(e.id) || registeredEventIds.includes(e.id))
      .map((e) => ({
        id: `${registeredEventIds.includes(e.id) ? "registered" : "saved"}-event:${e.id}`,
        title: e.title,
        kind: "event" as const,
        startsAt: e.startDate,
        endsAt: e.endDate,
        description: e.description,
        sourceId: e.id,
      })),
    ...opportunities
      .filter((o) => saved.includes(o.id))
      .map((o) => ({
        id: `saved-deadline:${o.id}`,
        title: o.title,
        kind: "deadline" as const,
        startsAt: o.deadline,
        description: o.description,
        sourceId: o.id,
      })),
  ].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
