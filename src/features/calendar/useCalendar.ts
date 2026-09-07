import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import {
  useStudentProfile,
  useEvents,
  useOpportunities,
  useEventRegistrations,
  useMentors,
  useMentorshipSessions,
  useMentorshipWorkspace,
  useRecruitmentPositions,
  useRecruitmentWorkspace,
} from "../../hooks/useContent";
import { buildCalendar } from "../../lib/calendar";
export function useCalendar() {
  const { calendar } = useServices(),
    workspace = useWorkspace();
  const profile = useStudentProfile(),
    events = useEvents(),
    opportunities = useOpportunities();
  const registrations = useEventRegistrations();
  const mentors = useMentors();
  const mentorshipSessions = useMentorshipSessions();
  const mentorship = useMentorshipWorkspace();
  const recruitmentPositions = useRecruitmentPositions();
  const recruitment = useRecruitmentWorkspace();
  const academic = useQuery({
    queryKey: ["personal", "calendar"],
    queryFn: calendar.list,
  });
  const queries = [
    profile,
    events,
    opportunities,
    academic,
    mentors,
    mentorshipSessions,
    recruitmentPositions,
  ];
  return {
    items: buildCalendar(
      academic.data || [],
      workspace.state.studyEntries,
      events.data || [],
      opportunities.data || [],
      workspace.state.savedIds,
      profile.data?.courseIds || [],
      registrations.registrations.map((item) => item.eventId),
      mentorshipSessions.data || [],
      mentorship.requests,
      mentorship.registrations,
      mentors.data || [],
      recruitment.applications,
      recruitmentPositions.data || [],
    ),
    isPending:
      workspace.isPending ||
      registrations.isPending ||
      mentorship.isPending ||
      recruitment.isPending ||
      queries.some((q) => q.isPending),
    isError:
      workspace.isError ||
      registrations.isError ||
      mentorship.isError ||
      recruitment.isError ||
      queries.some((q) => q.isError),
    retry: () => {
      workspace.retry();
      registrations.retry();
      mentorship.retry();
      recruitment.retry();
      queries.forEach((q) => void q.refetch());
    },
  };
}
