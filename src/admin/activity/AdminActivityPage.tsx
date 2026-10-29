import AdminOperationsPage from "../operations/AdminOperationsPage";
import {useServices} from "../../app/providers/ServicesProvider";
import { useMemo, useState } from "react";
import {
  Activity,
  Ban,
  CheckCircle2,
  ChevronRight,
  Fingerprint,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { formatDate } from "../../lib/dates";
import type { AdminActivityRecord } from "../../types/admin";
import { useAdminActivity } from "../useAdmin";

type RiskFilter = "all" | AdminActivityRecord["risk"];

function PreviewAdminActivityPage() {
  const { label, t, locale } = useLocale();
  const activity = useAdminActivity();
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState<RiskFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase();
    return (activity.data || []).filter((item) => {
      if (risk !== "all" && item.risk !== risk) return false;
      if (!value) return true;
      return [t(item.actor), t(item.role), t(item.action), t(item.resource)]
        .join(" ")
        .toLocaleLowerCase()
        .includes(value);
    });
  }, [activity.data, risk, search, t]);
  const selected =
    (activity.data || []).find((item) => item.id === selectedId) ||
    filtered[0] ||
    null;
  if (activity.isPending) return <LoadingState />;
  if (activity.isError)
    return <ErrorState retry={() => void activity.refetch()} />;
  return (
    <div className="container admin-page admin-activity-page">
      <PageIntro
        eyebrow={label("adminActivityEyebrow")}
        title={label("adminActivityTitle")}
        description={label("adminActivityBody")}
      />
      <aside className="admin-audit-rule">
        <Fingerprint size={22} />
        <p>{label("adminAuditRule")}</p>
      </aside>
      <div className="admin-activity-toolbar">
        <label className="admin-search-field">
          <Search size={18} />
          <span className="sr-only">{label("adminSearchActivity")}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={label("adminSearchActivity")}
          />
        </label>
        <label className="admin-kind-filter">
          <span className="sr-only">{label("adminAllRisk")}</span>
          <select
            value={risk}
            onChange={(event) => setRisk(event.target.value as RiskFilter)}
          >
            <option value="all">{label("adminAllRisk")}</option>
            <option value="normal">{label("adminRiskNormal")}</option>
            <option value="attention">{label("adminRiskAttention")}</option>
            <option value="high">{label("adminRiskHigh")}</option>
          </select>
        </label>
      </div>
      <div className="admin-activity-workbench">
        <section className="admin-log-list" aria-label={label("adminActivity")}>
          {filtered.length ? (
            filtered.map((record) => (
              <button
                type="button"
                className="admin-log-row"
                data-active={selected?.id === record.id || undefined}
                data-risk={record.risk}
                key={record.id}
                onClick={() => setSelectedId(record.id)}
              >
                <span className="admin-log-result" data-result={record.result}>
                  {record.result === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Ban size={18} />
                  )}
                </span>
                <span className="admin-log-copy">
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
                </span>
                <span className="admin-risk-chip" data-risk={record.risk}>
                  {label(
                    record.risk === "high"
                      ? "adminRiskHigh"
                      : record.risk === "attention"
                        ? "adminRiskAttention"
                        : "adminRiskNormal",
                  )}
                </span>
                <ChevronRight size={17} className="directional" />
              </button>
            ))
          ) : (
            <div className="admin-log-empty">
              <Activity size={28} />
              <p>{label("adminNoActivity")}</p>
            </div>
          )}
        </section>
        <section className="admin-log-inspector" aria-live="polite">
          {selected && <ActivityDetail record={selected} />}
        </section>
      </div>
    </div>
  );
}

function ActivityDetail({ record }: { record: AdminActivityRecord }) {
  const { label, t, locale } = useLocale();
  const entries = (value?: Record<string, string>) =>
    Object.entries(value || {});
  return (
    <article className="admin-activity-detail" data-risk={record.risk}>
      <header>
        <span className="admin-log-result" data-result={record.result}>
          {record.result === "success" ? (
            <CheckCircle2 size={21} />
          ) : (
            <ShieldAlert size={21} />
          )}
        </span>
        <div>
          <span className="admin-risk-chip" data-risk={record.risk}>
            {label(
              record.risk === "high"
                ? "adminRiskHigh"
                : record.risk === "attention"
                  ? "adminRiskAttention"
                  : "adminRiskNormal",
            )}
          </span>
          <h2>{t(record.action)}</h2>
          <p>{t(record.resource)}</p>
        </div>
      </header>
      <dl className="admin-activity-facts">
        <div>
          <dt>{label("adminContributor")}</dt>
          <dd>{t(record.actor)}</dd>
        </div>
        <div>
          <dt>{label("adminRole")}</dt>
          <dd>{t(record.role)}</dd>
        </div>
        <div>
          <dt>{label("date")}</dt>
          <dd>
            {formatDate(record.at, locale, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </dd>
        </div>
        <div>
          <dt>{label("status")}</dt>
          <dd>
            {label(
              record.result === "success"
                ? "adminResultSuccess"
                : "adminResultBlocked",
            )}
          </dd>
        </div>
      </dl>
      <div className="admin-change-grid">
        <section>
          <span>{label("adminBefore")}</span>
          {entries(record.before).map(([key, value]) => (
            <p key={key}>
              <b>{key}</b>
              <code>{value}</code>
            </p>
          ))}
        </section>
        <section>
          <span>{label("adminAfter")}</span>
          {entries(record.after).map(([key, value]) => (
            <p key={key}>
              <b>{key}</b>
              <code>{value}</code>
            </p>
          ))}
        </section>
      </div>
    </article>
  );
}

export default function AdminActivityPage(){const services=useServices();return services.operationsApi?<AdminOperationsPage initial="audit"/>:<PreviewAdminActivityPage/>}
