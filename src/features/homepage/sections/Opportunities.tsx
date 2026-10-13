import type { CSSProperties } from "react";
import { useOpportunities } from "../../../hooks/useContent";
import { OpportunityCard } from "../../../components/cards/OpportunityCard";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
export function Opportunities() {
  const query = useOpportunities();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  if (query.data.length === 0) return <EmptyState />;
  return (
    <div className="home-opportunity-board">
      {query.data.slice(0, 2).map((item, index) => (
        <div
          className="home-opportunity-note"
          key={item.id}
          data-home-reveal="unfold"
          style={{ "--home-stagger": `${index * 130}ms` } as CSSProperties}
        >
          <span className="home-note-pin" aria-hidden="true" />
          <OpportunityCard opportunity={item} />
        </div>
      ))}
    </div>
  );
}
