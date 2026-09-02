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
    <AppLink className="course-card" href={paths.course(c.slug)}>
      <div className={`course-top tone-${c.accent}`}>
        <div>
          <span className="course-code">
            <bdi>{c.code}</bdi>
          </span>
          <span className="tag">
            {label("year")} {c.year} · {t(c.batch)}
          </span>
        </div>
        <Icon name={c.icon} />
      </div>
      <div className="course-body">
        <h2>{t(c.title)}</h2>
        <p>{t(c.description)}</p>
        <span className="text-link">
          {label("courseView")}
          <ArrowRight className="directional" size={16} />
        </span>
      </div>
    </AppLink>
  );
}
