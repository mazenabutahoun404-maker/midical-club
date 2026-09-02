import { Bookmark } from "lucide-react";
import { useLibraryContent } from "./useLibraryContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { ResourceCard } from "../../components/cards/ResourceCard";
import { EventCard } from "../../components/cards/EventCard";
import { OpportunityCard } from "../../components/cards/OpportunityCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
export default function LibraryPage() {
  const { label, dir } = useLocale();
  const library = useLibraryContent();
  if (library.isPending) return <LoadingState />;
  if (library.isError) return <ErrorState retry={library.retry} />;
  const { resources, events, opportunities, courses, count } = library;
  const tabs = ["allSaved", "resources", "events", "opportunities"] as const;
  return (
    <div className="container">
      <PageIntro
        title={label("libraryTitle")}
        description={label("libraryBody")}
        eyebrow={label("libraryEyebrow")}
      />
      <div className="saved-summary">
        <Bookmark />
        <div>
          <h2>
            {count} {label("savedItems")}
          </h2>
          <p>{label("savedHint")}</p>
        </div>
      </div>
      <Tabs defaultValue="allSaved" dir={dir}>
        <TabsList className="filter-tabs" aria-label={label("allSaved")}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {label(tab)}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => {
          const showR = tab === "allSaved" || tab === "resources",
            showE = tab === "allSaved" || tab === "events",
            showO = tab === "allSaved" || tab === "opportunities";
          const visible =
            (showR ? resources.length : 0) +
            (showE ? events.length : 0) +
            (showO ? opportunities.length : 0);
          return (
            <TabsContent key={tab} value={tab}>
              <div className="library-grid">
                {showR &&
                  resources.map((r) => (
                    <ResourceCard
                      key={r.id}
                      resource={r}
                      course={courses.find((c) => c.id === r.courseId)}
                    />
                  ))}
                {showE && events.map((e) => <EventCard key={e.id} event={e} />)}
                {showO &&
                  opportunities.map((o) => (
                    <OpportunityCard key={o.id} opportunity={o} />
                  ))}
                {!visible && (
                  <EmptyState
                    title={label("libraryEmpty")}
                    description={label("libraryEmptyBody")}
                    href="/my/learning"
                  />
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
