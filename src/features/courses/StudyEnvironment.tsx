import type { ReactNode } from "react";
import type { Course } from "../../types/content";
import { StudyToolsProvider } from "./StudyTools";
import { CourseDesk } from "./CourseDeskHeader";
import { useLocale } from "../../app/providers/LocaleProvider";
import "../../styles/study-environment.css";
import "../../styles/study-desk-v1313.css";
import "../../styles/study-calm-v1314.css";
import "../../styles/study-polish-v1315.css";
import "../../styles/study-shelf-v1316.css";
import "../../styles/study-comfort-v1317.css";
import "../../styles/course-shelf-v1321.css";
import "../../styles/study-file-controls.css";
import "../../styles/study-viewport.css";
import "../../styles/study-refinement.css";
import "../../styles/study-magic.css";
import "../../styles/book-materials.css";
import "../../styles/notebook-edges.css";
import "../../styles/notebook-horizontal-v1328.css";
export function StudyEnvironment({
  course,
  storageKey,
  children,
}: {
  course: Course;
  storageKey: string;
  children: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <section
      className="study-environment"
      data-study-tone={course.accent}
      aria-label={t(course.title)}
    >
      <CourseDesk course={course}>
        <StudyToolsProvider key={storageKey} storageKey={storageKey}>
          {children}
        </StudyToolsProvider>
      </CourseDesk>
    </section>
  );
}
