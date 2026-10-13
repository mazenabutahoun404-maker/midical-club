import { useCourses, useResources } from "../../../hooks/useContent";
import { ResourceCollection } from "../../resources/ResourceCollection";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { CourseCard } from "../../../components/cards/CourseCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useLocale } from "../../../app/providers/LocaleProvider";
export function LatestResources() {
  const { label, t, dir } = useLocale();
  const courses = useCourses();
  const resources = useResources();
  if (courses.isPending || resources.isPending) return <LoadingState />;
  if (courses.isError || resources.isError)
    return (
      <ErrorState
        retry={() => {
          void courses.refetch();
          void resources.refetch();
        }}
      />
    );
  return (
    <div className="home-resource-desk" data-home-reveal="unfold">
      <Tabs defaultValue="courses" dir={dir} className="home-study-tabs">
        <TabsList
          aria-label={t({
            en: "Explore study materials",
            ar: "استكشف المواد الدراسية",
          })}
        >
          <TabsTrigger value="courses">
            {t({ en: "Courses", ar: "المساقات" })}
          </TabsTrigger>
          <TabsTrigger value="resources">{label("resources")}</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <div className="home-course-shelf">
            {courses.data.slice(0, 4).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="resources">
          <ResourceCollection
            courses={courses.data}
            resources={resources.data}
            limit={4}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
