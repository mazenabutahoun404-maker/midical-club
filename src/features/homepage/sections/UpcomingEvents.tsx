import { useEvents } from "../../../hooks/useContent";
import { EventCard } from "../../../components/cards/EventCard";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
export function UpcomingEvents() {
  const query = useEvents();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <div className="events-grid">
      {query.data.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
      {query.data.length === 0 && <EmptyState />}
    </div>
  );
}
