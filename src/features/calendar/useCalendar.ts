import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import {
  useStudentProfile,
  useEvents,
  useOpportunities,
  useEventRegistrations,
} from "../../hooks/useContent";
import { buildCalendar } from "../../lib/calendar";
export function useCalendar() {
  const { calendar } = useServices(),
    workspace = useWorkspace();
  const profile = useStudentProfile(),
    events = useEvents(),
    opportunities = useOpportunities();
  const registrations = useEventRegistrations();
  const academic = useQuery({
    queryKey: ["personal", "calendar"],
    queryFn: calendar.list,
  });
  const queries = [profile, events, opportunities, academic];
  return {
    items: buildCalendar(
      academic.data || [],
      workspace.state.studyEntries,
      events.data || [],
      opportunities.data || [],
      workspace.state.savedIds,
      profile.data?.courseIds || [],
      registrations.registrations.map((item) => item.eventId),
    ),
    isPending:
      workspace.isPending ||
      registrations.isPending ||
      queries.some((q) => q.isPending),
    isError:
      workspace.isError ||
      registrations.isError ||
      queries.some((q) => q.isError),
    retry: () => {
      workspace.retry();
      registrations.retry();
      queries.forEach((q) => void q.refetch());
    },
  };
}
