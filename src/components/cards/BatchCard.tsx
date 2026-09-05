import type { CSSProperties } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { Batch } from "../../types/content";
import { batchPath } from "../../constants/routes";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../navigation/AppLink";

export function BatchCard({ batch, index }: { batch: Batch; index: number }) {
  const { t, label } = useLocale();
  const current = batch.terms.find((term) => term.current);
  return (
    <AppLink
      href={batchPath(batch.slug)}
      className={`batch-passport batch-${batch.accent}`}
      style={
        {
          "--batch-index": index,
          "--batch-progress": `${batch.progress * 3.6}deg`,
        } as CSSProperties
      }
    >
      <span className="passport-index" aria-hidden="true">
        0{index + 1}
      </span>
      <span className="passport-stamp" aria-hidden="true">
        <span>{batch.progress}%</span>
      </span>
      <span className="passport-copy">
        <span className="academic-kicker">{t(batch.classLabel)}</span>
        <strong>{t(batch.name)}</strong>
        <em>{t(batch.tagline)}</em>
        <span>{t(batch.description)}</span>
      </span>
      <span className="passport-term">
        <CalendarDays size={16} />
        <span>
          <small>{label("currentSemester")}</small>
          <b>{current ? t(current.label) : "—"}</b>
        </span>
      </span>
      <span className="passport-action">
        {label("exploreBatch")}
        <ArrowUpRight size={18} className="directional" />
      </span>
    </AppLink>
  );
}
