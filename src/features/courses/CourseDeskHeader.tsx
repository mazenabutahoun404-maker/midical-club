import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { ArrowLeft, Columns2, Focus } from "lucide-react";
import type { Course } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useStudyChrome } from "../../app/providers/StudyChromeProvider";
import { academicBackPath } from "../../lib/access-policy";
import { record } from "../../services/api/mapping";
import { useLocation } from "react-router-dom";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { AppLink } from "../../components/navigation/AppLink";
import { AppearanceSettings } from "../../components/navigation/AppearanceSettings";
import { HeaderNotes } from "../../components/navigation/HeaderNotes";
import { CourseShelf } from "./CourseShelf";
import { CourseShelfControls, ShelfPaperControl } from "./ShelfPaperControl";
import { useStudyCopy } from "./study-copy";
import { bookMaterial } from "./book-material";
import "../../styles/reader-layout-v1337.css";

export interface CourseDeskControls {
  split: boolean;
  toggleSplit: () => void;
}
const Context = createContext<{
  register: (controls: CourseDeskControls | null) => void;
} | null>(null);
export const useCourseDesk = () => useContext(Context);

/** Chrome survives course changes; the reader and its account/course state do not. */
export function CourseDesk({
  course,
  children,
}: {
  course: Course;
  children: ReactNode;
}) {
  const { dir } = useLocale();
  const { focus } = useStudyChrome();
  const [controls, setControls] = useState<CourseDeskControls | null>(null);
  const register = useCallback(
    (value: CourseDeskControls | null) => setControls(value),
    [],
  );
  const value = useMemo(() => ({ register }), [register]);
  return (
    <Context.Provider value={value}>
      {!focus && (
        <div
          className="study-notebook course-desk-chrome"
          data-course-tone={course.accent}
          data-leather={bookMaterial(course.id)}
          dir={dir}
        >
          <CourseDeskHeader course={course} controls={controls} />
        </div>
      )}
      {children}
    </Context.Provider>
  );
}

export function CourseDeskHeader({
  course,
  controls,
}: {
  course: Course;
  controls: CourseDeskControls | null;
}) {
  const { t } = useLocale(),
    paths = useWorkspacePaths(),
    location = useLocation(),
    s = useStudyCopy();
  const { setFocus } = useStudyChrome();
  return (
    <div
      className="notebook-toolbar course-header-material"
      data-persistent-desk="true"
      data-leather={bookMaterial(course.id)}
    >
      <div className="course-header-leather" aria-hidden="true" />
      <svg
        className="shelf-header-outline"
        viewBox="0 0 1000 54"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0H1000V2C994 2 994 50 980 50H850C810 50 800 54 750 54H250C200 54 190 50 150 50H20C6 50 6 2 0 2Z" />
      </svg>
      <div className="shelf-heading">
        <ShelfPaperControl
          className="shelf-back-control"
          label={t({ en: "Back to courses", ar: "العودة إلى المساقات" })}
        >
          <AppLink
            className="notebook-back-courses"
            href={academicBackPath(
              course,
              paths.personal,
              record(location.state).from,
            )}
            aria-label={t({ en: "Back to courses", ar: "العودة إلى المساقات" })}
          >
            <ArrowLeft size={17} className="directional" />
          </AppLink>
        </ShelfPaperControl>
        <div className="shelf-heading-caption">
          <bdi>{course.code}</bdi>
          <span>{t(course.title)}</span>
        </div>
      </div>
      <CourseShelf course={course} showCaption={false} />
      <CourseShelfControls>
        <ShelfPaperControl
          label={t({ en: "Reading palettes", ar: "ألوان القراءة" })}
        >
          <AppearanceSettings compact />
        </ShelfPaperControl>
        <ShelfPaperControl label={t({ en: "My notes", ar: "ملاحظاتي" })}>
          <HeaderNotes hint={false} />
        </ShelfPaperControl>
        <ShelfPaperControl label={s("focus")}>
          <button
            type="button"
            className="notebook-button"
            aria-label={s("focus")}
            aria-pressed={false}
            onClick={() => {
              setFocus(true);
              requestAnimationFrame(() =>
                document
                  .querySelector<HTMLButtonElement>(".study-exit-focus")
                  ?.focus({ preventScroll: true }),
              );
            }}
          >
            <Focus size={17} />
            <span>{s("focus")}</span>
          </button>
        </ShelfPaperControl>
        <ShelfPaperControl label={s(controls?.split ? "single" : "split")}>
          <button
            type="button"
            className="notebook-button"
            disabled={!controls}
            aria-pressed={controls?.split ?? false}
            aria-label={s(controls?.split ? "single" : "split")}
            onClick={() => controls?.toggleSplit()}
          >
            <Columns2 size={17} />
            <span>{s(controls?.split ? "single" : "split")}</span>
          </button>
        </ShelfPaperControl>
      </CourseShelfControls>
    </div>
  );
}
