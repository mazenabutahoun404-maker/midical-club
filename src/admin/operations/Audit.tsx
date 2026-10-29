import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import {
  useOperationsConnection,
  useOperationsQuery,
  useOperationsAction,
  Panel,
  QueryStatus,
  Pager,
} from "./shared";
import { Facts, JsonDetails } from "./UI";
import { OperationsEditor } from "./Forms";
import { auditBlob } from "./model";
import { record, string } from "../../services/api/mapping";
export function Audit({ permissions }: { permissions: string[] }) {
  const { api } = useOperationsConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [actor, setActor] = useState(""),
    [filter, setFilter] = useState(""),
    [open, setOpen] = useState(false),
    [id, setId] = useState(""),
    action = useOperationsAction(),
    canRead = permissions.includes("audit.read"),
    canExport = permissions.includes("audit.export");
  const q = useOperationsQuery(
      "audit",
      (signal) =>
        api.get_api_v1_admin_audit_logs({
          query: {
            Page: page,
            PageSize: 20,
            Search: search || undefined,
            From: from || undefined,
            To: to || undefined,
            ActorId: actor || undefined,
            Action: filter || undefined,
          },
          signal,
        }),
      [page, search, from, to, actor, filter],
      canRead,
      true,
    ),
    exported = useOperationsQuery(
      "audit-export",
      (signal) =>
        api.get_api_v1_admin_audit_logs_exports_by_exportId({
          path: { exportId: id },
          signal,
        }),
      id,
      !!id && canExport,
      true,
    );
  return (
    <>
      <Panel title={t({ en: "Audit log", ar: "سجل التدقيق" })}>
        <div className="operations-toolbar">
          {[
            [t({ en: "Search", ar: "بحث" }), search, setSearch],
            [
              t({ en: "From · UTC offset", ar: "من · مع فرق التوقيت" }),
              from,
              setFrom,
            ],
            [
              t({ en: "To · UTC offset", ar: "إلى · مع فرق التوقيت" }),
              to,
              setTo,
            ],
            [t({ en: "Actor ID", ar: "معرّف المنفذ" }), actor, setActor],
            [t({ en: "Action", ar: "الإجراء" }), filter, setFilter],
          ].map(([label, value, set]) => (
            <label key={String(label)}>
              {String(label)}
              <input
                value={String(value)}
                onChange={(e) => {
                  (set as (v: string) => void)(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          ))}
        </div>
        {canRead && (
          <>
            <QueryStatus query={q} />
            {q.data && (
              <>
                {q.data.items.map((row) => (
                  <article className="operations-card" key={row.id}>
                    <Facts
                      value={{
                        action: row.action,
                        actor: row.actorNameSnapshot,
                        actorRolesSnapshot: row.actorRolesSnapshot.join(", "),
                        permissionUsed: row.permissionUsed,
                        entityType: row.entityType,
                        entityId: row.entityId,
                        result: row.result,
                        occurredAt: row.occurredAt,
                        traceId: row.traceId,
                      }}
                    />
                    <JsonDetails
                      label={t({ en: "Before", ar: "قبل" })}
                      value={row.beforeJson}
                    />
                    <JsonDetails
                      label={t({ en: "After", ar: "بعد" })}
                      value={row.afterJson}
                    />
                    <JsonDetails
                      label={t({ en: "Metadata", ar: "البيانات الوصفية" })}
                      value={row.metadataJson}
                    />
                  </article>
                ))}
                <Pager page={page} total={q.data.total} onChange={setPage} />
              </>
            )}
          </>
        )}
      </Panel>
      {canExport && (
        <Panel
          title={t({ en: "Private audit export", ar: "تصدير التدقيق الخاص" })}
        >
          <Button onClick={() => setOpen(true)}>
            {t({ en: "Request audit export", ar: "طلب تصدير التدقيق" })}
          </Button>
          <label>
            {t({ en: "Audit export ID", ar: "معرّف تصدير التدقيق" })}
            <input value={id} onChange={(e) => setId(e.target.value)} />
          </label>
          {id && (
            <>
              <QueryStatus query={exported} />
              {exported.data && <Facts value={exported.data} />}
              <Button variant="outline" onClick={() => void exported.refetch()}>
                {t({ en: "Refresh export status", ar: "تحديث حالة التصدير" })}
              </Button>
              <Button
                disabled={
                  action.busy ||
                  !exported.data?.downloadUrl ||
                  !exported.data.expiresAt ||
                  Date.parse(exported.data.expiresAt) <= Date.now()
                }
                onClick={() =>
                  void action.run(
                    async () => {
                      const result =
                          await api.get_api_v1_admin_audit_logs_exports_by_exportId_download(
                            { path: { exportId: id } },
                          ),
                        blob = auditBlob(result, exported.data!.format),
                        url = URL.createObjectURL(blob),
                        a = document.createElement("a");
                      a.href = url;
                      a.download = `audit-${id}.${exported.data!.format.toLowerCase()}`;
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 10000);
                    },
                    undefined,
                    t({ en: "Export downloaded", ar: "تم تنزيل التصدير" }),
                    false,
                  )
                }
              >
                {t({
                  en: "Download private audit file",
                  ar: "تنزيل ملف التدقيق الخاص",
                })}
              </Button>
              {action.feedback}
            </>
          )}
          {open && (
            <OperationsEditor
              operation="post_api_v1_admin_audit_logs_exports"
              title={t({
                en: "Queue audit export",
                ar: "إضافة تصدير التدقيق للطابور",
              })}
              initial={{
                format: "csv",
                from: from || null,
                to: to || null,
                action: filter || null,
              }}
              requireFields={["format"]}
              onSaved={(v) => setId(string(record(v).exportId))}
              onClose={() => setOpen(false)}
            />
          )}
        </Panel>
      )}
    </>
  );
}
export function SecurityAlerts() {
  const { api } = useOperationsConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    q = useOperationsQuery(
      "security-alerts",
      (signal) =>
        api.get_api_v1_admin_security_alerts({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
      true,
      true,
    ),
    action = useOperationsAction();
  return (
    <Panel title={t({ en: "Security alerts", ar: "التنبيهات الأمنية" })}>
      <QueryStatus query={q} />
      {q.data && (
        <>
          {q.data.items.map((row) => (
            <article className="operations-card" key={row.id}>
              <h3>{row.message}</h3>
              <Facts
                value={{
                  type: row.type,
                  severity: row.severity,
                  createdAt: row.createdAt,
                  readAt: row.readAt,
                }}
              />
              <JsonDetails
                label={t({ en: "Alert metadata", ar: "بيانات التنبيه" })}
                value={row.metadataJson}
              />
              {!row.readAt && (
                <Button
                  disabled={action.busy}
                  onClick={() =>
                    void action.run(() =>
                      api.patch_api_v1_admin_security_alerts_by_id_read({
                        path: { id: row.id },
                      }),
                    )
                  }
                >
                  {t({ en: "Mark as read", ar: "تحديد كمقروء" })}
                </Button>
              )}
            </article>
          ))}
          <Pager page={page} total={q.data.total} onChange={setPage} />
        </>
      )}
      {action.feedback}
    </Panel>
  );
}
