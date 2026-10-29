import {MyMentorship as ConnectedPage} from "../membership/MentorWorkspace";
import {MembershipScope} from "../membership/shared";
import {useServices} from "../../app/providers/ServicesProvider";
import {
  CalendarCheck,
  Clock3,
  HeartHandshake,
  MessageSquareText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { MentorshipSessionCard } from "../../components/cards/MentorshipSessionCard";
import { PageIntro } from "../../components/data-display/PageIntro";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Button } from "../../components/ui/button";
import {
  useMentors,
  useMentorshipSessions,
  useMentorshipWorkspace,
} from "../../hooks/useContent";
import { formatDate } from "../../lib/dates";

function PreviewMyMentorshipPage() {
  const { t, label, locale } = useLocale();
  const mentors = useMentors();
  const sessions = useMentorshipSessions();
  const workspace = useMentorshipWorkspace();
  if (mentors.isPending || sessions.isPending || workspace.isPending)
    return <LoadingState />;
  if (mentors.isError || sessions.isError || workspace.isError)
    return (
      <ErrorState
        retry={() => {
          void mentors.refetch();
          void sessions.refetch();
          workspace.retry();
        }}
      />
    );
  const plannedSessions = (sessions.data || []).filter((session) =>
    workspace.registrations.some((item) => item.sessionId === session.id),
  );
  async function cancelRequest(id: string) {
    try {
      await workspace.cancelRequest(id);
      toast.success(label("cancelled"));
    } catch {
      toast.error(label("requestFailed"));
    }
  }
  async function leaveSession(id: string) {
    try {
      await workspace.cancelSession(id);
      toast.success(label("sessionLeft"));
    } catch {
      toast.error(label("sessionActionFailed"));
    }
  }
  const statusLabel = (
    status: "pending" | "accepted" | "declined" | "cancelled",
  ) => label(status);
  return (
    <div className="container personal-mentorship mentorship-v6">
      <PageIntro
        eyebrow={label("myMentorshipEyebrow")}
        title={label("myMentorshipTitle")}
        description={label("myMentorshipBody")}
      />
      <section>
        <div className="personal-section-heading">
          <div>
            <span className="eyebrow">
              <HeartHandshake size={14} /> {label("mentorshipRequests")}
            </span>
            <h2>{label("mentors")}</h2>
          </div>
        </div>
        {workspace.requests.length ? (
          <div className="mentorship-request-list">
            {workspace.requests.map((request) => {
              const mentor = mentors.data?.find(
                (item) => item.id === request.mentorId,
              );
              return (
                <article key={request.id} data-status={request.status}>
                  <span className="request-status-mark">
                    <i />
                    {statusLabel(request.status)}
                  </span>
                  <div className="request-main">
                    <div className="request-person">
                      <span>{mentor ? t(mentor.initials) : "—"}</span>
                      <div>
                        <h3>{mentor ? t(mentor.name) : "—"}</h3>
                        <p>{mentor ? t(mentor.specialty) : ""}</p>
                      </div>
                    </div>
                    <dl>
                      <div>
                        <dt>{label("mentorshipArea")}</dt>
                        <dd>{request.area}</dd>
                      </div>
                      <div>
                        <dt>{label("requestedOn")}</dt>
                        <dd>{formatDate(request.requestedAt, locale)}</dd>
                      </div>
                      {request.scheduledAt && (
                        <div>
                          <dt>{label("scheduledFor")}</dt>
                          <dd>
                            {formatDate(request.scheduledAt, locale, {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <blockquote>
                      <MessageSquareText size={16} />
                      {request.response ? t(request.response) : request.note}
                    </blockquote>
                  </div>
                  {request.status === "pending" && (
                    <Button
                      variant="outline"
                      disabled={workspace.isMutating}
                      onClick={() => void cancelRequest(request.id)}
                    >
                      <X size={16} />
                      {label("cancelRequest")}
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={label("noMentorshipRequests")}
            description={label("noMentorshipRequestsBody")}
            href="/mentorship"
          />
        )}
      </section>
      <section className="personal-group-plans">
        <div className="personal-section-heading">
          <div>
            <span className="eyebrow">
              <CalendarCheck size={14} /> {label("groupSessions")}
            </span>
            <h2>{label("scheduledFor")}</h2>
          </div>
        </div>
        {plannedSessions.length ? (
          <div className="mentor-session-list">
            {plannedSessions.map((session) => (
              <MentorshipSessionCard
                key={session.id}
                session={session}
                mentor={mentors.data?.find(
                  (item) => item.id === session.mentorId,
                )}
                joined
                busy={workspace.isMutating}
                onToggle={() => void leaveSession(session.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={label("noGroupPlans")}
            description={label("noGroupPlansBody")}
            href="/mentorship/sessions"
          />
        )}
      </section>
      <p className="v6-boundary-note">
        <Clock3 size={16} /> {label("mentorshipBoundaries")}
      </p>
    </div>
  );
}

export default function MyMentorshipPage(){const services=useServices();return services.membershipApi?<MembershipScope><ConnectedPage /></MembershipScope>:<PreviewMyMentorshipPage/>}
