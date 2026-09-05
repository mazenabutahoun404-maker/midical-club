import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import {
  useStudentProfile,
  useEvents,
  useOpportunities,
  useEventRegistrations,
} from "../../hooks/useContent";
import { DEMO_TODAY } from "../../constants/config";
import { calendarDate, shiftDay } from "../../lib/calendar";
import { text } from "../../lib/localize";
import type { StudentNotification } from "../../types/workspace";
export function useNotifications() {
  const { notifications } = useServices(),
    workspace = useWorkspace();
  const profile = useStudentProfile(),
    events = useEvents(),
    opportunities = useOpportunities();
  const registrations = useEventRegistrations();
  const query = useQuery({
    queryKey: ["personal", "notifications"],
    queryFn: notifications.list,
  });
  const end = shiftDay(DEMO_TODAY, 14);
  const approaching = (value: string) => {
    const date = calendarDate(value);
    return date >= DEMO_TODAY && date <= end;
  };
  const items: StudentNotification[] = (query.data || []).filter(
    (n) => !n.courseId || profile.data?.courseIds.includes(n.courseId),
  );
  for (const event of events.data || [])
    if (
      (workspace.state.savedIds.includes(event.id) ||
        registrations.registrations.some(
          (item) => item.eventId === event.id,
        )) &&
      approaching(event.startDate)
    )
      items.push({
        id: `reminder-event:${event.id}`,
        kind: "reminder",
        title: event.title,
        body: registrations.registrations.some(
          (item) => item.eventId === event.id,
        )
          ? text(
              "An event you joined is coming up.",
              "اقترب موعد فعالية سجّلت فيها.",
            )
          : text(
              "A saved event is coming up. Saving is not registration.",
              "اقترب موعد فعالية محفوظة. الحفظ لا يعني التسجيل.",
            ),
        href: registrations.registrations.some(
          (item) => item.eventId === event.id,
        )
          ? "/my/events"
          : "/my/calendar",
        createdAt: DEMO_TODAY + "T08:00:00+03:00",
      });
  for (const opportunity of opportunities.data || [])
    if (
      workspace.state.savedIds.includes(opportunity.id) &&
      approaching(opportunity.deadline)
    )
      items.push({
        id: `reminder-deadline:${opportunity.id}`,
        kind: "reminder",
        title: opportunity.title,
        body: text(
          "The deadline for a saved opportunity is approaching.",
          "اقترب الموعد النهائي لفرصة محفوظة.",
        ),
        href: "/my/calendar",
        createdAt: DEMO_TODAY + "T08:00:00+03:00",
      });
  items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const queries = [profile, events, opportunities, query];
  return {
    items,
    unread: items.filter(
      (n) => !workspace.state.readNotificationIds.includes(n.id),
    ).length,
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
