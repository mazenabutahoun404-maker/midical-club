import {
  Activity,
  Newspaper,
  UsersRound,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import {
  useCommunityActivities,
  useJournal,
  useRecruitmentPositions,
  useEvents,
} from "../../hooks/useContent";
import { AppLink } from "../../components/navigation/AppLink";
import { routes, eventPath } from "../../constants/routes";
import { formatDate } from "../../lib/dates";
import { summarizeCommunity } from "./community-summary";

export function CommunityOverview() {
  const { t, locale, label } = useLocale();
  const { contentSnapshot } = useServices();
  const activities = useCommunityActivities(),
    articles = useJournal(),
    roles = useRecruitmentPositions(),
    events = useEvents();
  const queries = [activities, articles, roles, events];
  const pending = queries.some((q) => q.isPending),
    failed = queries.some((q) => q.isError);
  const supplied = contentSnapshot?.asOf
    ? Date.parse(contentSnapshot.asOf)
    : NaN;
  const at = Number.isFinite(supplied) ? supplied : Date.now();
  const snapshot = summarizeCommunity(
    activities.data ?? [],
    articles.data ?? [],
    roles.data ?? [],
    events.data ?? [],
    at,
  );
  const title = t({ en: "Community at a glance", ar: "المجتمع في لمحة" });
  const stats = [
    {
      key: "activities",
      value: snapshot.activities,
      title: t({ en: "Activities", ar: "أنشطة" }),
      Icon: Activity,
      href: routes.activities,
      tone: "teal",
    },
    {
      key: "publications",
      value: snapshot.publications,
      title: t({ en: "Journal publications", ar: "منشورات المجلة" }),
      Icon: Newspaper,
      href: routes.journal,
      tone: "blue",
    },
    {
      key: "roles",
      value: snapshot.openRoles,
      title: t({ en: "Open team roles", ar: "فرص الانضمام للفريق" }),
      Icon: UsersRound,
      href: routes.recruitment,
      tone: "violet",
    },
  ];
  return (
    <aside
      className="community-overview"
      aria-label={title}
      aria-busy={pending}
    >
      <div className="community-overview-heading">
        <h2>{title}</h2>
        <p>
          {t(
            contentSnapshot?.kind === "sample"
              ? { en: "Preview records", ar: "سجلات توضيحية" }
              : { en: "Available content", ar: "المحتوى المتاح" },
          )}
          {" · "}
          {t({ en: "As of", ar: "بتاريخ" })}{" "}
          <time dateTime={new Date(at).toISOString()}>
            {formatDate(new Date(at).toISOString(), locale, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        </p>
      </div>
      {failed ? (
        <div className="community-overview-message" role="alert">
          <p>
            {t({
              en: "The overview could not be loaded. Please try again.",
              ar: "تعذّر تحميل الملخص. يرجى المحاولة مجددًا.",
            })}
          </p>
          <button
            className="text-link"
            onClick={() => queries.forEach((q) => void q.refetch())}
          >
            {label("retry")}
          </button>
        </div>
      ) : pending ? (
        <p className="community-overview-message" role="status">
          {label("loading")}
        </p>
      ) : (
        <>
          <dl className="community-overview-stats">
            {stats.map(({ key, value, title, Icon, href, tone }) => (
              <div key={key} data-tone={tone}>
                <dt>
                  <Icon size={18} aria-hidden="true" />
                  <AppLink href={href}>{title}</AppLink>
                </dt>
                <dd>{value.toLocaleString(locale)}</dd>
              </div>
            ))}
          </dl>
          <div className="community-next-event" data-tone="amber">
            <span className="community-next-label">
              <CalendarDays size={17} aria-hidden="true" />
              {t({ en: "Next upcoming event", ar: "الفعالية القادمة" })}
            </span>
            {snapshot.nextEvent ? (
              <>
                <h3>
                  <AppLink href={eventPath(snapshot.nextEvent.slug)}>
                    {t(snapshot.nextEvent.title)}
                    <ArrowUpRight
                      size={18}
                      className="directional"
                      aria-hidden="true"
                    />
                  </AppLink>
                </h3>
                <time dateTime={snapshot.nextEvent.startDate}>
                  {formatDate(snapshot.nextEvent.startDate, locale, {
                    day: "numeric",
                    month: "long",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
                <p>{t(snapshot.nextEvent.location)}</p>
              </>
            ) : (
              <>
                <h3>
                  {t({
                    en: "No upcoming event scheduled",
                    ar: "لا توجد فعالية قادمة مجدولة",
                  })}
                </h3>
                <AppLink className="text-link" href={routes.events}>
                  {t({ en: "Explore events", ar: "استعرض الفعاليات" })}
                  <ArrowUpRight size={16} className="directional" />
                </AppLink>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
