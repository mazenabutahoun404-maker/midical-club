import { BackLink } from "../../components/navigation/BackLink";
import { ContentPlaceholder } from "../../components/feedback/ContentPlaceholder";
import { ReadFeedback } from "../../components/feedback/ReadFeedback";
import { ArrowUpRight, Compass, Stethoscope } from "lucide-react";
import { useParams } from "react-router-dom";
import { useClinicalYears, useCourses } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { routes } from "../../constants/routes";
import { CourseCard } from "../../components/cards/CourseCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { ApiActionError } from "../../components/feedback/ApiActionError";

export default function ClinicalYearPage() {
  const { t } = useLocale();
  return (
    <div className="container">
      <BackLink
        href={routes.clinical}
        label={t({
          en: "Back to clinical sciences",
          ar: "العودة إلى العلوم السريرية",
        })}
      />
      <ClinicalYearBody />
    </div>
  );
}
function ClinicalYearBody() {
  const { yearSlug } = useParams();
  const services = useServices();
  const studyYear = (
    { "fourth-year": 4, "fifth-year": 5, "sixth-year": 6 } as Record<
      string,
      number
    >
  )[yearSlug || ""];
  const metadata = useQuery({
    queryKey: ["academic-catalog", "year", studyYear],
    queryFn: () => services.academicCatalog!.year(studyYear),
    enabled: !!services.academicCatalog && !!studyYear,
    retry: false,
  });
  const years = useClinicalYears(),
    courses = useCourses();
  const { t, label } = useLocale();
  if (years.isPending || courses.isPending) return <LoadingState />;
  if (years.isError || courses.isError)
    return (
      <ErrorState
        error={years.error || courses.error}
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
    <div className={`clinical-year-page clinical-year-${year.accent}`}>
      <header className="clinical-year-hero">
        <span className="clinical-year-huge" aria-hidden="true">
          0{metadata.data?.studyYear || year.year}
        </span>
        <div>
          <span className="academic-kicker">
            <Stethoscope size={14} />
            {t(year.label)}
          </span>
          <h1 data-page-heading tabIndex={-1}>
            {t(year.tagline) ||
              t({
                en: `Year ${year.year} clinical courses`,
                ar: `مساقات السنة ${year.year} السريرية`,
              })}
          </h1>
          <p>
            {t(year.description) ||
              t({
                en: "Explore the published courses and learning materials available for this year.",
                ar: "تصفّح المساقات والمصادر التعليمية المنشورة والمتاحة لهذه السنة.",
              })}
          </p>
        </div>
        <aside>
          <small>{label("currentBlock")}</small>
          <strong>
            {t(year.currentBlock) ||
              t({ en: "Not announced yet", ar: "لم يُعلن بعد" })}
          </strong>
          <ArrowUpRight size={20} />
        </aside>
      </header>
      <ReadFeedback query={metadata} />
      <section className="clinical-focus-strip" aria-labelledby="focus-heading">
        <span>
          <Compass size={19} />
          <b id="focus-heading">{label("focusAreas")}</b>
        </span>
        {!year.focusAreas.length && (
          <ContentPlaceholder
            compact
            icon="books"
            title={t({
              en: "Focus areas have not been published yet",
              ar: "لم تُنشر محاور الدراسة بعد",
            })}
          />
        )}
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
        {!selected.length && (
          <ContentPlaceholder
            icon="books"
            title={t({
              en: "No courses published for this year yet",
              ar: "لم تُنشر مساقات لهذه السنة بعد",
            })}
          />
        )}
        <div className="course-grid academic-course-grid">
          {selected.map((course) => (
            <CourseCard course={course!} key={course!.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
