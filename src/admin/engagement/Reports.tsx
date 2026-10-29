import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
import { reports } from "../../services/api/engagement-contracts";
import {
  useEngagementConnection,
  useEngagementQuery,
  QueryStatus,
} from "../../features/engagement/shared";
import { EngagementEditor } from "../../features/engagement/Forms";
import { AssetAction } from "../../features/engagement/Events";
const permission: Record<string, string> = {
  registrations: "events.registrations.view",
  attendance: "attendance.view",
  evaluations: "events.evaluations.view",
  certificates: "certificates.issue",
  "volunteer-hours": "volunteer_hours.view_all",
};
const labels: Record<string, { en: string; ar: string }> = {
  registrations: { en: "Registrations", ar: "التسجيلات" },
  attendance: { en: "Attendance", ar: "الحضور" },
  evaluations: { en: "Evaluations", ar: "التقييمات" },
  certificates: { en: "Certificates", ar: "الشهادات" },
  "volunteer-hours": { en: "Volunteer hours", ar: "الساعات التطوعية" },
};
export function EventReports({
  eventId,
  permissions,
}: {
  eventId: string;
  permissions: string[];
}) {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    available = reports.filter(
      (r) =>
        permissions.includes(permission[r]) ||
        (r === "evaluations" && permissions.includes("events.view_admin")),
    ),
    [selected, setSelected] = useState(""),
    report = (available as readonly string[]).includes(selected)
      ? selected
      : available[0],
    [exporting, setExporting] = useState(false),
    [exportId, setExportId] = useState(""),
    [manualId, setManualId] = useState(""),
    q = useEngagementQuery(
      "event-report",
      (signal) =>
        api.get_api_v1_admin_events_by_id_reports_by_report({
          path: { id: eventId, report: report as (typeof reports)[number] },
          signal,
        }),
      [eventId, report],
      !!report,
      true,
    ),
    status = useEngagementQuery(
      "event-export",
      (signal) =>
        api.get_api_v1_admin_event_exports_by_id({
          path: { id: exportId },
          signal,
        }),
      exportId,
      !!exportId,
      true,
    );
  return (
    <section>
      <h3>{t({ en: "Reports", ar: "التقارير" })}</h3>
      {available.length ? (
        <>
          <label>
            {t({ en: "Report", ar: "التقرير" })}
            <select
              value={report}
              onChange={(e) => setSelected(e.target.value)}
            >
              {available.map((r) => (
                <option key={r} value={r}>
                  {t(labels[r])}
                </option>
              ))}
            </select>
          </label>
          <QueryStatus query={q} />
          {q.data && <Metrics value={q.data} />}
        </>
      ) : (
        <p>
          {t({
            en: "No report read permission is available.",
            ar: "لا تتوفر صلاحية لقراءة التقارير.",
          })}
        </p>
      )}
      {report && permissions.includes("event_reports.export") && (
        <Button variant="outline" onClick={() => setExporting(true)}>
          {t({ en: "Request export", ar: "طلب التصدير" })}
        </Button>
      )}
      <form
        className="engagement-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setExportId(manualId.trim());
        }}
      >
        <label>
          {t({ en: "Export request ID", ar: "معرّف طلب التصدير" })}
          <input
            required
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
          />
        </label>
        <Button variant="outline" type="submit">
          {t({ en: "Check export", ar: "فحص التصدير" })}
        </Button>
      </form>
      {exportId && (
        <>
          <QueryStatus query={status} />
          {status.data && (
            <>
              <p role="status">
                {status.data.status} · {status.data.failureCode}
              </p>
              <p>
                {t({ en: "Expires", ar: "ينتهي" })}: {status.data.expiresAt}
              </p>
              {status.data.assetId &&
                (!status.data.expiresAt ||
                  Date.parse(status.data.expiresAt) > Date.now()) && (
                  <AssetAction
                    assetId={status.data.assetId}
                    download
                    label={t({
                      en: "Load export download",
                      ar: "تحميل رابط التصدير",
                    })}
                  />
                )}
              <Button variant="outline" onClick={() => void status.refetch()}>
                {t({ en: "Refresh export status", ar: "تحديث حالة التصدير" })}
              </Button>
            </>
          )}
        </>
      )}
      {exporting && (
        <EngagementEditor
          title={t({ en: "Export event report", ar: "تصدير تقرير الفعالية" })}
          schema="EventExportRequest"
          initial={{ report, format: "CSV" }}
          description={t({
            en: "This queues an export. Use a format supported by your backend. The generated asset is checked separately.",
            ar: "يضيف هذا طلب تصدير إلى قائمة التنفيذ. استخدم صيغة يدعمها الخادم. يُفحص الملف الناتج بشكل منفصل.",
          })}
          onClose={() => setExporting(false)}
          onSave={async (body) => {
            const result =
              await api.post_api_v1_admin_events_by_id_reports_export({
                path: { id: eventId },
                body: body as Schemas["EventExportRequest"],
              });
            setExportId(string(result.id));
            setManualId(string(result.id));
            return result;
          }}
        />
      )}
    </section>
  );
}
export function Metrics({
  value,
  depth = 0,
}: {
  value: unknown;
  depth?: number;
}) {
  if (depth > 5) return null;
  if (Array.isArray(value))
    return (
      <div className="engagement-metrics-list">
        {value.map((item, index) => (
          <div key={index}>
            <Metrics value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  if (value && typeof value === "object")
    return (
      <dl className="engagement-metrics">
        {Object.entries(record(value)).map(([key, v]) => (
          <div key={key}>
            <dt>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt>
            <dd>
              <Metrics value={v} depth={depth + 1} />
            </dd>
          </div>
        ))}
      </dl>
    );
  return (
    <>
      {value == null
        ? "—"
        : typeof value === "boolean"
          ? String(value)
          : String(value)}
    </>
  );
}
