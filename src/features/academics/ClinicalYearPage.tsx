import { ArrowUpRight, Compass, Stethoscope } from "lucide-react";
import { useParams } from "react-router-dom";
import { useClinicalYears, useCourses } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { routes } from "../../constants/routes";
import { CourseCard } from "../../components/cards/CourseCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";

export default function ClinicalYearPage() {
  const { yearSlug } = useParams();
  const years = useClinicalYears(),
    courses = useCourses();
  const { t, label } = useLocale();
  if (years.isPending || courses.isPending) return <LoadingState />;
  if (years.isError || courses.isError)
    return (
      <ErrorState
        retry={() => {
          void years.refetch();
          void courses.refetch();
        }}
      />
    );
  const year = years.data.find((item) => item.slug === yearSlug);
  if (!year)
    return (
      <EmptyState
        title={label("notFound")}
        description={label("notFoundBody")}
        href={routes.clinical}
      />
    );
  const selected = year.courseIds
    .map((id) => courses.data.find((course) => course.id === id))
    .filter(Boolean);
  return (
    <div
      className={`container clinical-year-page clinical-year-${year.accent}`}
    >
      <header className="clinical-year-hero">
        <span className="clinical-year-huge" aria-hidden="true">
          0{year.year}
        </span>
        <div>
          <span className="academic-kicker">
            <Stethoscope size={14} />
            {t(year.label)}
          </span>
          <h1 data-page-heading tabIndex={-1}>
            {t(year.tagline)}
          </h1>
          <p>{t(year.description)}</p>
        </div>
        <aside>
          <small>{label("currentBlock")}</small>
          <strong>{t(year.currentBlock)}</strong>
          <ArrowUpRight size={20} />
        </aside>
      </header>
      <section className="clinical-focus-strip" aria-labelledby="focus-heading">
        <span>
          <Compass size={19} />
          <b id="focus-heading">{label("focusAreas")}</b>
        </span>
        {year.focusAreas.map((focus, index) => (
          <span key={focus.en}>
            <i>0{index + 1}</i>
            {t(focus)}
          </span>
        ))}
      </section>
      <section>
        <div className="academic-section-heading">
          <span>{selected.length}</span>
          <h2>{label("courseCollection")}</h2>
          <i />
        </div>
        <div className="course-grid academic-course-grid">
          {selected.map((course) => (
            <CourseCard course={course!} key={course!.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
