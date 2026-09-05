import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  Archive,
  BookOpen,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { useBatches, useCourses } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { batchPath, routes } from "../../constants/routes";
import { AppLink } from "../../components/navigation/AppLink";
import { CourseCard } from "../../components/cards/CourseCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";

export default function BatchPage({ view }: { view: "current" | "archive" }) {
  const { batchSlug } = useParams();
  const batches = useBatches(),
    courses = useCourses();
  const { t, label } = useLocale();
  if (batches.isPending || courses.isPending) return <LoadingState />;
  if (batches.isError || courses.isError)
    return (
      <ErrorState
        retry={() => {
          void batches.refetch();
          void courses.refetch();
        }}
      />
    );
  const batch = batches.data.find((item) => item.slug === batchSlug);
  if (!batch)
    return (
      <EmptyState
        title={label("notFound")}
        description={label("notFoundBody")}
        href={routes.basic}
      />
    );
  const current = batch.terms.find((term) => term.current);
  if (view === "current" && !current)
    return <Navigate to={batchPath(batch.slug, "archive")} replace />;
  return (
    <div className={`container batch-page batch-page-${batch.accent}`}>
      <header className="batch-identity-card">
        <div className="batch-identity-copy">
          <span className="academic-kicker">{t(batch.classLabel)}</span>
          <h1 data-page-heading tabIndex={-1}>
            {t(batch.name)}
          </h1>
          <strong>{t(batch.tagline)}</strong>
          <p>{t(batch.description)}</p>
        </div>
        <div
          className="batch-progress-seal"
          style={
            { "--progress": `${batch.progress * 3.6}deg` } as CSSProperties
          }
        >
          <span>
            <b>{batch.progress}%</b>
            {label("journeyComplete")}
          </span>
        </div>
        <dl className="batch-meta">
          <div>
            <dt>
              <GraduationCap size={16} />
              {label("graduation")}
            </dt>
            <dd>{batch.graduationYear}</dd>
          </div>
          <div>
            <dt>
              <BookOpen size={16} />
              {label("yearNumber")}
            </dt>
            <dd>{batch.studyYear}</dd>
          </div>
          <div>
            <dt>
              <CalendarDays size={16} />
              {label("semester")}
            </dt>
            <dd>{current?.semester ?? "—"}</dd>
          </div>
        </dl>
      </header>
      <nav className="batch-view-switch" aria-label={label("choosePath")}>
        <AppLink
          href={batchPath(batch.slug)}
          aria-current={view === "current" ? "page" : undefined}
        >
          <BookOpen size={17} />
          {label("currentSemester")}
        </AppLink>
        <AppLink
          href={batchPath(batch.slug, "archive")}
          aria-current={view === "archive" ? "page" : undefined}
        >
          <Archive size={17} />
          {label("archive")}
        </AppLink>
      </nav>
      {view === "current" && current ? (
        <section className="term-section">
          <div className="academic-section-heading">
            <span>{String(current.semester).padStart(2, "0")}</span>
            <div>
              <small>{current.academicYear}</small>
              <h2>{t(current.label)}</h2>
            </div>
            <i />
          </div>
          <div className="course-grid academic-course-grid">
            {current.courseIds
              .map((id) => courses.data.find((course) => course.id === id))
              .filter(Boolean)
              .map((course) => (
                <CourseCard course={course!} key={course!.id} />
              ))}
          </div>
        </section>
      ) : (
        <section className="archive-section">
          <div className="academic-section-heading">
            <span>
              <Archive size={20} />
            </span>
            <h2>{label("archivedTerms")}</h2>
            <i />
          </div>
          {batch.terms.filter((term) => !term.current).length ? (
            batch.terms
              .filter((term) => !term.current)
              .map((term) => (
                <details className="archive-term" key={term.id}>
                  <summary>
                    <span>
                      <small>
                        {term.academicYear} · {label("semester")}{" "}
                        {term.semester}
                      </small>
                      <b>{t(term.label)}</b>
                    </span>
                    <span>
                      {term.courseIds.length} {label("coursesCount")}
                      <ArrowUpRight size={18} />
                    </span>
                  </summary>
                  <div className="course-grid academic-course-grid">
                    {term.courseIds
                      .map((id) =>
                        courses.data.find((course) => course.id === id),
                      )
                      .filter(Boolean)
                      .map((course) => (
                        <CourseCard course={course!} key={course!.id} />
                      ))}
                  </div>
                </details>
              ))
          ) : (
            <EmptyState description={label("noArchive")} />
          )}
        </section>
      )}
    </div>
  );
}
