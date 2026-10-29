import { createRecordId } from "../../lib/record-id";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { AcademicFields, AcademicPager } from "./AcademicUI";
import { refreshAcademicQueries } from "./AcademicCatalogPanel";
import type { Field } from "./academic-fields";
import type { Operations, Schemas } from "../../services/api/schema.generated";
type Run =
  Operations["get_api_v1_admin_academic_promotions_by_runId"]["response"];
const fields: Field[] = [
  {
    key: "targetAcademicYearId",
    label: {
      en: "Target academic year reference",
      ar: "معرّف العام الدراسي المستهدف",
    },
    required: true,
  },
  {
    key: "sourceAcademicYearId",
    label: {
      en: "Source academic year reference (optional)",
      ar: "معرّف العام الدراسي المصدر (اختياري)",
    },
  },
  {
    key: "batchId",
    label: {
      en: "Source batch reference (optional)",
      ar: "معرّف الدفعة المصدر (اختياري)",
    },
  },
  {
    key: "targetBatchId",
    label: {
      en: "Target batch reference (optional)",
      ar: "معرّف الدفعة المستهدفة (اختياري)",
    },
  },
  {
    key: "targetStudyYear",
    label: {
      en: "Target study year (optional)",
      ar: "السنة المستهدفة (اختياري)",
    },
    type: "number",
    min: 1,
    max: 6,
  },
  {
    key: "changeType",
    label: { en: "Change type", ar: "نوع التغيير" },
    options: [
      "Registration",
      "AutomaticPromotion",
      "ManualPromotion",
      "Transfer",
      "Correction",
      "Graduation",
    ],
    required: true,
  },
  {
    key: "teamId",
    label: { en: "Team reference (optional)", ar: "معرّف الفريق (اختياري)" },
  },
  {
    key: "reason",
    label: { en: "Reason", ar: "السبب" },
    type: "textarea",
    required: true,
  },
];
export function AcademicProgressionPanel() {
  const admin = useServices().academicAdmin!,
    { t } = useLocale(),
    client = useQueryClient();
  const [kind, setKind] = useState<"promotion" | "transfer">("promotion"),
    [draft, setDraft] = useState<Record<string, unknown>>({
      changeType: "AutomaticPromotion",
    }),
    [users, setUsers] = useState(""),
    [scopeAck, setScopeAck] = useState(false),
    [ack, setAck] = useState(false),
    [preview, setPreview] = useState<Run | null>(null),
    [executed, setExecuted] = useState(false),
    [runId, setRunId] = useState(""),
    [lookup, setLookup] = useState(""),
    [page, setPage] = useState(1),
    [reportPage, setReportPage] = useState(1),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const [previewKey, setPreviewKey] = useState(() => createRecordId()),
    [executeKey, setExecuteKey] = useState(() => createRecordId()),
    [retry, setRetry] = useState<{
      run: Run;
      reason: string;
      key: string;
      ack: boolean;
    } | null>(null);
  const runs = useQuery({
    queryKey: ["academic-admin", "runs", page],
    queryFn: () => admin.promotions.list({ Page: page, PageSize: 20 }),
  });
  const run = useQuery({
    queryKey: ["academic-admin", "run", runId],
    queryFn: () => admin.promotions.get(runId),
    enabled: !!runId,
    retry: false,
  });
  const report = useQuery({
    queryKey: ["academic-admin", "run-report", runId, reportPage],
    queryFn: () =>
      admin.promotions.report(runId, { Page: reportPage, PageSize: 20 }),
    enabled: !!runId,
    retry: false,
  });
  const reset = () => {
    setPreview(null);
    setAck(false);
    setScopeAck(false);
    setExecuted(false);
    setError(null);
    setPreviewKey(createRecordId());
    setExecuteKey(createRecordId());
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
    !!preview &&
    ((!!run.data &&
      preview.id === run.data.id &&
      preview.version !== run.data.version) ||
      (!!report.data &&
        preview.id === report.data.summary.id &&
        preview.version !== report.data.summary.version));
  const expired =
    !!preview &&
    (!Number.isFinite(Date.parse(preview.expiresAt)) ||
      Date.parse(preview.expiresAt) <= Date.now());
  return (
    <section className="access-management-card">
      <h2>
        {t({ en: "Promotion and transfer runs", ar: "عمليات الترفيع والنقل" })}
      </h2>
      <form
        className="account-api-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!users.trim() && !scopeAck) return;
          void act(async () => {
            const userIds = users.split(/[\s,]+/).filter(Boolean);
            const body = {
              ...draft,
              ...(userIds.length ? { userIds } : {}),
            } as Schemas["PromotionPreviewRequest"];
            const result =
              kind === "promotion"
                ? await admin.promotions.preview(body, previewKey)
                : await admin.promotions.previewTransfer(body, previewKey);
            setPreview(result);
            setRunId(result.id);
            setReportPage(1);
            setAck(false);
            setExecuted(false);
            setExecuteKey(createRecordId());
            await runs.refetch();
          });
        }}
      >
        <fieldset disabled={busy || !!preview}>
          <label>
            {t({ en: "Operation", ar: "العملية" })}
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as typeof kind);
                setDraft({
                  ...draft,
                  changeType:
                    e.target.value === "transfer"
                      ? "Transfer"
                      : "AutomaticPromotion",
                });
                reset();
              }}
            >
              <option value="promotion">
                {t({ en: "Promotion", ar: "ترفيع" })}
              </option>
              <option value="transfer">
                {t({ en: "Transfer", ar: "نقل" })}
              </option>
            </select>
          </label>
          <AcademicFields
            fields={fields}
            value={draft}
            onChange={(value) => {
              setDraft(value);
              setPreviewKey(createRecordId());
            }}
            disabled={busy}
          />
          <label>
            {t({
              en: "Student account references (optional, separated by commas)",
              ar: "معرّفات حسابات الطلبة (اختياري، مفصولة بفواصل)",
            })}
            <textarea
              value={users}
              onChange={(e) => {
                setUsers(e.target.value);
                setScopeAck(false);
                setPreviewKey(createRecordId());
              }}
            />
          </label>
          {!users.trim() && (
            <label className="academic-checkbox">
              <span>
                {t({
                  en: "Preview every eligible student in the selected scope.",
                  ar: "معاينة جميع الطلبة المؤهلين ضمن النطاق المحدد.",
                })}
              </span>
              <input
                type="checkbox"
                checked={scopeAck}
                onChange={(e) => setScopeAck(e.target.checked)}
              />
            </label>
          )}
        </fieldset>
        <div className="account-security-actions">
          <Button disabled={busy || !!preview || (!users.trim() && !scopeAck)}>
            {t({ en: "Create preview", ar: "إنشاء معاينة" })}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={reset}
            >
              {t({ en: "Start a new preview", ar: "بدء معاينة جديدة" })}
            </Button>
          )}
        </div>
      </form>
      {preview && (
        <div className="academic-review-note">
          <strong>
            {t({ en: "Reviewed preview", ar: "المعاينة للمراجعة" })}:{" "}
            {preview.status}
          </strong>
          <p>
            {t({ en: "Target academic year", ar: "العام الدراسي المستهدف" })}:{" "}
            {preview.targetAcademicYearId} · {preview.changeType}
          </p>
          <p>
            {t({ en: "Expires", ar: "تنتهي" })}:{" "}
            {new Date(preview.expiresAt).toLocaleString()}
          </p>
          <p>
            {t({ en: "Reason", ar: "السبب" })}: {preview.reason}
          </p>
          {!executed && (
            <>
              <label className="academic-checkbox">
                <span>
                  {t({
                    en: "I reviewed the scope, target and student results below.",
                    ar: "راجعت النطاق والهدف ونتائج الطلبة أدناه.",
                  })}
                </span>
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                  disabled={busy}
                />
              </label>
              {(stale || expired) && (
                <p>
                  {t({
                    en: "The preview changed or expired. Create a new preview.",
                    ar: "تغيّرت المعاينة أو انتهت صلاحيتها. أنشئ معاينة جديدة.",
                  })}
                </p>
              )}
              <Button
                disabled={
                  busy ||
                  !ack ||
                  stale ||
                  expired ||
                  !report.data ||
                  report.data.summary.id !== preview.id ||
                  report.isError ||
                  !run.data ||
                  run.data.id !== preview.id ||
                  run.isError
                }
                onClick={() =>
                  void act(async () => {
                    if (!preview) return;
                    const result =
                      kind === "promotion"
                        ? await admin.promotions.execute(
                            preview,
                            preview.reason,
                            executeKey,
                          )
                        : await admin.promotions.executeTransfer(
                            preview,
                            preview.reason,
                            executeKey,
                          );
                    setExecuted(true);
                    setAck(false);
                    setNotice(
                      t({
                        en: "Run accepted for processing. Refresh to check the final results.",
                        ar: "تم قبول العملية للمعالجة. حدّث الحالة للتحقق من النتائج النهائية.",
                      }),
                    );
                    setRunId(result.id);
                    await refreshAcademicQueries(client, admin);
                  })
                }
              >
                {t({
                  en: "Execute reviewed run",
                  ar: "تنفيذ العملية بعد المراجعة",
                })}
              </Button>
            </>
          )}
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
      <ApiActionError
        error={error || runs.error || run.error || report.error}
        onReload={() => {
          reset();
          setRetry(null);
          void refreshAcademicQueries(client, admin);
        }}
      />
      <h3>{t({ en: "Recent runs", ar: "العمليات الأخيرة" })}</h3>
      {runs.data?.items.map((item) => (
        <div className="access-row" key={item.id}>
          <span>
            <strong>
              {item.kind} · {item.status}
            </strong>
            <small>{item.reason}</small>
            <span className="academic-record-id">{item.id}</span>
          </span>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              if (preview && preview.id !== item.id) reset();
              setRunId(item.id);
              setReportPage(1);
            }}
          >
            {t({ en: "Inspect", ar: "عرض" })}
          </Button>
        </div>
      ))}
      {runs.data && (
        <AcademicPager
          page={page}
          totalPages={runs.data.totalPages}
          onChange={setPage}
          disabled={busy}
        />
      )}
      <form
        className="account-api-form access-management-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          reset();
          setRunId(lookup.trim());
          setReportPage(1);
        }}
      >
        <input
          aria-label={t({ en: "Run reference", ar: "معرّف العملية" })}
          placeholder={t({ en: "Run reference", ar: "معرّف العملية" })}
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          required
        />
        <Button variant="outline" disabled={busy}>
          {t({ en: "Open run", ar: "فتح العملية" })}
        </Button>
      </form>
      {run.data && (
        <>
          <h3>
            {t({ en: "Run results", ar: "نتائج العملية" })}: {run.data.status}
          </h3>
          <p className="academic-record-id">{run.data.id}</p>
          <p>
            {t({
              en: "Processed / promoted / graduated / skipped / failed",
              ar: "المعالجة / المرفّعة / المتخرجة / المتجاوزة / الفاشلة",
            })}
            : {run.data.processed} / {run.data.promoted} / {run.data.graduated}{" "}
            / {run.data.skipped} / {run.data.failed}
          </p>
          <div className="account-security-actions">
            <Button
              variant="outline"
              disabled={busy || run.isFetching || report.isFetching}
              onClick={() => {
                void refreshAcademicQueries(client, admin);
              }}
            >
              {t({ en: "Refresh status", ar: "تحديث الحالة" })}
            </Button>
            {run.data.failed > 0 && (
              <Button
                variant="outline"
                disabled={busy || run.isFetching}
                onClick={() =>
                  setRetry({
                    run: run.data,
                    reason: "",
                    key: createRecordId(),
                    ack: false,
                  })
                }
              >
                {t({
                  en: "Retry failed records",
                  ar: "إعادة محاولة السجلات الفاشلة",
                })}
              </Button>
            )}
          </div>
        </>
      )}
      {report.data && (
        <>
          <div className="academic-data-table-wrap">
            <table className="academic-data-table">
              <thead>
                <tr>
                  {[
                    t({ en: "Student", ar: "الطالب" }),
                    t({ en: "Status", ar: "الحالة" }),
                    t({ en: "Resulting year", ar: "السنة الناتجة" }),
                    t({ en: "Error", ar: "الخطأ" }),
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.data.results.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.userId}</td>
                    <td>{item.status}</td>
                    <td>{item.resultStudyYear ?? "—"}</td>
                    <td>{item.error || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AcademicPager
            page={reportPage}
            totalPages={report.data.results.totalPages}
            onChange={setReportPage}
            disabled={busy}
          />
        </>
      )}
      <Modal
        open={!!retry}
        onClose={() => {
          if (!busy) {
            setRetry(null);
            setError(null);
          }
        }}
        title={t({
          en: "Retry failed students",
          ar: "إعادة محاولة الطلبة الذين فشلت معالجتهم",
        })}
        description={retry?.run.id || ""}
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={(e) => {
            e.preventDefault();
            if (!retry?.ack) return;
            void act(async () => {
              await admin.promotions.retryFailed(
                retry.run.id,
                { version: retry.run.version, reason: retry.reason },
                retry.key,
              );
              setRetry(null);
              setNotice(
                t({
                  en: "Retry accepted. Refresh the run to inspect results.",
                  ar: "تم قبول إعادة المحاولة. حدّث العملية لعرض النتائج.",
                }),
              );
              await refreshAcademicQueries(client, admin);
            });
          }}
        >
          <label>
            {t({ en: "Reason", ar: "السبب" })}
            <textarea
              required
              disabled={busy}
              value={retry?.reason || ""}
              onChange={(e) =>
                setRetry(retry ? { ...retry, reason: e.target.value } : null)
              }
            />
          </label>
          <label className="academic-checkbox">
            <span>
              {t({
                en: "I reviewed the failed records.",
                ar: "راجعت السجلات الفاشلة.",
              })}
            </span>
            <input
              type="checkbox"
              checked={retry?.ack || false}
              disabled={busy}
              onChange={(e) =>
                setRetry(retry ? { ...retry, ack: e.target.checked } : null)
              }
            />
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setRetry(null);
              void refreshAcademicQueries(client, admin);
            }}
          />
          <Button disabled={busy || !retry?.ack || !retry.reason.trim()}>
            {t({ en: "Confirm retry", ar: "تأكيد إعادة المحاولة" })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
