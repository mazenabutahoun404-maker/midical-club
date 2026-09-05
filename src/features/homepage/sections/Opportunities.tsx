import { useOpportunities } from "../../../hooks/useContent";
import { OpportunityCard } from "../../../components/cards/OpportunityCard";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
export function Opportunities() {
  const query = useOpportunities();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <div className="opportunity-list">
      {query.data.slice(0, 2).map((item) => (
        <OpportunityCard key={item.id} opportunity={item} />
      ))}
      {query.data.length === 0 && <EmptyState />}
    </div>
  );
}
