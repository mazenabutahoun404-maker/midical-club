import { bookMaterial } from "../../features/courses/book-material";
import { ArrowRight } from "lucide-react";
import type { Course } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../navigation/AppLink";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { Icon } from "../ui/Icon";
export function CourseCard({ course: c }: { course: Course }) {
  const paths = useWorkspacePaths();
  const { t, label } = useLocale();
  return (
    <AppLink
      className={`course-card course-volume tone-${c.accent}`}
      href={paths.course(c.slug)}
      data-leather={bookMaterial(c.id)}
      data-course-volume
    >
      <span className="course-volume-shadow" aria-hidden="true" />
      <span className="course-volume-pages" aria-hidden="true" />
      <span className="course-volume-spine" aria-hidden="true">
        <b>
          <bdi>{c.code}</bdi>
        </b>
        <small>MEDCLUB</small>
      </span>
      <span className="course-volume-inside" aria-hidden="true">
        <small>
          {label("semester")} {c.semester}
        </small>
        <strong>
          {c.sections.length} {label("materials")}
        </strong>
      </span>
      <div className="course-volume-cover">
        <header className="course-volume-classification">
          <span className="course-code">
            <bdi>{c.code}</bdi>
          </span>
          <span>
            {label("year")} {c.year}
          </span>
        </header>
        <span className="course-volume-emblem" aria-hidden="true">
          <Icon name={c.icon} />
          <i />
        </span>
        <div className="course-volume-copy">
          <small>
            {t(c.batch)} · {c.credits} {label("credits")}
          </small>
          <h2>{t(c.title)}</h2>
          <p>{t(c.description)}</p>
        </div>
        <span className="course-volume-action">
          {label("courseView")}
          <ArrowRight className="directional" size={16} />
        </span>
        <span className="course-volume-ribbon" aria-hidden="true" />
      </div>
    </AppLink>
  );
}
