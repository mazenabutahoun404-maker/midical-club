import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { AcademicFields, AcademicPager } from "../academics/AcademicUI";
import { C } from "./content-keys";
import { reasonField, parseArray, parseObject } from "./content-fields";
import { refreshContent } from "./content-cache";
import { createRecordId } from "../../lib/record-id";
import type { Schemas, Operations } from "../../services/api/schema.generated";
type Page =
  Operations["get_api_v1_admin_content_pages_by_id"]["response"]["page"];
export function ContentPageHistory({ page }: { page: Page }) {
  const c = useServices().contentApi!,
    { t } = useLocale(),
    client = useQueryClient();
  const [mode, setMode] = useState("versions"),
    [index, setIndex] = useState(1),
    [selected, setSelected] = useState(""),
    [compare, setCompare] = useState<{ from: string; to: string } | null>(null),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [restore, setRestore] = useState<{
      id: string;
      version: string;
      key: string;
      mode: string;
    } | null>(null),
    [reason, setReason] = useState(""),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const list = useQuery({
    queryKey: ["native-content", mode, page.id, index],
    queryFn: async () =>
      mode === "versions"
        ? c[C.versions]({
            path: { pageId: page.id },
            query: { Page: index, PageSize: 20 },
          })
        : c[C.draftRevisions]({
            path: { pageId: page.id },
            query: { Page: index, PageSize: 20 },
          }),
  });
  const detail = useQuery({
    queryKey: ["native-content", "snapshot", mode, page.id, selected],
    queryFn: async () =>
      mode === "versions"
        ? c[C.version]({ path: { pageId: page.id, versionId: selected } })
        : c[C.draftRevision]({
            path: { pageId: page.id, revisionId: selected },
          }),
    enabled: !!selected,
  });
  const diff = useQuery({
    queryKey: ["native-content", "compare", page.id, compare],
    queryFn: () =>
      c[C.compare]({
        path: { pageId: page.id },
        query: { from: compare!.from, to: compare!.to, details: true },
      }),
    enabled: !!compare,
  });
  return (
    <section className="access-management-card">
      <h2>{t({ en: "Page history", ar: "سجل الصفحة" })}</h2>
      <div className="academic-admin-tabs">
        {["versions", "drafts"].map((v) => (
          <button
            key={v}
            aria-pressed={mode === v}
            onClick={() => {
              setMode(v);
              setIndex(1);
              setSelected("");
            }}
          >
            {t(
              v === "versions"
                ? { en: "Published versions", ar: "النسخ المنشورة" }
                : { en: "Draft revisions", ar: "مراجعات المسودة" },
            )}
          </button>
        ))}
      </div>
      <ApiActionError
        error={error || list.error || detail.error || diff.error}
        onReload={() => {
          setRestore(null);
          void refreshContent(client);
        }}
      />
      {list.data?.items.map((item) => (
        <div className="access-row" key={item.id}>
          <span>
            <strong>
              {"versionNumber" in item
                ? item.versionNumber
                : "kind" in item
                  ? item.kind
                  : ""}
            </strong>
            <small>
              {new Date(item.createdAt).toLocaleString()} · {item.id}
            </small>
          </span>
          <div className="access-row-actions">
            <Button variant="outline" onClick={() => setSelected(item.id)}>
              {t({ en: "Inspect snapshot", ar: "عرض النسخة" })}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setReason("");
                setAck(false);
                setError(null);
                setRestore({
                  id: item.id,
                  version: page.version,
                  key: createRecordId(),
                  mode,
                });
              }}
            >
              {t({ en: "Restore", ar: "استعادة" })}
            </Button>
          </div>
        </div>
      ))}
      {list.data && (
        <AcademicPager
          page={index}
          totalPages={list.data.totalPages}
          onChange={setIndex}
        />
      )}
      <details open={!!selected}>
        <summary>
          {t({ en: "Selected snapshot", ar: "النسخة المختارة" })}
        </summary>
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {detail.data?.snapshotJson || ""}
        </pre>
      </details>
      <form
        className="account-api-form access-management-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setCompare({ from, to });
        }}
      >
        <input
          aria-label={t({
            en: "From version reference",
            ar: "معرّف النسخة السابقة",
          })}
          required
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          aria-label={t({
            en: "To version reference",
            ar: "معرّف النسخة التالية",
          })}
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Button variant="outline" disabled={from === to}>
          {t({ en: "Compare versions", ar: "مقارنة النسخ" })}
        </Button>
      </form>
      {diff.data && (
        <>
          <p>
            {diff.data.count} ·{" "}
            {diff.data.truncated
              ? t({ en: "Comparison truncated", ar: "المقارنة مختصرة" })
              : ""}
          </p>
          {diff.data.details.map((item, i) => (
            <p key={i}>
              {item.path}: {JSON.stringify(item.before)} →{" "}
              {JSON.stringify(item.after)}
            </p>
          ))}
        </>
      )}
      <Modal
        open={!!restore}
        onClose={() => {
          if (!busy) setRestore(null);
        }}
        title={t({
          en: "Restore reviewed snapshot",
          ar: "استعادة النسخة بعد المراجعة",
        })}
        description={restore?.id || ""}
      >
        <form
          className="account-api-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!restore || !ack) return;
            setBusy(true);
            setError(null);
            try {
              const input = {
                body: {
                  version: restore.version,
                  reason,
                  publishImmediately: false,
                },
                idempotencyKey: restore.key,
              };
              if (restore.mode === "versions")
                await c[C.restoreVersion]({
                  ...input,
                  path: { pageId: page.id, versionId: restore.id },
                });
              else
                await c[C.restoreDraftRevision]({
                  ...input,
                  path: { pageId: page.id, revisionId: restore.id },
                });
              setRestore(null);
              await refreshContent(client);
            } catch (caught) {
              setError(caught);
            } finally {
              setBusy(false);
            }
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
              en: "I inspected the selected snapshot.",
              ar: "راجعت النسخة المختارة.",
            })}
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setRestore(null);
              void refreshContent(client);
            }}
          />
          <Button disabled={busy || !ack || !reason.trim()}>
            {t({ en: "Confirm restore", ar: "تأكيد الاستعادة" })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
export function ContentSchedules({ page }: { page: Page }) {
  const c = useServices().contentApi!,
    { t } = useLocale(),
    client = useQueryClient();
  const [index, setIndex] = useState(1),
    [edit, setEdit] = useState<{
      id?: string;
      version: string;
      scheduleVersion?: string;
      key: string;
      cancel?: boolean;
    } | null>(null),
    [draft, setDraft] = useState<Record<string, unknown>>({}),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const list = useQuery({
    queryKey: ["native-content", "schedules", page.id, index],
    queryFn: () =>
      c[C.schedules]({
        path: { pageId: page.id },
        query: { Page: index, PageSize: 20 },
      }),
  });
  return (
    <section className="access-management-card">
      <h2>{t({ en: "Publication schedules", ar: "جداول النشر" })}</h2>
      <Button
        onClick={() => {
          setDraft({ action: "Publish", reason: "" });
          setAck(false);
          setError(null);
          setEdit({ version: page.version, key: createRecordId() });
        }}
      >
        {t({ en: "Schedule publication", ar: "جدولة النشر" })}
      </Button>
      <ApiActionError error={error || list.error} />
      {list.data?.items.map((item) => (
        <div className="access-row" key={item.id}>
          <span>
            {item.action} · {new Date(item.executeAt).toLocaleString()} ·{" "}
            {item.status}
            <small>{item.error || ""}</small>
          </span>
          <div className="access-row-actions">
            {[false, true].map((cancel) => (
              <Button
                variant="outline"
                key={String(cancel)}
                onClick={() => {
                  setDraft({
                    action: item.action,
                    executeAt: item.executeAt,
                    reason: "",
                  });
                  setAck(false);
                  setError(null);
                  setEdit({
                    id: item.id,
                    version: page.version,
                    scheduleVersion: item.version,
                    key: createRecordId(),
                    cancel,
                  });
                }}
              >
                {t(
                  cancel
                    ? { en: "Cancel schedule", ar: "إلغاء الجدولة" }
                    : { en: "Reschedule", ar: "تغيير الموعد" },
                )}
              </Button>
            ))}
          </div>
        </div>
      ))}
      {list.data && (
        <AcademicPager
          page={index}
          totalPages={list.data.totalPages}
          onChange={setIndex}
        />
      )}
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) setEdit(null);
        }}
        title={t({
          en: "Review publication schedule",
          ar: "مراجعة جدولة النشر",
        })}
        description={page.slug}
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!edit || !ack) return;
            setBusy(true);
            setError(null);
            try {
              if (edit.cancel)
                await c[C.deleteSchedule]({
                  path: { pageId: page.id, scheduleId: edit.id! },
                  query: { version: edit.scheduleVersion! },
                  idempotencyKey: edit.key,
                });
              else {
                const body = {
                  ...draft,
                  version: edit.version,
                  scheduleVersion: edit.scheduleVersion,
                } as Schemas["ScheduleRequest"];
                if (edit.id)
                  await c[C.updateSchedule]({
                    path: { pageId: page.id, scheduleId: edit.id },
                    body,
                    idempotencyKey: edit.key,
                  });
                else
                  await c[C.addSchedule]({
                    path: { pageId: page.id },
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
          {!edit?.cancel && (
            <AcademicFields
              fields={[
                {
                  key: "action",
                  label: { en: "Action", ar: "الإجراء" },
                  required: true,
                },
                {
                  key: "executeAt",
                  label: {
                    en: "Run at (local time)",
                    ar: "التنفيذ في (التوقيت المحلي)",
                  },
                  type: "datetime-local",
                  required: true,
                },
                {
                  key: "versionId",
                  label: {
                    en: "Selected snapshot reference (optional)",
                    ar: "معرّف النسخة المختارة (اختياري)",
                  },
                },
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
              en: "I reviewed the schedule and snapshot.",
              ar: "راجعت الجدولة والنسخة.",
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
export function ContentVisibility({
  pageId,
  sections,
}: {
  pageId: string;
  sections: Operations["get_api_v1_admin_content_pages_by_id"]["response"]["draft"]["sections"];
}) {
  const c = useServices().contentApi!,
    { t } = useLocale(),
    client = useQueryClient();
  const [target, setTarget] = useState({
      targetType: "page",
      targetId: pageId,
    }),
    [type, setType] = useState("page"),
    [id, setId] = useState(pageId),
    [edit, setEdit] = useState<{ version: string; key: string } | null>(null),
    [text, setText] = useState("[]"),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const rules = useQuery({
    queryKey: ["native-content", "visibility", target],
    queryFn: () => c[C.visibility]({ path: target }),
  });
  return (
    <section className="access-management-card">
      <h2>
        {t({ en: "Audience & visibility rules", ar: "قواعد الفئات والظهور" })}
      </h2>
      <form
        className="account-api-form access-management-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setEdit(null);
          setTarget({ targetType: type, targetId: id });
        }}
      >
        <input
          aria-label={t({ en: "Target type", ar: "نوع الهدف" })}
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <input
          aria-label={t({ en: "Target reference", ar: "معرّف الهدف" })}
          list="content-targets"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <datalist id="content-targets">
          <option value={pageId}>Page</option>
          {sections.flatMap((section) => [
            <option key={section.id} value={section.id}>
              {section.sectionKey}
            </option>,
            ...section.blocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.blockType}
              </option>
            )),
          ])}
        </datalist>
        <Button variant="outline">
          {t({ en: "Load rules", ar: "تحميل القواعد" })}
        </Button>
      </form>
      <ApiActionError error={error || rules.error} />
      {rules.data && (
        <>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(rules.data.rules, null, 2)}
          </pre>
          <Button
            variant="outline"
            onClick={() => {
              setText(JSON.stringify(rules.data.rules, null, 2));
              setEdit({ version: rules.data.version, key: createRecordId() });
              setAck(false);
              setError(null);
            }}
          >
            {t({ en: "Replace visibility rules", ar: "استبدال قواعد الظهور" })}
          </Button>
        </>
      )}
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) setEdit(null);
        }}
        title={t({
          en: "Review complete visibility rules",
          ar: "مراجعة قواعد الظهور كاملة",
        })}
        description={target.targetId}
      >
        <form
          className="account-api-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!edit || !ack) return;
            setBusy(true);
            setError(null);
            try {
              const values = parseArray(text) as Schemas["VisibilitySpec"][];
              await c[C.putVisibility]({
                path: target,
                body: { version: edit.version, rules: values },
                idempotencyKey: edit.key,
              });
              setEdit(null);
              await refreshContent(client);
            } catch (caught) {
              setError(caught);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            {t({
              en: "Complete rule set (JSON)",
              ar: "مجموعة القواعد كاملة (JSON)",
            })}
            <textarea
              rows={12}
              dir="ltr"
              value={text}
              onChange={(e) => setText(e.target.value)}
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
              en: "I reviewed the complete audience replacement.",
              ar: "راجعت استبدال الفئات كاملًا.",
            })}
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setEdit(null);
              void rules.refetch();
            }}
          />
          <Button disabled={busy || !ack}>
            {t({ en: "Save rules", ar: "حفظ القواعد" })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
export function ContentClone({ page }: { page: Page }) {
  const c = useServices().contentApi!,
    { t } = useLocale(),
    client = useQueryClient();
  const [draft, setDraft] = useState<Record<string, unknown>>({
      slug: "",
      targetOfferingId: "",
      convertLiveToSnapshot: false,
      reason: "",
    }),
    [batchMap, setBatchMap] = useState("{}"),
    [yearMap, setYearMap] = useState("{}"),
    [review, setReview] = useState<{
      request: Schemas["CloneRequest"];
      operation: Operations["get_api_v1_admin_content_clone_operations_by_operationId"]["response"];
      snapshot: unknown;
      key: string;
    } | null>(null),
    [jobId, setJobId] = useState(""),
    [lookup, setLookup] = useState(""),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [notice, setNotice] = useState(""),
    [key, setKey] = useState(createRecordId());
  const job = useQuery({
    queryKey: ["native-content", "clone-operation", jobId],
    queryFn: () => c[C.cloneOperation]({ path: { operationId: jobId } }),
    enabled: !!jobId,
    retry: false,
  });
  return (
    <section className="access-management-card">
      <h2>{t({ en: "Clone a reviewed page", ar: "نسخ صفحة بعد مراجعتها" })}</h2>
      <form
        className="account-api-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setError(null);
          try {
            const request = {
              ...draft,
              version: page.version,
              batchMapping: parseObject(batchMap),
              studyYearMapping: parseObject(yearMap),
            } as Schemas["CloneRequest"];
            const result = request.targetOfferingId
              ? await c[C.cloneOffering]({
                  path: { pageId: page.id },
                  body: request,
                  idempotencyKey: key,
                })
              : await c[C.clone]({
                  path: { pageId: page.id },
                  body: request,
                  idempotencyKey: key,
                });
            const operation = "operation" in result ? result.operation : result;
            setJobId(operation.id);
            if ("preview" in result)
              setReview({
                request,
                operation,
                snapshot: result.preview,
                key: createRecordId(),
              });
            else
              setNotice(
                t({
                  en: "Operation returned without a review snapshot. Inspect its state before taking another action.",
                  ar: "لم تُعد العملية نسخة للمراجعة. افحص حالتها قبل أي إجراء آخر.",
                }),
              );
            setAck(false);
          } catch (caught) {
            setError(caught);
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy || !!review}>
          <AcademicFields
            fields={[
              {
                key: "slug",
                label: { en: "New page address", ar: "عنوان الصفحة الجديدة" },
                required: true,
              },
              {
                key: "targetOfferingId",
                label: {
                  en: "Target course offering (optional)",
                  ar: "المساق المطروح المستهدف (اختياري)",
                },
              },
              {
                key: "convertLiveToSnapshot",
                label: {
                  en: "Convert live reusable references into snapshots",
                  ar: "تحويل المراجع الحية القابلة لإعادة الاستخدام إلى نسخ ثابتة",
                },
                type: "checkbox",
              },
              reasonField,
            ]}
            value={draft}
            onChange={(value) => {
              setDraft(value);
              setKey(createRecordId());
            }}
          />
          <label>
            {t({ en: "Batch mapping (JSON)", ar: "ربط الدفعات (JSON)" })}
            <textarea
              dir="ltr"
              value={batchMap}
              onChange={(e) => {
                setBatchMap(e.target.value);
                setKey(createRecordId());
              }}
            />
          </label>
          <label>
            {t({
              en: "Study-year mapping (JSON)",
              ar: "ربط السنوات الدراسية (JSON)",
            })}
            <textarea
              dir="ltr"
              value={yearMap}
              onChange={(e) => {
                setYearMap(e.target.value);
                setKey(createRecordId());
              }}
            />
          </label>
        </fieldset>
        <Button disabled={busy || !!review}>
          {t({ en: "Preview clone", ar: "معاينة النسخ" })}
        </Button>
      </form>
      <ApiActionError
        error={error || job.error}
        onReload={() => {
          setReview(null);
          setKey(createRecordId());
          void job.refetch();
        }}
      />
      {notice && <p role="status">{notice}</p>}
      {review && (
        <div className="academic-review-note">
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(review.snapshot, null, 2)}
          </pre>
          <p>
            {t({ en: "Expires", ar: "تنتهي" })}:{" "}
            {new Date(review.operation.expiresAt).toLocaleString()}
          </p>
          <label>
            <input
              type="checkbox"
              checked={ack}
              disabled={busy}
              onChange={(e) => setAck(e.target.checked)}
            />
            {t({
              en: "I reviewed the clone target, mappings and content.",
              ar: "راجعت هدف النسخ والروابط والمحتوى.",
            })}
          </label>
          <div className="account-security-actions">
            <Button
              disabled={busy || !ack}
              onClick={async () => {
                if (!review) return;
                setBusy(true);
                setError(null);
                try {
                  if (
                    Date.parse(review.operation.expiresAt) <= Date.now() ||
                    !Number.isFinite(Date.parse(review.operation.expiresAt))
                  )
                    throw new Error(
                      t({
                        en: "The clone preview expired. Create a new preview.",
                        ar: "انتهت المعاينة. أنشئ معاينة جديدة.",
                      }),
                    );
                  const body = {
                    ...review.request,
                    previewId: review.operation.id,
                  };
                  const input = {
                    path: { pageId: page.id },
                    body,
                    idempotencyKey: review.key,
                  };
                  const result = body.targetOfferingId
                    ? await c[C.cloneOffering](input)
                    : await c[C.clone](input);
                  setJobId(
                    "operation" in result ? result.operation.id : result.id,
                  );
                  setReview(null);
                  setNotice(
                    t({
                      en: "Clone accepted. Inspect the operation status; it may still be processing.",
                      ar: "تم قبول النسخ. افحص حالة العملية؛ قد تستمر المعالجة.",
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
              {t({
                en: "Execute reviewed clone",
                ar: "تنفيذ النسخ بعد المراجعة",
              })}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                setReview(null);
                setKey(createRecordId());
              }}
            >
              {t({ en: "Revise", ar: "تعديل" })}
            </Button>
          </div>
        </div>
      )}
      <form
        className="account-api-form access-management-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setReview(null);
          setJobId(lookup.trim());
        }}
      >
        <input
          aria-label={t({
            en: "Clone operation reference",
            ar: "معرّف عملية النسخ",
          })}
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          required
        />
        <Button variant="outline">
          {t({ en: "Track operation", ar: "متابعة العملية" })}
        </Button>
      </form>
      {job.data && (
        <p>
          {job.data.status} · {job.data.targetSlug} · {job.data.error || ""}{" "}
          <Button variant="outline" onClick={() => void job.refetch()}>
            {t({ en: "Refresh", ar: "تحديث" })}
          </Button>
        </p>
      )}
    </section>
  );
}
