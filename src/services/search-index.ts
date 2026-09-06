import type {
  Course,
  Resource,
  ClubEvent,
  Opportunity,
  Article,
  Mentor,
  MentorshipSession,
  StoreProduct,
  SearchResult,
  SearchFilters,
} from "../types/content";
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/(^|\s)ال(?=[\u0621-\u064A])/g, "$1")
    .toLowerCase()
    .trim();
const aliases = [
  ["cardio", "cardiac", "cardiovascular", "heart", "قلب", "قلبية"],
  ["ecg", "ekg", "electrocardiogram"],
  ["neuro", "neurology", "neurological"],
  ["physio", "physiology", "فسيولوجيا"],
  ["anatomy", "تشريح"],
  ["slides", "شرائح"],
  ["notes", "ملاحظات"],
  ["summary", "summaries", "ملخص"],
  ["research", "بحث"],
  ["questions", "اسئلة"],
  ["store", "shop", "merch", "product", "متجر", "منتج"],
];
export function searchRecords(
  data: {
    courses: Course[];
    resources: Resource[];
    events: ClubEvent[];
    opportunities: Opportunity[];
    journal?: Article[];
    mentors?: Mentor[];
    mentorshipSessions?: MentorshipSession[];
    storeProducts?: StoreProduct[];
  },
  query: string,
  filters: SearchFilters = {},
): SearchResult[] {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const rows = [
    ...data.courses.map((item) => ({
      id: `course:${item.id}`,
      title: item.title,
      subtitle: item.batch,
      record: { kind: "course" as const, item },
      course: item,
      keywords: [
        item.code,
        item.track,
        item.description.en,
        item.description.ar,
      ],
    })),
    ...data.resources.map((item) => {
      const course = data.courses.find((c) => c.id === item.courseId);
      return {
        id: item.id,
        title: item.title,
        subtitle: course?.title || item.title,
        record: { kind: "resource" as const, item },
        course,
        keywords: [
          item.kind,
          ...item.keywords,
          item.description.en,
          item.description.ar,
        ],
      };
    }),
    ...data.events.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.type,
      record: { kind: "event" as const, item },
      course: undefined,
      keywords: [
        item.category,
        item.format,
        item.description.en,
        item.description.ar,
        item.location.en,
        item.location.ar,
        item.audience.en,
        item.audience.ar,
      ],
    })),
    ...data.opportunities.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.type,
      record: { kind: "opportunity" as const, item },
      course: undefined,
      keywords: [
        item.category,
        item.organization.en,
        item.organization.ar,
        item.field.en,
        item.field.ar,
        item.location.en,
        item.location.ar,
        item.description.en,
        item.description.ar,
        ...item.tags.flatMap((tag) => [tag.en, tag.ar]),
      ],
    })),
    ...(data.journal || []).map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.category,
      record: { kind: "article" as const, item },
      course: undefined,
      keywords: [
        item.excerpt.en,
        item.excerpt.ar,
        item.author.en,
        item.author.ar,
        ...item.tags.flatMap((tag) => [tag.en, tag.ar]),
      ],
    })),
    ...(data.mentors || []).map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: item.specialty,
      record: { kind: "mentor" as const, item },
      course: undefined,
      keywords: [
        item.title.en,
        item.title.ar,
        item.bio.en,
        item.bio.ar,
        item.format,
        ...item.areas.flatMap((area) => [area.en, area.ar]),
      ],
    })),
    ...(data.mentorshipSessions || []).map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.topic,
      record: { kind: "mentorship-session" as const, item },
      course: undefined,
      keywords: [
        item.summary.en,
        item.summary.ar,
        item.location.en,
        item.location.ar,
        item.audience.en,
        item.audience.ar,
        item.format,
      ],
    })),
    ...(data.storeProducts || []).map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: item.shortDescription,
      record: { kind: "product" as const, item },
      course: undefined,
      keywords: [
        item.category,
        item.description.en,
        item.description.ar,
        ...item.materials.flatMap((material) => [material.en, material.ar]),
        ...item.variants.flatMap((variant) => [
          variant.label.en,
          variant.label.ar,
          variant.sku,
        ]),
      ],
    })),
  ];
  return rows
    .flatMap((row) => {
      if (filters.type && row.record.kind !== filters.type) return [];
      if (
        filters.courseIds &&
        (!row.course || !filters.courseIds.includes(row.course.id))
      )
        return [];
      if (filters.track && row.course?.track !== filters.track) return [];
      if (filters.courseId && row.course?.id !== filters.courseId) return [];
      if (
        filters.resourceKind &&
        (row.record.kind !== "resource" ||
          row.record.item.kind !== filters.resourceKind)
      )
        return [];
      const title = normalizeSearch(row.title.en + " " + row.title.ar);
      const course = normalizeSearch(
        (row.course?.title.en || "") + " " + (row.course?.title.ar || ""),
      );
      const all = normalizeSearch(
        [title, course, row.subtitle.en, row.subtitle.ar, ...row.keywords].join(
          " ",
        ),
      );
      let score = 0;
      for (const term of terms) {
        const synonyms = aliases.find((group) =>
          group.map(normalizeSearch).includes(term),
        ) || [term];
        if (!synonyms.some((s) => all.includes(normalizeSearch(s)))) return [];
        score += title.includes(term) ? 10 : course.includes(term) ? 5 : 1;
      }
      if (
        normalizeSearch(row.title.en) === normalizeSearch(query) ||
        normalizeSearch(row.title.ar) === normalizeSearch(query)
      )
        score += 30;
      return [
        {
          id: row.id,
          title: row.title,
          subtitle: row.subtitle,
          record: row.record,
          matchReason: (terms.some((t) => title.includes(t))
            ? "title"
            : terms.some((t) => course.includes(t))
              ? "course"
              : "keyword") as SearchResult["matchReason"],
          score,
        },
      ];
    })
    .sort((a, b) => b.score - a.score)
    .map(({ score: _, ...row }) => row);
}
