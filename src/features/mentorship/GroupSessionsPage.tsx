import { toast } from "sonner";
import { UsersRound } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { MentorshipSessionCard } from "../../components/cards/MentorshipSessionCard";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { MentorshipNavigation } from "../../components/navigation/MentorshipNavigation";
import {
  useMentors,
  useMentorshipSessions,
  useMentorshipWorkspace,
} from "../../hooks/useContent";

export default function GroupSessionsPage() {
  const { label } = useLocale();
  const mentors = useMentors();
  const sessions = useMentorshipSessions();
  const workspace = useMentorshipWorkspace();
  const pending =
    mentors.isPending || sessions.isPending || workspace.isPending;
  const failed = mentors.isError || sessions.isError || workspace.isError;
  if (pending) return <LoadingState />;
  if (failed)
    return (
      <ErrorState
        retry={() => {
          void mentors.refetch();
          void sessions.refetch();
          workspace.retry();
        }}
      />
    );
  async function toggle(sessionId: string, joined: boolean) {
    try {
      if (joined) await workspace.cancelSession(sessionId);
      else await workspace.registerSession(sessionId);
      toast.success(label(joined ? "sessionLeft" : "sessionJoined"));
    } catch {
      toast.error(label("sessionActionFailed"));
    }
  }
  return (
    <div className="mentorship-v6 group-sessions-page container">
      <MentorshipNavigation />
      <header className="v6-page-intro">
        <div>
          <span className="eyebrow">{label("groupSessionsEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("groupSessionsTitle")}
          </h1>
          <p>{label("groupSessionsBody")}</p>
        </div>
        <span className="v6-intro-icon" aria-hidden="true">
          <UsersRound size={38} />
          <i />
        </span>
      </header>
      <div className="mentor-session-list">
        {sessions.data?.map((session) => {
          const joined = workspace.registrations.some(
            (item) => item.sessionId === session.id,
          );
          return (
            <MentorshipSessionCard
              key={session.id}
              session={session}
              mentor={mentors.data?.find(
                (item) => item.id === session.mentorId,
              )}
              joined={joined}
              busy={workspace.isMutating}
              onToggle={() => void toggle(session.id, joined)}
            />
          );
        })}
      </div>
      <p className="v6-boundary-note">{label("mentorPreviewNotice")}</p>
    </div>
  );
}
