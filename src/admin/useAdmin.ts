import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../app/providers/ServicesProvider";
import type { AdminReviewInput } from "../types/admin";

export function useAdminOverview() {
  const services = useServices();
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: services.admin.getOverview,
  });
}

export function useAdminContent() {
  const services = useServices();
  return useQuery({
    queryKey: ["admin", "content"],
    queryFn: services.admin.listContent,
  });
}

export function useAdminActivity() {
  const services = useServices();
  return useQuery({
    queryKey: ["admin", "activity"],
    queryFn: services.admin.listActivity,
  });
}

export function useAdminVersions(itemId?: string) {
  const services = useServices();
  return useQuery({
    queryKey: ["admin", "versions", itemId || "all"],
    queryFn: () => services.admin.listVersions(itemId),
  });
}

export function useAdminActions() {
  const services = useServices();
  const client = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["admin", "overview"] }),
      client.invalidateQueries({ queryKey: ["admin", "content"] }),
      client.invalidateQueries({ queryKey: ["admin", "activity"] }),
      client.invalidateQueries({ queryKey: ["admin", "versions"] }),
    ]);
  };
  const review = useMutation({
    mutationFn: (input: AdminReviewInput) =>
      services.admin.reviewContent(input),
    onSuccess: refresh,
  });
  const restore = useMutation({
    mutationFn: ({
      itemId,
      versionId,
    }: {
      itemId: string;
      versionId: string;
    }) => services.admin.restoreVersion(itemId, versionId),
    onSuccess: refresh,
  });
  return {
    review: review.mutateAsync,
    restore: restore.mutateAsync,
    isMutating: review.isPending || restore.isPending,
  };
}
