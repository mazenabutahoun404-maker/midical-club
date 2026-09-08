import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileWarning,
  Fingerprint,
  Radio,
  ShieldAlert,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AppLink } from "../../components/navigation/AppLink";
import { formatDate } from "../../lib/dates";
import { adminStatusKey } from "../admin-format";
import {
  useAdminActivity,
  useAdminContent,
  useAdminOverview,
} from "../useAdmin";
import { useGovernanceOverview } from "../governance/useGovernance";

export default function AdminDashboardPage() {
  const { label, t, locale } = useLocale();
  const overview = useAdminOverview();
  const content = useAdminContent();
  const activity = useAdminActivity();
  const governance = useGovernanceOverview();
  if (overview.isPending || content.isPending || activity.isPending || governance.isPending)
    return <LoadingState />;
  if (overview.isError || content.isError || activity.isError || governance.isError)
    return (
      <ErrorState
        retry={() => {
          void overview.refetch();
          void content.refetch();
          void activity.refetch();
          void governance.refetch();
        }}
      />
    );

  const metrics = [
    {
      label: label("adminPendingReviews"),
      value: overview.data.pendingReviews,
      icon: ClipboardCheck,
      tone: "red",
    },
    {
      label: label("adminApprovedWaiting"),
      value: overview.data.approvedWaiting,
      icon: CheckCircle2,
      tone: "olive",
    },
    {
      label: label("adminPublishedWeek"),
      value: overview.data.publishedThisWeek,
      icon: Radio,
      tone: "russet",
    },
    {
      label: label("adminStaleContent"),
      value: overview.data.staleContent,
      icon: FileWarning,
      tone: "amber",
    },
    {
      label: label("adminOpenRoles"),
      value: overview.data.openRecruitmentRoles,
      icon: UsersRound,
      tone: "plum",
    },
    {
      label: label("adminUpcomingEvents"),
      value: overview.data.upcomingEvents,
      icon: CalendarClock,
      tone: "ink",
    },
  ];
  const queue = content.data
    .filter((item) =>
      ["under-review", "changes-requested", "approved"].includes(item.status),
    )
    .slice(0, 4);
  return (
    <div className="container admin-page admin-dashboard">
      <section className="admin-command-hero">
        <div className="admin-command-copy">
          <span className="eyebrow">{label("adminHeroEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("adminHeroTitle")}
          </h1>
          <p>{label("adminHeroBody")}</p>
          <span className="admin-snapshot">
            <Clock3 size={15} />
            {label("adminSnapshot")} ·{" "}
            {formatDate(overview.data.generatedAt, locale, {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="admin-signal-field" aria-hidden="true">
          <span className="admin-signal-core">
            <Stethoscope size={34} />
          </span>
          <i className="admin-orbit orbit-a" />
          <i className="admin-orbit orbit-b" />
          <svg viewBox="0 0 420 120" role="presentation">
            <path d="M0 67h76l14-20 18 56 20-89 22 53h42l15-22 17 42 15-20H420" />
          </svg>
          <span className="admin-signal-caption">
            <i /> {label("adminSignalLive")}
          </span>
        </div>
      </section>

      <AppLink className="admin-governance-command" href="/admin/governance">
        <span className="admin-governance-command-icon" aria-hidden="true"><Fingerprint size={25} /><i /></span>
        <span><small>{label("governancePriority")}</small><strong>{label("governancePortalTitle")}</strong><em>{label("governancePortalBody")}</em></span>
        <b>{governance.data.pendingRequests}</b>
        <ArrowUpRight size={20} className="directional" />
      </AppLink>

      <section
        className="admin-metric-grid"
        aria-label={label("adminOverview")}
      >
        {metrics.map(({ label: metricLabel, value, icon: Icon, tone }) => (
          <article
            className="admin-metric-card"
            data-tone={tone}
            key={metricLabel}
          >
            <span className="admin-metric-icon">
              <Icon size={20} />
            </span>
            <strong>{value}</strong>
            <span>{metricLabel}</span>
            <i className="admin-metric-scan" aria-hidden="true" />
          </article>
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-queue-panel">
          <header className="admin-panel-heading">
            <div>
              <span className="eyebrow">{label("adminContent")}</span>
              <h2>{label("adminReviewQueue")}</h2>
              <p>{label("adminReviewQueueBody")}</p>
            </div>
            <AppLink
              className="admin-circle-link"
              href="/admin/content"
              aria-label={label("adminOpenContentDesk")}
            >
              <ArrowUpRight size={19} className="directional" />
            </AppLink>
          </header>
          <div className="admin-mini-queue">
            {queue.map((item, index) => (
              <AppLink
                href={`/admin/content?item=${encodeURIComponent(item.id)}`}
                key={item.id}
              >
                <span className="admin-queue-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="admin-queue-copy">
                  <strong>{t(item.title)}</strong>
                  <small>
                    {t(item.contributor)} · {t(item.topic)}
                  </small>
                </span>
                <span className="admin-status" data-status={item.status}>
                  {label(adminStatusKey(item.status))}
                </span>
              </AppLink>
            ))}
          </div>
          <AppLink
            className="button button-primary admin-panel-cta"
            href="/admin/content"
          >
            {label("adminOpenContentDesk")}
            <ArrowUpRight size={17} className="directional" />
          </AppLink>
        </article>

        <article className="admin-panel admin-health-panel">
          <span className="admin-health-icon">
            <ShieldAlert size={26} />
          </span>
          <span className="eyebrow">{label("adminStaleContent")}</span>
          <strong className="admin-health-number">
            {overview.data.staleContent}
          </strong>
          <h2>{label("adminContentHealth")}</h2>
          <p>{label("adminContentHealthBody")}</p>
          <AppLink className="text-link" href="/admin/content-health">
            {label("adminReviewStale")}
            <ArrowUpRight size={16} className="directional" />
          </AppLink>
        </article>

        <article className="admin-panel admin-activity-panel">
          <header className="admin-panel-heading">
            <div>
              <span className="eyebrow">{label("adminActivity")}</span>
              <h2>{label("adminRecentActivity")}</h2>
              <p>{label("adminRecentActivityBody")}</p>
            </div>
            <Activity size={21} />
          </header>
          <ol className="admin-activity-preview">
            {activity.data.slice(0, 4).map((record) => (
              <li key={record.id} data-risk={record.risk}>
                <i />
                <div>
                  <strong>{t(record.action)}</strong>
                  <span>{t(record.resource)}</span>
                  <small>
                    {t(record.actor)} ·{" "}
                    {formatDate(record.at, locale, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </li>
            ))}
          </ol>
          <AppLink className="text-link" href="/admin/activity">
            {label("adminViewActivity")}
            <ArrowUpRight size={16} className="directional" />
          </AppLink>
        </article>

        <aside className="admin-boundary-panel">
          <ShieldAlert size={22} />
          <div>
            <strong>{label("adminPermissionsBoundary")}</strong>
            <p>{label("adminPermissionsBoundaryBody")}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
