import { FileText } from "lucide-react";
import type { Resource, Course } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { formatDate } from "../../lib/dates";
import { AppLink } from "../navigation/AppLink";
import { Icon } from "../ui/Icon";
import { SaveButton } from "./SaveButton";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
export function ResourceCard({
  resource: r,
  course: c,
}: {
  resource: Resource;
  course?: Course;
}) {
  const paths = useWorkspacePaths();
  const { t, label, locale } = useLocale();
  const { openDetail } = useOverlays();
  if (!c) return null;
  return (
    <article className="resource-card">
      <AppLink
        href={paths.course(c.slug)}
        className={`resource-art tone-${c.accent}`}
      >
        <div>
          <span className="course-code">
            <bdi>{c.code}</bdi>
          </span>
          <span className="course-title">{t(c.title)}</span>
        </div>
        <Icon name={c.icon} />
      </AppLink>
      <div className="resource-body">
        <div className="resource-meta">
          <span className="tag">
            <FileText size={12} />
            {label(r.kind)}
          </span>
          <span>
            {r.pages} {label("pages")}
          </span>
        </div>
        <h3>
          <button
            className="resource-title"
            onClick={() => openDetail({ kind: "resource", item: r })}
          >
            {t(r.title)}
          </button>
        </h3>
        <div className="resource-bottom">
          <span>
            {label("updated")} {formatDate(r.updatedAt, locale)}
          </span>
          <SaveButton id={r.id} title={t(r.title)} />
        </div>
      </div>
    </article>
  );
}
