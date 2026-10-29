import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { string } from "../../services/api/mapping";
import { publicationVersion } from "../../services/api/publication-contracts";
import {
  usePublicationConnection,
  usePublicationQuery,
  QueryStatus,
  Panel,
  rows,
} from "../../features/publications/shared";
import { ActionDialog } from "./ActionDialog";
export function Monitoring({ canRetry }: { canRetry: boolean }) {
  const { api } = usePublicationConnection(),
    { t } = useLocale(),
    [job, setJob] = useState<Record<string, unknown> | null>(null),
    q = usePublicationQuery(
      "publication-monitoring",
      (signal) => api.get_api_v1_admin_medclub_team_monitoring({ signal }),
      "",
      true,
      true,
    );
  return (
    <Panel
      title={t({
        en: "Publication jobs and schedules",
        ar: "مهام المنشورات والجدولة",
      })}
    >
      <Button variant="outline" onClick={() => void q.refetch()}>
        {t({ en: "Refresh status", ar: "تحديث الحالة" })}
      </Button>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <p>
            {t({
              en: "Search index backlog",
              ar: "المهام المؤجلة لفهرس البحث",
            })}
            : {Number(q.data.indexBacklog)}
          </p>
          {["scheduleCounts", "backgroundCounts"].map((key) => (
            <dl className="publication-counts" key={key}>
              {rows(q.data[key as "scheduleCounts"]).map((row) => (
                <div key={string(row.status)}>
                  <dt>{string(row.status)}</dt>
                  <dd>{Number(row.count)}</dd>
                </div>
              ))}
            </dl>
          ))}
          <h3>
            {t({ en: "Failed background jobs", ar: "مهام الخلفية الفاشلة" })}
          </h3>
          {rows(q.data.failedBackground).map((row) => (
            <div key={string(row.id)} className="publication-row">
              <div>
                <strong>{string(row.kind)}</strong>
                <p>
                  {Number(row.attempts)} · {string(row.errorCode)}
                </p>
              </div>
              {canRetry && (
                <Button
                  variant="outline"
                  onClick={() => setJob(structuredClone(row))}
                >
                  {t({ en: "Retry job", ar: "إعادة محاولة المهمة" })}
                </Button>
              )}
            </div>
          ))}
          <h3>
            {t({
              en: "Failed publication schedules",
              ar: "جداول النشر الفاشلة",
            })}
          </h3>
          {rows(q.data.failedSchedules).map((row) => (
            <p key={string(row.id)}>
              {string(row.resourceId)} · {string(row.action)} ·{" "}
              {Number(row.attempts)} · {string(row.errorCode)}
            </p>
          ))}
          <h3>
            {t({ en: "About page schedules", ar: "جدولة صفحة نبذة النادي" })}
          </h3>
          {rows(q.data.aboutSchedules).map((row) => (
            <p key={string(row.id)}>
              {string(row.action)} · {Number(row.attempts)} ·{" "}
              {string(row.error)}
            </p>
          ))}
        </>
      )}
      {job && (
        <ActionDialog
          kind="retry"
          title={string(job.kind)}
          version={publicationVersion(job.version)}
          onClose={() => setJob(null)}
          onExecute={(body) =>
            api.post_api_v1_admin_medclub_team_jobs_by_id_retry({
              path: { id: string(job.id) },
              body,
            })
          }
        />
      )}
    </Panel>
  );
}
