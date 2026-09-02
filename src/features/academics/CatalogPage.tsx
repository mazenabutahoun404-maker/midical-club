import { useState } from "react";
import type { Track } from "../../types/content";
import { useCourses } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { CourseCard } from "../../components/cards/CourseCard";
import { SearchInput } from "../../components/forms/SearchInput";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
export default function CatalogPage({ track }: { track?: Track }) {
  const query = useCourses();
  const { label, dir } = useLocale();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const records = query.data.filter(
    (c) =>
      (!track || c.track === track) &&
      (filter === "all" || c.track === filter) &&
      [c.title.en, c.title.ar, c.batch.en, c.batch.ar, c.code]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="container">
      <PageIntro
        eyebrow={label("learnEyebrow")}
        title={label(track || "learnTitle")}
        description={label("learnBody")}
      />
      <Tabs value={filter} onValueChange={setFilter} dir={dir}>
        <div className="catalog-controls">
          <TabsList className="filter-tabs" aria-label={label("course")}>
            {(track ? ["all"] : ["all", "basic", "clinical"]).map((value) => (
              <TabsTrigger value={value} key={value}>
                {label(value === "all" ? "allCourses" : (value as Track))}
              </TabsTrigger>
            ))}
          </TabsList>
          <SearchInput
            value={search}
            onChange={setSearch}
            label={label("courseSearch")}
          />
        </div>
        {["all", "basic", "clinical"].map((value) => (
          <TabsContent key={value} value={value}>
            <div className="course-grid">
              {records.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
              {!records.length && (
                <EmptyState
                  title={label("emptyCourses")}
                  description={label("emptyCoursesBody")}
                />
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
