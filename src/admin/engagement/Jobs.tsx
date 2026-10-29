import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { string } from "../../services/api/mapping";
import {
  useEngagementConnection,
  useEngagementQuery,
  QueryStatus,
  Pager,
  Empty,
  rows,
} from "../../features/engagement/shared";
import { EngagementConfirm } from "../../features/engagement/Forms";
export function EventJobs() {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [job, setJob] = useState<Record<string, unknown> | null>(null),
    q = useEngagementQuery(
      "event-jobs",
      (signal) =>
        api.get_api_v1_admin_event_jobs({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
      true,
      true,
    );
  return (
    <section>
      <h2>{t({ en: "Event jobs", ar: "مهام الفعاليات" })}</h2>
      <Button variant="outline" onClick={() => void q.refetch()}>
        {t({ en: "Refresh jobs", ar: "تحديث المهام" })}
      </Button>
      <QueryStatus query={q} />
      {q.data && (
        <>
          {rows(q.data.items).map((row) => (
            <div className="engagement-row" key={string(row.id)}>
              <div>
                <strong>
                  {string(row.kind)} · {string(row.status)}
                </strong>
                <p>
                  {t({ en: "Attempts", ar: "المحاولات" })}:{" "}
                  {Number(row.attempts)} · {string(row.errorCode)} ·{" "}
                  {string(row.dueAt)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setJob(structuredClone(row))}
              >
                {t({ en: "Review retry", ar: "مراجعة إعادة المحاولة" })}
              </Button>
            </div>
          ))}
          <Empty items={rows(q.data.items)} />
          <Pager
            page={page}
            total={Number(q.data.totalItems)}
            onChange={setPage}
          />
        </>
      )}
      {job && (
        <EngagementConfirm
          title={t({ en: "Retry event job", ar: "إعادة محاولة مهمة الفعالية" })}
          version={string(job.version)}
          onClose={() => setJob(null)}
          onExecute={(body) =>
            api.post_api_v1_admin_event_jobs_by_id_retry({
              path: { id: string(job.id) },
              body,
            })
          }
        >
          <p>
            {string(job.kind)} · {string(job.id)} · {string(job.status)}
          </p>
          <p>
            {t({
              en: "The server rechecks the relevant action permission. A retry request does not establish job completion.",
              ar: "يعيد الخادم التحقق من صلاحية الإجراء. لا يعني طلب إعادة المحاولة اكتمال المهمة.",
            })}
          </p>
        </EngagementConfirm>
      )}
    </section>
  );
}
