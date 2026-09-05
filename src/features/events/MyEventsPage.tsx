import { CalendarCheck, PartyPopper } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { EventTicketCard } from "../../components/cards/EventTicketCard";
import { PageIntro } from "../../components/data-display/PageIntro";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AppLink } from "../../components/navigation/AppLink";
import { useEventRegistrations, useEvents } from "../../hooks/useContent";

export default function MyEventsPage() {
  const { label } = useLocale();
  const events = useEvents();
  const registrations = useEventRegistrations();
  const workspace = useWorkspace();
  if (events.isPending || registrations.isPending || workspace.isPending)
    return <LoadingState />;
  if (events.isError || registrations.isError || workspace.isError)
    return (
      <ErrorState
        retry={() => {
          void events.refetch();
          registrations.retry();
          workspace.retry();
        }}
      />
    );
  const planned = (events.data || []).filter((event) =>
    registrations.registrations.some((item) => item.eventId === event.id),
  );
  const saved = (events.data || []).filter(
    (event) =>
      workspace.state.savedIds.includes(event.id) &&
      !planned.some((item) => item.id === event.id),
  );
  return (
    <div className="container personal-discovery-page">
      <PageIntro
        eyebrow={label("myEventsEyebrow")}
        title={label("myEventsTitle")}
        description={label("myEventsBody")}
      />
      {planned.length ? (
        <section>
          <div className="personal-section-heading">
            <div>
              <span className="eyebrow">
                <CalendarCheck size={14} /> {label("registrationStatus")}
              </span>
              <h2>{label("myEvents")}</h2>
            </div>
          </div>
          <div className="event-ticket-grid">
            {planned.map((event) => {
              const status = registrations.registrations.find(
                (item) => item.eventId === event.id,
              )!.status;
              return (
                <div
                  className="personal-event-plan"
                  data-status={status}
                  key={event.id}
                >
                  <span className="personal-plan-status">{label(status)}</span>
                  <EventTicketCard event={event} />
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <EmptyState
          title={label("noEventPlans")}
          description={label("noEventPlansBody")}
          href="/events"
        />
      )}
      {saved.length > 0 && (
        <section className="saved-discovery-section">
          <div className="personal-section-heading">
            <div>
              <span className="eyebrow">
                <PartyPopper size={14} /> {label("discoverSavedEvents")}
              </span>
              <h2>{label("savedShort")}</h2>
            </div>
          </div>
          <div className="event-ticket-grid">
            {saved.map((event) => (
              <EventTicketCard event={event} key={event.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
