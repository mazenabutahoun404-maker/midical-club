import { useMemo, useState } from "react";
import {
  Activity,
  HeartPulse,
  Search,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { CommunityActivityCard } from "../../components/cards/CommunityActivityCard";
import { CommunityNavigation } from "../../components/navigation/CommunityNavigation";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useCommunityActivities } from "../../hooks/useContent";

type View =
  "all" | "health-campaign" | "peer-learning" | "volunteering" | "student-life";

export default function ActivitiesPage() {
  const { t, label } = useLocale();
  const query = useCommunityActivities();
  const [view, setView] = useState<View>("all");
  const [search, setSearch] = useState("");
  const activities = query.data || [];
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return activities.filter(
      (item) =>
        (view === "all" || item.kind === view) &&
        (!needle ||
          [t(item.title), t(item.summary), t(item.location)].some((value) =>
            value.toLocaleLowerCase().includes(needle),
          )),
    );
  }, [activities, search, t, view]);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const tabs = [
    {
      id: "all",
      label: label("allActivities"),
      icon: Activity,
      count: activities.length,
    },
    {
      id: "health-campaign",
      label: label("healthCampaign"),
      icon: HeartPulse,
      count: activities.filter((item) => item.kind === "health-campaign")
        .length,
    },
    {
      id: "peer-learning",
      label: label("peerLearning"),
      icon: Stethoscope,
      count: activities.filter((item) => item.kind === "peer-learning").length,
    },
    {
      id: "volunteering",
      label: label("volunteering"),
      icon: UsersRound,
      count: activities.filter((item) => item.kind === "volunteering").length,
    },
  ] as const;
  return (
    <div className="community-v5 community-index-page container">
      <CommunityNavigation />
      <header className="community-page-intro">
        <span className="eyebrow">{label("activitiesEyebrow")}</span>
        <h1 tabIndex={-1} data-page-heading>
          {label("activitiesTitle")}
        </h1>
        <p>{label("activitiesBody")}</p>
      </header>
      <section
        className="community-filter-panel"
        aria-label={label("activityFilters")}
      >
        <AliveTabs
          label={label("activityFilters")}
          items={[...tabs]}
          value={view}
          onChange={setView}
        />
        <label className="community-search">
          <Search size={18} />
          <span className="sr-only">{label("activityFilters")}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={label("searchSomething")}
          />
        </label>
      </section>
      <p className="community-results" role="status">
        <strong>{filtered.length}</strong> {label("results")}
      </p>
      {filtered.length ? (
        <div className="community-activity-grid">
          {filtered.map((item) => (
            <CommunityActivityCard key={item.id} activity={item} />
          ))}
        </div>
      ) : (
        <EmptyState title={label("noActivityResults")} />
      )}
    </div>
  );
}
