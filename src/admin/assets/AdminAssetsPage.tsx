import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../governance/useGovernance";
import { PageIntro } from "../../components/data-display/PageIntro";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AcademicFields, AcademicPager } from "../academics/AcademicUI";
import type { Field } from "../academics/academic-fields";
import type { Operations, Schemas } from "../../services/api/schema.generated";
import { createRecordId } from "../../lib/record-id";
import { FileUploadWorkbench } from "../../features/resources/FileUploadWorkbench";
import { AssetImportPanel } from "./AssetImportPanel";
import "../../styles/account-access.css";
import "../../styles/academic-admin.css";
type Asset = Operations["get_api_v1_admin_assets_by_assetId"]["response"];
const reasonField: Field = {
  key: "reason",
  label: { en: "Reason", ar: "السبب" },
  type: "textarea",
  required: true,
};
const targetTypes = [
  "Page",
  "PageSection",
  "PageBlock",
  "ReusableBlock",
  "ContentVersion",
  "SubjectOffering",
  "BatchIdentity",
  "ImportRecord",
  "StoreProduct",
  "StoreEvidence",
  "StoreReport",
  "PublicContentVersion",
  "ContributionDraft",
  "ContributionRevision",
  "MemberProfile",
  "Event",
  "Certificate",
  "CertificateTemplate",
  "VolunteerEvidence",
  "EventReport",
];
export default function AdminAssetsPage() {
  const owner = useAuth().snapshot.user?.id || "guest";
  return <AssetManager key={owner} />;
}
function AssetManager() {
  const services = useServices(),
    assets = services.assets!,
    { t } = useLocale(),
    client = useQueryClient(),
    access = useAccess();
  const can = (permission: string) =>
    !!access.data?.permissions?.includes(permission);
  const [tab, setTab] = useState("files"),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [fullText, setFullText] = useState(false),
    [selected, setSelected] = useState(""),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [team, setTeam] = useState(""),
    [purpose, setPurpose] = useState("Content"),
    [offering, setOffering] = useState("");
  const [edit, setEdit] = useState<{
      kind: string;
      asset: Asset;
      linkId?: string;
      key: string;
    } | null>(null),
    [draft, setDraft] = useState<Record<string, unknown>>({}),
    [ack, setAck] = useState(false),
    [fileAccess, setFileAccess] = useState<{
      url: string;
      expiresAt: string;
    } | null>(null);
  const list = useQuery({
    queryKey: ["assets-admin", "files", page, query, fullText],
    queryFn: async () =>
      fullText
        ? assets.search({ Q: query, Page: page, PageSize: 20 })
        : assets.list({ Search: query || undefined, Page: page, PageSize: 20 }),
    enabled: tab === "files",
  });
  const detail = useQuery({
    queryKey: ["assets-admin", "asset", selected],
    queryFn: () => assets.get(selected),
    enabled: !!selected && tab === "files",
  });
  const processing = useQuery({
    queryKey: ["assets-admin", "processing", selected],
    queryFn: () => assets.processing(selected),
    enabled: !!selected && tab === "files",
  });
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["assets-admin"] }),
      client.invalidateQueries({ queryKey: ["resources"] }),
      client.invalidateQueries({ queryKey: ["course-content"] }),
    ]);
  };
  const open = (kind: string, asset: Asset, linkId?: string) => {
    setError(null);
    setAck(false);
    setEdit({ kind, asset, linkId, key: createRecordId() });
    setDraft(
      kind === "metadata"
        ? {
            displayName: asset.displayName,
            descriptionAr: asset.descriptionAr,
            descriptionEn: asset.descriptionEn,
          }
        : kind === "policy"
          ? {
              previewAllowed: asset.previewAllowed,
              downloadAllowed: asset.downloadAllowed,
              reason: "",
            }
          : kind === "link"
            ? { targetType: "SubjectOffering", requireReview: true, reason: "" }
            : kind === "retry"
              ? { processType: "", pageNumbers: "", reason: "" }
              : { reason: "" },
    );
  };
  const submit = async () => {
    if (!edit || busy || !ack) return;
    setBusy(true);
    setError(null);
    try {
      const { asset, key } = edit;
      const body = { ...draft, version: asset.version };
      if (edit.kind === "metadata")
        await assets.updateMetadata(
          asset.id,
          body as Schemas["AssetMetadataRequest"],
          key,
        );
      if (edit.kind === "policy")
        await assets.policy(
          asset.id,
          body as Schemas["AssetPolicyRequest"],
          key,
        );
      if (edit.kind === "delete")
        await assets.remove(asset.id, body as Schemas["AssetAction"], key);
      if (edit.kind === "restore")
        await assets.restore(asset.id, body as Schemas["AssetAction"], key);
      if (edit.kind === "unlink")
        await assets.unlink(
          asset.id,
          edit.linkId!,
          body as Schemas["AssetAction"],
          key,
        );
      if (edit.kind === "link") {
        const result = await assets.link(
          asset.id,
          {
            ...body,
            requireReview:
              draft.targetType === "SubjectOffering"
                ? true
                : draft.requireReview === true,
          } as Schemas["AssetLinkRequest"],
          key,
        );
        setNotice(
          t({
            en: "Link created. Review reference",
            ar: "تم إنشاء الرابط. معرّف المراجعة",
          }) +
            ": " +
            result.id,
        );
      }
      if (edit.kind === "retry") {
        const numbers = String(draft.pageNumbers || "")
          .split(/[\s,]+/)
          .filter(Boolean)
          .map(Number);
        if (numbers.some((n) => !Number.isInteger(n) || n < 1))
          throw new Error(
            t({
              en: "Enter positive page numbers.",
              ar: "أدخل أرقام صفحات صحيحة موجبة.",
            }),
          );
        await assets.retry(
          asset.id,
          { ...body, pageNumbers: numbers } as Schemas["AssetRetryRequest"],
          key,
        );
      }
      setEdit(null);
      setFileAccess(null);
      await refresh();
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const title = (kind: string) =>
    t(
      (
        {
          metadata: { en: "Edit file metadata", ar: "تعديل بيانات الملف" },
          policy: { en: "File access policy", ar: "سياسة الوصول للملف" },
          delete: { en: "Delete file", ar: "حذف الملف" },
          restore: { en: "Restore file", ar: "استعادة الملف" },
          link: { en: "Attach file", ar: "ربط الملف" },
          unlink: { en: "Remove file link", ar: "إزالة رابط الملف" },
          retry: { en: "Retry processing", ar: "إعادة محاولة المعالجة" },
        } as Record<string, { en: string; ar: string }>
      )[kind] || { en: "File", ar: "الملف" },
    );
  const fields: Field[] =
    edit?.kind === "metadata"
      ? [
          {
            key: "displayName",
            label: { en: "Display name", ar: "اسم العرض" },
          },
          {
            key: "descriptionAr",
            label: { en: "Arabic description", ar: "الوصف بالعربية" },
            type: "textarea",
          },
          {
            key: "descriptionEn",
            label: { en: "English description", ar: "الوصف بالإنجليزية" },
            type: "textarea",
          },
        ]
      : edit?.kind === "policy"
        ? [
            {
              key: "previewAllowed",
              label: { en: "Allow preview", ar: "السماح بالمعاينة" },
              type: "checkbox",
            },
            {
              key: "downloadAllowed",
              label: { en: "Allow download", ar: "السماح بالتنزيل" },
              type: "checkbox",
            },
            reasonField,
          ]
        : edit?.kind === "link"
          ? [
              {
                key: "targetType",
                label: { en: "Attach to", ar: "الربط بـ" },
                options: targetTypes,
                required: true,
              },
              {
                key: "targetId",
                label: {
                  en: "Target record reference",
                  ar: "معرّف السجل المستهدف",
                },
                required: true,
              },
              {
                key: "requireReview",
                label: {
                  en: "Require review before publication",
                  ar: "اشتراط المراجعة قبل النشر",
                },
                type: "checkbox",
              },
              reasonField,
            ]
          : edit?.kind === "retry"
            ? [
                {
                  key: "processType",
                  label: { en: "Processing task", ar: "مهمة المعالجة" },
                  required: true,
                },
                {
                  key: "pageNumbers",
                  label: {
                    en: "Page numbers (optional, comma-separated)",
                    ar: "أرقام الصفحات (اختياري، مفصولة بفواصل)",
                  },
                },
                reasonField,
              ]
            : [reasonField];
  return (
    <div className="container academic-admin">
      <PageIntro
        title={t({
          en: "Files & academic resources",
          ar: "الملفات والموارد الأكاديمية",
        })}
        description={t({
          en: "Upload, verify and attach files. Publishing and review are separate steps.",
          ar: "ارفع الملفات وتحقق منها واربطها. النشر والمراجعة خطوتان منفصلتان.",
        })}
      />
      <nav
        className="academic-admin-tabs"
        aria-label={t({ en: "File administration", ar: "إدارة الملفات" })}
      >
        {[
          "files",
          ...(can("assets.upload") || can("assets.import.execute")
            ? ["upload"]
            : []),
          ...(can("assets.import.preview") || can("assets.import.execute")
            ? ["imports"]
            : []),
        ].map((id) => (
          <button
            key={id}
            aria-pressed={tab === id}
            onClick={() => {
              setTab(id);
              setError(null);
            }}
          >
            {t(
              id === "files"
                ? { en: "Files", ar: "الملفات" }
                : id === "upload"
                  ? { en: "Upload", ar: "رفع" }
                  : { en: "Import jobs", ar: "عمليات الاستيراد" },
            )}
          </button>
        ))}
      </nav>
      {tab === "upload" && (
        <section className="access-management-card account-api-form">
          <AcademicFields
            fields={[
              {
                key: "teamId",
                label: {
                  en: "Team reference (optional)",
                  ar: "معرّف الفريق (اختياري)",
                },
              },
              {
                key: "purpose",
                label: { en: "File purpose", ar: "غرض الملف" },
                required: true,
              },
              {
                key: "offeringId",
                label: {
                  en: "Course offering reference (optional)",
                  ar: "معرّف المساق المطروح (اختياري)",
                },
              },
            ]}
            value={{ teamId: team, purpose, offeringId: offering }}
            onChange={(v) => {
              setTeam(String(v.teamId || ""));
              setPurpose(String(v.purpose || ""));
              setOffering(String(v.offeringId || ""));
            }}
          />
          <FileUploadWorkbench
            key={`${team}:${purpose}:${offering}`}
            teamId={team || undefined}
            purpose={purpose}
            offeringId={offering || undefined}
            onQueued={() => void refresh()}
          />
        </section>
      )}
      {tab === "imports" && <AssetImportPanel />}
      {tab === "files" && (
        <section className="access-management-card">
          <form
            className="account-api-form access-management-toolbar"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search);
              setPage(1);
            }}
          >
            <input
              aria-label={t({ en: "Search files", ar: "البحث عن الملفات" })}
              value={search}
              maxLength={100}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={fullText}
                onChange={(e) => {
                  setFullText(e.target.checked);
                  setPage(1);
                }}
              />
              {t({ en: "Search file text", ar: "البحث في نصوص الملفات" })}
            </label>
            <Button>{t({ en: "Search", ar: "بحث" })}</Button>
          </form>
          {list.isFetching && <LoadingState />}
          <ApiActionError
            error={error || list.error || detail.error || processing.error}
            onReload={() => {
              setEdit(null);
              void refresh();
            }}
          />
          {notice && <p role="status">{notice}</p>}
          {list.data && (
            <>
              <p>
                {t({ en: "Visible results", ar: "النتائج المتاحة" })}:{" "}
                {list.data.total}
              </p>
              {list.data.items.map((row, index) => {
                const id = "assetId" in row ? row.assetId : row.id;
                return (
                  <div className="access-row" key={`${id}-${index}`}>
                    <span>
                      <strong>{row.displayName || row.originalFileName}</strong>
                      <small>
                        {"snippet" in row
                          ? row.snippet
                          : "status" in row
                            ? row.status
                            : ""}
                      </small>
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelected(id);
                        setFileAccess(null);
                      }}
                    >
                      {t({ en: "Inspect", ar: "عرض" })}
                    </Button>
                  </div>
                );
              })}
              <AcademicPager
                page={page}
                totalPages={
                  "totalPages" in list.data
                    ? list.data.totalPages
                    : Math.ceil(list.data.total / 20)
                }
                onChange={setPage}
              />
            </>
          )}
          {detail.data && (
            <div className="access-management-card">
              <h2>{detail.data.displayName || detail.data.originalFileName}</h2>
              <p className="academic-record-id">{detail.data.id}</p>
              <p>
                {detail.data.status} · {detail.data.assetType} ·{" "}
                {detail.data.sizeBytes} B
              </p>
              <p>
                {t({
                  en: "Malware / text extraction / OCR / index",
                  ar: "الفحص الأمني / استخراج النص / OCR / الفهرسة",
                })}
                : {detail.data.malwareScanStatus} /{" "}
                {detail.data.textExtractionStatus} / {detail.data.ocrStatus} /{" "}
                {detail.data.searchIndexStatus}
              </p>
              <div className="account-security-actions">
                {[
                  "metadata",
                  "policy",
                  "delete",
                  "restore",
                  ...(can("assets.link") ? ["link"] : []),
                  ...(can("assets.malware.review") ? ["retry"] : []),
                ].map((kind) => (
                  <Button
                    key={kind}
                    variant="outline"
                    disabled={busy || detail.isFetching}
                    onClick={() => open(kind, detail.data)}
                  >
                    {title(kind)}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void refresh()}
                >
                  {t({ en: "Refresh status", ar: "تحديث الحالة" })}
                </Button>
                {["preview", "download"].map((kind) => (
                  <Button
                    variant="outline"
                    key={kind}
                    onClick={async () => {
                      setError(null);
                      try {
                        await assets.metadata(selected);
                        setFileAccess(
                          await assets[kind as "preview" | "download"](
                            selected,
                          ),
                        );
                      } catch (caught) {
                        setError(caught);
                      }
                    }}
                  >
                    {t(
                      kind === "preview"
                        ? { en: "Preview link", ar: "رابط المعاينة" }
                        : { en: "Download link", ar: "رابط التنزيل" },
                    )}
                  </Button>
                ))}
              </div>
              {fileAccess && (
                <p>
                  <a
                    href={fileAccess.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t({
                      en: "Open authorized file",
                      ar: "فتح الملف المصرح به",
                    })}
                  </a>{" "}
                  · {new Date(fileAccess.expiresAt).toLocaleString()}
                </p>
              )}
              {processing.data?.processingWarning && (
                <p>{processing.data.processingWarning}</p>
              )}
              {processing.data?.attempts.map((attempt) => (
                <p key={attempt.id}>
                  {attempt.processType} · {attempt.status} ·{" "}
                  {attempt.errorCode || "—"}
                </p>
              ))}
              {processing.data?.links.map((link) => (
                <div className="access-row" key={link.id}>
                  <span>
                    {link.targetType} · {link.targetId}{" "}
                    {link.isRetained ? "· retained" : ""}
                  </span>
                  {can("assets.link") && (
                    <Button
                      variant="outline"
                      onClick={() => open("unlink", detail.data, link.id)}
                    >
                      {t({ en: "Remove link", ar: "إزالة الرابط" })}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) {
            setEdit(null);
            setError(null);
          }
        }}
        title={title(edit?.kind || "")}
        description={edit?.asset.originalFileName || ""}
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <AcademicFields
            fields={fields}
            value={draft}
            onChange={setDraft}
            disabled={busy}
          />
          {edit?.kind === "link" && draft.targetType === "SubjectOffering" && (
            <p>
              {t({
                en: "Course resource links enter review before publication.",
                ar: "تدخل روابط موارد المساق مرحلة المراجعة قبل النشر.",
              })}
            </p>
          )}
          <label className="academic-checkbox">
            <span>
              {t({
                en: "I reviewed this file change.",
                ar: "راجعت تغيير الملف.",
              })}
            </span>
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              disabled={busy}
            />
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setEdit(null);
              void refresh();
            }}
          />
          <Button disabled={busy || !ack}>
            {t({ en: "Confirm", ar: "تأكيد" })}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
