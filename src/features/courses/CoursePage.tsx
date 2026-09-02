import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { useParams } from "react-router-dom";
import { useCourses, useResources } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { ResourceCollection } from "../resources/ResourceCollection";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { Notice } from "../../components/feedback/Notice";
export default function CoursePage() {
  const paths = useWorkspacePaths();
  const { slug } = useParams();
  const courses = useCourses();
  const resources = useResources();
  const { t, label } = useLocale();
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
  const course = courses.data.find((c) => c.slug === slug);
  if (!course)
    return (
      <div className="container section">
        <EmptyState
          title={label("notFound")}
          description={label("notFoundBody")}
          href={paths.learning}
        />
      </div>
    );
  return (
    <div className="container">
      <PageIntro
        title={t(course.title)}
        description={t(course.description)}
        eyebrow={`${label(course.track)} · ${course.code}`}
      >
        <span className="tag">
          {label("year")} {course.year} · {t(course.batch)}
        </span>
      </PageIntro>
      <div className="course-resource-wrap">
        <Notice>{label("courseSample")}</Notice>
        <ResourceCollection
          courses={courses.data}
          resources={resources.data.filter((r) => r.courseId === course.id)}
        />
      </div>
    </div>
  );
}
