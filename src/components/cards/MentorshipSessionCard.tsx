import { CalendarDays, Clock3, MapPin, UsersRound } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { formatDate } from "../../lib/dates";
import type { Mentor, MentorshipSession } from "../../types/content";
import { Button } from "../ui/button";

export function MentorshipSessionCard({
  session,
  mentor,
  joined,
  busy,
  onToggle,
}: {
  session: MentorshipSession;
  mentor?: Mentor;
  joined: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  const { t, label, locale } = useLocale();
  const full = session.registeredCount >= session.capacity && !joined;
  return (
    <article className="mentor-session-card" data-joined={joined || undefined}>
      <div className="session-date-block">
        <CalendarDays size={20} />
        <strong>
          {formatDate(session.startsAt, locale, {
            day: "2-digit",
            month: "short",
          })}
        </strong>
        <span>
          {formatDate(session.startsAt, locale, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="session-card-copy">
        <span className="eyebrow">{t(session.topic)}</span>
        <h2>{t(session.title)}</h2>
        <p>{t(session.summary)}</p>
        <div className="session-facts">
          <span>
            <Clock3 size={15} /> {label(session.format)}
          </span>
          <span>
            <MapPin size={15} /> {t(session.location)}
          </span>
          <span>
            <UsersRound size={15} /> {session.registeredCount}/
            {session.capacity} {label("registeredCount")}
          </span>
        </div>
        <small>
          {label("facilitatedBy")}: {mentor ? t(mentor.name) : "—"} ·{" "}
          {label("forStudents")}: {t(session.audience)}
        </small>
      </div>
      <Button
        variant={joined ? "outline" : "default"}
        className={joined ? "button" : "button button-primary"}
        disabled={busy || full}
        onClick={onToggle}
      >
        {label(
          joined ? "leaveSession" : full ? "sessionFull" : "joinGroupSession",
        )}
      </Button>
    </article>
  );
}
