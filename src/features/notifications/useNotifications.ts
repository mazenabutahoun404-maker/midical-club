import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/AuthProvider";
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
  useContributions,
  useStoreWorkspace,
  useRecruitmentPositions,
  useRecruitmentWorkspace,
} from "../../hooks/useContent";
import { DEMO_TODAY } from "../../constants/config";
import { calendarDate, shiftDay } from "../../lib/calendar";
import { text } from "../../lib/localize";
import type { StudentNotification } from "../../types/workspace";
export function useNotifications() {
  const { snapshot } = useAuth();
  const accountId =
    snapshot.status === "authenticated" ? snapshot.user?.id || null : null;
  const { notifications } = useServices(),
    workspace = useWorkspace();
  const profile = useStudentProfile(),
    events = useEvents(),
    opportunities = useOpportunities();
  const registrations = useEventRegistrations();
  const mentors = useMentors();
  const mentorshipSessions = useMentorshipSessions();
  const mentorship = useMentorshipWorkspace();
  const contributions = useContributions();
  const store = useStoreWorkspace();
  const recruitmentPositions = useRecruitmentPositions();
  const recruitment = useRecruitmentWorkspace();
  const query = useQuery({
    queryKey: ["personal", "notifications", accountId],
    queryFn: notifications.list,
    enabled: !!accountId,
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
  for (const request of mentorship.requests) {
    if (request.status !== "accepted") continue;
    const mentor = mentors.data?.find((item) => item.id === request.mentorId);
    items.push({
      id: `mentorship-accepted:${request.id}`,
      kind: "community",
      title:
        mentor?.name ||
        text("Mentorship request accepted", "تم قبول طلب الإرشاد"),
      body:
        request.response ||
        text(
          "Your mentorship request has been accepted.",
          "تم قبول طلب الإرشاد الخاص بك.",
        ),
      href: "/my/mentorship",
      createdAt: request.scheduledAt || request.requestedAt,
    });
  }
  for (const session of mentorshipSessions.data || [])
    if (
      mentorship.registrations.some((item) => item.sessionId === session.id) &&
      approaching(session.startsAt)
    )
      items.push({
        id: `mentorship-session:${session.id}`,
        kind: "reminder",
        title: session.title,
        body: text(
          "A group mentorship session you joined is coming up.",
          "اقترب موعد جلسة إرشاد جماعية انضممت إليها.",
        ),
        href: "/my/mentorship",
        createdAt: DEMO_TODAY + "T08:30:00+03:00",
      });
  for (const contribution of contributions.items)
    if (
      contribution.status === "changes-requested" ||
      contribution.status === "approved" ||
      contribution.status === "published"
    )
      items.push({
        id: `contribution-status:${contribution.id}:${contribution.status}`,
        kind: "community",
        title: text(contribution.title, contribution.title),
        body:
          contribution.status === "changes-requested"
            ? text(
                "A reviewer requested changes to your contribution.",
                "طلب المراجع تعديلات على مساهمتك.",
              )
            : text(
                "Your contribution passed scientific review.",
                "اجتازت مساهمتك المراجعة العلمية.",
              ),
        href: "/my/contributions",
        createdAt: contribution.updatedAt,
      });
  for (const order of store.orders)
    if (order.status === "confirmed" || order.status === "ready")
      items.push({
        id: `store-order:${order.id}:${order.status}`,
        kind: "community",
        title: text(`Order ${order.number}`, `الطلب ${order.number}`),
        body:
          order.status === "ready"
            ? text(
                "A sample order is marked ready for collection.",
                "هناك طلب توضيحي جاهز للاستلام.",
              )
            : text(
                "A sample store reservation is confirmed.",
                "تم تأكيد حجز توضيحي من المتجر.",
              ),
        href: "/my/orders",
        createdAt: order.reservedAt,
      });
  for (const application of recruitment.applications) {
    const position = recruitmentPositions.data?.find(
      (item) => item.id === application.positionId,
    );
    if (
      [
        "screening",
        "interview",
        "accepted",
        "onboarding",
        "completed",
      ].includes(application.status)
    )
      items.push({
        id: `recruitment-status:${application.id}:${application.status}`,
        kind: "community",
        title:
          position?.title ||
          text("Recruitment application", "طلب الانضمام إلى الفريق"),
        body:
          application.reviewerNote ||
          text(
            "Your recruitment application has a new status update.",
            "يوجد تحديث جديد على حالة طلب الانضمام إلى الفريق.",
          ),
        href: "/my/applications",
        createdAt: application.updatedAt,
      });
    if (application.interviewAt && approaching(application.interviewAt))
      items.push({
        id: `recruitment-interview:${application.id}`,
        kind: "reminder",
        title:
          position?.title ||
          text("Recruitment interview", "مقابلة الانضمام إلى الفريق"),
        body: text(
          "Your recruitment interview is coming up. Check the application workspace for details.",
          "اقترب موعد مقابلة الانضمام إلى الفريق. راجع مساحة الطلب لمعرفة التفاصيل.",
        ),
        href: "/my/applications",
        createdAt: DEMO_TODAY + "T09:00:00+03:00",
      });
  }
  items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const queries = [
    profile,
    events,
    opportunities,
    query,
    mentors,
    mentorshipSessions,
    recruitmentPositions,
  ];
  return {
    items,
    unread: items.filter(
      (n) => !workspace.state.readNotificationIds.includes(n.id),
    ).length,
    isPending:
      workspace.isPending ||
      registrations.isPending ||
      mentorship.isPending ||
      contributions.isPending ||
      store.isPending ||
      recruitment.isPending ||
      queries.some((q) => q.isPending),
    isError:
      workspace.isError ||
      registrations.isError ||
      mentorship.isError ||
      contributions.isError ||
      store.isError ||
      recruitment.isError ||
      queries.some((q) => q.isError),
    retry: () => {
      workspace.retry();
      registrations.retry();
      mentorship.retry();
      contributions.retry();
      store.retry();
      recruitment.retry();
      queries.forEach((q) => void q.refetch());
    },
  };
}
