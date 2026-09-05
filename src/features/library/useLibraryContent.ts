import {
  useCourses,
  useResources,
  useEvents,
  useOpportunities,
  useJournal,
} from "../../hooks/useContent";
import { useSavedItems } from "../../app/providers/SavedItemsProvider";
import type { DetailRecord } from "../../types/content";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
/** Shared library selectors keep personal counts and saved cards consistent. */
export function useLibraryContent() {
  const { saved } = useSavedItems();
  const workspace = useWorkspace();
  const cq = useCourses(),
    rq = useResources(),
    eq = useEvents(),
    oq = useOpportunities(),
    jq = useJournal();
  const queries = [cq, rq, eq, oq, jq];
  const resources = (rq.data || []).filter((r) => saved.includes(r.id));
  const events = (eq.data || []).filter((e) => saved.includes(e.id));
  const opportunities = (oq.data || []).filter((o) => saved.includes(o.id));
  const articles = (jq.data || []).filter((article) =>
    saved.includes(article.id),
  );
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
    if (o) {
      items.push({ kind: "opportunity", item: o });
      continue;
    }
    const article = articles.find((x) => x.id === id);
    if (article) items.push({ kind: "article", item: article });
  }
  return {
    courses: cq.data || [],
    resources,
    events,
    opportunities,
    articles,
    items,
    count: items.length,
    isPending: workspace.isPending || queries.some((q) => q.isPending),
    isError: workspace.isError || queries.some((q) => q.isError),
    retry: () => {
      workspace.retry();
      queries.forEach((q) => void q.refetch());
    },
  };
}
