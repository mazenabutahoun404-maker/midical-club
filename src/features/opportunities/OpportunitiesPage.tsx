import { useMemo, useState } from "react";
import {
  Bookmark,
  BriefcaseBusiness,
  Clock3,
  Search,
  Sparkles,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { OpportunityExplorerCard } from "../../components/cards/OpportunityExplorerCard";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useOpportunities } from "../../hooks/useContent";
import { daysFromDemo, opportunityIsOpen } from "../../lib/discovery";

type View = "open" | "soon" | "saved" | "all";
export default function OpportunitiesPage() {
  const { t, label } = useLocale();
  const query = useOpportunities();
  const workspace = useWorkspace();
  const [view, setView] = useState<View>("open");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [field, setField] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");
  const opportunities = query.data || [];
  const fields = [...new Set(opportunities.map((item) => t(item.field)))];
  const locations = [...new Set(opportunities.map((item) => t(item.location)))];
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return opportunities.filter((item) => {
      const open = opportunityIsOpen(item);
      const days = daysFromDemo(item.deadline);
      const tabMatch =
        view === "all" ||
        (view === "open" && open) ||
        (view === "soon" && open && days <= 14) ||
        (view === "saved" && workspace.state.savedIds.includes(item.id));
      const textMatch =
        !needle ||
        [
          t(item.title),
          t(item.organization),
          t(item.description),
          t(item.field),
        ].some((value) => value.toLocaleLowerCase().includes(needle));
      return (
        tabMatch &&
        textMatch &&
        (!category || item.category === category) &&
        (!field || t(item.field) === field) &&
        (!location || t(item.location) === location) &&
        (!year || item.yearEligibility.includes(Number(year)))
      );
    });
  }, [
    opportunities,
    view,
    search,
    category,
    field,
    location,
    year,
    t,
    workspace.state.savedIds,
  ]);
  if (query.isPending || workspace.isPending) return <LoadingState />;
  if (query.isError || workspace.isError)
    return (
      <ErrorState
        retry={() => {
          void query.refetch();
          workspace.retry();
        }}
      />
    );
  const tabs = [
    {
      id: "open",
      label: label("open"),
      icon: Sparkles,
      count: opportunities.filter(opportunityIsOpen).length,
    },
    {
      id: "soon",
      label: label("deadlineSoon"),
      icon: Clock3,
      count: opportunities.filter(
        (item) => opportunityIsOpen(item) && daysFromDemo(item.deadline) <= 14,
      ).length,
    },
    {
      id: "saved",
      label: label("savedOnly"),
      icon: Bookmark,
      count: opportunities.filter((item) =>
        workspace.state.savedIds.includes(item.id),
      ).length,
    },
    {
      id: "all",
      label: label("allContent"),
      icon: BriefcaseBusiness,
      count: opportunities.length,
    },
  ] as const;
  return (
    <div className="discovery-page opportunity-hub container">
      <section className="discovery-hero opportunity-discovery-hero">
        <div className="discovery-hero-copy">
          <span className="eyebrow">{label("opportunitiesHubEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("opportunitiesHubTitle")}
          </h1>
          <p>{label("opportunitiesHubBody")}</p>
        </div>
        <div className="door-sculpture" aria-hidden="true">
          <i />
          <i />
          <span>
            <Sparkles size={27} />
          </span>
          <b />
        </div>
      </section>
      <section
        className="discovery-controls"
        aria-label={label("opportunityFilters")}
      >
        <AliveTabs
          label={label("opportunityFilters")}
          items={[...tabs]}
          value={view}
          onChange={setView}
        />
        <div className="discovery-filter-row opportunity-filter-row">
          <label className="discovery-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={label("opportunitySearch")}
            />
          </label>
          <label>
            <span>{label("category")}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{label("allCategories")}</option>
              {[
                "research",
                "training",
                "conference",
                "exchange",
                "volunteering",
              ].map((value) => (
                <option value={value} key={value}>
                  {label(value as "research")}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{label("field")}</span>
            <select value={field} onChange={(e) => setField(e.target.value)}>
              <option value="">{label("allFields")}</option>
              {fields.map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{label("location")}</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">{label("allLocations")}</option>
              {locations.map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{label("eligibilityYear")}</span>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">{label("allYears")}</option>
              {[1, 2, 3, 4, 5, 6].map((value) => (
                <option value={value} key={value}>
                  {label("year")} {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <div className="results-line">
        <strong>{filtered.length}</strong> {label("results")}
      </div>
      {filtered.length ? (
        <div className="opportunity-explorer-grid">
          {filtered.map((item) => (
            <OpportunityExplorerCard opportunity={item} key={item.id} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
