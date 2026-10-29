import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import {
  useOperationsConnection,
  useOperationsQuery,
  useOperationsAction,
  Panel,
  QueryStatus,
  Pager,
} from "./shared";
import { Facts, Table, CountCards, JsonDetails, ObservedTrend } from "./UI";
import { OperationsEditor } from "./Forms";
import { internalHealthPath, reportUrl } from "./model";
import { record, string } from "../../services/api/mapping";
export function Overview() {
  const { api } = useOperationsConnection(),
    { t } = useLocale(),
    q = useOperationsQuery(
      "overview",
      (signal) => api.get_api_v1_admin_overview({ signal }),
      "",
      true,
      true,
    );
  return (
    <Panel
      title={t({ en: "Operations overview", ar: "نظرة عامة على العمليات" })}
    >
      <QueryStatus query={q} />
      {q.data && (
        <>
          <CountCards value={q.data} />
          <Facts value={{ generatedAt: q.data.generatedAt }} />
          <JsonDetails
            label={t({ en: "Metric definitions", ar: "تعريفات المقاييس" })}
            value={q.data.definitions}
          />
        </>
      )}
    </Panel>
  );
}
export function Analytics({ permissions }: { permissions: string[] }) {
  const { api } = useOperationsConnection(),
    { t } = useLocale(),
    [range, setRange] = useState("30d"),
    [through, setThrough] = useState(""),
    [module, setModule] = useState<
      | "overview"
      | "content"
      | "academic"
      | "search"
      | "contributions"
      | "events"
      | "store"
      | "mentorship"
      | "teams"
    >("overview"),
    [date, setDate] = useState(""),
    [team, setTeam] = useState(""),
    [event, setEvent] = useState(false);
  const q = useOperationsQuery(
      "analytics-range",
      (signal) =>
        api.get_api_v1_admin_analytics_range({
          query: { range, through: through || undefined },
          signal,
        }),
      [range, through],
      true,
      true,
    ),
    m = useOperationsQuery(
      "analytics-module",
      (signal) =>
        api.get_api_v1_admin_analytics_by_module({
          path: { module },
          query: { date: date || undefined, teamId: team || undefined },
          signal,
        }),
      [module, date, team],
      true,
      true,
    );
  return (
    <>
      <Panel title={t({ en: "Engagement analytics", ar: "تحليلات التفاعل" })}>
        <div className="operations-toolbar">
          <label>
            {t({ en: "Range", ar: "الفترة" })}
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              {["7d", "30d", "90d"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            {t({ en: "Through date", ar: "حتى تاريخ" })}
            <input
              type="date"
              value={through}
              onChange={(e) => setThrough(e.target.value)}
            />
          </label>
        </div>
        <QueryStatus query={q} />
        {q.data && (
          <>
            <Facts
              value={{
                mode: q.data.mode,
                from: q.data.from,
                through: q.data.through,
                timezone: q.data.timezone,
                minimumCohort: q.data.minimumCohort,
                generatedAt: q.data.generatedAt,
              }}
            />
            <p>
              {t({
                en: "Completed UTC days. — means unavailable or suppressed; it does not mean zero.",
                ar: "أيام مكتملة بتوقيت UTC. الرمز — يعني غير متاح أو محجوب؛ ولا يعني صفراً.",
              })}
            </p>
            <CountCards value={q.data.totals} />
            <ObservedTrend points={q.data.points} />
            <Table value={q.data.points} />
            <h3>{t({ en: "Funnel", ar: "مراحل التفاعل" })}</h3>
            <Table value={q.data.funnel} />
            {(["topContent", "courseDemand"] as const).map((k) => (
              <section key={k}>
                <h3>
                  {k === "topContent"
                    ? t({ en: "Top content", ar: "المحتوى الأبرز" })
                    : t({ en: "Course demand", ar: "الطلب على المقررات" })}
                </h3>
                {q.data[k] === null ? (
                  <p>
                    {t({
                      en: "Unavailable or suppressed",
                      ar: "غير متاح أو محجوب",
                    })}
                  </p>
                ) : (
                  <Table value={q.data[k]} />
                )}
              </section>
            ))}
            <JsonDetails
              label={t({
                en: "Definitions and suppression",
                ar: "التعريفات والحجب",
              })}
              value={q.data.definitions}
            />
          </>
        )}
      </Panel>
      <Panel title={t({ en: "Module analytics", ar: "تحليلات الأقسام" })}>
        <div className="operations-toolbar">
          <label>
            {t({ en: "Module", ar: "القسم" })}
            <select
              value={module}
              onChange={(e) => setModule(e.target.value as typeof module)}
            >
              {[
                "overview",
                "content",
                "academic",
                "search",
                "contributions",
                "events",
                "store",
                "mentorship",
                "teams",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            {t({ en: "Date", ar: "التاريخ" })}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            {t({ en: "Team ID (optional)", ar: "معرّف الفريق (اختياري)" })}
            <input value={team} onChange={(e) => setTeam(e.target.value)} />
          </label>
        </div>
        <QueryStatus query={m} />
        {m.data && (
          <>
            <Facts value={m.data} />
            <CountCards
              value={{ dau: m.data.dau, wau: m.data.wau, mau: m.data.mau }}
            />
            <Table value={m.data.metrics} />
            <Table value={m.data.domainMetrics} />
          </>
        )}
      </Panel>
      {permissions.includes("analytics.reports.export") && <ReportExports />}
      <Panel
        title={t({ en: "Record an analytics event", ar: "تسجيل حدث تحليلي" })}
      >
        <p>
          {t({
            en: "Use a real event and resource. This control records one explicit event; opening this page does not create analytics events.",
            ar: "استخدم حدثاً ومورداً حقيقيين. يسجل هذا الإجراء حدثاً واحداً؛ فتح الصفحة لا ينشئ أحداثاً.",
          })}
        </p>
        <Button onClick={() => setEvent(true)}>
          {t({ en: "Review event", ar: "مراجعة الحدث" })}
        </Button>
        {event && (
          <OperationsEditor
            operation="post_api_v1_analytics_events"
            title={t({ en: "Record event", ar: "تسجيل الحدث" })}
            requireFields={["eventName", "resourceType", "resourceId"]}
            onClose={() => setEvent(false)}
          />
        )}
      </Panel>
    </>
  );
}
function ReportExports() {
  const { api } = useOperationsConnection(),
    { t } = useLocale(),
    [open, setOpen] = useState(false),
    [id, setId] = useState(""),
    q = useOperationsQuery(
      "report-export",
      (signal) =>
        api.get_api_v1_admin_reports_exports_by_id({ path: { id }, signal }),
      id,
      !!id,
      true,
    ),
    url = reportUrl(q.data);
  return (
    <Panel title={t({ en: "Report exports", ar: "تصدير التقارير" })}>
      <Button onClick={() => setOpen(true)}>
        {t({ en: "Request report export", ar: "طلب تصدير تقرير" })}
      </Button>
      <label>
        {t({ en: "Export ID", ar: "معرّف التصدير" })}
        <input value={id} onChange={(e) => setId(e.target.value)} />
      </label>
      {id && (
        <>
          <QueryStatus query={q} />
          {q.data && <Facts value={q.data} />}
          <Button variant="outline" onClick={() => void q.refetch()}>
            {t({ en: "Refresh export", ar: "تحديث التصدير" })}
          </Button>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer">
              {t({ en: "Download export", ar: "تنزيل التصدير" })}
            </a>
          )}
        </>
      )}
      {open && (
        <OperationsEditor
          operation="post_api_v1_admin_reports_exports"
          title={t({ en: "Request export", ar: "طلب التصدير" })}
          requireFields={["reportType", "date", "format"]}
          initial={{
            format: "csv",
            date: new Date().toISOString().slice(0, 10),
          }}
          onSaved={(v) => setId(string(record(v).id))}
          onClose={() => setOpen(false)}
        />
      )}
    </Panel>
  );
}
export function ContentHealth() {
  const { api } = useOperationsConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [kind, setKind] = useState(""),
    [search, setSearch] = useState(""),
    q = useOperationsQuery(
      "content-health",
      (signal) =>
        api.get_api_v1_admin_content_health({
          query: {
            Page: page,
            PageSize: 20,
            kind: kind || undefined,
            Search: search || undefined,
          },
          signal,
        }),
      [page, kind, search],
      true,
      true,
    );
  return (
    <Panel title={t({ en: "Content health", ar: "صحة المحتوى" })}>
      <div className="operations-toolbar">
        <label>
          {t({ en: "Content kind", ar: "نوع المحتوى" })}
          <input
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          {t({ en: "Search content", ar: "البحث في المحتوى" })}
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <CountCards value={{ score: q.data.score, ...q.data.counts }} />
          {q.data.records.map((row) => {
            const href = internalHealthPath(row.href);
            return (
              <article className="operations-card" key={row.id}>
                <h3>
                  {(locale === "ar" ? row.title.ar : row.title.en) ||
                    row.title.en ||
                    row.title.ar ||
                    row.id}
                </h3>
                <Facts
                  value={{
                    kind: row.kind,
                    severity: row.severity,
                    score: row.score,
                    updatedAt: row.updatedAt,
                  }}
                />
                <p>{row.issues.join(" · ")}</p>
                {row.unknownChecks.length > 0 && (
                  <p>
                    {t({ en: "Checks unavailable", ar: "فحوصات غير متاحة" })}:{" "}
                    {row.unknownChecks.join(" · ")}
                  </p>
                )}
                {href && (
                  <AppLink href={href}>
                    {t({ en: "Open content", ar: "فتح المحتوى" })}
                  </AppLink>
                )}
              </article>
            );
          })}
          <Pager page={page} total={q.data.total} onChange={setPage} />
          <JsonDetails
            value={q.data.definitions}
            label={t({ en: "Scoring definitions", ar: "تعريفات التقييم" })}
          />
        </>
      )}
    </Panel>
  );
}
