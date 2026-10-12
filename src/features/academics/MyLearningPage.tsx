import { lazy, Suspense, useState } from "react";
import { useCourses, useStudentProfile } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { SearchInput } from "../../components/forms/SearchInput";
import { CourseCard } from "../../components/cards/CourseCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useSearchParams } from "react-router-dom";
import { BookOpen, ChartNoAxesCombined } from "lucide-react";
const AcademicProgressPage = lazy(
  () => import("../insights/AcademicProgressPage"),
);
export default function MyLearningPage() {
  const courses = useCourses(),
    profile = useStudentProfile();
  const { label } = useLocale();
  const [search, setSearch] = useState("");
  const [params, setParams] = useSearchParams();
  const insightView = params.get("view") === "insights";
  if (courses.isPending || profile.isPending) return <LoadingState />;
  if (courses.isError || profile.isError)
    return (
      <ErrorState
        retry={() => {
          void courses.refetch();
          void profile.refetch();
        }}
      />
    );
  const selected = courses.data.filter(
    (c) =>
      profile.data.courseIds.includes(c.id) &&
      [c.title.en, c.title.ar, c.code]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="container">
      <PageIntro
        title={label("myLearning")}
        eyebrow={label("yourOwnPace")}
        description={label("myLearningBody")}
      />
      <nav className="my-learning-views" aria-label={label("myLearning")}>
        <button
          aria-pressed={!insightView}
          onClick={() =>
            setParams(
              (p) => {
                p.delete("view");
                return p;
              },
              { preventScrollReset: true },
            )
          }
        >
          <BookOpen size={18} />
          {label("myLearning")}
        </button>
        <button
          aria-pressed={insightView}
          onClick={() =>
            setParams(
              (p) => {
                p.set("view", "insights");
                return p;
              },
              { preventScrollReset: true },
            )
          }
        >
          <ChartNoAxesCombined size={18} />
          {label("myProgress")}
        </button>
      </nav>
      {insightView ? (
        <Suspense fallback={<LoadingState />}>
          <AcademicProgressPage embedded />
        </Suspense>
      ) : (
        <>
          <SearchInput
            value={search}
            onChange={setSearch}
            label={label("findMyCourse")}
          />
          <div className="course-grid personal-learning-grid">
            {selected.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
            {selected.length === 0 && (
              <EmptyState
                title={label("emptyCourses")}
                description={label("myCoursesEmpty")}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
