import {
  useCourses,
  useResources,
  useEvents,
  useOpportunities,
} from "../../hooks/useContent";
import { useSavedItems } from "../../app/providers/SavedItemsProvider";
import type { DetailRecord } from "../../types/content";
/** Shared library selectors keep personal counts and saved cards consistent. */
export function useLibraryContent() {
  const { saved } = useSavedItems();
  const cq = useCourses(),
    rq = useResources(),
    eq = useEvents(),
    oq = useOpportunities();
  const queries = [cq, rq, eq, oq];
  const resources = (rq.data || []).filter((r) => saved.includes(r.id));
  const events = (eq.data || []).filter((e) => saved.includes(e.id));
  const opportunities = (oq.data || []).filter((o) => saved.includes(o.id));
  const items: DetailRecord[] = [];
  for (const id of [...new Set(saved)].reverse()) {
    const r = resources.find((x) => x.id === id);
    if (r) {
      items.push({ kind: "resource", item: r });
      continue;
    }
    const e = events.find((x) => x.id === id);
    if (e) {
      items.push({ kind: "event", item: e });
      continue;
    }
    const o = opportunities.find((x) => x.id === id);
    if (o) items.push({ kind: "opportunity", item: o });
  }
  return {
    courses: cq.data || [],
    resources,
    events,
    opportunities,
    items,
    count: items.length,
    isPending: queries.some((q) => q.isPending),
    isError: queries.some((q) => q.isError),
    retry: () => queries.forEach((q) => void q.refetch()),
  };
}
