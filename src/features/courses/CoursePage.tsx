import { BackLink } from "../../components/navigation/BackLink";
import { academicBackPath } from "../../lib/access-policy";
import { record } from "../../services/api/mapping";
import type { ReactNode } from "react";
import { PublishedContent } from "../resources/PublishedContent";
import {
  PrivateCourseFiles,
  usePrivateCourseFiles,
} from "./PrivateCourseFiles";
import { useServices } from "../../app/providers/ServicesProvider";
import { useRef } from "react";
import { offerUndo } from "../../components/feedback/undo-action";
import { useParams, useLocation } from "react-router-dom";
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
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../services/api/client";
import "../../styles/course-notebook.css";
import "../../styles/notebook-reader.css";

export default function CoursePage() {
  const paths = useWorkspacePaths(),
    location = useLocation();
  const services = useServices();
  const { slug } = useParams();
  const courses = useCourses(),
    resources = useResources();
  const { label, t, locale } = useLocale();
  const { snapshot } = useAuth();
  const course = courses.data?.find((item) => item.slug === slug);
  const published = useQuery({
    queryKey: [
      "course-content",
      snapshot.user?.id,
      course?.id,
      course?.version,
    ],
    enabled: !!course && !!services.courseContent,
    queryFn: async () => {
      try {
        return await services.courseContent!(course!);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404)
          return {
            course: course!,
            resources:
              resources.data?.filter((item) => item.courseId === course!.id) ||
              [],
          };
        throw error;
      }
    },
  });
  const live = services.contentSnapshot?.kind === "live";
  const localPdfs = useLocalCoursePdfs(course?.id || "", !live);
  const access = useAccess();
  const canPrivateFiles =
    live &&
    !!access.data?.permissions?.includes("study.use") &&
    !!access.data?.permissions?.includes("academics.read");
  const privateFiles = usePrivateCourseFiles(course?.id || "", canPrivateFiles);
  const authorization = useRef({ snapshot, access: access.data });
  authorization.current = { snapshot, access: access.data };
  const backHref = academicBackPath(
    course,
    paths.personal,
    record(location.state).from,
  );
  const frame = (child: ReactNode) => (
    <div className="course-page-route">
      <div className="container">
        <BackLink
          href={backHref}
          label={t({ en: "Back to courses", ar: "العودة إلى المساقات" })}
        />
      </div>
      {child}
    </div>
  );
  if (
    courses.isPending ||
    resources.isPending ||
    (services.courseContent && course && published.isPending)
  )
    return frame(<LoadingState />);
  if (courses.isError || resources.isError || published.isError)
    return frame(
      <ErrorState
        error={courses.error || resources.error || published.error}
        retry={() => {
          void courses.refetch();
          void resources.refetch();
          if (services.courseContent) void published.refetch();
        }}
      />,
    );
  if (!course)
    return frame(
      <div className="container section">
        <EmptyState
          title={label("notFound")}
          description={label("notFoundBody")}
          href={paths.learning}
        />
      </div>,
    );
  const key = studyStorageKey(
    snapshot.status === "authenticated" ? snapshot.user!.id : "guest",
    course.id,
  );
  const canImport =
    services.contentSnapshot?.kind !== "live" &&
    snapshot.status === "authenticated" &&
    !!access.data?.capabilities.some((capability) =>
      ["content.review", "content.publish", "builder.manage"].includes(
        capability,
      ),
    );
  const courseResources = [
    ...(published.data?.resources ||
      resources.data.filter((item) => item.courseId === course.id)),
    ...(!live ? localPdfs.resources : []),
    ...privateFiles.resources,
  ];
  return frame(
    <div
      className={`container course-atlas course-atlas-${course.accent} course-study-edition`}
    >
      {published.data?.course.publishedDocuments && (
        <details className="content-editor-item" open>
          <summary>
            {t({ en: "Published course content", ar: "محتوى المساق المنشور" })}
          </summary>
          <PublishedContent
            content={published.data.course.publishedDocuments[locale]}
            hideHeading
          />
        </details>
      )}
      <StudyEnvironment
        course={published.data?.course || course}
        storageKey={key}
      >
        <CourseNotebook
          key={key}
          course={published.data?.course || course}
          resources={courseResources}
          fileSourcesPending={localPdfs.loading}
          storageKey={key}
          canImportPdfs={canImport}
          importingPdfs={localPdfs.pending}
          pdfImportError={localPdfs.error}
          onImportPdfs={async (kind, files, onProgress) => {
            if (!canImport) return [];
            return localPdfs.importFiles(kind, files, onProgress);
          }}
          onRemoveImportedPdf={async (id) => {
            if (!canImport) throw new Error("COURSE_EDIT_PERMISSION_REQUIRED");
            const owner = snapshot.user!.id;
            const fresh = await services.auth.getSnapshot();
            const freshAccess = await services.governance.getAccess();
            if (
              fresh.status !== "authenticated" ||
              fresh.user?.id !== owner ||
              !freshAccess.capabilities.some((cap) =>
                [
                  "content.review",
                  "content.publish",
                  "builder.manage",
                ].includes(cap),
              )
            )
              throw new Error("COURSE_EDIT_PERMISSION_REQUIRED");
            const restore = await localPdfs.remove(id);
            offerUndo({
              message: t({ en: "PDF removed", ar: "حُذف الملف" }),
              label: t({ en: "Undo", ar: "تراجع" }),
              restored: t({ en: "PDF restored", ar: "استُعيد الملف" }),
              failed: t({
                en: "Could not restore this PDF. Try again while Undo is available.",
                ar: "تعذّرت استعادة الملف. حاول مجدداً أثناء إتاحة التراجع.",
              }),
              canRestore: () =>
                authorization.current.snapshot.user?.id === owner &&
                authorization.current.snapshot.status === "authenticated" &&
                !!authorization.current.access?.capabilities.some((cap) =>
                  [
                    "content.review",
                    "content.publish",
                    "builder.manage",
                  ].includes(cap),
                ),
              undo: async () => {
                const fresh = await services.auth.getSnapshot();
                const access = await services.governance.getAccess();
                if (
                  fresh.status !== "authenticated" ||
                  fresh.user?.id !== owner ||
                  !access.capabilities.some((cap) =>
                    [
                      "content.review",
                      "content.publish",
                      "builder.manage",
                    ].includes(cap),
                  )
                )
                  throw new Error("COURSE_EDIT_PERMISSION_REQUIRED");
                await restore();
              },
            });
          }}
        />
      </StudyEnvironment>
      {canPrivateFiles &&
        snapshot.status === "authenticated" &&
        services.assets && (
          <PrivateCourseFiles
            key={snapshot.user?.id + course.id}
            offeringId={course.id}
            query={privateFiles.query}
          />
        )}
    </div>,
  );
}
