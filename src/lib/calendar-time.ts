import {
  dateOnly,
  invalid,
  timeZone,
} from "../services/api/schedule-contracts";
export function localDateTime(value: string, zone: string) {
  timeZone(zone);
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (name: string) => p.find((v) => v.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}
export function zonedInstant(local: string, zone: string, offset?: string) {
  timeZone(zone);
  if (
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(local) ||
    !dateOnly(local.slice(0, 10)) ||
    Number(local.slice(11, 13)) > 23 ||
    Number(local.slice(14, 16)) > 59
  )
    invalid("Enter a valid local date and time.");
  const naive = Date.parse(local + ":00Z"),
    offsets = new Set<number>();
  for (let h = -48; h <= 48; h += 6) {
    const at = naive + h * 3600000;
    offsets.add(
      Date.parse(localDateTime(new Date(at).toISOString(), zone) + ":00Z") - at,
    );
  }
  let candidates = [...offsets]
    .map((v) => naive - v)
    .filter((v) => localDateTime(new Date(v).toISOString(), zone) === local);
  if (offset) {
    if (!/^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(offset))
      invalid("Enter the UTC offset as +03:00 or -05:00.");
    const explicit = Date.parse(local + ":00" + offset);
    candidates = candidates.filter((v) => v === explicit);
  }
  if (candidates.length === 0)
    invalid(
      "This local time or offset does not exist in the selected time zone. Choose another time.",
    );
  if (candidates.length > 1)
    invalid(
      "This time occurs twice due to daylight saving. Enter its UTC offset to choose the intended occurrence.",
    );
  return new Date(candidates[0]).toISOString();
}
export function entryDay(
  entry: {
    allDay?: boolean;
    startDate?: string | null;
    startsAt?: string | null;
  },
  zone: string,
) {
  return entry.allDay
    ? entry.startDate || ""
    : entry.startsAt
      ? localDateTime(entry.startsAt, zone).slice(0, 10)
      : "";
}
