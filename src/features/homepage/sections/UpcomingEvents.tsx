import type { CSSProperties } from "react";
import { useEvents } from "../../../hooks/useContent";
import { EventCard } from "../../../components/cards/EventCard";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
export function UpcomingEvents() {
  const query = useEvents();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  if (query.data.length === 0) return <EmptyState />;
  return (
    <div className="home-event-timeline">
      {query.data.slice(0, 3).map((event, index) => (
        <div
          className="home-event-stop"
          key={event.id}
          data-home-reveal={index === 0 ? "left" : "right"}
          style={{ "--home-stagger": `${index * 90}ms` } as CSSProperties}
        >
          <span className="home-event-marker" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}
