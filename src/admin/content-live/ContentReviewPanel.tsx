import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { AcademicFields, AcademicPager } from "../academics/AcademicUI";
import { C } from "./content-keys";
import { refreshContent } from "./content-cache";
import { createRecordId } from "../../lib/record-id";
import type { Schemas, Operations } from "../../services/api/schema.generated";
type Review = Operations["get_api_v1_admin_content_review_by_id"]["response"];
const actionNames: Record<string, { en: string; ar: string }> = {
  submit: { en: "Submit for review", ar: "إرسال للمراجعة" },
  claim: { en: "Claim review", ar: "تولّي المراجعة" },
  assign: { en: "Assign reviewer", ar: "تعيين المراجع" },
  "request-changes": { en: "Request changes", ar: "طلب تعديلات" },
  approve: { en: "Approve", ar: "موافقة" },
  publish: { en: "Publish", ar: "نشر" },
  "return-to-review": { en: "Return to review", ar: "إعادة للمراجعة" },
  reject: { en: "Reject", ar: "رفض" },
  unpublish: { en: "Unpublish", ar: "إلغاء النشر" },
};
export function ContentReviewPanel() {
  const c = useServices().contentApi!,
    { snapshot } = useAuth(),
    { t } = useLocale(),
    client = useQueryClient();
  const [page, setPage] = useState(1),
    [selected, setSelected] = useState(""),
    [historyPage, setHistoryPage] = useState(1),
    [mine, setMine] = useState(false),
    [edit, setEdit] = useState<{
      action: Schemas["AdminReviewAction"];
      review?: Review;
      key: string;
    } | null>(null),
    [draft, setDraft] = useState<Record<string, unknown>>({}),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [notice, setNotice] = useState("");
  const list = useQuery({
      queryKey: ["native-content", "reviews", page, mine],
      queryFn: () =>
        c[C.reviews]({ query: { Page: page, PageSize: 20, Mine: mine } }),
    }),
    detail = useQuery({
      queryKey: ["native-content", "review", selected],
      queryFn: () => c[C.review]({ path: { id: selected } }),
      enabled: !!selected,
    }),
    history = useQuery({
      queryKey: ["native-content", "review-history", selected, historyPage],
      queryFn: () =>
        c[C.history]({
          path: { id: selected },
          query: { page: historyPage, pageSize: 20 },
        }),
      enabled: !!selected,
    });
  const begin = (action: Schemas["AdminReviewAction"], review?: Review) => {
    setEdit({ action, review, key: createRecordId() });
    setDraft(
      review
        ? { note: "", reviewerId: review.reviewerId || "" }
        : {
            kind: "resource",
            itemId: "",
            version: "",
            note: "",
            revisionId: "",
            draftRevisionId: "",
          },
    );
    setError(null);
    setAck(false);
  };
  return (
    <section className="access-management-card">
      <h2>{t({ en: "Content review queue", ar: "قائمة مراجعة المحتوى" })}</h2>
      <p>
        {t({
          en: "Claim a review before making a decision. Approval does not publish content.",
          ar: "تولَّ المراجعة قبل اتخاذ القرار. الموافقة لا تنشر المحتوى.",
        })}
      </p>
      <div className="account-security-actions">
        <Button onClick={() => begin("submit")}>{t(actionNames.submit)}</Button>
        <label>
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => {
              setMine(e.target.checked);
              setPage(1);
            }}
          />
          {t({ en: "My reviews", ar: "مراجعاتي" })}
        </label>
        <Button variant="outline" onClick={() => void refreshContent(client)}>
          {t({ en: "Refresh", ar: "تحديث" })}
        </Button>
      </div>
      <ApiActionError
        error={error || list.error || detail.error || history.error}
        onReload={() => {
          setEdit(null);
          void refreshContent(client);
        }}
      />
      {notice && <p role="status">{notice}</p>}
      {list.data?.items?.map((row) => (
        <div className="access-row" key={row.id}>
          <span>
            <strong>
              {row.kind} · {row.status}
            </strong>
            <small>{row.itemId}</small>
          </span>
          <Button
            variant="outline"
            onClick={() => {
              if (row.id) setSelected(row.id);
              setHistoryPage(1);
            }}
          >
            {t({ en: "Inspect review", ar: "عرض المراجعة" })}
          </Button>
        </div>
      ))}
      {list.data && (
        <AcademicPager
          page={page}
          totalPages={list.data.totalPages!}
          onChange={setPage}
        />
      )}
      {detail.data && (
        <div className="access-management-card">
          <h3>
            {detail.data.kind} · {detail.data.status}
          </h3>
          <p className="academic-record-id">
            {detail.data.itemId} · {detail.data.revisionId}
          </p>
          <p>
            {t({ en: "Reviewer", ar: "المراجع" })}:{" "}
            {detail.data.reviewerId || "—"}
          </p>
          <div className="account-security-actions">
            {(
              [
                "claim",
                "assign",
                "request-changes",
                "approve",
                "publish",
                "return-to-review",
                "reject",
                ...(["event", "opportunity"].includes(detail.data.kind || "")
                  ? []
                  : ["unpublish"]),
              ] as Schemas["AdminReviewAction"][]
            ).map((action) => (
              <Button
                key={action}
                variant="outline"
                disabled={
                  detail.isFetching ||
                  (["approve", "request-changes", "reject"].includes(action) &&
                    detail.data.reviewerId !== snapshot.user?.id)
                }
                onClick={() => begin(action, detail.data)}
              >
                {t(actionNames[action])}
              </Button>
            ))}
          </div>
          {history.data?.items?.map((row) => (
            <p key={row.id}>
              {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"} ·{" "}
              {row.action} · {row.previousState} → {row.newState} ·{" "}
              {row.reason || ""}
            </p>
          ))}
          {history.data && (
            <AcademicPager
              page={historyPage}
              totalPages={history.data.totalPages!}
              onChange={setHistoryPage}
            />
          )}
        </div>
      )}
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) setEdit(null);
        }}
        title={t(actionNames[edit?.action || "submit"])}
        description={
          edit?.review?.itemId ||
          t({
            en: "Use the current source record version and selected revision.",
            ar: "استخدم نسخة السجل المصدر الحالية والمراجعة المختارة.",
          })
        }
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!edit || !ack) return;
            setBusy(true);
            setError(null);
            try {
              const source = edit.review;
              const body = {
                kind: source?.kind || draft.kind,
                itemId: source?.itemId || draft.itemId,
                action: edit.action,
                version: source?.sourceVersion || draft.version,
                reviewVersion: source?.version,
                revisionId: source?.revisionId || draft.revisionId || null,
                draftRevisionId: draft.draftRevisionId || null,
                note: String(draft.note || ""),
                reviewerId:
                  edit.action === "assign"
                    ? draft.reviewerId || null
                    : undefined,
              } as Schemas["AdminContentReviewRequest"];
              await c[C.reviewAction]({ body, idempotencyKey: edit.key });
              setEdit(null);
              setNotice(
                t({
                  en: "Review action accepted. Check the reported workflow state; approval alone is not publication.",
                  ar: "تم قبول إجراء المراجعة. تحقق من الحالة؛ الموافقة وحدها لا تعني النشر.",
                }),
              );
              await refreshContent(client);
            } catch (caught) {
              setError(caught);
            } finally {
              setBusy(false);
            }
          }}
        >
          {!edit?.review && (
            <AcademicFields
              fields={[
                {
                  key: "kind",
                  label: { en: "Resource kind", ar: "نوع المورد" },
                  options: [
                    "contribution",
                    "resource",
                    "article",
                    "homepage",
                    "event",
                    "opportunity",
                  ],
                  required: true,
                },
                {
                  key: "itemId",
                  label: {
                    en: "Resource reference (course resource: link reference)",
                    ar: "معرّف المورد (لمورد المساق: معرّف الرابط)",
                  },
                  required: true,
                },
                {
                  key: "version",
                  label: {
                    en: "Current source version",
                    ar: "نسخة المصدر الحالية",
                  },
                  required: true,
                },
                {
                  key: "revisionId",
                  label: {
                    en: "Submitted revision reference (optional)",
                    ar: "معرّف المراجعة المقدمة (اختياري)",
                  },
                },
                {
                  key: "draftRevisionId",
                  label: {
                    en: "Draft revision reference (optional)",
                    ar: "معرّف مراجعة المسودة (اختياري)",
                  },
                },
              ]}
              value={draft}
              onChange={setDraft}
              disabled={busy}
            />
          )}
          {edit?.action === "assign" && (
            <AcademicFields
              fields={[
                {
                  key: "reviewerId",
                  label: {
                    en: "Reviewer account reference",
                    ar: "معرّف حساب المراجع",
                  },
                  required: true,
                },
              ]}
              value={draft}
              onChange={setDraft}
              disabled={busy}
            />
          )}
          <label>
            {t({ en: "Review note", ar: "ملاحظة المراجعة" })}
            <textarea
              value={String(draft.note || "")}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              disabled={busy}
              required
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
              en: "I reviewed the resource, revision and action.",
              ar: "راجعت المورد والنسخة والإجراء.",
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
            {t({ en: "Confirm action", ar: "تأكيد الإجراء" })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
export function ContentReviewCalendar() {
  const c = useServices().contentApi!,
    { t } = useLocale(),
    client = useQueryClient();
  const [page, setPage] = useState(1),
    [team, setTeam] = useState(""),
    [filter, setFilter] = useState(""),
    [edit, setEdit] = useState<{
      record?: Operations["get_api_v1_admin_content_review_schedules"]["response"][number];
      mark: boolean;
      key: string;
    } | null>(null),
    [draft, setDraft] = useState<Record<string, unknown>>({}),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const list = useQuery({
    queryKey: ["native-content", "review-calendar", filter, page],
    queryFn: () =>
      c[C.reviewSchedules]({ query: { teamId: filter || undefined, page } }),
  });
  return (
    <section className="access-management-card">
      <h2>{t({ en: "Review calendar", ar: "تقويم المراجعة" })}</h2>
      <form
        className="account-api-form access-management-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setFilter(team);
          setPage(1);
        }}
      >
        <input
          aria-label={t({ en: "Team filter", ar: "تصفية الفريق" })}
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />
        <Button variant="outline">{t({ en: "Filter", ar: "تصفية" })}</Button>
        <Button
          type="button"
          onClick={() => {
            setEdit({ mark: false, key: createRecordId() });
            setDraft({ reviewIntervalDays: 30 });
            setAck(false);
            setError(null);
          }}
        >
          {t({ en: "Add review schedule", ar: "إضافة موعد مراجعة" })}
        </Button>
      </form>
      <ApiActionError error={error || list.error} />
      {list.data?.map((row) => (
        <div className="access-row" key={row.id}>
          <span>
            {row.resourceType} · {row.resourceId}
            <small>
              {row.status} · {new Date(row.nextReviewAt).toLocaleString()}
            </small>
          </span>
          <div className="access-row-actions">
            {[false, true].map((mark) => (
              <Button
                variant="outline"
                key={String(mark)}
                onClick={() => {
                  setEdit({ record: row, mark, key: createRecordId() });
                  setDraft(mark ? { note: "" } : { ...row });
                  setAck(false);
                  setError(null);
                }}
              >
                {t(
                  mark
                    ? { en: "Mark reviewed", ar: "تأكيد المراجعة" }
                    : { en: "Edit schedule", ar: "تعديل الموعد" },
                )}
              </Button>
            ))}
          </div>
        </div>
      ))}
      <div className="academic-pager">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          {t({ en: "Previous", ar: "السابق" })}
        </Button>
        <span>{page}</span>
        <Button
          variant="outline"
          disabled={!list.data?.length}
          onClick={() => setPage(page + 1)}
        >
          {t({ en: "Next", ar: "التالي" })}
        </Button>
      </div>
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) setEdit(null);
        }}
        title={t({ en: "Review schedule change", ar: "مراجعة تغيير الموعد" })}
        description={edit?.record?.resourceId || ""}
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!edit || !ack) return;
            setBusy(true);
            setError(null);
            try {
              if (edit.mark)
                await c[C.markReviewed]({
                  path: { id: edit.record!.id },
                  body: {
                    version: edit.record!.version,
                    note: String(draft.note || ""),
                  },
                  idempotencyKey: edit.key,
                });
              else {
                const body = {
                  resourceType: draft.resourceType,
                  resourceId: draft.resourceId,
                  reviewIntervalDays: Number(draft.reviewIntervalDays),
                  assignedUserId: draft.assignedUserId || null,
                  version: edit.record?.version,
                } as Schemas["ReviewInput"];
                if (edit.record)
                  await c[C.updateReviewSchedule]({
                    path: { id: edit.record.id },
                    body,
                    idempotencyKey: edit.key,
                  });
                else
                  await c[C.addReviewSchedule]({
                    body,
                    idempotencyKey: edit.key,
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
          <AcademicFields
            fields={
              edit?.mark
                ? [
                    {
                      key: "note",
                      label: { en: "Review note", ar: "ملاحظة المراجعة" },
                      type: "textarea",
                      required: true,
                    },
                  ]
                : [
                    {
                      key: "resourceType",
                      label: { en: "Resource type", ar: "نوع المورد" },
                      required: true,
                    },
                    {
                      key: "resourceId",
                      label: { en: "Resource reference", ar: "معرّف المورد" },
                      required: true,
                    },
                    {
                      key: "reviewIntervalDays",
                      label: {
                        en: "Review interval (days)",
                        ar: "الفاصل بين المراجعات (أيام)",
                      },
                      type: "number",
                      min: 1,
                      required: true,
                    },
                    {
                      key: "assignedUserId",
                      label: {
                        en: "Assigned reviewer reference (optional)",
                        ar: "معرّف المراجع المكلّف (اختياري)",
                      },
                    },
                  ]
            }
            value={draft}
            onChange={setDraft}
            disabled={busy}
          />
          <label>
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              disabled={busy}
            />
            {t({ en: "I reviewed this schedule.", ar: "راجعت هذا الموعد." })}
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setEdit(null);
              void list.refetch();
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
export function ContentRollbackPanel() {
  const c = useServices().contentApi!,
    { t } = useLocale(),
    client = useQueryClient();
  const [type, setType] = useState(""),
    [id, setId] = useState(""),
    [version, setVersion] = useState(""),
    [target, setTarget] = useState<{
      resourceType: string;
      resourceId: string;
    } | null>(null),
    [page, setPage] = useState(1),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [diffInput, setDiffInput] = useState<{ from: string; to: string } | null>(
      null,
    ),
    [review, setReview] = useState<{
      preview: Operations["post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore_preview"]["response"];
      sourceVersion: string;
      target: { resourceType: string; resourceId: string };
      key: string;
    } | null>(null),
    [reason, setReason] = useState(""),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [notice, setNotice] = useState("");
  const list = useQuery({
      queryKey: ["native-content", "resource-versions", target, page],
      queryFn: () => c[C.resourceVersions]({ path: target!, query: { page } }),
      enabled: !!target,
    }),
    diff = useQuery({
      queryKey: ["native-content", "resource-diff", target, diffInput],
      queryFn: () => c[C.resourceCompare]({ path: target!, query: diffInput! }),
      enabled: !!target && !!diffInput,
    });
  return (
    <section className="access-management-card">
      <h2>
        {t({ en: "Restore a resource version", ar: "استعادة نسخة مورد" })}
      </h2>
      <form
        className="account-api-form"
        onSubmit={(e) => {
          e.preventDefault();
          setReview(null);
          setTarget({ resourceType: type, resourceId: id });
          setDiffInput(null);
          setPage(1);
        }}
      >
        <AcademicFields
          fields={[
            {
              key: "type",
              label: { en: "Resource type", ar: "نوع المورد" },
              required: true,
            },
            {
              key: "id",
              label: { en: "Resource reference", ar: "معرّف المورد" },
              required: true,
            },
            {
              key: "version",
              label: {
                en: "Current source record version",
                ar: "نسخة السجل المصدر الحالية",
              },
              required: true,
            },
          ]}
          value={{ type, id, version }}
          onChange={(v) => {
            setType(String(v.type || ""));
            setId(String(v.id || ""));
            setVersion(String(v.version || ""));
          }}
        />
        <Button variant="outline">
          {t({ en: "Load version history", ar: "تحميل سجل النسخ" })}
        </Button>
      </form>
      <ApiActionError
        error={error || list.error || diff.error}
        onReload={() => {
          setReview(null);
          void list.refetch();
        }}
      />
      {notice && <p role="status">{notice}</p>}
      {list.data?.map((item) => (
        <div className="access-row" key={item.id}>
          <span>
            {"versionNumber" in item ? item.versionNumber : item.revisionNumber}{" "}
            · {new Date(item.createdAt).toLocaleString()}
            <small>{item.id}</small>
          </span>
          <Button
            variant="outline"
            disabled={busy}
            onClick={async () => {
              if (!target) return;
              setBusy(true);
              setError(null);
              try {
                const result = await c[C.rollbackPreview]({
                  path: { ...target, versionId: item.id },
                  idempotencyKey: createRecordId(),
                });
                if (result.sourceVersionId !== item.id || !result.snapshotHash)
                  throw new Error(
                    t({
                      en: "Restoration preview does not match the selected version.",
                      ar: "لا تطابق معاينة الاستعادة النسخة المختارة.",
                    }),
                  );
                setReview({
                  preview: result,
                  sourceVersion: version,
                  target: { ...target },
                  key: createRecordId(),
                });
                setReason("");
                setAck(false);
              } catch (caught) {
                setError(caught);
              } finally {
                setBusy(false);
              }
            }}
          >
            {t({ en: "Preview restoration", ar: "معاينة الاستعادة" })}
          </Button>
        </div>
      ))}
      {target && (
        <>
          <div className="academic-pager">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              {t({ en: "Previous", ar: "السابق" })}
            </Button>
            <span>{page}</span>
            <Button
              variant="outline"
              disabled={!list.data?.length}
              onClick={() => setPage(page + 1)}
            >
              {t({ en: "Next", ar: "التالي" })}
            </Button>
          </div>
          <form
            className="account-api-form access-management-toolbar"
            onSubmit={(e) => {
              e.preventDefault();
              setDiffInput({ from, to });
            }}
          >
            <input
              aria-label={t({ en: "From version", ar: "من النسخة" })}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
            <input
              aria-label={t({ en: "To version", ar: "إلى النسخة" })}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
            <Button variant="outline" disabled={from === to}>
              {t({ en: "Compare", ar: "مقارنة" })}
            </Button>
          </form>
        </>
      )}
      {diff.data && (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(diff.data, null, 2)}
        </pre>
      )}
      <Modal
        open={!!review}
        onClose={() => {
          if (!busy) setReview(null);
        }}
        title={t({
          en: "Review version restoration",
          ar: "مراجعة استعادة النسخة",
        })}
        description={review?.preview.sourceVersionId || ""}
      >
        <form
          className="account-api-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!review || !ack || !review.preview.publishedVersionUnchanged)
              return;
            setBusy(true);
            setError(null);
            try {
              await c[C.rollback]({
                path: {
                  ...review.target,
                  versionId: review.preview.sourceVersionId,
                },
                body: {
                  version: review.sourceVersion,
                  reason,
                  snapshotHash: review.preview.snapshotHash,
                },
                idempotencyKey: review.key,
              });
              setReview(null);
              setNotice(
                t({
                  en: "Restored into the reported draft state. Publication remains a separate action.",
                  ar: "تمت الاستعادة إلى حالة المسودة المُبلّغ عنها. يبقى النشر إجراءً منفصلًا.",
                }),
              );
              await refreshContent(client);
            } catch (caught) {
              setError(caught);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>
            {review?.preview.newVersionStatus} ·{" "}
            {review?.preview.publishedVersionUnchanged
              ? t({
                  en: "Published snapshot stays unchanged",
                  ar: "تبقى النسخة المنشورة كما هي",
                })
              : t({
                  en: "This restoration would change published content; this draft-only flow cannot execute it.",
                  ar: "ستغير هذه الاستعادة المحتوى المنشور؛ مسار المسودات هذا لا ينفذها.",
                })}
          </p>
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
              en: "I reviewed the restoration preview.",
              ar: "راجعت معاينة الاستعادة.",
            })}
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setReview(null);
              void list.refetch();
            }}
          />
          <Button
            disabled={
              busy ||
              !ack ||
              !reason.trim() ||
              !review?.preview.publishedVersionUnchanged
            }
          >
            {t({
              en: "Restore reviewed version",
              ar: "استعادة النسخة بعد المراجعة",
            })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
