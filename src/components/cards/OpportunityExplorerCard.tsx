import { ArrowUpRight, CalendarClock, MapPin, ShieldCheck } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { opportunityPath } from "../../constants/routes";
import { daysFromDemo, opportunityIsOpen } from "../../lib/discovery";
import { formatDate } from "../../lib/dates";
import type { Opportunity } from "../../types/content";
import { AppLink } from "../navigation/AppLink";
import { SaveButton } from "./SaveButton";

export function OpportunityExplorerCard({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const { t, label, locale } = useLocale();
  const open = opportunityIsOpen(opportunity);
  const days = daysFromDemo(opportunity.deadline);
  return (
    <article
      className="opportunity-explorer"
      data-open={open}
      data-status={!open ? "closed" : days <= 14 ? "closing-soon" : "open"}
    >
      <div className="opportunity-ribbon">
        <span>{t(opportunity.type)}</span>
        <i />
      </div>
      <div className="opportunity-card-top">
        <span className="opportunity-mark" aria-hidden="true">
          {String(opportunity.category).slice(0, 2).toUpperCase()}
        </span>
        <SaveButton id={opportunity.id} title={t(opportunity.title)} />
      </div>
      <span className="eyebrow">
        {t(opportunity.field)} · {t(opportunity.mode)}
      </span>
      <h2>
        <AppLink href={opportunityPath(opportunity.slug)}>
          {t(opportunity.title)}
        </AppLink>
      </h2>
      <p className="opportunity-org">{t(opportunity.organization)}</p>
      <p>{t(opportunity.description)}</p>
      <div className="opportunity-tags">
        {opportunity.tags.map((tag, index) => (
          <span key={index}>{t(tag)}</span>
        ))}
      </div>
      <div className="opportunity-facts">
        <span>
          <MapPin size={15} />
          {t(opportunity.location)}
        </span>
        <span>
          <ShieldCheck size={15} />
          {t(opportunity.eligibility)}
        </span>
      </div>
      <div className="opportunity-deadline" data-soon={open && days <= 14}>
        <CalendarClock size={19} />
        <span>
          <small>{label("deadline")}</small>
          <strong>
            {formatDate(opportunity.deadline, locale, {
              day: "numeric",
              month: "short",
            })}
          </strong>
        </span>
        <b>{open ? `${days} ${label("daysLeft")}` : label("deadlinePassed")}</b>
      </div>
      <AppLink
        className="opportunity-open"
        href={opportunityPath(opportunity.slug)}
        aria-label={`${label("view")} ${t(opportunity.title)}`}
      >
        <ArrowUpRight size={20} className="directional" />
      </AppLink>
    </article>
  );
}
