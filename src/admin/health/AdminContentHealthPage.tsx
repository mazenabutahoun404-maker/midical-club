import AdminOperationsPage from "../operations/AdminOperationsPage";
import {useServices} from "../../app/providers/ServicesProvider";
import { useMemo, useState, type CSSProperties } from "react";
import { ArrowUpRight, Download, FileCheck2, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AppLink } from "../../components/navigation/AppLink";
import type { MessageKey } from "../../constants/messages";
import { downloadCsv } from "../../lib/csv";
import { formatDate } from "../../lib/dates";
import { useContentHealth } from "../../features/insights/useInsights";
import type { ContentHealthIssueCode, ContentHealthRecord } from "../../types/insights";

const issueKeys: Record<ContentHealthIssueCode, MessageKey> = {
  "missing-file": "healthIssueMissingFile",
  "missing-reviewer": "healthIssueMissingReviewer",
  "missing-references": "healthIssueMissingReferences",
  "missing-translation": "healthIssueMissingTranslation",
  "rights-unconfirmed": "healthIssueRightsUnconfirmed",
  stale: "healthIssueStale",
};

const kinds: ContentHealthRecord["kind"][] = ["resource", "article", "contribution", "homepage", "event", "opportunity"];

function PreviewAdminContentHealthPage() {
  const { label, t, locale } = useLocale();
  const query = useContentHealth();
  const [severity, setSeverity] = useState<"all" | ContentHealthRecord["severity"]>("all");
  const [kind, setKind] = useState<"all" | ContentHealthRecord["kind"]>("all");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => (query.data?.records || []).filter((record) => {
    const needle = search.trim().toLocaleLowerCase(locale);
    return (severity === "all" || record.severity === severity) &&
      (kind === "all" || record.kind === kind) &&
      (!needle || [record.title.en, record.title.ar, record.context.en, record.context.ar].join(" ").toLocaleLowerCase(locale).includes(needle));
  }), [kind, locale, query.data?.records, search, severity]);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const data = query.data;
  const exportHealth = () => {
    downloadCsv("medclub-content-health.csv", [
      ["id", "kind", "title_en", "title_ar", "score", "status", "issues", "updated_at", "source_href"],
      ...filtered.map((record) => [record.sourceId, record.kind, record.title.en, record.title.ar, record.score, record.severity, record.issues.join("|"), record.updatedAt, record.href]),
    ]);
    toast.success(label("insightsExported"));
  };
  const kindLabel = (value: ContentHealthRecord["kind"]) => label(value === "resource" ? "resources" : value === "article" ? "journal" : value === "contribution" ? "myContributions" : value === "homepage" ? "home" : value === "event" ? "events" : "opportunities");
  return (
    <div className="container admin-page health-page">
      <section className="health-hero">
        <div>
          <span className="eyebrow">{label("healthEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>{label("healthTitle")}</h1>
          <p>{label("healthBody")}</p>
        </div>
        <div className="health-orb" style={{ "--health-score": data.score } as CSSProperties}><FileCheck2 size={28} /><strong>{data.score}</strong><span>/ 100</span></div>
      </section>
      <p className="insights-source-note" role="status"><span>{label("insightsAdminNotice")}</span><small>{label("insightsGenerated")} · {formatDate(data.generatedAt, locale)}</small></p>
      <section className="health-summary" aria-label={label("healthOverall")}>
        <button type="button" aria-pressed={severity === "all"} onClick={() => setSeverity("all")}><span>{data.records.length}</span><strong>{label("healthAll")}</strong></button>
        <button type="button" data-severity="critical" aria-pressed={severity === "critical"} onClick={() => setSeverity("critical")}><span>{data.counts.critical}</span><strong>{label("healthCritical")}</strong></button>
        <button type="button" data-severity="attention" aria-pressed={severity === "attention"} onClick={() => setSeverity("attention")}><span>{data.counts.attention}</span><strong>{label("healthAttention")}</strong></button>
        <button type="button" data-severity="healthy" aria-pressed={severity === "healthy"} onClick={() => setSeverity("healthy")}><span>{data.counts.healthy}</span><strong>{label("healthHealthy")}</strong></button>
      </section>
      <div className="health-toolbar">
        <label className="health-search"><Search size={18} /><span className="sr-only">{label("healthSearch")}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={label("healthSearch")} /></label>
        <label><span className="sr-only">{label("healthAllKinds")}</span><select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="all">{label("healthAllKinds")}</option>{kinds.map((item) => <option key={item} value={item}>{kindLabel(item)}</option>)}</select></label>
        <button type="button" className="button button-secondary" onClick={exportHealth}><Download size={17} />{label("insightsExport")}</button>
      </div>
      <p className="health-explainer"><ShieldAlert size={18} />{label("healthScoring")}</p>
      <div className="health-list" aria-live="polite">
        {filtered.map((record) => <article className="health-record" data-severity={record.severity} key={record.id}>
          <div className="health-score"><strong>{record.score}</strong><span>/100</span></div>
          <div className="health-record-copy"><span className="health-kind">{kindLabel(record.kind)} · {t(record.context)}</span><h2>{t(record.title)}</h2><p>{formatDate(record.updatedAt, locale)}</p><div className="health-tags">{record.issues.length ? record.issues.map((issue) => <span key={issue}>{label(issueKeys[issue])}</span>) : <span className="healthy">{label("healthHealthy")}</span>}</div></div>
          <AppLink className="health-open" href={record.href} aria-label={`${label("healthOpenItem")}: ${t(record.title)}`}><ArrowUpRight size={19} className="directional" /></AppLink>
        </article>)}
        {!filtered.length && <p className="health-empty">{label("healthEmpty")}</p>}
      </div>
    </div>
  );
}

export default function AdminContentHealthPage(){const services=useServices();return services.operationsApi?<AdminOperationsPage initial="health"/>:<PreviewAdminContentHealthPage/>}
