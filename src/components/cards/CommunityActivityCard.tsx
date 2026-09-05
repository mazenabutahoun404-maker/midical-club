import { CalendarDays, MapPin, UsersRound, Activity } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { formatDate } from "../../lib/dates";
import type { CommunityActivity } from "../../types/content";

const labels = {
  "health-campaign": "healthCampaign",
  "peer-learning": "peerLearning",
  volunteering: "volunteering",
  "student-life": "studentLife",
} as const;

export function CommunityActivityCard({
  activity,
}: {
  activity: CommunityActivity;
}) {
  const { t, label, locale } = useLocale();
  return (
    <article className="community-activity-card" data-kind={activity.kind}>
      <div className="activity-card-head">
        <span className="activity-kind-icon" aria-hidden="true">
          <Activity size={20} />
          <i />
        </span>
        <span className="eyebrow">{label(labels[activity.kind])}</span>
        <time dateTime={activity.date}>
          <CalendarDays size={15} />
          {formatDate(activity.date, locale, {
            day: "numeric",
            month: "short",
          })}
        </time>
      </div>
      <h2>{t(activity.title)}</h2>
      <p>{t(activity.summary)}</p>
      <div className="activity-card-facts">
        <span>
          <MapPin size={15} />
          {t(activity.location)}
        </span>
        <span>
          <UsersRound size={15} />
          {activity.participantCount} {label("participants")}
        </span>
      </div>
      <div className="activity-impact">
        <span>{label("measuredImpact")}</span>
        <strong>{t(activity.impact)}</strong>
      </div>
    </article>
  );
}
