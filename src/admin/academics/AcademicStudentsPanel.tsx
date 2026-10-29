import { createRecordId } from "../../lib/record-id";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AcademicFields, AcademicPager } from "./AcademicUI";
import { refreshAcademicQueries } from "./AcademicCatalogPanel";
import type { Field } from "./academic-fields";
import type { Schemas } from "../../services/api/schema.generated";
export const transferFields: Field[] = [
  {
    key: "targetBatchId",
    label: { en: "Target batch reference", ar: "معرّف الدفعة المستهدفة" },
    required: true,
  },
  {
    key: "targetStudyYear",
    label: { en: "Target study year", ar: "السنة الدراسية المستهدفة" },
    type: "number",
    min: 1,
    max: 6,
    required: true,
  },
  {
    key: "targetAcademicYearId",
    label: {
      en: "Target academic year reference",
      ar: "معرّف العام الدراسي المستهدف",
    },
    required: true,
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
    key: "reason",
    label: { en: "Reason", ar: "السبب" },
    type: "textarea",
    required: true,
  },
];
export function AcademicStudentsPanel({
  initialUserId = "",
}: {
  initialUserId?: string;
}) {
  const services = useServices(),
    admin = services.academicAdmin!,
    { t } = useLocale(),
    client = useQueryClient();
  const [lookup, setLookup] = useState(initialUserId),
    [userId, setUserId] = useState(initialUserId),
    [page, setPage] = useState(1),
    [edit, setEdit] = useState<{
      kind: "transfer" | "automatic";
      version: string;
      key: string;
    } | null>(null),
    [draft, setDraft] = useState<Record<string, unknown>>({}),
    [ack, setAck] = useState(false),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const profile = useQuery({
    queryKey: ["academic-admin", "student", userId],
    queryFn: () => admin.students.profile(userId),
    enabled: !!userId,
  });
  const history = useQuery({
    queryKey: ["academic-admin", "student-history", userId, page],
    queryFn: () => admin.students.history(userId, { Page: page, PageSize: 20 }),
    enabled: !!userId,
  });
  const reload = () => {
    setEdit(null);
    setError(null);
    void profile.refetch();
    void history.refetch();
  };
  const open = (kind: "transfer" | "automatic") => {
    if (!profile.data) return;
    setEdit({ kind, version: profile.data.version, key: createRecordId() });
    setDraft(
      kind === "transfer"
        ? {
            targetBatchId: profile.data.batchId,
            targetStudyYear: profile.data.studyYear,
            targetAcademicYearId: profile.data.currentAcademicYearId,
            changeType: "Transfer",
            reason: "",
          }
        : { enabled: !profile.data.automaticPromotionEnabled, reason: "" },
    );
    setAck(false);
    setError(null);
    setNotice("");
  };
  const submit = async () => {
    if (!edit || !ack || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (edit.kind === "transfer")
        await admin.students.transfer(
          userId,
          {
            ...draft,
            version: edit.version,
          } as Schemas["AcademicTransferRequest"],
          edit.key,
        );
      else
        await admin.students.automaticPromotion(
          userId,
          {
            enabled: draft.enabled === true,
            reason: String(draft.reason || ""),
            version: edit.version,
          },
          edit.key,
        );
      setEdit(null);
      setNotice(
        t({ en: "Academic record updated.", ar: "تم تحديث السجل الأكاديمي." }),
      );
      await refreshAcademicQueries(client, admin);
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="access-management-card">
      <h2>{t({ en: "Student progression", ar: "التقدم الأكاديمي للطالب" })}</h2>
      <form
        className="account-api-form access-management-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setUserId(lookup.trim());
          setPage(1);
          setNotice("");
          setError(null);
        }}
      >
        <input
          aria-label={t({
            en: "Student account reference",
            ar: "معرّف حساب الطالب",
          })}
          placeholder={t({
            en: "Student account reference",
            ar: "معرّف حساب الطالب",
          })}
          required
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
        />
        <Button>
          {t({ en: "Open academic record", ar: "فتح السجل الأكاديمي" })}
        </Button>
      </form>
      {notice && <p role="status">{notice}</p>}
      <ApiActionError
        error={error || profile.error || history.error}
        onReload={reload}
      />
      {profile.isFetching && <LoadingState />}
      {profile.data && (
        <>
          <div className="academic-record-meta">
            <strong>
              {t({ en: "Year", ar: "السنة" })} {profile.data.studyYear} ·{" "}
              {profile.data.stage} · {profile.data.enrollmentStatus}
            </strong>
            <span>
              {t({ en: "Automatic promotion", ar: "الترفيع التلقائي" })}:{" "}
              {profile.data.automaticPromotionEnabled
                ? t({ en: "Enabled", ar: "مفعّل" })
                : t({ en: "Disabled", ar: "معطّل" })}
            </span>
          </div>
          <p className="academic-record-id">
            {t({ en: "Batch", ar: "الدفعة" })}: {profile.data.batchId} ·{" "}
            {t({ en: "Academic year", ar: "العام الدراسي" })}:{" "}
            {profile.data.currentAcademicYearId || "—"}
          </p>
          <div className="account-security-actions">
            <Button
              variant="outline"
              disabled={busy || profile.isFetching}
              onClick={() => open("transfer")}
            >
              {t({
                en: "Transfer / correct academic record",
                ar: "نقل أو تصحيح السجل الأكاديمي",
              })}
            </Button>
            <Button
              variant="outline"
              disabled={busy || profile.isFetching}
              onClick={() => open("automatic")}
            >
              {t({
                en: "Change automatic promotion",
                ar: "تغيير الترفيع التلقائي",
              })}
            </Button>
            <Button variant="outline" disabled={busy} onClick={reload}>
              {t({ en: "Reload", ar: "إعادة تحميل" })}
            </Button>
          </div>
        </>
      )}
      {history.data && (
        <>
          <h3>{t({ en: "Academic history", ar: "السجل الأكاديمي" })}</h3>
          {history.data.items.length === 0 && (
            <p>
              {t({
                en: "No academic changes recorded.",
                ar: "لا توجد تغييرات أكاديمية مسجلة.",
              })}
            </p>
          )}
          <div className="academic-data-table-wrap">
            <table className="academic-data-table">
              <thead>
                <tr>
                  {[
                    t({ en: "When", ar: "التاريخ" }),
                    t({ en: "Change", ar: "التغيير" }),
                    t({ en: "Study year", ar: "السنة الدراسية" }),
                    t({ en: "Reason", ar: "السبب" }),
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.data.items.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                    <td>{row.changeType}</td>
                    <td>
                      {row.fromStudyYear ?? "—"} → {row.toStudyYear ?? "—"}
                    </td>
                    <td>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AcademicPager
            page={page}
            totalPages={history.data.totalPages}
            onChange={setPage}
          />
        </>
      )}
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) {
            setEdit(null);
            setError(null);
          }
        }}
        title={t({
          en: "Review academic change",
          ar: "مراجعة التغيير الأكاديمي",
        })}
        description={userId}
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <AcademicFields
            fields={
              edit?.kind === "transfer"
                ? transferFields
                : [
                    {
                      key: "enabled",
                      label: {
                        en: "Enable automatic promotion",
                        ar: "تفعيل الترفيع التلقائي",
                      },
                      type: "checkbox",
                    },
                    {
                      key: "reason",
                      label: { en: "Reason", ar: "السبب" },
                      type: "textarea",
                      required: true,
                    },
                  ]
            }
            value={draft}
            onChange={setDraft}
            disabled={busy}
          />
          <label className="academic-checkbox">
            <span>
              {t({
                en: "I reviewed the student and academic change.",
                ar: "راجعت الطالب والتغيير الأكاديمي.",
              })}
            </span>
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              disabled={busy}
            />
          </label>
          <ApiActionError error={error} onReload={reload} />
          <Button disabled={busy || !ack || !String(draft.reason || "").trim()}>
            {t({ en: "Confirm change", ar: "تأكيد التغيير" })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
