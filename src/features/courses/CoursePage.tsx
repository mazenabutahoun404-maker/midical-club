import { useParams } from "react-router-dom";
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

import { StudyEnvironment } from "./StudyEnvironment";
import "../../styles/course-notebook.css";
import "../../styles/notebook-reader.css";

export default function CoursePage() {
  const paths = useWorkspacePaths();
  const { slug } = useParams();
  const courses = useCourses(),
    resources = useResources();
  const { label } = useLocale();
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
      ["content.review", "content.publish", "builder.manage"].includes(
        capability,
      ),
    );
  const courseResources = [
    ...resources.data.filter((item) => item.courseId === course.id),
    ...localPdfs.resources,
  ];
  return (
    <div
      className={`container course-atlas course-atlas-${course.accent} course-study-edition`}
    >
      <StudyEnvironment course={course} storageKey={key}>
        <CourseNotebook
          key={key}
          course={course}
          resources={courseResources}
          storageKey={key}
          canImportPdfs={canImport}
          importingPdfs={localPdfs.pending}
          pdfImportError={localPdfs.error}
          onImportPdfs={async (kind, files, onProgress) => {
            if (!canImport) return [];
            return localPdfs.importFiles(kind, files, onProgress);
          }}
          onRemoveImportedPdf={async (id) => {
            if (canImport) await localPdfs.remove(id);
          }}
        />
      </StudyEnvironment>
    </div>
  );
}
