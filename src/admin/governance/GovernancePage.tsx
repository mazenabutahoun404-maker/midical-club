import {
  ArrowUpRight,
  BadgeCheck,
  Fingerprint,
  KeyRound,
  Network,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AppLink } from "../../components/navigation/AppLink";
import { useGovernanceOverview } from "./useGovernance";

export default function GovernancePage() {
  const { label, t } = useLocale();
  const overview = useGovernanceOverview();
  if (overview.isPending) return <LoadingState />;
  if (overview.isError)
    return <ErrorState retry={() => void overview.refetch()} />;
  const metrics = [
    {
      label: label("governanceProtectedFounders"),
      value: overview.data.protectedFounders,
      icon: ShieldCheck,
      tone: "red",
    },
    {
      label: label("governanceActiveUsers"),
      value: overview.data.activeUsers,
      icon: UsersRound,
      tone: "russet",
    },
    {
      label: label("governanceRoleCount"),
      value: overview.data.roles,
      icon: KeyRound,
      tone: "plum",
    },
    {
      label: label("governancePending"),
      value: overview.data.pendingRequests,
      icon: ShieldAlert,
      tone: "amber",
    },
  ];
  return (
    <div className="container admin-page governance-page">
      <section className="governance-hero">
        <PageIntro
          eyebrow={label("governanceEyebrow")}
          title={label("governanceTitle")}
          description={label("governanceBody")}
        />
        <div className="governance-lattice" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <span>
            <Fingerprint size={42} />
          </span>
          <small>{label("governanceSignalLive")}</small>
        </div>
      </section>

      <section
        className="governance-metrics"
        aria-label={label("governanceOverview")}
      >
        {metrics.map(({ label: metric, value, icon: Icon, tone }) => (
          <article key={metric} data-tone={tone}>
            <span>
              <Icon size={20} />
            </span>
            <strong>
              {value === null ? "—" : String(value).padStart(2, "0")}
            </strong>
            <small>{metric}</small>
          </article>
        ))}
      </section>
      <p className="access-scope-note">
        {t({
          en: "Counts include records visible to your current permissions. Unavailable counts are shown as —.",
          ar: "تشمل الأعداد السجلات المتاحة لصلاحياتك الحالية. تظهر الأعداد غير المتاحة بعلامة —.",
        })}
      </p>

      <section className="governance-priority-card">
        <div className="governance-priority-signal">
          <ShieldAlert size={24} />
          <i />
        </div>
        <div>
          <span className="eyebrow">{label("governancePriority")}</span>
          <h2>{label("governanceHighRisk")}</h2>
          <p>{label("governanceHighRiskBody")}</p>
        </div>
        <strong>{overview.data.highRiskRequests ?? "—"}</strong>
        <AppLink className="button button-primary" href="/admin/approvals">
          {label("governanceReviewNow")}
          <ArrowUpRight size={17} className="directional" />
        </AppLink>
      </section>

      <section className="governance-grid">
        <article className="governance-boundary-card">
          <div className="governance-card-icon">
            <BadgeCheck size={25} />
          </div>
          <span className="eyebrow">
            {t({ en: "PROTECTED ACCOUNTS", ar: "الحسابات المحمية" })}
          </span>
          <h2>{label("governanceFounderBoundary")}</h2>
          <p>{label("governanceFounderBoundaryBody")}</p>
          <div className="governance-founder-stack" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index}>
                <ShieldCheck size={16} />
              </span>
            ))}
          </div>
        </article>
        <article className="governance-model-card">
          <header>
            <Network size={22} />
            <h2>{label("governanceModel")}</h2>
          </header>
          <div>
            <KeyRound size={19} />
            <span>
              <strong>{label("governanceRoleModel")}</strong>
              <small>{label("governanceRoleModelBody")}</small>
            </span>
          </div>
          <div>
            <UsersRound size={19} />
            <span>
              <strong>{label("governanceMembershipModel")}</strong>
              <small>{label("governanceMembershipModelBody")}</small>
            </span>
          </div>
          <div>
            <Sparkles size={19} />
            <span>
              <strong>{label("governanceTitleModel")}</strong>
              <small>{label("governanceTitleModelBody")}</small>
            </span>
          </div>
        </article>
        <nav
          className="governance-action-card"
          aria-label={label("governanceNavigation")}
        >
          <AppLink href="/admin/users">
            <UsersRound size={23} />
            <span>
              <strong>{label("governanceOpenUsers")}</strong>
              <small>{label("governanceUsersBody")}</small>
            </span>
            <ArrowUpRight size={18} className="directional" />
          </AppLink>
          <AppLink href="/admin/roles">
            <KeyRound size={23} />
            <span>
              <strong>{label("governanceOpenRoles")}</strong>
              <small>{label("governanceRolesBody")}</small>
            </span>
            <ArrowUpRight size={18} className="directional" />
          </AppLink>
        </nav>
      </section>
    </div>
  );
}
