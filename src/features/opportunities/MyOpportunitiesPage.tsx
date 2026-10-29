import {useServices} from "../../app/providers/ServicesProvider";
import {OpportunityCatalog} from "../engagement/Opportunities";
import { BookmarkCheck } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { OpportunityExplorerCard } from "../../components/cards/OpportunityExplorerCard";
import { PageIntro } from "../../components/data-display/PageIntro";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useOpportunities } from "../../hooks/useContent";

function PreviewMyOpportunitiesPage() {
  const { label } = useLocale();
  const opportunities = useOpportunities();
  const workspace = useWorkspace();
  if (opportunities.isPending || workspace.isPending) return <LoadingState />;
  if (opportunities.isError || workspace.isError)
    return (
      <ErrorState
        retry={() => {
          void opportunities.refetch();
          workspace.retry();
        }}
      />
    );
  const saved = (opportunities.data || [])
    .filter((item) => workspace.state.savedIds.includes(item.id))
    .sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline));
  return (
    <div className="container personal-discovery-page">
      <PageIntro
        eyebrow={label("myOpportunitiesEyebrow")}
        title={label("myOpportunitiesTitle")}
        description={label("myOpportunitiesBody")}
      />
      {saved.length ? (
        <section>
          <div className="personal-section-heading">
            <div>
              <span className="eyebrow">
                <BookmarkCheck size={14} /> {label("savedOnly")}
              </span>
              <h2>{label("myOpportunities")}</h2>
            </div>
          </div>
          <div className="opportunity-explorer-grid">
            {saved.map((item) => (
              <OpportunityExplorerCard opportunity={item} key={item.id} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title={label("noSavedOpportunities")}
          description={label("noSavedOpportunitiesBody")}
          href="/opportunities"
        />
      )}
    </div>
  );
}

export default function MyOpportunitiesPage(){return useServices().engagementApi?<OpportunityCatalog saved/>:<PreviewMyOpportunitiesPage/>;}
