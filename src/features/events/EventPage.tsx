import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  UsersRound,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { SaveButton } from "../../components/cards/SaveButton";
import { AppLink } from "../../components/navigation/AppLink";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Notice } from "../../components/feedback/Notice";
import { useEvent } from "../../hooks/useContent";
import { eventAvailability, eventPlacesLeft } from "../../lib/discovery";
import { formatDate } from "../../lib/dates";
import { EventRegistrationAction } from "./EventRegistrationAction";

export default function EventPage() {
  const { slug } = useParams();
  const query = useEvent(slug);
  const { t, label, locale } = useLocale();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const event = query.data;
  if (!event) return <ErrorState retry={() => void query.refetch()} />;
  const status = eventAvailability(event);
  return (
    <div className="container event-detail-page">
      <AppLink href="/events" className="detail-back">
        <ArrowLeft className="directional" size={17} />
        {label("events")}
      </AppLink>
      <section className="event-detail-hero" data-status={status}>
        <div>
          <span className="eyebrow">
            {t(event.type)} · {label(event.format)}
          </span>
          <h1 tabIndex={-1} data-page-heading>
            {t(event.title)}
          </h1>
          <p>{t(event.description)}</p>
          <div className="event-detail-facts">
            <span>
              <CalendarDays size={18} />
              {formatDate(event.startDate, locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <span>
              <Clock3 size={18} />
              {formatDate(event.startDate, locale, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <span>
              <MapPin size={18} />
              {t(event.location)}
            </span>
          </div>
        </div>
        <div className="event-pass">
          <span>{formatDate(event.startDate, locale, { month: "short" })}</span>
          <b>{formatDate(event.startDate, locale, { day: "2-digit" })}</b>
          <small>
            {status === "open"
              ? `${eventPlacesLeft(event)} ${label("spotsLeft")}`
              : label(
                  status === "waitlist"
                    ? "eventWaitlist"
                    : status === "upcoming"
                      ? "opensSoon"
                      : "registrationClosed",
                )}
          </small>
          <SaveButton id={event.id} title={t(event.title)} />
        </div>
      </section>
      <div className="event-detail-layout">
        <section className="event-agenda-panel">
          <span className="eyebrow">{label("eventJourney")}</span>
          <h2>{label("eventJourneyTitle")}</h2>
          <ol>
            {event.agenda.map((item, index) => (
              <li key={index}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(item)}</strong>
              </li>
            ))}
          </ol>
        </section>
        <aside className="event-registration-panel">
          <div>
            <UsersRound size={21} />
            <span>
              <small>{label("audience")}</small>
              <strong>{t(event.audience)}</strong>
            </span>
          </div>
          <div>
            <CalendarDays size={21} />
            <span>
              <small>{label("capacity")}</small>
              <strong>{event.capacity}</strong>
            </span>
          </div>
          <EventRegistrationAction event={event} />
          <Notice>{label("eventRegistrationNote")}</Notice>
        </aside>
      </div>
    </div>
  );
}
