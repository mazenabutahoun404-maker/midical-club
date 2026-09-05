import type { ClubEvent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { formatDate } from "../../lib/dates";
import { DetailFacts } from "../../components/data-display/DetailFacts";
import { Notice } from "../../components/feedback/Notice";
import { ActionLink } from "../../components/ui/ActionLink";
import { eventPath } from "../../constants/routes";
export function EventDetails({ item }: { item: ClubEvent }) {
  const { t, label, locale } = useLocale();
  return (
    <>
      <DetailFacts
        items={[
          {
            label: label("date"),
            value: formatDate(item.startDate, locale, {
              weekday: "short",
              day: "numeric",
              month: "long",
            }),
          },
          {
            label: label("time"),
            value: `${formatDate(item.startDate, locale, { hour: "numeric", minute: "2-digit" })} – ${formatDate(item.endDate, locale, { hour: "numeric", minute: "2-digit" })}`,
          },
          { label: label("location"), value: t(item.location) },
          { label: label("audience"), value: t(item.audience) },
        ]}
      />
      <h3 className="detail-subtitle">{label("agenda")}</h3>
      <ul className="detail-agenda">
        {item.agenda.map((a, i) => (
          <li key={i}>{t(a)}</li>
        ))}
      </ul>
      <ActionLink href={eventPath(item.slug)}>{label("eventView")}</ActionLink>
      <Notice>{label("eventRegistrationNote")}</Notice>
    </>
  );
}
