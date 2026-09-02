import { ArrowRight, Microscope } from "lucide-react";
import type { Opportunity } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { formatDate } from "../../lib/dates";
import { SaveButton } from "./SaveButton";
export function OpportunityCard({
  opportunity: o,
}: {
  opportunity: Opportunity;
}) {
  const { t, label, locale } = useLocale();
  const { openDetail } = useOverlays();
  return (
    <article className="opportunity">
      <span className="opportunity-icon">
        <Microscope size={22} />
      </span>
      <div className="opportunity-copy">
        <span className="eyebrow">
          {t(o.type)} · {t(o.location)}
        </span>
        <h3>
          <button
            className="resource-title"
            onClick={() => openDetail({ kind: "opportunity", item: o })}
          >
            {t(o.title)}
          </button>
        </h3>
        <p>{t(o.organization)}</p>
        <div className="opportunity-footer">
          <span>
            {label("deadline")} {formatDate(o.deadline, locale)}
          </span>
          <button
            className="text-link"
            aria-label={`${label("view")} ${t(o.title)}`}
            onClick={() => openDetail({ kind: "opportunity", item: o })}
          >
            <ArrowRight className="directional" size={18} />
          </button>
        </div>
      </div>
      <SaveButton id={o.id} title={t(o.title)} />
    </article>
  );
}
