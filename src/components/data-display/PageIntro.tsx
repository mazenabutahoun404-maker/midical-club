import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { AppLink } from "../navigation/AppLink";
import { useLocale } from "../../app/providers/LocaleProvider";
export function PageIntro({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  const paths = useWorkspacePaths();
  const { label } = useLocale();
  return (
    <div className="page-intro">
      <nav
        className="breadcrumbs"
        aria-label={label(
          paths.admin ? "adminOverview" : paths.personal ? "mySpace" : "home",
        )}
      >
        <AppLink href={paths.home}>
          {label(
            paths.admin ? "adminOverview" : paths.personal ? "mySpace" : "home",
          )}
        </AppLink>
        <ChevronRight className="directional" size={14} />
        <span aria-current="page">{title}</span>
      </nav>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 tabIndex={-1} data-page-heading>
        {title}
      </h1>
      <p>{description}</p>
      {children}
    </div>
  );
}
