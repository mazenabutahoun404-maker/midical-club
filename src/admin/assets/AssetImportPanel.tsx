import { manifestPath } from "../../services/files/manifest";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { hashFile } from "../../services/files/file-hash";
import { assertOwner } from "../../services/api/mapping";
import { ApiError } from "../../services/api/client";
import { createRecordId } from "../../lib/record-id";
import { FileUploadWorkbench } from "../../features/resources/FileUploadWorkbench";
import type { Operations } from "../../services/api/schema.generated";
type Preview =
  Operations["get_api_v1_admin_asset_imports_by_importId_preview"]["response"];

export function AssetImportPanel() {
  const services = useServices(),
    assets = services.assets!,
    api = services.api!,
    { t } = useLocale();
  const [name, setName] = useState(""),
    [team, setTeam] = useState(""),
    [year, setYear] = useState(""),
    [id, setId] = useState(""),
    [lookup, setLookup] = useState(""),
    [files, setFiles] = useState<File[]>([]),
    [mapping, setMapping] = useState<
      Record<string, { offeringId: string; confirmed: boolean }>
    >({}),
    [review, setReview] = useState<Preview | null>(null),
    [reason, setReason] = useState(""),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [notice, setNotice] = useState(""),
    [action, setAction] = useState<{
      kind: "pause" | "resume" | "cancel";
      version: string;
      key: string;
    } | null>(null);
  const createKey = useRef(createRecordId()),
    manifestKey = useRef(createRecordId()),
    confirmKey = useRef(createRecordId());
  const job = useQuery({
    queryKey: ["asset-import", id],
    queryFn: () => assets.imports.get(id),
    enabled: !!id,
    retry: false,
  });
  const preview = useQuery({
    queryKey: ["asset-import-preview", id],
    queryFn: () => assets.imports.preview(id),
    enabled: !!id,
    retry: false,
  });
  const report = useQuery({
    queryKey: ["asset-import-report", id],
    queryFn: () => assets.imports.report(id),
    enabled: !!id,
    retry: false,
  });
  const refresh = async () => {
    await Promise.all([job.refetch(), preview.refetch(), report.refetch()]);
  };
  const run = async (work: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const stage = async () => {
    if (!job.data) return;
    const owner = api.session.get()?.sessionId,
      seen = new Set<string>(),
      items = [];
    for (const file of files) {
      const path = manifestPath(file);
      if (seen.has(path))
        throw new ApiError(
          "Duplicate relative paths must be resolved before staging.",
          422,
          "DUPLICATE_IMPORT_PATH",
        );
      seen.add(path);
      const mapped = mapping[path];
      const sha256 = await hashFile(file);
      assertOwner(api, owner);
      items.push({
        relativePath: path,
        sizeBytes: file.size,
        sha256,
        declaredContentType: file.type || "application/octet-stream",
        subjectOfferingId: mapped?.offeringId || null,
        mappingConfirmed: mapped?.confirmed === true,
        explicitMapping: !!mapped?.offeringId,
      });
    }
    if (!items.length)
      throw new ApiError("Select files to stage.", 422, "FILES_REQUIRED");
    const result = await assets.imports.manifest(
      id,
      { version: job.data.version, items },
      manifestKey.current,
    );
    assertOwner(api, owner);
    setReview(result);
    setAck(false);
    setReason("");
    confirmKey.current = createRecordId();
    await refresh();
  };
  return (
    <section className="access-management-card">
      <h2>{t({ en: "File import jobs", ar: "عمليات استيراد الملفات" })}</h2>
      <p>
        {t({
          en: "Map each file to its course offering, review the staged manifest, then confirm. Matching an existing file never bypasses malware checks.",
          ar: "اربط كل ملف بمساقه، وراجع قائمة الاستيراد ثم أكّدها. إعادة استخدام ملف موجود لا تتجاوز الفحص الأمني.",
        })}
      </p>
      {!id && (
        <form
          className="account-api-form"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              const result = await assets.imports.create(
                {
                  name: name.trim(),
                  teamId: team || null,
                  academicYearId: year || null,
                  clientJobId: createKey.current,
                },
                createKey.current,
              );
              setId(result.id);
            });
          }}
        >
          <label>
            {t({ en: "Import name", ar: "اسم الاستيراد" })}
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            {t({
              en: "Team reference (optional)",
              ar: "معرّف الفريق (اختياري)",
            })}
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            {t({
              en: "Academic year reference (optional)",
              ar: "معرّف العام الدراسي (اختياري)",
            })}
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={busy}
            />
          </label>
          <Button disabled={busy}>
            {t({ en: "Create import job", ar: "إنشاء عملية استيراد" })}
          </Button>
        </form>
      )}
      <form
        className="account-api-form access-management-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setReview(null);
          setId(lookup.trim());
          setTeam("");
          setFiles([]);
          setMapping({});
          setError(null);
        }}
      >
        <input
          aria-label={t({
            en: "Existing import reference",
            ar: "معرّف استيراد سابق",
          })}
          placeholder={t({
            en: "Existing import reference",
            ar: "معرّف استيراد سابق",
          })}
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          required
        />
        <Button variant="outline" disabled={busy}>
          {t({ en: "Open job", ar: "فتح العملية" })}
        </Button>
      </form>
      <ApiActionError
        error={error || job.error || preview.error || report.error}
        onReload={() => {
          setReview(null);
          setAck(false);
          void refresh();
        }}
      />
      {notice && <p role="status">{notice}</p>}
      {job.data && (
        <>
          <h3>
            {job.data.name} · {job.data.status}
          </h3>
          <p className="academic-record-id">{job.data.id}</p>
          <p>
            {job.data.totalItems} {t({ en: "files", ar: "ملفات" })} ·{" "}
            {job.data.totalBytes} B
          </p>
          <div className="account-security-actions">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void refresh()}
            >
              {t({ en: "Refresh status", ar: "تحديث الحالة" })}
            </Button>
            {(["pause", "resume", "cancel"] as const).map((kind) => (
              <Button
                key={kind}
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setReason("");
                  setAck(false);
                  setError(null);
                  setAction({
                    kind,
                    version: job.data.version,
                    key: createRecordId(),
                  });
                }}
              >
                {t(
                  kind === "pause"
                    ? { en: "Pause job", ar: "إيقاف العملية مؤقتًا" }
                    : kind === "resume"
                      ? { en: "Resume job", ar: "متابعة العملية" }
                      : { en: "Cancel job", ar: "إلغاء العملية" },
                )}
              </Button>
            ))}
          </div>
          <form
            className="account-api-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run(stage);
            }}
          >
            <label>
              {t({ en: "Files for the manifest", ar: "ملفات قائمة الاستيراد" })}
              <input
                type="file"
                multiple
                disabled={busy || !!review}
                onChange={(e) => {
                  try {
                    const chosen = Array.from(e.target.files || []);
                    const paths = chosen.map(manifestPath);
                    if (new Set(paths).size !== paths.length)
                      throw new ApiError(
                        "Duplicate relative file paths.",
                        422,
                        "DUPLICATE_IMPORT_PATH",
                      );
                    setFiles(chosen);
                    setMapping({});
                    manifestKey.current = createRecordId();
                    setError(null);
                  } catch (caught) {
                    setFiles([]);
                    setError(caught);
                  }
                }}
              />
            </label>
            {files.map((file) => {
              const path = manifestPath(file),
                m = mapping[path] || { offeringId: "", confirmed: false };
              return (
                <div className="access-row" key={path}>
                  <span>
                    <strong>{path}</strong>
                    <small>{file.size} B</small>
                  </span>
                  <label>
                    {t({
                      en: "Course offering reference",
                      ar: "معرّف المساق المطروح",
                    })}
                    <input
                      value={m.offeringId}
                      disabled={busy || !!review}
                      onChange={(e) =>
                        setMapping({
                          ...mapping,
                          [path]: {
                            offeringId: e.target.value,
                            confirmed: false,
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={m.confirmed}
                      disabled={busy || !!review || !m.offeringId}
                      onChange={(e) =>
                        setMapping({
                          ...mapping,
                          [path]: { ...m, confirmed: e.target.checked },
                        })
                      }
                    />
                    {t({ en: "Mapping reviewed", ar: "راجعت الربط" })}
                  </label>
                </div>
              );
            })}
            <Button disabled={busy || !files.length || !!review}>
              {t({ en: "Stage manifest", ar: "تجهيز قائمة الاستيراد" })}
            </Button>
          </form>
          {review && (
            <form
              className="account-api-form academic-review-note"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  !ack ||
                  !review.readyToConfirm ||
                  preview.data?.version !== review.version
                )
                  return;
                void run(async () => {
                  const result = await assets.imports.confirm(
                    id,
                    {
                      version: review.version,
                      manifestHash: review.manifestHash,
                      idempotencyKey: confirmKey.current,
                      reason,
                    },
                    confirmKey.current,
                  );
                  setReview(null);
                  setNotice(
                    t({
                      en: "Import accepted. Track its background processing below.",
                      ar: "تم قبول الاستيراد. تابع المعالجة في الخلفية أدناه.",
                    }) +
                      " · " +
                      result.status,
                  );
                  await refresh();
                });
              }}
            >
              <h3>
                {t({ en: "Reviewed manifest", ar: "قائمة الاستيراد للمراجعة" })}
              </h3>
              <p>
                {review.totalItems} · {review.status} ·{" "}
                {review.readyToConfirm
                  ? t({ en: "Ready to confirm", ar: "جاهزة للتأكيد" })
                  : t({
                      en: "Resolve mapping and validation errors first",
                      ar: "عالج أخطاء الربط والتحقق أولًا",
                    })}
              </p>
              <label>
                {t({ en: "Reason", ar: "السبب" })}
                <textarea
                  required
                  value={reason}
                  disabled={busy}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={ack}
                  disabled={busy}
                  onChange={(e) => setAck(e.target.checked)}
                />
                {t({
                  en: "I reviewed the complete manifest and mappings.",
                  ar: "راجعت قائمة الاستيراد والروابط كاملة.",
                })}
              </label>
              <div className="account-security-actions">
                <Button
                  disabled={
                    busy ||
                    !ack ||
                    !reason.trim() ||
                    !review.readyToConfirm ||
                    preview.data?.version !== review.version
                  }
                >
                  {t({ en: "Confirm import", ar: "تأكيد الاستيراد" })}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setReview(null);
                    manifestKey.current = createRecordId();
                  }}
                >
                  {t({ en: "Revise manifest", ar: "تعديل القائمة" })}
                </Button>
              </div>
            </form>
          )}
          <div className="academic-data-table-wrap">
            <table className="academic-data-table">
              <thead>
                <tr>
                  <th>{t({ en: "File", ar: "الملف" })}</th>
                  <th>{t({ en: "Status", ar: "الحالة" })}</th>
                  <th>{t({ en: "Mapping / error", ar: "الربط / الخطأ" })}</th>
                  <th>{t({ en: "Action", ar: "الإجراء" })}</th>
                </tr>
              </thead>
              <tbody>
                {preview.data?.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.relativePath}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.subjectOfferingId || "—"} · {item.errorCode || "—"}
                    </td>
                    <td>
                      {item.reusableAssetId && (
                        <Button
                          variant="outline"
                          disabled={
                            busy ||
                            !item.mappingConfirmed ||
                            job.data.status !== "Running"
                          }
                          onClick={() =>
                            void run(async () => {
                              await assets.imports.reuse(
                                id,
                                item.id,
                                item.reusableAssetId!,
                              );
                              await refresh();
                            })
                          }
                        >
                          {t({
                            en: "Reuse verified match",
                            ar: "إعادة استخدام المطابقة المتحقق منها",
                          })}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {job.data.status === "Running" &&
            preview.data?.items
              .filter((item) => !item.assetId)
              .map((item) => (
                <details key={item.id}>
                  <summary>
                    {t({
                      en: "Upload manifest file",
                      ar: "رفع ملف من القائمة",
                    })}
                    : {item.relativePath}
                  </summary>
                  <FileUploadWorkbench
                    importItemId={item.id}
                    offeringId={item.subjectOfferingId || undefined}
                    teamId={team || undefined}
                    purpose="Content"
                    expected={{
                      sizeBytes: item.sizeBytes,
                      sha256: item.sha256,
                    }}
                    initialFiles={files.filter(
                      (file) => manifestPath(file) === item.relativePath,
                    )}
                    onQueued={() => void refresh()}
                  />
                </details>
              ))}
          {report.data && (
            <>
              <h3>{t({ en: "Import report", ar: "تقرير الاستيراد" })}</h3>
              {report.data.summary.counts.map((count) => (
                <p key={count.status}>
                  {count.status}: {count.count} · {count.bytes} B
                </p>
              ))}
              {report.data.items.map((item) => (
                <p key={item.id}>
                  {item.relativePath} · {item.status} · {item.errorCode || "—"}
                </p>
              ))}
            </>
          )}
        </>
      )}
      <Modal
        open={!!action}
        onClose={() => {
          if (!busy) setAction(null);
        }}
        title={t({ en: "Change import state", ar: "تغيير حالة الاستيراد" })}
        description={action?.kind || ""}
      >
        <form
          className="account-api-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!action || !ack) return;
            void run(async () => {
              await assets.imports[action.kind](
                id,
                { version: action.version, reason },
                action.key,
              );
              setAction(null);
              await refresh();
            });
          }}
        >
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
              en: "I reviewed this job action.",
              ar: "راجعت الإجراء على العملية.",
            })}
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setAction(null);
              void refresh();
            }}
          />
          <Button disabled={busy || !ack || !reason.trim()}>
            {t({ en: "Confirm", ar: "تأكيد" })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
