import type { DetailRecord, Locale } from "../../types/content";
import { normalizeSearch } from "../../services/search-index";
export interface LibraryFilters {
  query: string;
  type: string;
  courseId: string;
  sort: string;
  collectionIds?: string[];
}
export function filterLibrary(
  items: DetailRecord[],
  filters: LibraryFilters,
  locale: Locale,
): DetailRecord[] {
  const terms = normalizeSearch(filters.query).split(/\s+/).filter(Boolean);
  return items
    .filter(
      (r) =>
        (!filters.type || r.kind === filters.type) &&
        (!filters.courseId ||
          (r.kind === "resource" && r.item.courseId === filters.courseId)) &&
        (!filters.collectionIds || filters.collectionIds.includes(r.item.id)) &&
        terms.every((term) =>
          normalizeSearch(r.item.title.en + " " + r.item.title.ar).includes(
            term,
          ),
        ),
    )
    .sort((a, b) => {
      if (filters.sort === "title")
        return a.item.title[locale].localeCompare(b.item.title[locale], locale);
      if (filters.sort === "updated") {
        const date = (r: DetailRecord) =>
          r.kind === "resource"
            ? r.item.updatedAt
            : r.kind === "event"
              ? r.item.startDate
              : r.kind === "opportunity"
                ? r.item.deadline
                : r.item.publishedAt;
        return date(b).localeCompare(date(a));
      }
      return 0; // input is newest-saved first
    });
}
