import { APP_TIMEZONE } from "../constants/config";
import type { Locale } from "../types/content";
export function formatDate(
  value: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
) {
  if (!value || typeof value !== "string") return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
    timeZone: APP_TIMEZONE,
    ...options,
  }).format(date);
}
