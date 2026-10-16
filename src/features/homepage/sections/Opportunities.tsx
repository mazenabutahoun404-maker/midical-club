import { ArrowUpRight } from "lucide-react";
import { useOpportunities } from "../../../hooks/useContent";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { AppLink } from "../../../components/navigation/AppLink";
import { SaveButton } from "../../../components/cards/SaveButton";
import { opportunityPath } from "../../../constants/routes";
import { formatDate } from "../../../lib/dates";
import { opportunityIsOpen } from "../../../lib/discovery";
export function Opportunities() {
  const query = useOpportunities(),
    { t, label, locale } = useLocale();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  if (!query.data.length) return <EmptyState />;
  return (
    <div className="home-openings-list">
      {query.data.slice(0, 3).map((item, index) => (
        <article
          className="home-opening"
          key={item.id}
          data-home-reveal="slide"
          data-home-step={index}
        >
          <span className="home-opening-index" aria-hidden="true">
            0{index + 1}
          </span>
          <div className="home-opening-top">
            <span className="eyebrow">
              {t(item.type)} · {t(item.location)}
            </span>
            <SaveButton id={item.id} title={t(item.title)} />
          </div>
          <h4>
            <AppLink href={opportunityPath(item.slug)}>{t(item.title)}</AppLink>
          </h4>
          <p>{t(item.organization)}</p>
          <div className="home-opening-bottom">
            <span>
              <small>{label("deadline")}</small>
              <time dateTime={item.deadline}>
                {formatDate(item.deadline, locale)}
              </time>
            </span>
            <AppLink className="text-link" href={opportunityPath(item.slug)}>
              {t({ en: "View opportunity", ar: "عرض الفرصة" })}
              <ArrowUpRight className="directional" size={16} />
            </AppLink>
          </div>
          <span
            className="home-opening-status"
            data-open={opportunityIsOpen(item)}
          >
            {t(
              opportunityIsOpen(item)
                ? { en: "Open", ar: "متاحة" }
                : { en: "Closed", ar: "مغلقة" },
            )}
          </span>
        </article>
      ))}
    </div>
  );
}
