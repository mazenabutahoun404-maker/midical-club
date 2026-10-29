import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { AcademicFields, AcademicPager } from "../academics/AcademicUI";
import { blockTypes, parseObject, reasonField } from "./content-fields";
import { refreshContent } from "./content-cache";
import { C } from "./content-keys";
import { createRecordId } from "../../lib/record-id";
import type { Schemas, Operations } from "../../services/api/schema.generated";
type Reusable =
  Operations["get_api_v1_admin_content_reusable_blocks_by_id"]["response"];
export function ContentReusablePanel() {
  const c = useServices().contentApi!,
    { t } = useLocale(),
    client = useQueryClient();
  const [page, setPage] = useState(1),
    [id, setId] = useState(""),
    [vp, setVp] = useState(1),
    [ip, setIp] = useState(1),
    [edit, setEdit] = useState<{
      kind: string;
      record?: Reusable;
      versionId?: string;
      key: string;
    } | null>(null),
    [draft, setDraft] = useState<Record<string, unknown>>({}),
    [json, setJson] = useState("{}"),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [snapshot, setSnapshot] = useState("");
  const list = useQuery({
      queryKey: ["native-content", "reusables", page],
      queryFn: () => c[C.reusables]({ query: { Page: page, PageSize: 20 } }),
    }),
    detail = useQuery({
      queryKey: ["native-content", "reusable", id],
      queryFn: () => c[C.reusable]({ path: { id } }),
      enabled: !!id,
    }),
    versions = useQuery({
      queryKey: ["native-content", "reusable-versions", id, vp],
      queryFn: () =>
        c[C.reusableVersions]({
          path: { id },
          query: { Page: vp, PageSize: 20 },
        }),
      enabled: !!id,
    }),
    impact = useQuery({
      queryKey: ["native-content", "reusable-impact", id, ip],
      queryFn: () =>
        c[C.reusableImpact]({
          path: { id },
          query: { Page: ip, PageSize: 20 },
        }),
      enabled: !!id,
    });
  const open = (kind: string, record?: Reusable, versionId?: string) => {
    setEdit({ kind, record, versionId, key: createRecordId() });
    setDraft(
      kind === "edit" && record
        ? {
            name: record.name,
            displayAr: record.nameAr,
            displayEn: record.nameEn,
            descriptionAr: record.descriptionAr,
            descriptionEn: record.descriptionEn,
            blockType: record.blockType,
            teamId: record.teamId,
          }
        : kind === "create"
          ? { name: "", blockType: "Text" }
          : { reason: "", disabled: record?.securityDisabled },
    );
    setJson(record?.configurationJson || "{}");
    setError(null);
    setAck(false);
  };
  const label = (kind: string) =>
    t(
      (
        {
          create: {
            en: "Create reusable block",
            ar: "إنشاء كتلة قابلة لإعادة الاستخدام",
          },
          edit: {
            en: "Edit reusable block",
            ar: "تعديل الكتلة القابلة لإعادة الاستخدام",
          },
          publish: {
            en: "Publish reusable block",
            ar: "نشر الكتلة القابلة لإعادة الاستخدام",
          },
          archive: {
            en: "Archive reusable block",
            ar: "أرشفة الكتلة القابلة لإعادة الاستخدام",
          },
          security: {
            en: "Change security policy",
            ar: "تغيير السياسة الأمنية",
          },
          restore: {
            en: "Restore reusable version",
            ar: "استعادة نسخة الكتلة",
          },
        } as Record<string, { en: string; ar: string }>
      )[kind] || { en: "Reusable block", ar: "كتلة قابلة لإعادة الاستخدام" },
    );
  return (
    <section className="access-management-card">
      <h2>
        {t({ en: "Reusable blocks", ar: "الكتل القابلة لإعادة الاستخدام" })}
      </h2>
      <Button onClick={() => open("create")}>{label("create")}</Button>
      <ApiActionError
        error={
          error || list.error || detail.error || versions.error || impact.error
        }
        onReload={() => {
          setEdit(null);
          void refreshContent(client);
        }}
      />
      {list.data?.items.map((row) => (
        <div className="access-row" key={row.id}>
          <span>
            <strong>{row.nameEn || row.nameAr || row.name}</strong>
            <small>
              {row.blockType} · {row.status}
            </small>
          </span>
          <Button
            variant="outline"
            onClick={() => {
              setId(row.id);
              setIp(1);
              setVp(1);
            }}
          >
            {t({ en: "Inspect", ar: "عرض" })}
          </Button>
        </div>
      ))}
      {list.data && (
        <AcademicPager
          page={page}
          totalPages={list.data.totalPages}
          onChange={setPage}
        />
      )}
      {detail.data && (
        <div className="access-management-card">
          <h3>{detail.data.name}</h3>
          <p>
            {detail.data.status} ·{" "}
            {detail.data.securityDisabled
              ? t({ en: "Security disabled", ar: "معطلة أمنيًا" })
              : t({ en: "Security enabled", ar: "مفعلة أمنيًا" })}
          </p>
          <div className="account-security-actions">
            {["edit", "publish", "security", "archive"].map((kind) => (
              <Button
                key={kind}
                variant="outline"
                onClick={() => open(kind, detail.data)}
              >
                {label(kind)}
              </Button>
            ))}
          </div>
          <details>
            <summary>{t({ en: "Configuration", ar: "الإعدادات" })}</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {detail.data.configurationJson}
            </pre>
          </details>
          <h3>
            {t({
              en: "Published-page impact",
              ar: "الأثر على الصفحات المنشورة",
            })}
          </h3>
          {impact.data?.publishedPages.items.map((item) => (
            <p key={item.id}>
              {item.slug} · {item.status}
            </p>
          ))}
          {impact.data && (
            <AcademicPager
              page={ip}
              totalPages={impact.data.publishedPages.totalPages}
              onChange={setIp}
            />
          )}
          <h3>{t({ en: "Versions", ar: "النسخ" })}</h3>
          {versions.data?.items.map((item) => (
            <div className="access-row" key={item.id}>
              <span>
                {item.versionNumber} ·{" "}
                {new Date(item.createdAt).toLocaleString()}
              </span>
              <div className="access-row-actions">
                <Button
                  variant="outline"
                  onClick={() => setSnapshot(item.snapshotJson)}
                >
                  {t({ en: "Inspect snapshot", ar: "عرض النسخة" })}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => open("restore", detail.data, item.id)}
                >
                  {label("restore")}
                </Button>
              </div>
            </div>
          ))}
          {versions.data && (
            <AcademicPager
              page={vp}
              totalPages={versions.data.totalPages}
              onChange={setVp}
            />
          )}
        </div>
      )}
      {snapshot && <pre style={{ whiteSpace: "pre-wrap" }}>{snapshot}</pre>}
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) setEdit(null);
        }}
        title={label(edit?.kind || "")}
        description={edit?.record?.name || ""}
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!edit || !ack) return;
            setBusy(true);
            setError(null);
            try {
              const isSave = edit.kind === "create" || edit.kind === "edit";
              if (isSave) {
                const body = {
                  name: String(draft.name || ""),
                  blockType: draft.blockType,
                  configuration: parseObject(json),
                  teamId: draft.teamId || null,
                  version: edit.record?.version,
                  displayName: {
                    ar: draft.displayAr || null,
                    en: draft.displayEn || null,
                  },
                  description: {
                    ar: draft.descriptionAr || null,
                    en: draft.descriptionEn || null,
                  },
                } as Schemas["ReusableRequest"];
                if (edit.record)
                  await c[C.updateReusable]({
                    path: { id: edit.record.id! },
                    body,
                    idempotencyKey: edit.key,
                  });
                else await c[C.addReusable]({ body, idempotencyKey: edit.key });
              } else {
                const body = {
                  version: edit.record!.version!,
                  reason: String(draft.reason || ""),
                  publishImmediately: false,
                };
                const input = {
                  path: { id: edit.record!.id! },
                  body,
                  idempotencyKey: edit.key,
                };
                if (edit.kind === "publish") await c[C.publishReusable](input);
                if (edit.kind === "archive") await c[C.archiveReusable](input);
                if (edit.kind === "security")
                  await c[C.disableReusable]({
                    ...input,
                    query: { disabled: draft.disabled === true },
                  });
                if (edit.kind === "restore")
                  await c[C.restoreReusable]({
                    ...input,
                    path: { id: edit.record!.id!, versionId: edit.versionId! },
                  });
              }
              setEdit(null);
              await refreshContent(client);
            } catch (caught) {
              setError(caught);
            } finally {
              setBusy(false);
            }
          }}
        >
          {["create", "edit"].includes(edit?.kind || "") ? (
            <>
              <AcademicFields
                fields={[
                  {
                    key: "name",
                    label: { en: "Internal name", ar: "الاسم الداخلي" },
                    required: true,
                  },
                  {
                    key: "displayAr",
                    label: {
                      en: "Arabic display name",
                      ar: "اسم العرض بالعربية",
                    },
                  },
                  {
                    key: "displayEn",
                    label: {
                      en: "English display name",
                      ar: "اسم العرض بالإنجليزية",
                    },
                  },
                  {
                    key: "descriptionAr",
                    label: { en: "Arabic description", ar: "الوصف بالعربية" },
                  },
                  {
                    key: "descriptionEn",
                    label: {
                      en: "English description",
                      ar: "الوصف بالإنجليزية",
                    },
                  },
                  {
                    key: "blockType",
                    label: { en: "Block type", ar: "نوع الكتلة" },
                    options: blockTypes,
                    required: true,
                  },
                  {
                    key: "teamId",
                    label: {
                      en: "Team reference (optional)",
                      ar: "معرّف الفريق (اختياري)",
                    },
                  },
                ]}
                value={draft}
                onChange={setDraft}
                disabled={busy}
              />
              <label>
                {t({ en: "Configuration (JSON)", ar: "الإعدادات (JSON)" })}
                <textarea
                  rows={10}
                  dir="ltr"
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  disabled={busy}
                />
              </label>
            </>
          ) : (
            <AcademicFields
              fields={[
                ...(edit?.kind === "security"
                  ? [
                      {
                        key: "disabled",
                        label: {
                          en: "Disable this reusable block",
                          ar: "تعطيل هذه الكتلة القابلة لإعادة الاستخدام",
                        },
                        type: "checkbox" as const,
                      },
                    ]
                  : []),
                reasonField,
              ]}
              value={draft}
              onChange={setDraft}
              disabled={busy}
            />
          )}
          <label>
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              disabled={busy}
            />
            {t({
              en: "I reviewed the change and its publication impact.",
              ar: "راجعت التغيير وأثره على النشر.",
            })}
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setEdit(null);
              void refreshContent(client);
            }}
          />
          <Button disabled={busy || !ack}>
            {t({ en: "Confirm", ar: "تأكيد" })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
export function ContentEmbedPanel() {
  const c = useServices().contentApi!,
    { t } = useLocale(),
    client = useQueryClient();
  const [selected, setSelected] = useState<
      | Operations["get_api_v1_admin_content_embed_providers"]["response"][number]
      | null
    >(null),
    [hosts, setHosts] = useState(""),
    [enabled, setEnabled] = useState(false),
    [reason, setReason] = useState(""),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [key, setKey] = useState(createRecordId());
  const list = useQuery({
    queryKey: ["native-content", "embed-providers"],
    queryFn: () => c[C.embeds]({}),
  });
  return (
    <section className="access-management-card">
      <h2>
        {t({ en: "Trusted embed providers", ar: "مزودو التضمين الموثوقون" })}
      </h2>
      <ApiActionError error={error || list.error} />
      {list.data?.map((item) => (
        <div className="access-row" key={item.id}>
          <span>
            <strong>{item.name}</strong>
            <small>
              {item.enabled
                ? t({ en: "Enabled", ar: "مفعّل" })
                : t({ en: "Disabled", ar: "معطّل" })}{" "}
              · {item.hostsJson}
            </small>
          </span>
          <Button
            variant="outline"
            onClick={() => {
              try {
                const values: unknown = JSON.parse(item.hostsJson);
                if (
                  !Array.isArray(values) ||
                  values.some((v) => typeof v !== "string")
                )
                  throw new Error("Invalid saved hosts");
                setHosts(values.join("\n"));
                setSelected(item);
                setEnabled(item.enabled);
                setReason("");
                setAck(false);
                setError(null);
                setKey(createRecordId());
              } catch (caught) {
                setError(caught);
              }
            }}
          >
            {t({ en: "Edit provider", ar: "تعديل المزود" })}
          </Button>
        </div>
      ))}
      <Modal
        open={!!selected}
        onClose={() => {
          if (!busy) setSelected(null);
        }}
        title={t({ en: "Edit trusted provider", ar: "تعديل المزود الموثوق" })}
        description={selected?.name || ""}
      >
        <form
          className="account-api-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selected || !ack) return;
            setBusy(true);
            setError(null);
            try {
              await c[C.updateEmbed]({
                path: { id: selected.id },
                body: {
                  version: selected.version,
                  enabled,
                  hosts: hosts.split(/\s+/).filter(Boolean),
                  reason,
                },
                idempotencyKey: key,
              });
              setSelected(null);
              await refreshContent(client);
            } catch (caught) {
              setError(caught);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={busy}
            />
            {t({ en: "Enabled", ar: "مفعّل" })}
          </label>
          <label>
            {t({
              en: "Allowed hosts (one per line)",
              ar: "المضيفون المسموحون (واحد في كل سطر)",
            })}
            <textarea
              rows={6}
              value={hosts}
              onChange={(e) => setHosts(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            {t({ en: "Reason", ar: "السبب" })}
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              disabled={busy}
            />
            {t({
              en: "I reviewed the allowed host changes.",
              ar: "راجعت تغيير المضيفين المسموحين.",
            })}
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setSelected(null);
              void list.refetch();
            }}
          />
          <Button disabled={busy || !ack || !reason.trim()}>
            {t({ en: "Save provider", ar: "حفظ المزود" })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
