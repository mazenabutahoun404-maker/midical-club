import type {
  Article,
  ClubEvent,
  CommunityActivity,
} from "../../types/content";
import type { RecruitmentPosition } from "../../types/recruitment";
/** Counts public records, never team members or application submissions. */
export function summarizeCommunity(
  activities: CommunityActivity[],
  articles: Article[],
  positions: RecruitmentPosition[],
  events: ClubEvent[],
  at: number,
) {
  return {
    activities: new Set(activities.map((item) => item.id)).size,
    publications: new Set(
      articles
        .filter(
          (item) =>
            Number.isFinite(Date.parse(item.publishedAt)) &&
            Date.parse(item.publishedAt) <= at,
        )
        .map((item) => item.id),
    ).size,
    openRoles: new Set(
      positions
        .filter(
          (item) =>
            item.status !== "closed" &&
            item.openings > 0 &&
            Date.parse(item.closesAt) >= at,
        )
        .map((item) => item.id),
    ).size,
    nextEvent:
      events
        .filter(
          (item) =>
            Date.parse(item.startDate) >= at &&
            Date.parse(item.endDate) >= Date.parse(item.startDate),
        )
        .sort(
          (a, b) =>
            Date.parse(a.startDate) - Date.parse(b.startDate) ||
            a.id.localeCompare(b.id),
        )[0] ?? null,
  };
}
