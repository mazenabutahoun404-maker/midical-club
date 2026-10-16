import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, LibraryBig } from "lucide-react";
import { useCourses, useResources } from "../../../hooks/useContent";
import { ResourceCollection } from "../../resources/ResourceCollection";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { CourseCard } from "../../../components/cards/CourseCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useLocale } from "../../../app/providers/LocaleProvider";
export function LatestResources() {
  const { label, t, dir } = useLocale(),
    courses = useCourses(),
    resources = useResources();
  const shelf = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState("courses");
  const [browsing, setBrowsing] = useState({ before: false, after: false });
  useEffect(() => {
    const node = shelf.current;
    if (!node || tab !== "courses") return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.abs(node.scrollLeft),
        max = node.scrollWidth - node.clientWidth;
      const next = { before: progress > 2, after: progress < max - 2 };
      setBrowsing((old) =>
        old.before === next.before && old.after === next.after ? old : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(node);
    node.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, [courses.data, dir, tab]);
  function browse(next: boolean) {
    const node = shelf.current,
      first = node?.firstElementChild as HTMLElement | null;
    if (!node || !first) return;
    const step = first.offsetWidth + 24;
    node.scrollBy({
      left: step * (next ? 1 : -1) * (dir === "rtl" ? -1 : 1),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  if (courses.isPending) return <LoadingState />;
  if (courses.isError)
    return <ErrorState retry={() => void courses.refetch()} />;
  return (
    <div className="home-library-room">
      <Tabs
        value={tab}
        onValueChange={setTab}
        dir={dir}
        className="home-study-tabs"
      >
        <div className="home-library-toolbar">
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
          {tab === "courses" && (
            <div className="home-library-browse">
              <span>
                {courses.data.length} {t({ en: "courses", ar: "مساقاً" })}
              </span>
              <button
                type="button"
                onClick={() => browse(false)}
                disabled={!browsing.before}
                aria-label={t({ en: "Previous books", ar: "الكتب السابقة" })}
              >
                <ArrowLeft className="directional" size={19} />
              </button>
              <button
                type="button"
                onClick={() => browse(true)}
                disabled={!browsing.after}
                aria-label={t({ en: "Next books", ar: "الكتب التالية" })}
              >
                <ArrowRight className="directional" size={19} />
              </button>
            </div>
          )}
        </div>
        <TabsContent
          value="courses"
          className="home-library-course-panel"
          data-empty={!courses.data.length || undefined}
        >
          {courses.data.length ? (
            <div className="home-wood-desk">
              <div className="home-bookcase-heading">
                <span>
                  <LibraryBig size={17} aria-hidden="true" />
                  {t({ en: "The study collection", ar: "مجموعة الدراسة" })}
                </span>
                <span>
                  {t({ en: "Choose a book to begin", ar: "اختر كتاباً لتبدأ" })}
                </span>
              </div>
              <div
                className="home-course-shelf"
                ref={shelf}
                tabIndex={0}
                role="region"
                aria-label={t({
                  en: "Course bookshelf. Swipe or use the arrow buttons to browse.",
                  ar: "رف المساقات. اسحب أو استخدم أزرار الأسهم لتصفح الكتب.",
                })}
              >
                {courses.data.slice(0, 4).map((course, index) => (
                  <div
                    className="home-library-volume"
                    key={course.id}
                    data-home-reveal="book"
                    data-home-step={index % 4}
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
              <span className="home-bookcase-ledge" aria-hidden="true" />
            </div>
          ) : (
            <div className="home-library-empty">
              <EmptyState
                title={t({ en: "No courses yet", ar: "لا توجد مساقات بعد" })}
              />
            </div>
          )}
        </TabsContent>
        <TabsContent value="resources" className="home-resource-paper">
          {resources.isPending ? (
            <LoadingState />
          ) : resources.isError ? (
            <ErrorState retry={() => void resources.refetch()} />
          ) : (
            <ResourceCollection
              courses={courses.data}
              resources={resources.data}
              limit={4}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
