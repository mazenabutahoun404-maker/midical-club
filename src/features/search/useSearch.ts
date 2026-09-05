import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useStudentProfile } from "../../hooks/useContent";
import type { SearchFilters } from "../../types/content";
export function useSearch(
  query: string,
  scope: "all" | "my",
  filters: SearchFilters,
  enabled = true,
) {
  const { search } = useServices();
  const profile = useStudentProfile();
  const result = useQuery({
    queryKey: [
      "search-v3",
      query,
      scope,
      filters,
      scope === "my" ? profile.data?.courseIds : null,
    ],
    queryFn: () =>
      search.query(query, {
        ...filters,
        courseIds: scope === "my" ? profile.data?.courseIds : undefined,
      }),
    enabled: enabled && (scope === "all" || !!profile.data),
  });
  return {
    ...result,
    isError: result.isError || (scope === "my" && profile.isError),
    retry: () => {
      void profile.refetch();
      void result.refetch();
    },
  };
}
