import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import {
  useOperationsConnection,
  useOperationsQuery,
  useOperationsAction,
  Panel,
  QueryStatus,
} from "./shared";
import { Facts, Table, CountCards } from "./UI";
import {
  captureRestorePreview,
  restorePayload,
  type RestorePreview,
} from "./model";
export function Governance({ permissions }: { permissions: string[] }) {
  const { api, session } = useOperationsConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [id, setId] = useState(""),
    [preview, setPreview] = useState<RestorePreview | null>(null),
    [reason, setReason] = useState(""),
    [ack, setAck] = useState(false),
    [now, setNow] = useState(Date.now()),
    client = useQueryClient(),
    action = useOperationsAction();
  const overview = useOperationsQuery(
      "governance-overview",
      (signal) => api.get_api_v1_admin_governance_overview({ signal }),
      "",
      true,
      true,
    ),
    q = useOperationsQuery(
      "governance-versions",
      (signal) =>
        api.get_api_v1_admin_governance_versions({ query: { page }, signal }),
      page,
      permissions.includes("governance_versions.view"),
      true,
    ),
    details = useOperationsQuery(
      "governance-version",
      (signal) =>
        api.get_api_v1_admin_governance_versions_by_id({
          path: { id },
          signal,
        }),
      id,
      !!id && permissions.includes("governance_versions.view"),
      true,
    ),
    compare = useOperationsQuery(
      "governance-compare",
      (signal) =>
        api.get_api_v1_admin_governance_versions_by_id_compare({
          path: { id },
          signal,
        }),
      id,
      !!id && permissions.includes("governance_versions.compare"),
      true,
    );
  useEffect(() => {
    if (!preview) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [preview]);
  const seconds = preview
    ? Math.max(0, Math.ceil((preview.expiresAt - now) / 1000))
    : 0;
  return (
    <>
      <Panel
        title={t({ en: "Governance overview", ar: "نظرة عامة على الحوكمة" })}
      >
        <QueryStatus query={overview} />
        {overview.data && <CountCards value={overview.data} />}
        <div className="operations-toolbar">
          <AppLink href="/admin/approvals">
            {t({ en: "Reviewed access requests", ar: "طلبات الوصول للمراجعة" })}
          </AppLink>
          <AppLink href="/admin/users">
            {t({ en: "User access management", ar: "إدارة وصول المستخدمين" })}
          </AppLink>
        </div>
      </Panel>
      <Panel title={t({ en: "Governance snapshots", ar: "لقطات الحوكمة" })}>
        <QueryStatus query={q} />
        {q.data && (
          <>
            <Table value={q.data} />
            <div className="operations-toolbar">
              {q.data.map((row) => (
                <Button
                  variant="outline"
                  key={row.id}
                  onClick={() => {
                    setId(row.id);
                    setPreview(null);
                    setAck(false);
                    setReason("");
                  }}
                >
                  {t({ en: "Review snapshot", ar: "مراجعة اللقطة" })} #
                  {row.versionNumber}
                </Button>
              ))}
            </div>
            <div className="operations-toolbar">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                {t({ en: "Previous", ar: "السابق" })}
              </Button>
              <span>{page}</span>
              <Button
                variant="outline"
                disabled={!q.data.length}
                onClick={() => setPage(page + 1)}
              >
                {t({ en: "Next", ar: "التالي" })}
              </Button>
            </div>
          </>
        )}
        {id && (
          <section className="operations-card">
            <h3>{t({ en: "Selected snapshot", ar: "اللقطة المحددة" })}</h3>
            <p dir="ltr">{id}</p>
            <QueryStatus query={details} />
            {details.data && <Table value={details.data} />}
            <QueryStatus query={compare} />
            {compare.data && (
              <>
                <h4>{t({ en: "Removed", ar: "المحذوف" })}</h4>
                <Table value={compare.data.removed} />
                <h4>{t({ en: "Added", ar: "المضاف" })}</h4>
                <Table value={compare.data.added} />
              </>
            )}
            <p>
              {t({
                en: "Restoring changes roles and permissions. Review the server policy and differences first.",
                ar: "تؤدي الاستعادة إلى تغيير الأدوار والصلاحيات. راجع سياسة الخادم والفروقات أولاً.",
              })}
            </p>
            <Button
              disabled={action.busy}
              onClick={() =>
                void action.run(
                  async () =>
                    captureRestorePreview(
                      await api.post_api_v1_admin_governance_versions_by_id_restore_preview(
                        { path: { id } },
                      ),
                      id,
                      session,
                    ),
                  (v) => {
                    setPreview(v);
                    setAck(false);
                    setReason("");
                    setNow(Date.now());
                  },
                  t({
                    en: "Preview ready for review",
                    ar: "المعاينة جاهزة للمراجعة",
                  }),
                  false,
                )
              }
            >
              {t({ en: "Preview restore", ar: "معاينة الاستعادة" })}
            </Button>
            {preview && (
              <>
                <Facts value={preview.changes} />
                <p>{preview.policy}</p>
                <p role="status">
                  {t({ en: "Preview expires in", ar: "تنتهي المعاينة خلال" })}{" "}
                  {seconds} {t({ en: "seconds", ar: "ثانية" })}
                </p>
                <label>
                  {t({ en: "Restore reason", ar: "سبب الاستعادة" })}
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
                <label className="engagement-check">
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                  />
                  {t({
                    en: "I reviewed the policy and changes for this snapshot.",
                    ar: "راجعت سياسة هذه اللقطة والتغييرات.",
                  })}
                </label>
                <Button
                  disabled={
                    action.busy || !ack || !reason.trim() || seconds <= 0
                  }
                  onClick={() =>
                    void action.run(
                      () =>
                        api.post_api_v1_admin_governance_versions_by_id_restore(
                          {
                            path: { id },
                            body: restorePayload(
                              preview,
                              id,
                              session,
                              reason,
                              ack,
                            ),
                          },
                        ),
                      async () => {
                        setPreview(null);
                        setAck(false);
                        setId("");
                        await client.cancelQueries();
                        client.clear();
                        await client.invalidateQueries();
                      },
                      t({
                        en: "Governance restored. Access will reload.",
                        ar: "تمت استعادة الحوكمة. سيعاد تحميل الوصول.",
                      }),
                      false,
                    )
                  }
                >
                  {t({
                    en: "Restore reviewed snapshot",
                    ar: "استعادة اللقطة المراجعة",
                  })}
                </Button>
              </>
            )}
            {action.feedback}
          </section>
        )}
      </Panel>
    </>
  );
}
