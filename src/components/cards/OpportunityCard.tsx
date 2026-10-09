import { ArrowRight, Microscope } from "lucide-react";
import type { Opportunity } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { formatDate } from "../../lib/dates";
import { SaveButton } from "./SaveButton";
import { AppLink } from "../navigation/AppLink";
import { opportunityIsOpen, daysFromDemo } from "../../lib/discovery";
import { opportunityPath } from "../../constants/routes";
export function OpportunityCard({
  opportunity: o,
}: {
  opportunity: Opportunity;
}) {
  const { t, label, locale } = useLocale();
  return (
    <article
      className="opportunity"
      data-status={
        !opportunityIsOpen(o)
          ? "closed"
          : daysFromDemo(o.deadline) <= 14
            ? "closing-soon"
            : "open"
      }
    >
      <span className="opportunity-icon">
        <Microscope size={22} />
      </span>
      <div className="opportunity-copy">
        <span className="eyebrow">
          {t(o.type)} · {t(o.location)}
        </span>
        <h3>
          <AppLink className="resource-title" href={opportunityPath(o.slug)}>
            {t(o.title)}
          </AppLink>
        </h3>
        <p>{t(o.organization)}</p>
        <div className="opportunity-footer">
          <span>
            {label("deadline")} {formatDate(o.deadline, locale)}
          </span>
          <AppLink
            className="text-link"
            aria-label={`${label("view")} ${t(o.title)}`}
            href={opportunityPath(o.slug)}
          >
            <ArrowRight className="directional" size={18} />
          </AppLink>
        </div>
      </div>
      <SaveButton id={o.id} title={t(o.title)} />
    </article>
  );
}
