import { ApiError } from "./client";
import { record, requireId } from "./mapping";
import type { Schemas } from "./schema.generated";
export function invalid(message: string): never {
  throw new ApiError(message, 422, "INVALID_SCHEDULE");
}
export function dateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(value + "T12:00:00Z");
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
export function timeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(0);
  } catch {
    invalid("Enter a valid IANA time zone, such as Asia/Amman.");
  }
  return value;
}
export function instant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d+)?)?(?:Z|[+-]\d\d:\d\d)$/.test(
      value,
    ) &&
    dateOnly(value.slice(0, 10)) &&
    Number(value.slice(11, 13)) < 24 &&
    Number(value.slice(14, 16)) < 60 &&
    Number.isFinite(Date.parse(value))
  );
}
export function calendarRequest(body: Schemas["CalendarRequest"]) {
  if (!body.title?.trim()) invalid("Enter an entry title.");
  timeZone(body.timeZone || "");
  if (body.allDay) {
    if (
      !dateOnly(body.startDate) ||
      (body.endDate != null &&
        (!dateOnly(body.endDate) || body.endDate < body.startDate))
    )
      invalid("Choose valid start and end dates.");
    if (body.startsAt != null || body.endsAt != null)
      invalid("All-day entries use dates, without timed instants.");
  } else {
    if (
      !instant(body.startsAt) ||
      (body.endsAt != null &&
        (!instant(body.endsAt) ||
          Date.parse(body.endsAt) <= Date.parse(body.startsAt)))
    )
      invalid(
        "Choose an end time after the start time, including a UTC offset.",
      );
    if (body.startDate != null || body.endDate != null)
      invalid("Timed entries use instants, without all-day dates.");
  }
  for (const reminder of body.reminders || []) {
    const relative = reminder.minutesBefore != null,
      absolute = reminder.at != null;
    if (
      relative === absolute ||
      (relative &&
        (!Number.isInteger(reminder.minutesBefore) ||
          reminder.minutesBefore! < 0)) ||
      (absolute && !instant(reminder.at))
    )
      invalid(
        "Each reminder needs either nonnegative minutes before, or one exact time with a UTC offset.",
      );
  }
}
export function checkedCalendar<T>(value: T): T {
  const v = record(value);
  requireId(v.id);
  requireId(v.version);
  if (
    typeof v.title !== "string" ||
    typeof v.source !== "string" ||
    typeof v.allDay !== "boolean" ||
    typeof v.isDeleted !== "boolean" ||
    typeof v.isCancelled !== "boolean"
  )
    throw new ApiError(
      "The calendar entry is incomplete.",
      502,
      "INVALID_RESPONSE",
    );
  if (
    v.allDay
      ? !dateOnly(v.startDate) || (v.endDate != null && !dateOnly(v.endDate))
      : !instant(v.startsAt) || (v.endsAt != null && !instant(v.endsAt))
  )
    throw new ApiError(
      "The calendar entry has invalid dates.",
      502,
      "INVALID_RESPONSE",
    );
  if (typeof v.timeZone !== "string")
    throw new ApiError(
      "The calendar time zone is missing.",
      502,
      "INVALID_RESPONSE",
    );
  try {
    timeZone(v.timeZone);
  } catch {
    throw new ApiError(
      "The calendar time zone is invalid.",
      502,
      "INVALID_RESPONSE",
    );
  }
  return value;
}
export function checkedCalendarId<T>(value: T, id: string): T {
  checkedCalendar(value);
  if (String(record(value).id).toLowerCase() !== id.toLowerCase())
    throw new ApiError(
      "The calendar response did not match the requested entry.",
      502,
      "INVALID_RESPONSE",
    );
  return value;
}
export function checkedPage<T>(value: T, entry?: (v: unknown) => unknown): T {
  const v = record(value);
  if (
    !Array.isArray(v.items) ||
    !Number.isInteger(v.total) ||
    Number(v.total) < 0 ||
    !Number.isInteger(v.page) ||
    Number(v.page) < 1 ||
    !Number.isInteger(v.pageSize) ||
    Number(v.pageSize) < 1
  )
    throw new ApiError(
      "The server returned an invalid page.",
      502,
      "INVALID_RESPONSE",
    );
  if (entry) v.items.forEach(entry);
  return value;
}
export function checkedNotifications<T>(value: T): T {
  return checkedPage(value, (row) => {
    const v = record(row);
    requireId(v.id);
    if (
      typeof v.title !== "string" ||
      typeof v.body !== "string" ||
      !instant(v.createdAt) ||
      (v.readAt !== null && !instant(v.readAt))
    )
      throw new ApiError(
        "The notification is incomplete.",
        502,
        "INVALID_RESPONSE",
      );
  });
}
export async function calendarText(value: unknown) {
  const text =
    typeof value === "string"
      ? value
      : value instanceof Blob
        ? await value.text()
        : "";
  if (
    text.length > 5 * 1024 * 1024 ||
    !/^BEGIN:VCALENDAR(?:\r?\n)/.test(text) ||
    !/(?:\r?\n)END:VCALENDAR(?:\r?\n)?$/.test(text)
  )
    throw new ApiError(
      "The server did not return a valid calendar file.",
      502,
      "INVALID_CALENDAR_FEED",
    );
  return text;
}
export function subscriptionAddress(
  baseUrl: string,
  path: string,
  token: string,
) {
  if (
    !token ||
    path !== `/api/v1/calendar/subscriptions/${encodeURIComponent(token)}.ics`
  )
    throw new ApiError(
      "The subscription address did not match the issued token.",
      502,
      "INVALID_SUBSCRIPTION",
    );
  const result = new URL(baseUrl.replace(/\/$/, "") + path),
    base = new URL(baseUrl);
  if (
    result.origin !== base.origin ||
    !/^https?:$/.test(result.protocol) ||
    result.username ||
    result.password ||
    result.search ||
    result.hash
  )
    throw new ApiError(
      "The subscription address is invalid.",
      502,
      "INVALID_SUBSCRIPTION",
    );
  return result.href;
}
export function notificationPreferences(
  value: unknown,
  changes: Record<string, boolean>,
) {
  const categories = record(value).categories;
  if (!Array.isArray(categories))
    throw new ApiError(
      "Notification preference metadata is unavailable.",
      502,
      "INVALID_RESPONSE",
    );
  const result: Record<string, boolean> = Object.create(null);
  for (const item of categories) {
    const c = record(item),
      key = String(c.category);
    if (typeof c.enabled === "boolean") result[key] = c.enabled;
    if (Object.hasOwn(changes, key)) {
      if (c.canDisable !== true && changes[key] === false)
        invalid("This notification category is required.");
      result[key] = changes[key];
    }
  }
  if (
    Object.keys(changes).some(
      (key) => !categories.some((c) => record(c).category === key),
    )
  )
    invalid("Reload the available notification categories before saving.");
  return { categories: result };
}
export function checkedUnread<T>(value: T): T {
  if (
    !Number.isInteger(record(value).unreadCount) ||
    Number(record(value).unreadCount) < 0
  )
    throw new ApiError("The unread count is invalid.", 502, "INVALID_RESPONSE");
  return value;
}
export function checkedPreferences<T>(value: T): T {
  const v = record(value);
  if (
    typeof v.channel !== "string" ||
    typeof v.required !== "boolean" ||
    !Array.isArray(v.categories) ||
    v.categories.some((item) => {
      const c = record(item);
      return (
        typeof c.category !== "string" ||
        typeof c.canDisable !== "boolean" ||
        (c.enabled !== null && typeof c.enabled !== "boolean")
      );
    })
  )
    throw new ApiError(
      "Notification preference metadata is incomplete.",
      502,
      "INVALID_RESPONSE",
    );
  return value;
}
export function checkedSubscriptions<T>(value: T): T {
  if (
    !Array.isArray(value) ||
    value.some((item) => {
      const c = record(item);
      return (
        typeof c.id !== "string" ||
        !c.id ||
        typeof c.name !== "string" ||
        typeof c.includePersonalEntries !== "boolean"
      );
    })
  )
    throw new ApiError(
      "Calendar subscription metadata is incomplete.",
      502,
      "INVALID_RESPONSE",
    );
  return value;
}
export function checkedFollows<T>(value: T): T {
  if (
    !Array.isArray(value) ||
    value.some((item) => {
      const c = record(item);
      return (
        !c.id ||
        typeof c.id !== "string" ||
        typeof c.userId !== "string" ||
        typeof c.subjectId !== "string"
      );
    })
  )
    throw new ApiError(
      "Followed subject data is incomplete.",
      502,
      "INVALID_RESPONSE",
    );
  return value;
}
export function checkedPreview<T>(value: T): T {
  const v = record(value);
  if (
    v.sent !== false ||
    !Number.isInteger(v.recipientCount) ||
    Number(v.recipientCount) < 0
  )
    throw new ApiError(
      "The audience preview is invalid.",
      502,
      "INVALID_PREVIEW",
    );
  return value;
}
