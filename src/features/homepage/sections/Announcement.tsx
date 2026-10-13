import { ArrowRight, Megaphone } from "lucide-react";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { useOverlays } from "../../../app/providers/OverlayProvider";
import { useEvents } from "../../../hooks/useContent";
export function Announcement({ site }: { site: SiteContent }) {
  const { t, label } = useLocale();
  const { openDetail } = useOverlays();
  const events = useEvents();
  const event = events.data?.find((e) => e.id === site.announcement.eventId);
  return (
    <div className="home-signal">
      <span className="home-signal-badge">
        <Megaphone size={19} />
        <span>{t(site.announcement.label)}</span>
      </span>
      <p>
        {t(site.announcement.title)}
        <span>{t(site.announcement.description)}</span>
      </p>
      {event && (
        <button
          className="text-link"
          onClick={() => openDetail({ kind: "event", item: event })}
        >
          {label("upcoming")}
          <ArrowRight className="directional" size={16} />
        </button>
      )}
    </div>
  );
}
