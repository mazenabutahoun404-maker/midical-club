import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowUpRight,
  BookMarked,
  BookOpen,
  CircleHelp,
  ClipboardList,
  FileText,
  Film,
  Globe2,
  LayoutDashboard,
  Lightbulb,
  ListFilter,
  Sparkles,
} from "lucide-react";
import type { CourseSectionKind } from "../../types/content";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { useCourses, useResources } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { formatDate } from "../../lib/dates";
import { ResourceCard } from "../../components/cards/ResourceCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { AppLink } from "../../components/navigation/AppLink";

const icons = {
  overview: LayoutDashboard,
  guidance: Lightbulb,
  slides: FileText,
  notes: ClipboardList,
  summary: BookMarked,
  recording: Film,
  book: BookOpen,
  questions: CircleHelp,
  external: Globe2,
} satisfies Record<CourseSectionKind, typeof FileText>;

export default function CoursePage() {
  const paths = useWorkspacePaths();
  const { slug } = useParams();
  const courses = useCourses(),
    resources = useResources();
  const { t, label, locale } = useLocale();
  const [active, setActive] = useState<CourseSectionKind>("overview");
  useEffect(() => setActive("overview"), [slug]);
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
  const course = courses.data.find((item) => item.slug === slug);
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
  const ordered = [...course.sections].sort((a, b) => a.order - b.order);
  const section = ordered.find((item) => item.kind === active) ?? ordered[0];
  const courseResources = resources.data.filter(
    (item) => item.courseId === course.id,
  );
  const visible =
    section.kind === "overview"
      ? []
      : courseResources.filter((item) => item.kind === section.kind);
  const count = (kind: CourseSectionKind) =>
    kind === "overview"
      ? course.outcomes.length
      : courseResources.filter((item) => item.kind === kind).length;
  return (
    <div className={`container course-atlas course-atlas-${course.accent}`}>
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
      <div className="course-atlas-layout">
        <aside className="course-section-rail">
          <span className="academic-kicker">
            <ListFilter size={14} />
            {label("courseSections")}
          </span>
          <nav aria-label={label("courseSections")}>
            {ordered.map((item, index) => {
              const Icon = icons[item.kind];
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.kind)}
                  aria-current={section.kind === item.kind ? "page" : undefined}
                >
                  <span>
                    <Icon size={17} />
                    <b>{t(item.title)}</b>
                  </span>
                  <small>
                    {String(index + 1).padStart(2, "0")} · {count(item.kind)}
                  </small>
                </button>
              );
            })}
          </nav>
        </aside>
        <section className="course-section-stage" aria-live="polite">
          <header className="course-section-heading">
            <div>
              <span className="academic-kicker">
                {label(section.kind === "overview" ? "beginHere" : "materials")}
              </span>
              <h2>{t(section.title)}</h2>
              <p>{t(section.description)}</p>
            </div>
            {section.kind !== "overview" && (
              <span className="section-count">
                <b>{visible.length}</b>
                {label("materialCount")}
              </span>
            )}
          </header>
          {section.kind === "overview" ? (
            <div className="course-overview-panel">
              <div className="overview-note">
                <Lightbulb size={24} />
                <p>{label("overviewBody")}</p>
              </div>
              <section>
                <span className="academic-kicker">
                  {label("learningOutcomes")}
                </span>
                <ol>
                  {course.outcomes.map((outcome, index) => (
                    <li key={outcome.en}>
                      <span>0{index + 1}</span>
                      {t(outcome)}
                    </li>
                  ))}
                </ol>
              </section>
              <button
                className="button button-primary"
                onClick={() =>
                  setActive(
                    ordered.find((item) => item.kind === "guidance")?.kind ??
                      ordered[1]?.kind ??
                      "overview",
                  )
                }
              >
                {label("openSection")}
                <ArrowUpRight size={17} className="directional" />
              </button>
            </div>
          ) : visible.length ? (
            <div className="resource-grid course-material-grid">
              {visible.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  course={course}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={label("emptyTitle")}
              description={label("emptyBody")}
            />
          )}
        </section>
        <aside className="course-context-card">
          <span className="academic-kicker">{label("academicPulse")}</span>
          <strong>
            {courseResources.length}
            <small>{label("resourcesCount")}</small>
          </strong>
          <div>
            <span>{label("lastRefreshed")}</span>
            <b>{formatDate(course.lastUpdated, locale)}</b>
          </div>
          <div>
            <span>{label("batch")}</span>
            <b>{t(course.batch)}</b>
          </div>
          <p>{label("guidanceBody")}</p>
          <AppLink href={paths.learning}>
            {label("allCoursesLink")}
            <ArrowUpRight size={16} className="directional" />
          </AppLink>
        </aside>
      </div>
    </div>
  );
}
