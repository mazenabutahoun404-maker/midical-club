import { createRecordId } from "../../lib/record-id";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import type {
  AcademicBody,
  AcademicRecord,
  CalendarContext,
} from "../../services/api/academic-admin";
import { AcademicFields, AcademicPager } from "./AcademicUI";
import {
  catalogFields,
  prepareAcademicDraft,
  recordName,
  sectionLabels,
  validateAcademicDraft,
  type CatalogSection,
} from "./academic-fields";

export async function refreshAcademicQueries(
  client: ReturnType<typeof useQueryClient>,
  admin?: import("../../services/api/academic-admin").AcademicAdminService,
) {
  admin?.invalidateCatalog();
  await Promise.all([
    ...[
      "academic-admin",
      "academic-catalog",
      "academics",
      "courses",
      "resources",
      "course-content",
    ].map((key) => client.invalidateQueries({ queryKey: [key] })),
    client.invalidateQueries({ queryKey: ["account", "academic-profile"] }),
    client.invalidateQueries({ queryKey: ["governance", "users"] }),
  ]);
}
export function AcademicCatalogPanel({
  section,
  can,
}: {
  section: CatalogSection;
  can: (name: string) => boolean;
}) {
  const admin = useServices().academicAdmin!,
    { t } = useLocale(),
    client = useQueryClient();
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [parent, setParent] = useState(""),
    [parentDraft, setParentDraft] = useState("");
  const [edit, setEdit] = useState<{
      row?: AcademicRecord;
      key: string;
    } | null>(null),
    [draft, setDraft] = useState<Record<string, unknown>>({}),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const [action, setAction] = useState<{
      kind: string;
      row: AcademicRecord;
      key: string;
      context?: CalendarContext;
      semesters?: AcademicRecord[];
    } | null>(null),
    [explanation, setExplanation] = useState(""),
    [targetSemester, setTargetSemester] = useState(""),
    [ack, setAck] = useState(false);
  const list = useQuery<{
    items: AcademicRecord[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ["academic-admin", section, parent, page, query],
    queryFn: () =>
      section === "semesters"
        ? admin.semesters.list(parent, {
            Page: page,
            PageSize: 20,
            Search: query || undefined,
          })
        : admin[section].list({
            Page: page,
            PageSize: 20,
            Search: query || undefined,
          }),
    enabled: section !== "semesters" || !!parent,
  });
  const refs = useQuery({
    queryKey: [
      "academic-admin",
      "suggestions",
      section,
      String(draft.academicYearId || parent),
    ],
    queryFn: async () => {
      const choices: Record<string, Record<string, unknown>[]> = {};
      const needed = new Set(
        catalogFields[section].map((f) => f.reference).filter(Boolean),
      );
      if (section === "semesters") needed.add("years");
      const loads = [...needed]
        .filter(
          (ref): ref is CatalogSection =>
            !!ref && can(`academics.${ref}.manage`),
        )
        .map(async (ref) => {
          if (ref === "semesters") {
            const year = String(draft.academicYearId || parent);
            if (year)
              choices[ref] = (
                await admin.semesters.list(year, { Page: 1, PageSize: 100 })
              ).items;
          } else
            choices[ref] = (
              await admin[ref].list({ Page: 1, PageSize: 100 })
            ).items;
        });
      const results = await Promise.allSettled(loads);
      return { choices, failed: results.some((r) => r.status === "rejected") };
    },
    enabled: !!edit || section === "semesters",
  });
  const reload = async () => {
    setEdit(null);
    setAction(null);
    setError(null);
    await refreshAcademicQueries(client, admin);
  };
  const open = async (row?: Record<string, unknown>) => {
    setError(null);
    setNotice("");
    setBusy(true);
    try {
      let detail: Record<string, unknown> | undefined;
      if (row) {
        const value = await admin[section].get(String(row.id));
        detail = "offering" in value ? value.offering : value;
      }
      setDraft(prepareAcademicDraft(section, detail));
      setEdit({
        row: detail as AcademicRecord | undefined,
        key: createRecordId(),
      });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    if (!edit || busy) return;
    setError(null);
    setBusy(true);
    try {
      validateAcademicDraft(section, draft);
      const id = edit.row?.id;
      if (section === "years") {
        const body = draft as AcademicBody<"AcademicYearRequest">;
        if (id) await admin.years.update(id, body, edit.key);
        else await admin.years.create(body, edit.key);
      }
      if (section === "batches") {
        const body = draft as AcademicBody<"BatchAcademicRequest">;
        if (id) await admin.batches.update(id, body, edit.key);
        else await admin.batches.create(body, edit.key);
      }
      if (section === "subjects") {
        const body = draft as AcademicBody<"SubjectRequest">;
        if (id) await admin.subjects.update(id, body, edit.key);
        else await admin.subjects.create(body, edit.key);
      }
      if (section === "offerings") {
        const body = draft as AcademicBody<"OfferingRequest">;
        if (id) await admin.offerings.update(id, body, edit.key);
        else await admin.offerings.create(body, edit.key);
      }
      if (section === "semesters") {
        const body = draft as AcademicBody<"SemesterRequest">;
        if (id) await admin.semesters.update(id, body, edit.key);
        else await admin.semesters.create(parent, body, edit.key);
      }
      setEdit(null);
      setNotice(t({ en: "Changes saved.", ar: "تم حفظ التغييرات." }));
      await refreshAcademicQueries(client, admin);
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const beginAction = async (kind: string, row: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    setExplanation("");
    setTargetSemester("");
    setAck(false);
    setNotice("");
    try {
      const detail =
        section === "years"
          ? await admin.years.get(String(row.id))
          : await admin.semesters.get(String(row.id));
      const extra =
        kind === "activate"
          ? await Promise.all([
              admin.currentContext(),
              admin.semesters.list(detail.id, { Page: 1, PageSize: 100 }),
            ])
          : null;
      setAction({
        kind,
        row: detail,
        key: createRecordId(),
        ...(extra ? { context: extra[0], semesters: extra[1].items } : {}),
      });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const runAction = async () => {
    if (!action || !ack || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body = {
        version: action.row.version,
        reason: explanation,
        ...(targetSemester ? { nextSemesterId: targetSemester } : {}),
      };
      if (section === "years") {
        if (action.kind === "activate")
          await admin.years.activate(
            action.row.id,
            action.row.version,
            targetSemester,
            explanation,
            action.context ?? null,
            action.key,
          );
        else await admin.years.archive(action.row.id, body, action.key);
      } else if (action.kind === "makeCurrent")
        await admin.semesters.makeCurrent(action.row.id, body, action.key);
      else if (action.kind === "reopen")
        await admin.semesters.reopen(action.row.id, body, action.key);
      else await admin.semesters.archive(action.row.id, body, action.key);
      setAction(null);
      setNotice(
        t({
          en: "Calendar updated. Student progression is a separate action.",
          ar: "تم تحديث التقويم. ترفيع الطلبة إجراء منفصل.",
        }),
      );
      await refreshAcademicQueries(client, admin);
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const actionLabel = (kind: string) =>
    kind === "activate"
      ? t({ en: "Activate year and semester", ar: "تفعيل العام والفصل" })
      : kind === "makeCurrent"
        ? t({ en: "Make current", ar: "تعيين كحالي" })
        : kind === "reopen"
          ? t({ en: "Reopen", ar: "إعادة فتح" })
          : t({ en: "Archive", ar: "أرشفة" });
  const [progress, setProgress] = useState<Record<string, unknown> | null>(
    null,
  );
  return (
    <section className="access-management-card">
      <h2>{t(sectionLabels[section])}</h2>
      {section === "semesters" && (
        <form
          className="account-api-form"
          onSubmit={(e) => {
            e.preventDefault();
            setParent(parentDraft);
            setPage(1);
          }}
        >
          <label>
            {t({ en: "Academic year", ar: "العام الدراسي" })}
            <input
              required
              value={parentDraft}
              list="academic-parent-years"
              onChange={(e) => setParentDraft(e.target.value)}
            />
            <datalist id="academic-parent-years">
              {refs.data?.choices.years?.map((row) => (
                <option key={String(row.id)} value={String(row.id)}>
                  {recordName(row)}
                </option>
              ))}
            </datalist>
          </label>
          <Button variant="outline">
            {t({ en: "Load semesters", ar: "عرض الفصول" })}
          </Button>
        </form>
      )}
      <form
        className="account-api-form access-management-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(search);
          setPage(1);
        }}
      >
        <input
          aria-label={t({ en: "Search catalog", ar: "البحث في الدليل" })}
          value={search}
          maxLength={100}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline">{t({ en: "Search", ar: "بحث" })}</Button>
        <Button
          type="button"
          disabled={busy || (section === "semesters" && !parent)}
          onClick={() => void open()}
        >
          {t({ en: "Create", ar: "إنشاء" })}
        </Button>
      </form>
      {notice && <p role="status">{notice}</p>}
      <ApiActionError error={error} onReload={() => void reload()} />
      {list.isFetching && <LoadingState />}
      {list.isError && <ErrorState retry={() => void list.refetch()} />}
      {list.data && !list.isFetching && (
        <>
          <p className="access-scope-note">
            {t({
              en: "Records visible to your account",
              ar: "السجلات المتاحة لحسابك",
            })}
            : {list.data.total}
          </p>
          {list.data.items.length === 0 && (
            <p>{t({ en: "No records found.", ar: "لا توجد سجلات." })}</p>
          )}
          {list.data.items.map((row) => (
            <div className="access-row" key={row.id}>
              <span>
                <strong>
                  <bdi>{recordName(row)}</bdi>
                </strong>
                <small>
                  {"scopeType" in row
                    ? `${row.scopeType} · ${row.studyYear}`
                    : "code" in row
                      ? String(row.code)
                      : "startDate" in row
                        ? String(row.startDate || "")
                        : ""}{" "}
                  {"status" in row ? ` · ${row.status}` : ""}
                </small>
                <span className="academic-record-id">{row.id}</span>
              </span>
              <div className="access-row-actions">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void open(row)}
                >
                  {t({ en: "Edit", ar: "تعديل" })}
                </Button>
                {section === "years" && can("academics.semesters.manage") && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void beginAction("activate", row)}
                  >
                    {actionLabel("activate")}
                  </Button>
                )}
                {section === "semesters" &&
                  can("academics.semesters.manage") && (
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => void beginAction("makeCurrent", row)}
                    >
                      {actionLabel("makeCurrent")}
                    </Button>
                  )}
                {(section === "years" ||
                  (section === "semesters" &&
                    can("academics.semesters.archive"))) && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void beginAction("archive", row)}
                  >
                    {actionLabel("archive")}
                  </Button>
                )}
                {section === "semesters" &&
                  can("academics.semesters.reopen") && (
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => void beginAction("reopen", row)}
                    >
                      {actionLabel("reopen")}
                    </Button>
                  )}
                {section === "batches" && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={async () => {
                      setError(null);
                      try {
                        setProgress(await admin.batches.progress(row.id));
                      } catch (caught) {
                        setError(caught);
                      }
                    }}
                  >
                    {t({ en: "Progress", ar: "التقدم" })}
                  </Button>
                )}
              </div>
            </div>
          ))}
          <AcademicPager
            page={page}
            totalPages={list.data.totalPages}
            onChange={setPage}
          />
        </>
      )}
      {progress && (
        <p className="academic-review-note" role="status">
          {String(progress.id)} · {t({ en: "Progress", ar: "التقدم" })}:{" "}
          {progress.progress === null ? "—" : String(progress.progress)} ·{" "}
          {t({ en: "Days remaining", ar: "الأيام المتبقية" })}:{" "}
          {String(progress.daysRemaining ?? "—")}{" "}
          {progress.needsAcademicSetup === true &&
            t({
              en: "Academic setup is required.",
              ar: "يلزم إعداد البيانات الأكاديمية.",
            })}
        </p>
      )}
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) {
            setEdit(null);
            setError(null);
          }
        }}
        title={t(sectionLabels[section])}
        description={
          edit?.row
            ? t({
                en: "Review and save this record.",
                ar: "راجع السجل ثم احفظه.",
              })
            : t({
                en: "Create a new catalog record.",
                ar: "إنشاء سجل جديد في الدليل.",
              })
        }
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <AcademicFields
            fields={catalogFields[section]}
            value={draft}
            onChange={setDraft}
            disabled={busy}
            choices={refs.data?.choices}
          />
          {refs.data?.failed && (
            <p>
              {t({
                en: "Some suggestions could not load. You can enter a record reference.",
                ar: "تعذّر تحميل بعض الاقتراحات. يمكنك إدخال معرّف السجل.",
              })}
            </p>
          )}
          <ApiActionError error={error} onReload={() => void reload()} />
          <Button disabled={busy}>{t({ en: "Save", ar: "حفظ" })}</Button>
        </form>
      </Modal>
      <Modal
        open={!!action}
        onClose={() => {
          if (!busy) {
            setAction(null);
            setError(null);
          }
        }}
        title={actionLabel(action?.kind || "")}
        description={action ? recordName(action.row) : ""}
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={(e) => {
            e.preventDefault();
            void runAction();
          }}
        >
          {action?.kind === "activate" && (
            <>
              <p className="academic-review-note">
                {t({
                  en: "The selected Draft semester becomes current. The previous calendar remains available. This does not promote students.",
                  ar: "سيصبح الفصل المختار هو الحالي مع بقاء التقويم السابق متاحًا. هذا الإجراء لا يرفّع الطلبة.",
                })}
              </p>
              <p>
                {t({ en: "Current calendar", ar: "التقويم الحالي" })}:{" "}
                {action.context
                  ? `${action.context.academicYear.name} · ${action.context.semester.semesterType}`
                  : t({ en: "None", ar: "لا يوجد" })}
              </p>
              <label>
                {t({ en: "Target semester", ar: "الفصل المستهدف" })}
                <select
                  required
                  value={targetSemester}
                  onChange={(e) => setTargetSemester(e.target.value)}
                  disabled={busy}
                >
                  <option value="">
                    {t({
                      en: "Choose a Draft semester",
                      ar: "اختر فصلًا بحالة مسودة",
                    })}
                  </option>
                  {action.semesters
                    ?.filter(
                      (row) =>
                        row.status === "Draft" ||
                        (action.row.status === "Current" &&
                          row.status === "Current"),
                    )
                    .map((row) => (
                      <option key={row.id} value={row.id}>
                        {recordName(row)} · {String(row.startDate)}
                      </option>
                    ))}
                </select>
              </label>
            </>
          )}
          {action?.kind !== "activate" && (
            <label>
              {t({
                en: "Replacement semester reference (optional)",
                ar: "معرّف الفصل البديل (اختياري)",
              })}
              <input
                value={targetSemester}
                onChange={(e) => setTargetSemester(e.target.value)}
                disabled={busy}
              />
            </label>
          )}
          <label>
            {t({ en: "Reason", ar: "السبب" })}
            <textarea
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="academic-checkbox">
            <span>
              {t({
                en: "I reviewed this calendar change.",
                ar: "راجعت تغيير التقويم.",
              })}
            </span>
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              disabled={busy}
            />
          </label>
          <ApiActionError error={error} onReload={() => void reload()} />
          <Button
            disabled={
              busy ||
              !ack ||
              !explanation.trim() ||
              (action?.kind === "activate" && !targetSemester)
            }
          >
            {t({ en: "Confirm change", ar: "تأكيد التغيير" })}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
