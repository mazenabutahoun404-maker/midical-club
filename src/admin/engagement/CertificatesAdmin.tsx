import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
import {
  useEngagementConnection,
  useEngagementQuery,
  useEngagementAction,
  QueryStatus,
  Pager,
  Empty,
  rows,
} from "../../features/engagement/shared";
import {
  EngagementEditor,
  EngagementConfirm,
} from "../../features/engagement/Forms";
import { AssetAction } from "../../features/engagement/Events";
export function CertificateTemplates() {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [editing, setEditing] = useState<{
      id?: string;
      version?: string;
      initial: Record<string, unknown>;
    } | null>(null),
    q = useEngagementQuery(
      "certificate-templates",
      (signal) =>
        api.get_api_v1_admin_certificate_templates({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
      true,
      true,
    ),
    action = useEngagementAction();
  return (
    <section>
      <h2>{t({ en: "Certificate templates", ar: "قوالب الشهادات" })}</h2>
      <Button
        onClick={() =>
          setEditing({
            initial: {
              name: "",
              titleAr: "",
              titleEn: null,
              status: "Draft",
              layout: {
                accentColor: "#842b32",
                subtitleAr: null,
                footerAr: null,
                placeholders: [],
              },
              backgroundAssetId: null,
            },
          })
        }
      >
        {t({ en: "New template", ar: "قالب جديد" })}
      </Button>
      <QueryStatus query={q} />
      {q.data && (
        <>
          {rows(q.data.items).map((row) => (
            <div key={string(row.id)} className="engagement-row">
              <div>
                <strong>
                  {string(row.name)} · {string(row.status)}
                </strong>
                <p>
                  {string(row.titleAr)} · #{Number(row.templateVersion)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  void action.run(
                    async () => {
                      const layout = JSON.parse(string(row.layoutJson));
                      return {
                        name: row.name,
                        titleAr: row.titleAr,
                        titleEn: row.titleEn,
                        status: row.status,
                        layout,
                        backgroundAssetId: row.backgroundAssetId,
                      };
                    },
                    (initial) =>
                      setEditing({
                        id: string(row.id),
                        version: string(row.version),
                        initial,
                      }),
                    "",
                    false,
                  )
                }
              >
                {t({ en: "Edit template", ar: "تعديل القالب" })}
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
      {action.feedback}
      {editing && (
        <EngagementEditor
          title={t({ en: "Certificate template", ar: "قالب الشهادة" })}
          schema="EventTemplateRequest"
          initial={editing.initial}
          version={editing.version}
          onClose={() => setEditing(null)}
          onSave={(body) =>
            editing.id
              ? api.put_api_v1_admin_certificate_templates_by_id({
                  path: { id: editing.id },
                  body: body as Schemas["EventTemplateRequest"],
                })
              : api.post_api_v1_admin_certificate_templates({
                  body: body as Schemas["EventTemplateRequest"],
                })
          }
        />
      )}
    </section>
  );
}
export function EventCertificatesAdmin({
  eventId,
  eventVersion,
  permissions,
}: {
  eventId: string;
  eventVersion: string;
  permissions: string[];
}) {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [command, setCommand] = useState<{
      kind: "issue" | "revoke" | "reissue";
      id?: string;
      version?: string;
    } | null>(null),
    [queued, setQueued] = useState<number | null>(null),
    [versions, setVersions] = useState<Record<string, string>>({}),
    can = (p: string) => permissions.includes("certificates." + p),
    q = useEngagementQuery(
      "event-certificates",
      (signal) =>
        api.get_api_v1_admin_events_by_id_certificates({
          path: { id: eventId },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [eventId, page],
      can("issue"),
      true,
    );
  return (
    <section>
      {can("issue") && (
        <>
          <Button
            disabled={!eventVersion}
            onClick={() => setCommand({ kind: "issue", version: eventVersion })}
          >
            {t({
              en: "Queue certificate issuance",
              ar: "إضافة إصدار الشهادات إلى قائمة التنفيذ",
            })}
          </Button>
          {queued !== null && (
            <p role="status">
              {t({
                en: "Queued, still processing",
                ar: "في قائمة التنفيذ، ما زالت قيد المعالجة",
              })}
              : {queued}
            </p>
          )}
          <QueryStatus query={q} />
          {q.data && (
            <>
              {rows(q.data.items).map((row) => (
                <div className="engagement-row" key={string(row.id)}>
                  <div>
                    <strong>
                      {string(row.status)} · …
                      {string(row.verificationCodeDisplaySuffix)}
                    </strong>
                    <p>
                      {string(row.issuedAt)} · {string(row.failureCode)}
                    </p>
                    {row.superseded === true && (
                      <p>{t({ en: "Superseded", ar: "مستبدلة" })}</p>
                    )}
                    {!!row.pdfAssetId && (
                      <AssetAction assetId={string(row.pdfAssetId)} download />
                    )}
                  </div>
                  <div className="student-connected-actions">
                    {(["revoke", "reissue"] as const)
                      .filter(can)
                      .map((kind) => (
                        <Button
                          key={kind}
                          variant="outline"
                          onClick={() =>
                            setCommand({
                              kind,
                              id: string(row.id),
                              version: versions[string(row.id)],
                            })
                          }
                        >
                          {t(
                            kind === "revoke"
                              ? { en: "Revoke", ar: "إلغاء الشهادة" }
                              : { en: "Reissue", ar: "إعادة الإصدار" },
                          )}
                        </Button>
                      ))}
                  </div>
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
        </>
      )}
      {!can("issue") && (can("revoke") || can("reissue")) && (
        <CertificateById
          onSelect={(id, kind) => setCommand({ id, kind })}
          permissions={permissions}
        />
      )}
      {command && (
        <EngagementConfirm
          title={t({
            en: command.kind + " certificate",
            ar: "إجراء على الشهادة",
          })}
          version={command.version}
          onClose={() => setCommand(null)}
          onExecute={async (body) => {
            if (command.kind === "issue") {
              const result =
                await api.post_api_v1_admin_events_by_id_certificates_issue({
                  path: { id: eventId },
                  body,
                });
              setQueued(Number(result.queued));
              return result;
            }
            const result =
              command.kind === "revoke"
                ? await api.post_api_v1_admin_certificates_by_id_revoke({
                    path: { id: command.id! },
                    body,
                  })
                : await api.post_api_v1_admin_certificates_by_id_reissue({
                    path: { id: command.id! },
                    body,
                  });
            if (result.id && result.version)
              setVersions((v) => ({ ...v, [result.id!]: result.version! }));
            return result;
          }}
        >
          <p>{command.id || eventId}</p>
          {command.kind === "issue" ? (
            <p>
              {t({
                en: "This queues work. Eligibility and generated PDFs must be checked after processing.",
                ar: "يضيف هذا العمل إلى قائمة التنفيذ. يجب التحقق من الأهلية وملفات PDF بعد المعالجة.",
              })}
            </p>
          ) : (
            !command.version && (
              <p>
                {t({
                  en: "The certificate list does not provide a concurrency version. This action sends its ID and reason; the server must validate its current state.",
                  ar: "لا توفر قائمة الشهادات إصدارًا للتحقق من التزامن. يرسل الإجراء المعرّف والسبب، ويتحقق الخادم من الحالة الحالية.",
                })}
              </p>
            )
          )}
        </EngagementConfirm>
      )}
    </section>
  );
}
function CertificateById({
  onSelect,
  permissions,
}: {
  onSelect: (id: string, kind: "revoke" | "reissue") => void;
  permissions: string[];
}) {
  const { t } = useLocale(),
    [id, setId] = useState("");
  return (
    <div>
      <label>
        {t({ en: "Certificate ID", ar: "معرّف الشهادة" })}
        <input value={id} onChange={(e) => setId(e.target.value)} />
      </label>
      {(["revoke", "reissue"] as const)
        .filter((kind) => permissions.includes("certificates." + kind))
        .map((kind) => (
          <Button
            key={kind}
            variant="outline"
            disabled={!id.trim()}
            onClick={() => onSelect(id.trim(), kind)}
          >
            {t(
              kind === "revoke"
                ? { en: "Review revocation", ar: "مراجعة إلغاء الشهادة" }
                : { en: "Review reissue", ar: "مراجعة إعادة الإصدار" },
            )}
          </Button>
        ))}
    </div>
  );
}
