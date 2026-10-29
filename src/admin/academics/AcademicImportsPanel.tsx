import { refreshAcademicQueries } from "./AcademicCatalogPanel";
import { createRecordId } from "../../lib/record-id";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AcademicPager, downloadAcademicFile } from "./AcademicUI";
import type { Operations, Schemas } from "../../services/api/schema.generated";
type Preview =
  Operations["post_api_v1_admin_academic_imports_preview"]["response"];
export function AcademicImportsPanel() {
  const admin = useServices().academicAdmin!,
    { t } = useLocale();
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null),
    [mode, setMode] = useState<Schemas["ImportMode"]>("CreateOnly"),
    [commitMode, setCommitMode] = useState<Schemas["CommitMode"]>("Atomic"),
    [team, setTeam] = useState(""),
    [format, setFormat] = useState("csv");
  const [preview, setPreview] = useState<Preview | null>(null),
    [jobId, setJobId] = useState(""),
    [lookup, setLookup] = useState(""),
    [page, setPage] = useState(1),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [notice, setNotice] = useState(""),
    [accepted, setAccepted] = useState(false);
  const [previewKey, setPreviewKey] = useState(() => createRecordId()),
    [commitKey, setCommitKey] = useState(() => createRecordId());
  const job = useQuery({
    queryKey: ["academic-admin", "import", jobId, page],
    queryFn: () => admin.imports.get(jobId, { Page: page, PageSize: 20 }),
    enabled: !!jobId,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const invalidatePreview = () => {
    setPreview(null);
    setAck(false);
    setPreviewKey(createRecordId());
    setCommitKey(createRecordId());
    setAccepted(false);
    setError(null);
    setNotice("");
  };
  const act = async (work: () => Promise<void>) => {
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
  const stale =
    !!preview && !!job.data && preview.version !== job.data.job.version;
  const expired =
    !!preview &&
    (!Number.isFinite(Date.parse(preview.expiresAt)) ||
      Date.parse(preview.expiresAt) <= Date.now());
  return (
    <section className="access-management-card">
      <h2>{t({ en: "Academic imports", ar: "استيراد المواد الأكاديمية" })}</h2>
      <p>
        {t({
          en: "Download a template, preview the file, inspect validation results, then commit the reviewed import.",
          ar: "نزّل القالب ثم عاين الملف وراجع نتائج التحقق قبل تأكيد الاستيراد.",
        })}
      </p>
      <form
        className="account-api-form"
        onSubmit={(e) => {
          e.preventDefault();
          void act(async () => {
            if (!file) return;
            const result = await admin.imports.preview(
              file,
              mode,
              team || undefined,
              previewKey,
            );
            setPreview(result);
            setJobId(result.id);
            setPage(1);
            setAck(false);
            setAccepted(false);
            setCommitKey(createRecordId());
          });
        }}
      >
        <fieldset disabled={busy || !!preview}>
          <div className="academic-form-grid">
            <label>
              {t({
                en: "Team reference (optional)",
                ar: "معرّف الفريق (اختياري)",
              })}
              <input
                value={team}
                onChange={(e) => {
                  setTeam(e.target.value);
                  invalidatePreview();
                }}
              />
            </label>
            <label>
              {t({ en: "Import mode", ar: "نوع الاستيراد" })}
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as Schemas["ImportMode"]);
                  invalidatePreview();
                }}
              >
                <option value="CreateOnly">
                  {t({
                    en: "Create new subjects only",
                    ar: "إنشاء مواد جديدة فقط",
                  })}
                </option>
                <option value="Upsert">
                  {t({
                    en: "Create or update matching subjects",
                    ar: "إنشاء المواد أو تحديث المطابقة",
                  })}
                </option>
              </select>
            </label>
            <label>
              {t({ en: "Template format", ar: "صيغة القالب" })}
              <input
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                required
              />
            </label>
            <Button
              type="button"
              variant="outline"
              disabled={!format.trim()}
              onClick={() =>
                void act(async () =>
                  downloadAcademicFile(
                    await admin.imports.template(
                      format.trim(),
                      team || undefined,
                    ),
                    `academic-template.${format.replace(/[^a-zA-Z0-9]/g, "") || "bin"}`,
                  ),
                )
              }
            >
              {t({ en: "Download template", ar: "تنزيل القالب" })}
            </Button>
            <label>
              {t({ en: "Import file", ar: "ملف الاستيراد" })}
              <input
                type="file"
                required
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  invalidatePreview();
                }}
              />
            </label>
          </div>
        </fieldset>
        <div className="account-security-actions">
          <Button disabled={busy || !file || !!preview}>
            {t({ en: "Preview file", ar: "معاينة الملف" })}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={invalidatePreview}
            >
              {t({ en: "Start a new preview", ar: "بدء معاينة جديدة" })}
            </Button>
          )}
        </div>
      </form>
      {preview && (
        <div className="academic-review-note">
          <strong>
            {t({ en: "Preview", ar: "المعاينة" })}: {preview.status}
          </strong>
          <p>
            {t({
              en: "Rows / valid / invalid",
              ar: "الصفوف / الصالحة / غير الصالحة",
            })}
            : {preview.totalRows} / {preview.valid} / {preview.invalid}
          </p>
          <p>
            {t({ en: "Expires", ar: "تنتهي" })}:{" "}
            {new Date(preview.expiresAt).toLocaleString()}
          </p>
          {!accepted && (
            <form
              className="account-api-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!preview || !ack || stale || expired) return;
                void act(async () => {
                  const result = await admin.imports.commit(
                    preview,
                    commitMode,
                    commitKey,
                  );
                  setAccepted(true);
                  setAck(false);
                  setNotice(
                    t({
                      en: "Import accepted for processing. Refresh its status to see the result.",
                      ar: "تم قبول الاستيراد للمعالجة. حدّث الحالة لعرض النتيجة.",
                    }),
                  );
                  setJobId(result.id);
                  await job.refetch();
                });
              }}
            >
              <label>
                {t({ en: "Commit behavior", ar: "طريقة التنفيذ" })}
                <select
                  disabled={busy}
                  value={commitMode}
                  onChange={(e) => {
                    setCommitMode(e.target.value as Schemas["CommitMode"]);
                    setAck(false);
                    setCommitKey(createRecordId());
                  }}
                >
                  <option value="Atomic">
                    {t({
                      en: "All rows must pass",
                      ar: "يجب أن تنجح جميع الصفوف",
                    })}
                  </option>
                  <option value="Partial">
                    {t({
                      en: "Commit valid rows; report failures",
                      ar: "تنفيذ الصفوف الصالحة وتسجيل الأخطاء",
                    })}
                  </option>
                </select>
              </label>
              <label className="academic-checkbox">
                <span>
                  {t({
                    en: "I reviewed the rows, warnings and chosen commit behavior.",
                    ar: "راجعت الصفوف والتحذيرات وطريقة التنفيذ.",
                  })}
                </span>
                <input
                  type="checkbox"
                  checked={ack}
                  disabled={busy}
                  onChange={(e) => setAck(e.target.checked)}
                />
              </label>
              {(stale || expired) && (
                <p>
                  {t({
                    en: "This preview changed or expired. Create and review a new preview.",
                    ar: "تغيّرت المعاينة أو انتهت صلاحيتها. أنشئ معاينة جديدة وراجعها.",
                  })}
                </p>
              )}
              <Button
                disabled={
                  busy ||
                  !ack ||
                  stale ||
                  expired ||
                  !job.data ||
                  job.isError ||
                  (commitMode === "Atomic" && preview.invalid > 0)
                }
              >
                {t({
                  en: "Commit reviewed import",
                  ar: "تأكيد الاستيراد بعد المراجعة",
                })}
              </Button>
            </form>
          )}
        </div>
      )}
      <form
        className="account-api-form access-management-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setPreview(null);
          setAccepted(false);
          setAck(false);
          setJobId(lookup.trim());
          setPage(1);
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
          {t({ en: "Track import", ar: "متابعة الاستيراد" })}
        </Button>
      </form>
      {notice && <p role="status">{notice}</p>}
      <ApiActionError
        error={error || job.error}
        onReload={() => {
          invalidatePreview();
          void job.refetch();
        }}
      />
      {job.isFetching && <LoadingState />}
      {job.data && (
        <>
          <div className="academic-record-meta">
            <strong>{job.data.job.status}</strong>
            <span>
              {t({ en: "Succeeded / failed", ar: "الناجحة / الفاشلة" })}:{" "}
              {job.data.job.succeeded} / {job.data.job.failed}
            </span>
            <span className="academic-record-id">{job.data.job.id}</span>
          </div>
          <div className="account-security-actions">
            <Button
              variant="outline"
              disabled={busy || job.isFetching}
              onClick={() => void refreshAcademicQueries(client, admin)}
            >
              {t({ en: "Refresh status", ar: "تحديث الحالة" })}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                void act(async () =>
                  downloadAcademicFile(
                    await admin.imports.report(jobId),
                    `academic-import-${jobId}.csv`,
                  ),
                )
              }
            >
              {t({ en: "Download report", ar: "تنزيل التقرير" })}
            </Button>
          </div>
          <div className="academic-data-table-wrap">
            <table className="academic-data-table">
              <thead>
                <tr>
                  {[
                    t({ en: "Row", ar: "الصف" }),
                    t({ en: "Status", ar: "الحالة" }),
                    t({ en: "Subject", ar: "المادة" }),
                    t({ en: "Error / warning", ar: "الخطأ / التحذير" }),
                  ].map((v) => (
                    <th key={v}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {job.data.rows.items.map((row) => (
                  <tr key={row.rowNumber}>
                    <td>{row.rowNumber}</td>
                    <td>{row.status}</td>
                    <td>
                      {importSubject(row.dataJson) || row.subjectId || "—"}
                    </td>
                    <td>
                      {[row.error, row.warning].filter(Boolean).join(" · ") ||
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AcademicPager
            page={page}
            totalPages={job.data.rows.totalPages}
            onChange={setPage}
            disabled={busy}
          />
        </>
      )}
    </section>
  );
}
function importSubject(value: string) {
  try {
    const row = JSON.parse(value);
    return String(
      row.nameEn ||
        row.NameEn ||
        row.nameAr ||
        row.NameAr ||
        row.code ||
        row.Code ||
        "",
    );
  } catch {
    return "";
  }
}
