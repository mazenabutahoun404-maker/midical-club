import { ArrowUpRight, Clock3, MapPin, UsersRound } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { eventPath } from "../../constants/routes";
import { eventAvailability, eventPlacesLeft } from "../../lib/discovery";
import { formatDate } from "../../lib/dates";
import type { ClubEvent } from "../../types/content";
import { AppLink } from "../navigation/AppLink";
import { SaveButton } from "./SaveButton";

const statusKeys = {
  upcoming: "opensSoon",
  open: "eventOpen",
  waitlist: "eventWaitlist",
  closed: "registrationClosed",
  ended: "registrationClosed",
} as const;

export function EventTicketCard({ event }: { event: ClubEvent }) {
  const { t, label, locale } = useLocale();
  const status = eventAvailability(event);
  const progress = Math.min(
    100,
    (event.registeredCount / event.capacity) * 100,
  );
  return (
    <article className="event-ticket layered-discovery-card" data-status={status}>
      <span className="layered-card-divider" aria-hidden="true" />
      <span className="layered-card-sheet" aria-hidden="true">
        <b>{t(event.type)}</b>
        <small>{t(event.location)} · {event.format}</small>
      </span>
      <div
        className="ticket-date"
        aria-label={formatDate(event.startDate, locale)}
      >
        <span>{formatDate(event.startDate, locale, { month: "short" })}</span>
        <b>{formatDate(event.startDate, locale, { day: "2-digit" })}</b>
        <small>
          {formatDate(event.startDate, locale, { weekday: "short" })}
        </small>
      </div>
      <div className="ticket-body layered-card-face">
        <div className="ticket-topline">
          <span className="eyebrow">{t(event.type)}</span>
          <span className="event-status" data-status={status}>
            {label(statusKeys[status])}
          </span>
        </div>
        <h2>
          <AppLink href={eventPath(event.slug)}>{t(event.title)}</AppLink>
        </h2>
        <p>{t(event.description)}</p>
        <div className="ticket-facts">
          <span>
            <Clock3 size={15} />
            {formatDate(event.startDate, locale, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          <span>
            <MapPin size={15} />
            {t(event.location)}
          </span>
          <span>
            <UsersRound size={15} />
            {status === "open"
              ? `${eventPlacesLeft(event)} ${label("spotsLeft")}`
              : `${event.registeredCount}/${event.capacity}`}
          </span>
        </div>
        <div className="capacity-line" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className="ticket-actions">
          <AppLink className="text-link" href={eventPath(event.slug)}>
            {label("eventView")}
            <ArrowUpRight size={17} className="directional" />
          </AppLink>
          <SaveButton id={event.id} title={t(event.title)} />
        </div>
      </div>
    </article>
  );
}
