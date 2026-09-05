import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../app/providers/ServicesProvider";
export function useSiteContent() {
  const s = useServices();
  return useQuery({ queryKey: ["site"], queryFn: s.site.get });
}
export function useCourses() {
  const s = useServices();
  return useQuery({ queryKey: ["courses"], queryFn: s.academics.listCourses });
}
export function useBatches() {
  const s = useServices();
  return useQuery({
    queryKey: ["academics", "batches"],
    queryFn: s.academics.listBatches,
  });
}
export function useClinicalYears() {
  const s = useServices();
  return useQuery({
    queryKey: ["academics", "clinical-years"],
    queryFn: s.academics.listClinicalYears,
  });
}
export function useResources() {
  const s = useServices();
  return useQuery({ queryKey: ["resources"], queryFn: s.resources.list });
}
export function useEvents() {
  const s = useServices();
  return useQuery({ queryKey: ["events"], queryFn: s.events.list });
}
export function useEvent(slug?: string) {
  const s = useServices();
  return useQuery({
    queryKey: ["events", "detail", slug],
    queryFn: () => s.events.get(slug!),
    enabled: !!slug,
  });
}
export function useEventRegistrations() {
  const s = useServices();
  const profile = useStudentProfile();
  const client = useQueryClient();
  const studentId = profile.data?.id;
  const key = ["events", "registrations", studentId];
  const query = useQuery({
    queryKey: key,
    queryFn: () => s.events.listRegistrations(studentId!),
    enabled: !!studentId,
  });
  const register = useMutation({
    mutationFn: (eventId: string) => s.events.register(studentId!, eventId),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const cancel = useMutation({
    mutationFn: (eventId: string) => s.events.cancel(studentId!, eventId),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  return {
    registrations: query.data || [],
    isPending: profile.isPending || query.isPending,
    isError: profile.isError || query.isError,
    register: register.mutateAsync,
    cancel: cancel.mutateAsync,
    isMutating: register.isPending || cancel.isPending,
    retry: () => {
      void profile.refetch();
      void query.refetch();
    },
  };
}
export function useOpportunities() {
  const s = useServices();
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: s.opportunities.list,
  });
}
export function useOpportunity(slug?: string) {
  const s = useServices();
  return useQuery({
    queryKey: ["opportunities", "detail", slug],
    queryFn: () => s.opportunities.get(slug!),
    enabled: !!slug,
  });
}
export function useJournal() {
  const s = useServices();
  return useQuery({ queryKey: ["journal"], queryFn: s.journal.list });
}
export function useArticle(slug?: string) {
  const s = useServices();
  return useQuery({
    queryKey: ["journal", "article", slug],
    queryFn: () => s.journal.get(slug!),
    enabled: !!slug,
  });
}
export function useCommunityActivities() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "activities"],
    queryFn: s.community.listActivities,
  });
}
export function useCommunityMedia() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "media"],
    queryFn: s.community.listMedia,
  });
}
export function useExecutiveBodies() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "executive-bodies"],
    queryFn: s.community.listExecutiveBodies,
  });
}
export function useRecognitions() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "recognitions"],
    queryFn: s.community.listRecognitions,
  });
}
export function useClubValues() {
  const s = useServices();
  return useQuery({
    queryKey: ["community", "values"],
    queryFn: s.community.listValues,
  });
}

export function useStudentProfile() {
  const services = useServices();
  return useQuery({
    queryKey: ["personal", "profile"],
    queryFn: services.personal.getProfile,
  });
}
