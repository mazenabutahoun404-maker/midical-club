import type { HomeSection } from "../types/content";
export function visibleSections(sections: HomeSection[], now: Date) {
  const time = now.getTime();
  return sections
    .filter(
      (s) =>
        s.enabled &&
        (!s.startsAt || Date.parse(s.startsAt) <= time) &&
        (!s.endsAt || Date.parse(s.endsAt) > time),
    )
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
