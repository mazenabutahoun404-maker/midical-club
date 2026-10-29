import {useServices} from "../../app/providers/ServicesProvider";
import {EventCatalog} from "../engagement/Events";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  PartyPopper,
  Search,
  TicketCheck,
  UsersRound,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { EventTicketCard } from "../../components/cards/EventTicketCard";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useEvents } from "../../hooks/useContent";
import { eventAvailability } from "../../lib/discovery";

type View = "all" | "upcoming" | "open" | "waitlist";
function PreviewEventsPage() {
  const { t, label } = useLocale();
  const query = useEvents();
  const [view, setView] = useState<View>("upcoming");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const events = query.data || [];
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return events.filter((event) => {
      const status = eventAvailability(event);
      const tabMatch =
        view === "all" ||
        (view === "upcoming" ? status !== "ended" : status === view);
      const textMatch =
        !needle ||
        [
          t(event.title),
          t(event.description),
          t(event.location),
          t(event.type),
        ].some((value) => value.toLocaleLowerCase().includes(needle));
      return (
        tabMatch &&
        textMatch &&
        (!category || event.category === category) &&
        (!format || event.format === format)
      );
    });
  }, [events, view, search, category, format, t]);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const tabs = [
    {
      id: "upcoming",
      label: label("eventUpcoming"),
      icon: PartyPopper,
      count: events.filter((event) => eventAvailability(event) !== "ended")
        .length,
    },
    {
      id: "open",
      label: label("eventOpen"),
      icon: TicketCheck,
      count: events.filter((event) => eventAvailability(event) === "open")
        .length,
    },
    {
      id: "waitlist",
      label: label("eventWaitlist"),
      icon: UsersRound,
      count: events.filter((event) => eventAvailability(event) === "waitlist")
        .length,
    },
    {
      id: "all",
      label: label("eventAll"),
      icon: CalendarDays,
      count: events.length,
    },
  ] as const;
  return (
    <div className="discovery-page event-hub container">
      <section className="discovery-hero event-discovery-hero artwork-scene">
        <div className="discovery-hero-copy">
          <span className="eyebrow">{label("eventsHubEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("eventsHubTitle")}
          </h1>
          <p>{label("eventsHubBody")}</p>
        </div>
        <HeroArtwork section="involved" />
      </section>
      <section
        className="discovery-controls"
        aria-label={label("eventFilters")}
      >
        <AliveTabs
          label={label("eventFilters")}
          items={[...tabs]}
          value={view}
          onChange={setView}
        />
        <div className="discovery-filter-row">
          <label className="discovery-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={label("eventSearch")}
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
                "workshop",
                "talk",
                "volunteering",
                "conference",
                "training",
              ].map((value) => (
                <option value={value} key={value}>
                  {label(value as "workshop")}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{label("format")}</span>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="">{label("allTypes")}</option>
              {["onsite", "hybrid", "online"].map((value) => (
                <option value={value} key={value}>
                  {label(value as "onsite")}
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
        <div className="event-ticket-grid">
          {filtered.map((event) => (
            <EventTicketCard event={event} key={event.id} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

export default function EventsPage(){return useServices().engagementApi?<EventCatalog/>:<PreviewEventsPage/>;}
