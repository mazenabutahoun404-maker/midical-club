import type { Course } from "../../types/content";

export function courseSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/ـ/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x660))
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function courseMatches(course: Course, search: string) {
  const text = courseSearchText(
    [
      course.title.en,
      course.title.ar,
      course.code,
      course.batch.en,
      course.batch.ar,
    ].join(" "),
  );
  const compact = text.replace(/\s/g, "");
  return courseSearchText(search)
    .split(/\s+/)
    .every((word) => text.includes(word) || compact.includes(word));
}
