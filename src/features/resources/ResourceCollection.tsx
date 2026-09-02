import type { Course, Resource } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { ResourceCard } from "../../components/cards/ResourceCard";
import { EmptyState } from "../../components/feedback/EmptyState";
const filters = ["all", "slides", "notes", "summary", "questions"] as const;
export function ResourceCollection({
  resources,
  courses,
  limit,
}: {
  resources: Resource[];
  courses: Course[];
  limit?: number;
}) {
  const { label, dir } = useLocale();
  return (
    <Tabs defaultValue="all" dir={dir}>
      <TabsList className="filter-tabs" aria-label={label("resources")}>
        {filters.map((kind) => (
          <TabsTrigger key={kind} value={kind}>
            {label(kind === "all" ? "allResources" : kind)}
          </TabsTrigger>
        ))}
      </TabsList>
      {filters.map((kind) => {
        const records = resources
          .filter((r) => kind === "all" || r.kind === kind)
          .slice(0, limit);
        return (
          <TabsContent key={kind} value={kind}>
            <div className="resource-grid">
              {records.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  course={courses.find((c) => c.id === resource.courseId)}
                />
              ))}
              {records.length === 0 && <EmptyState />}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
