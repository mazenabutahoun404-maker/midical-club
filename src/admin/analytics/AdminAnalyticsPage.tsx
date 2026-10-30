import { useState } from "react";
import { Activity, Bookmark, Download, Search, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { downloadCsv } from "../../lib/csv";
import { formatDate } from "../../lib/dates";
import { EngagementTrend } from "../../features/insights/InsightCharts";
import { useAdminAnalytics } from "../../features/insights/useInsights";
import type { AnalyticsRange } from "../../types/insights";

const ranges: AnalyticsRange[] = ["7d", "30d", "90d"];

export default function AdminAnalyticsPage() {
  const { label, t, locale } = useLocale();
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const query = useAdminAnalytics(range);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const data = query.data;
  const metrics = [
    { label: label("insightsAverageActive"), value: data.totals.activeStudents.toLocaleString(locale), icon: UsersRound },
    { label: label("insightsResourceOpens"), value: data.totals.resourceOpens.toLocaleString(locale), icon: Activity },
    { label: label("insightsSearches"), value: data.totals.searches.toLocaleString(locale), icon: Search },
    { label: label("insightsSaves"), value: data.totals.saves.toLocaleString(locale), icon: Bookmark },
  ];
  const exportData = () => {
    downloadCsv(`medclub-analytics-${range}.csv`, [
      ["date", "active_students", "resource_opens", "searches", "saves"],
      ...data.points.map((point) => [point.date, point.activeStudents, point.resourceOpens, point.searches, point.saves]),
    ]);
    toast.success(label("insightsExported"));
  };
  const maxFunnel = Math.max(...data.funnel.map((item) => item.value), 1);
  const maxContent = Math.max(...data.topContent.map((item) => item.value), 1);
  return (
    <div className="container admin-page insights-admin-page">
      <section className="insights-hero">
        <div>
          <span className="eyebrow">{label("insightsEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>{label("insightsTitle")}</h1>
          <p>{label("insightsBody")}</p>
        </div>
        <div className="insights-pulse" aria-hidden="true"><i /><span /><b /></div>
      </section>
      <div className="insights-toolbar">
        <div className="insights-range" role="group" aria-label={label("insightsEngagementTrend")}>
          {ranges.map((item) => <button type="button" key={item} aria-pressed={range === item} onClick={() => setRange(item)}>{label(item === "7d" ? "insightsLast7" : item === "30d" ? "insightsLast30" : "insightsLast90")}</button>)}
        </div>
        <button type="button" className="button button-secondary" onClick={exportData}><Download size={17} />{label("insightsExport")}</button>
      </div>
      <p className="insights-source-note" role="status"><span>{label("insightsAdminNotice")}</span><small>{label("insightsGenerated")} · {formatDate(data.generatedAt, locale)}</small></p>
      <section className="insights-metrics" aria-label={label("adminAnalytics")}>
        {metrics.map(({ label: name, value, icon: Icon }) => <article key={name}><Icon size={20} /><strong>{value}</strong><span>{name}</span></article>)}
        <article className="insight-rate-card"><Bookmark size={20} /><strong>{data.totals.saveRate}%</strong><span>{label("insightsSaveRate")}</span></article>
      </section>
      <section className="insights-dashboard-grid">
        <article className="insight-panel insight-trend-panel">
          <header><h2>{label("insightsEngagementTrend")}</h2><p>{label("insightsTrendBody")}</p></header>
          <EngagementTrend points={data.points} labels={{ opens: label("insightsResourceOpens"), searches: label("insightsSearches"), saves: label("insightsSaves"), accessible: label("insightsEngagementTrend") }} />
        </article>
        <article className="insight-panel insight-funnel-panel">
          <header><h2>{label("insightsFunnel")}</h2><p>{label("insightsFunnelBody")}</p></header>
          <ol>{data.funnel.map((item, index) => <li key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{t(item.label)}</strong><i><b style={{ width: `${(item.value / maxFunnel) * 100}%` }} /></i></div><em>{item.value.toLocaleString(locale)}</em></li>)}</ol>
        </article>
        <article className="insight-panel insight-ranking-panel">
          <header><h2>{label("insightsTopContent")}</h2><p>{label("insightsTopContentBody")}</p></header>
          <div>{data.topContent.map((item) => <section key={item.id}><span><strong>{t(item.label)}</strong><small>{item.value.toLocaleString(locale)} {label("insightsOpens")} · {item.secondary.toLocaleString(locale)} {label("insightsSaves")}</small></span><i><b style={{ width: `${(item.value / maxContent) * 100}%` }} /></i></section>)}</div>
        </article>
        <article className="insight-panel insight-demand-panel">
          <header><h2>{label("insightsCourseDemand")}</h2><p>{label("insightsCourseDemandBody")}</p></header>
          <div>{data.courseDemand.map((item, index) => <section key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{t(item.label)}</strong><small>{item.value.toLocaleString(locale)} {label("insightsOpens")} · {item.secondary.toLocaleString(locale)} {label("insightsInterest")}</small></div></section>)}</div>
        </article>
      </section>
      <p className="insights-boundary-note">{label("insightsNoLiveData")}</p>
    </div>
  );
}
