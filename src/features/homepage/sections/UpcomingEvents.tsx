import { HomeSectionState } from "./HomeSectionState";
import { ArrowUpRight, Clock3, MapPin, Ticket } from "lucide-react";
import { useEvents } from "../../../hooks/useContent";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { AppLink } from "../../../components/navigation/AppLink";
import { SaveButton } from "../../../components/cards/SaveButton";
import { eventPath } from "../../../constants/routes";
import { eventAvailability } from "../../../lib/discovery";
import { formatDate } from "../../../lib/dates";
const statusKeys = {
  upcoming: "opensSoon",
  open: "eventOpen",
  waitlist: "eventWaitlist",
  closed: "registrationClosed",
  ended: "registrationClosed",
} as const;
export function UpcomingEvents() {
  const query = useEvents(),
    { t, label, locale } = useLocale();
  if (query.isPending || query.isError || !query.data.length)
    return <HomeSectionState kind="events" query={query} />;
  const featured = query.data.find((e) => e.featured) || query.data[0];
  const upcoming = query.data.filter((e) => e.id !== featured.id).slice(0, 2);
  return (
    <div className="home-events-content">
      <article className="home-featured-event" data-home-reveal="ticket">
        <div className="home-featured-date" aria-hidden="true">
          <b>{formatDate(featured.startDate, locale, { day: "2-digit" })}</b>
          <span>
            {formatDate(featured.startDate, locale, { month: "short" })}
          </span>
          <Ticket size={24} className="home-ticket-mark" aria-hidden="true" />
        </div>
        <div className="home-featured-event-copy">
          <div className="home-ticket-label">
            <Ticket size={15} aria-hidden="true" />
            {t({ en: "On the calendar", ar: "على التقويم" })}
          </div>
          <div className="home-event-meta">
            <span className="eyebrow">{t(featured.type)}</span>
            <span
              className="event-status"
              data-status={eventAvailability(featured)}
            >
              {label(statusKeys[eventAvailability(featured)])}
            </span>
          </div>
          <h4>
            <AppLink href={eventPath(featured.slug)}>
              {t(featured.title)}
            </AppLink>
          </h4>
          <p>{t(featured.description)}</p>
          <div className="home-event-facts">
            <time dateTime={featured.startDate}>
              <Clock3 size={14} aria-hidden="true" />
              {formatDate(featured.startDate, locale, {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </time>
            <span>
              <MapPin size={14} aria-hidden="true" />
              {t(featured.location)}
            </span>
          </div>
          <div className="home-row-actions">
            <AppLink className="text-link" href={eventPath(featured.slug)}>
              {label("eventView")}
              <ArrowUpRight className="directional" size={17} />
            </AppLink>
            <SaveButton id={featured.id} title={t(featured.title)} />
          </div>
        </div>
      </article>
      <div className="home-upcoming-list">
        {upcoming.map((event, index) => (
          <article
            className="home-upcoming-event"
            key={event.id}
            data-home-reveal="rise"
            data-home-step={index}
          >
            <time dateTime={event.startDate}>
              <b>{formatDate(event.startDate, locale, { day: "2-digit" })}</b>
              <small>
                {formatDate(event.startDate, locale, { month: "short" })}
              </small>
            </time>
            <div>
              <h4>
                <AppLink href={eventPath(event.slug)}>{t(event.title)}</AppLink>
              </h4>
              <p>{t(event.location)}</p>
            </div>
            <SaveButton id={event.id} title={t(event.title)} />
          </article>
        ))}
      </div>
    </div>
  );
}
