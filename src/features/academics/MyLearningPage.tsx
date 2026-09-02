import { useState } from "react";
import { useCourses, useStudentProfile } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { SearchInput } from "../../components/forms/SearchInput";
import { CourseCard } from "../../components/cards/CourseCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
export default function MyLearningPage() {
  const courses = useCourses(),
    profile = useStudentProfile();
  const { label } = useLocale();
  const [search, setSearch] = useState("");
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
    </div>
  );
}
