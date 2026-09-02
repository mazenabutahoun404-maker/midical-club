import { useQuery } from "@tanstack/react-query";
import { useServices } from "../app/providers/ServicesProvider";
export function useSiteContent() {
  const s = useServices();
  return useQuery({ queryKey: ["site"], queryFn: s.site.get });
}
export function useCourses() {
  const s = useServices();
  return useQuery({ queryKey: ["courses"], queryFn: s.academics.listCourses });
}
export function useResources() {
  const s = useServices();
  return useQuery({ queryKey: ["resources"], queryFn: s.resources.list });
}
export function useEvents() {
  const s = useServices();
  return useQuery({ queryKey: ["events"], queryFn: s.events.list });
}
export function useOpportunities() {
  const s = useServices();
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: s.opportunities.list,
  });
}
export function useJournal() {
  const s = useServices();
  return useQuery({ queryKey: ["journal"], queryFn: s.journal.list });
}

export function useStudentProfile() {
  const services = useServices();
  return useQuery({
    queryKey: ["personal", "profile"],
    queryFn: services.personal.getProfile,
  });
}
