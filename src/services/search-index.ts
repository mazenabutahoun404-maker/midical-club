import type {
  Course,
  Resource,
  ClubEvent,
  Opportunity,
  SearchResult,
} from "../types/content";
const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/(^|\s)ال(?=[\u0621-\u064A])/g, "$1")
    .toLowerCase()
    .trim();
export function searchRecords(
  data: {
    courses: Course[];
    resources: Resource[];
    events: ClubEvent[];
    opportunities: Opportunity[];
  },
  query: string,
): SearchResult[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const rows = [
    ...data.courses.map((item) => ({
      id: `course:${item.id}`,
      title: item.title,
      subtitle: item.batch,
      record: { kind: "course" as const, item },
      keywords: [item.code, item.track],
    })),
    ...data.resources.map((item) => {
      const c = data.courses.find((c) => c.id === item.courseId);
      return {
        id: item.id,
        title: item.title,
        subtitle: c?.title || item.title,
        record: { kind: "resource" as const, item },
        keywords: [item.kind, ...item.keywords],
      };
    }),
    ...data.events.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.type,
      record: { kind: "event" as const, item },
      keywords: [],
    })),
    ...data.opportunities.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.type,
      record: { kind: "opportunity" as const, item },
      keywords: [],
    })),
  ];
  return rows
    .filter((r) =>
      terms.every((term) =>
        normalize(
          [
            r.title.en,
            r.title.ar,
            r.subtitle.en,
            r.subtitle.ar,
            ...r.keywords,
          ].join(" "),
        ).includes(term),
      ),
    )
    .slice(0, 12)
    .map(({ keywords: _, ...r }) => r);
}
