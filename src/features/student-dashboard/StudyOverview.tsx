import { ArrowUpRight, Clock3, BookOpen, Check, Sparkles } from "lucide-react";
import { useResources, useStudentProfile } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { useCalendar } from "../calendar/useCalendar";
import { useNotifications } from "../notifications/useNotifications";
import { AppLink } from "../../components/navigation/AppLink";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { DEMO_TODAY } from "../../constants/config";
import { calendarDate, dateAtNoon } from "../../lib/calendar";
import { formatDate } from "../../lib/dates";
export function StudyOverview() {
  const { label, t, locale } = useLocale(),
    { state } = useWorkspace();
  const { openDetail } = useOverlays();
  const resources = useResources(),
    profile = useStudentProfile(),
    calendar = useCalendar(),
    notifications = useNotifications();
  if (
    resources.isError ||
    profile.isError ||
    calendar.isError ||
    notifications.isError
  )
    return (
      <ErrorState
        retry={() => {
          void resources.refetch();
          void profile.refetch();
          calendar.retry();
          notifications.retry();
        }}
      />
    );
  if (
    resources.isPending ||
    profile.isPending ||
    calendar.isPending ||
    notifications.isPending
  )
    return <LoadingState />;
  const mine = resources.data.filter((r) =>
    profile.data.courseIds.includes(r.courseId),
  );
  const recent = state.recentResources.flatMap((entry) => {
    const resource = mine.find((r) => r.id === entry.resourceId);
    return resource ? [{ resource, viewedAt: entry.viewedAt }] : [];
  });
  const latest = recent[0]?.resource;
  const reviewed = mine.filter((r) =>
    state.reviewedResourceIds.includes(r.id),
  ).length;
  const upcoming = calendar.items
    .filter((i) => calendarDate(i.startsAt) >= DEMO_TODAY)
    .slice(0, 3);
  const updates = [...mine]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 3);
  return (
    <div className="study-overview">
      <div className="study-thread-grid">
        <section className="continue-thread">
          <div className="thread-orbits" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span className="eyebrow">{label("continueEyebrow")}</span>
          <h2>{label(latest ? "continueLearning" : "beginLearning")}</h2>
          <p>{label(latest ? "continueBody" : "beginLearningBody")}</p>
          {latest ? (
            <button
              className="resume-resource"
              aria-label={label("resume") + " " + t(latest.title)}
              onClick={() => openDetail({ kind: "resource", item: latest })}
            >
              <BookOpen size={22} />
              <span>
                <small>{label("resume")}</small>
                <strong>{t(latest.title)}</strong>
              </span>
              <ArrowUpRight className="directional" size={21} />
            </button>
          ) : (
            <AppLink href="/my/learning" className="resume-resource">
              <BookOpen size={22} />
              <strong>{label("openMyLearning")}</strong>
              <ArrowUpRight className="directional" size={21} />
            </AppLink>
          )}
          <div className="review-meter">
            <div>
              <span>{label("reviewProgress")}</span>
              <strong>
                {reviewed}/{mine.length}
              </strong>
            </div>
            <progress
              max={Math.max(mine.length, 1)}
              value={reviewed}
              aria-label={label("reviewProgress")}
            />
            <small>{label("reviewNote")}</small>
          </div>
        </section>
        <section className="next-up-card">
          <div className="personal-section-heading">
            <h2>{label("workspaceUpcoming")}</h2>
            <AppLink href="/my/calendar" aria-label={label("openCalendar")}>
              <ArrowUpRight className="directional" size={20} />
            </AppLink>
          </div>
          <span className="demo-date-label">
            {label("demoDate")} · {formatDate(dateAtNoon(DEMO_TODAY), locale)}
          </span>
          {upcoming.map((item) => (
            <AppLink
              className="next-up-entry"
              key={item.id}
              href="/my/calendar"
            >
              <time dateTime={item.startsAt}>
                <b>{formatDate(item.startsAt, locale, { day: "numeric" })}</b>
                {formatDate(item.startsAt, locale, { month: "short" })}
              </time>
              <strong>{t(item.title)}</strong>
              <ArrowUpRight className="directional" size={15} />
            </AppLink>
          ))}
          {!upcoming.length && (
            <p className="workspace-note">{label("noUpcoming")}</p>
          )}
          <AppLink href="/my/notifications" className="updates-pill">
            <Sparkles size={15} />
            <b>{notifications.unread}</b>
            {label("unreadUpdates")}
            <ArrowUpRight className="directional" size={15} />
          </AppLink>
        </section>
      </div>
      <div className="personal-activity-grid">
        <section>
          <div className="personal-section-heading">
            <h2>{label("recentlyViewed")}</h2>
            <span className="eyebrow">{label("recentPreview")}</span>
          </div>
          <div className="activity-resource-list">
            {recent.slice(0, 3).map(({ resource, viewedAt }) => (
              <button
                key={resource.id}
                onClick={() => openDetail({ kind: "resource", item: resource })}
              >
                <Clock3 size={19} />
                <span>
                  <strong>{t(resource.title)}</strong>
                  <small>
                    {formatDate(viewedAt, locale, {
                      day: "numeric",
                      month: "short",
                    })}
                  </small>
                </span>
                {state.reviewedResourceIds.includes(resource.id) ? (
                  <Check size={16} aria-label={label("reviewed")} />
                ) : (
                  <ArrowUpRight className="directional" size={16} />
                )}
              </button>
            ))}
            {!recent.length && (
              <p className="personal-empty">{label("noRecent")}</p>
            )}
          </div>
        </section>
        <section>
          <div className="personal-section-heading">
            <h2>{label("courseUpdates")}</h2>
            <AppLink href="/my/learning" className="text-link">
              {label("viewAll")}
              <ArrowUpRight className="directional" size={15} />
            </AppLink>
          </div>
          <div className="activity-resource-list">
            {updates.map((r) => (
              <button
                key={r.id}
                onClick={() => openDetail({ kind: "resource", item: r })}
              >
                <BookOpen size={19} />
                <span>
                  <strong>{t(r.title)}</strong>
                  <small>
                    {formatDate(r.updatedAt, locale)} · {label(r.kind)}
                  </small>
                </span>
                <ArrowUpRight className="directional" size={16} />
              </button>
            ))}
            {!updates.length && (
              <p className="personal-empty">{label("noCourseUpdates")}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
