import { ArrowRight, MapPin } from "lucide-react";
import type { ClubEvent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { formatDate } from "../../lib/dates";
import { SaveButton } from "./SaveButton";
export function EventCard({ event: e }: { event: ClubEvent }) {
  const { t, label, locale } = useLocale();
  const { openDetail } = useOverlays();
  return (
    <article className="event-card">
      <div className="event-top">
        <div className="event-date">
          <span>{formatDate(e.startDate, locale, { month: "short" })}</span>
          <b>{formatDate(e.startDate, locale, { day: "2-digit" })}</b>
        </div>
        <div>
          <span className="eyebrow">{t(e.type)}</span>
          <h3>{t(e.title)}</h3>
        </div>
      </div>
      <p className="event-place">
        <MapPin size={14} />
        {t(e.location)}
      </p>
      <div className="event-actions">
        <button
          className="text-link"
          onClick={() => openDetail({ kind: "event", item: e })}
        >
          {label("eventView")}
          <ArrowRight className="directional" size={15} />
        </button>
        <SaveButton id={e.id} title={t(e.title)} />
      </div>
    </article>
  );
}
