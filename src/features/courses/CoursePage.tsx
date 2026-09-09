import { useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { useCourses, useResources } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { CourseNotebook } from "./CourseNotebook";
import { studyStorageKey } from "./study-state";
import { useLocalCoursePdfs } from "./useLocalCoursePdfs";
import { useAccess } from "../../admin/governance/useGovernance";
import { AppLink } from "../../components/navigation/AppLink";
import "../../styles/course-notebook.css";

export default function CoursePage() {
  const paths = useWorkspacePaths();
  const { slug } = useParams();
  const courses = useCourses(),
    resources = useResources();
  const { t, label } = useLocale();
  const { snapshot } = useAuth();
  const course = courses.data?.find((item) => item.slug === slug);
  const localPdfs = useLocalCoursePdfs(course?.id || "");
  const access = useAccess();
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
  const key = studyStorageKey(
    snapshot.status === "authenticated" ? snapshot.user!.id : "guest",
    course.id,
  );
  const canImport =
    snapshot.status === "authenticated" &&
    !!access.data?.capabilities.some((capability) =>
      ["content.review", "content.publish", "builder.manage"].includes(capability),
    );
  const courseResources = [
    ...resources.data.filter((item) => item.courseId === course.id),
    ...localPdfs.resources,
  ];
  return (
    <div
      className={`container course-atlas course-atlas-${course.accent} course-study-edition`}
    >
      <AppLink className="course-back-link" href={paths.learning}>
        <ArrowLeft size={17} className="directional" />
        {label("allCoursesLink")}
      </AppLink>
      <header className="course-atlas-hero">
        <div className="course-atlas-title">
          <span className="academic-kicker">
            <Sparkles size={14} />
            {label("courseHome")} · {course.code}
          </span>
          <h1 data-page-heading tabIndex={-1}>
            {t(course.title)}
          </h1>
          <p>{t(course.description)}</p>
        </div>
        <dl className="course-atlas-meta">
          <div>
            <dt>{label("year")}</dt>
            <dd>{course.year}</dd>
          </div>
          <div>
            <dt>{label("semester")}</dt>
            <dd>{course.semester}</dd>
          </div>
          <div>
            <dt>{label("credits")}</dt>
            <dd>{course.credits}</dd>
          </div>
        </dl>
        <span className="course-atlas-orbit" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </header>
      <CourseNotebook
        key={key}
        course={course}
        resources={courseResources}
        storageKey={key}
        canImportPdfs={canImport}
        importingPdfs={localPdfs.pending}
        pdfImportError={localPdfs.error}
        onImportPdfs={localPdfs.importFiles}
        onRemoveImportedPdf={localPdfs.remove}
      />
    </div>
  );
}
