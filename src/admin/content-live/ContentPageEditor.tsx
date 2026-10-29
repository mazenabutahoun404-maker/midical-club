import { useState } from "react";
import { VisualDraftEditor } from "./VisualDraftEditor";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../governance/useGovernance";
import { PageIntro } from "../../components/data-display/PageIntro";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { AcademicFields } from "../academics/AcademicUI";
import {
  blockTypes,
  localizedBody,
  pageFields,
  parseObject,
  sectionFields,
  reasonField,
} from "./content-fields";
import { C } from "./content-keys";
import { refreshContent } from "./content-cache";
import { PublishedContent } from "../../features/resources/PublishedContent";
import {
  ContentPageHistory,
  ContentSchedules,
  ContentVisibility,
  ContentClone,
} from "./ContentPageTools";
import { createRecordId } from "../../lib/record-id";
import { requireVersion } from "../../services/api/accounts";
import type { Schemas } from "../../services/api/schema.generated";
import type { Field } from "../academics/academic-fields";
import "../../styles/account-access.css";
import "../../styles/academic-admin.css";
export default function ContentPageEditor() {
  const { pageId } = useParams(),
    owner = useAuth().snapshot.user?.id || "guest";
  return <Editor key={owner + pageId} pageId={pageId || ""} />;
}
function Editor({ pageId }: { pageId: string }) {
  const services = useServices(),
    c = services.contentApi!,
    { t, locale } = useLocale(),
    client = useQueryClient(),
    access = useAccess();
  const canPublish = !!access.data?.permissions?.includes("content.publish");
  const [visualPending, setVisualPending] = useState(false);
  const [tab, setTab] = useState("visual"),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [edit, setEdit] = useState<{
      kind: string;
      version: string;
      sectionId?: string;
      blockId?: string;
      ids?: string[];
      key: string;
    } | null>(null),
    [draft, setDraft] = useState<Record<string, unknown>>({}),
    [json, setJson] = useState("{}"),
    [ack, setAck] = useState(false),
    [audience, setAudience] = useState<Schemas["ContentAudience"]>("Guest");
  const [previewBatch, setPreviewBatch] = useState("");
  const [previewYear, setPreviewYear] = useState("");
  const data = useQuery({
    queryKey: ["native-content", "page", pageId],
    queryFn: () => c[C.page]({ path: { id: pageId } }),
    enabled: !!pageId,
  });
  const schemas = useQuery({
    queryKey: ["native-content", "schemas", data.data?.page.teamId],
    queryFn: () =>
      c[C.schemas]({ query: { teamId: data.data?.page.teamId || undefined } }),
    enabled: !!data.data,
  });
  const preview = useQuery({
    queryKey: [
      "native-content",
      "preview",
      pageId,
      locale,
      audience,
      previewBatch,
      previewYear,
    ],
    queryFn: () =>
      c[C.preview]({
        path: { id: pageId },
        query: {
          locale,
          audience,
          batchId: previewBatch || undefined,
          studyYear: previewYear ? Number(previewYear) : undefined,
        },
      }),
    enabled: tab === "preview",
  });
  const reload = async () => {
    setEdit(null);
    setError(null);
    await refreshContent(client);
  };
  if (data.isPending) return <LoadingState />;
  if (data.isError)
    return (
      <div className="container">
        <ApiActionError error={data.error} />
        <Button onClick={() => void data.refetch()}>
          {t({ en: "Retry", ar: "إعادة المحاولة" })}
        </Button>
      </div>
    );
  const { page, draft: document, sectionVersions, blockVersions } = data.data;
  const sectionVersion = (id: string) =>
      sectionVersions.find((item) => item.id === id)?.version || "",
    blockVersion = (id: string) =>
      blockVersions.find((item) => item.id === id)?.version || "";
  const begin = (
    kind: string,
    options: { sectionId?: string; blockId?: string; ids?: string[] } = {},
  ) => {
    setError(null);
    setAck(false);
    setNotice("");
    const section = document.sections.find(
        (item) => item.id === options.sectionId,
      ),
      block = section?.blocks.find((item) => item.id === options.blockId);
    const version = options.blockId
      ? blockVersion(options.blockId)
      : options.sectionId
        ? sectionVersion(options.sectionId)
        : page.version;
    setEdit({ kind, version, ...options, key: createRecordId() });
    setDraft(
      kind === "metadata"
        ? { ...page }
        : kind === "section" && section
          ? {
              ...section,
              titleAr: section.title?.ar,
              titleEn: section.title?.en,
            }
          : kind === "new-section"
            ? {
                sectionKey: "",
                sectionType: "",
                position: document.sections.length,
                isPinned: false,
                status: "Active",
              }
            : kind === "block" && block
              ? { blockType: block.blockType, position: block.position }
              : kind === "new-block"
                ? { blockType: "Text", position: section?.blocks.length || 0 }
                : { reason: "" },
    );
    setJson(
      JSON.stringify(
        kind === "document" || kind === "checkpoint"
          ? document
          : kind === "block"
            ? block?.configuration
            : {},
        null,
        2,
      ),
    );
  };
  const actionLabel = (kind: string) =>
    t(
      (
        {
          metadata: { en: "Edit page details", ar: "تعديل بيانات الصفحة" },
          section: { en: "Edit section", ar: "تعديل القسم" },
          "new-section": { en: "Add section", ar: "إضافة قسم" },
          block: { en: "Edit block", ar: "تعديل الكتلة" },
          "new-block": { en: "Add block", ar: "إضافة كتلة" },
          document: { en: "Save complete draft", ar: "حفظ المسودة كاملة" },
          checkpoint: {
            en: "Create draft checkpoint",
            ar: "إنشاء نقطة حفظ للمسودة",
          },
          publish: { en: "Publish page", ar: "نشر الصفحة" },
          unpublish: { en: "Unpublish page", ar: "إلغاء نشر الصفحة" },
          archive: { en: "Archive page", ar: "أرشفة الصفحة" },
          restore: { en: "Restore draft", ar: "استعادة المسودة" },
          "delete-section": { en: "Remove section", ar: "إزالة القسم" },
          "delete-block": { en: "Remove block", ar: "إزالة الكتلة" },
          "duplicate-section": { en: "Duplicate section", ar: "نسخ القسم" },
          "duplicate-block": { en: "Duplicate block", ar: "نسخ الكتلة" },
          "reorder-sections": {
            en: "Reorder sections",
            ar: "إعادة ترتيب الأقسام",
          },
          "reorder-blocks": { en: "Reorder blocks", ar: "إعادة ترتيب الكتل" },
        } as Record<string, { en: string; ar: string }>
      )[kind] || { en: "Confirm change", ar: "تأكيد التغيير" },
    );
  const submit = async () => {
    if (!edit || busy || !ack) return;
    setBusy(true);
    setError(null);
    try {
      requireVersion(edit.version);
      const command = { idempotencyKey: edit.key };
      const action = {
        version: edit.version,
        reason: String(draft.reason || ""),
        publishImmediately: false,
      };
      if (edit.kind === "metadata") {
        const body = {
          pageType: draft.pageType,
          slug: draft.slug,
          ...localizedBody(draft),
          teamId: draft.teamId || null,
          subjectOfferingId: draft.subjectOfferingId || null,
          version: edit.version,
          editorial: JSON.parse(page.editorialJson || "null"),
        } as Schemas["PageRequest"];
        await c[C.updatePage]({ path: { id: pageId }, body, ...command });
      }
      if (edit.kind === "new-section" || edit.kind === "section") {
        const body = {
          sectionKey: draft.sectionKey,
          sectionType: draft.sectionType,
          title: localizedBody(draft).title,
          position: draft.position,
          isPinned: draft.isPinned === true,
          pinnedFrom: draft.pinnedFrom || null,
          pinnedUntil: draft.pinnedUntil || null,
          status: draft.status,
          version: edit.version,
        } as Schemas["SectionRequest"];
        if (edit.kind === "new-section")
          await c[C.addSection]({ path: { pageId }, body, ...command });
        else
          await c[C.updateSection]({
            path: { sectionId: edit.sectionId! },
            body,
            ...command,
          });
      }
      if (edit.kind === "new-block" || edit.kind === "block") {
        const config = parseObject(json);
        const schema = schemas.data?.find(
          (item) => item.blockType === draft.blockType,
        );
        if (schema?.additionalProperties === false) {
          const invalid = Object.keys(config).filter(
            (key) => !schema.allowedFields.includes(key),
          );
          if (invalid.length)
            throw new Error(
              t({
                en: "Unsupported configuration fields: ",
                ar: "حقول إعداد غير مدعومة: ",
              }) + invalid.join(", "),
            );
        }
        const body = {
          blockType: draft.blockType,
          position: draft.position,
          configuration: config,
          version: edit.version,
        } as Schemas["BlockRequest"];
        if (edit.kind === "new-block")
          await c[C.addBlock]({
            path: { sectionId: edit.sectionId! },
            body,
            ...command,
          });
        else
          await c[C.updateBlock]({
            path: { blockId: edit.blockId! },
            body,
            ...command,
          });
      }
      if (edit.kind === "document")
        await c[C.autosave]({
          path: { pageId },
          body: {
            version: edit.version,
            document: parseObject(json) as Schemas["ContentDocument"],
          },
          ...command,
        });
      if (edit.kind === "checkpoint")
        await c[C.checkpoint]({
          path: { pageId },
          body: {
            version: edit.version,
            document: parseObject(json) as Schemas["ContentDocument"],
            reason: String(draft.reason || ""),
          },
          ...command,
        });
      if (edit.kind === "publish")
        await c[C.publish]({ path: { pageId }, body: action, ...command });
      if (edit.kind === "unpublish")
        await c[C.unpublish]({ path: { pageId }, body: action, ...command });
      if (edit.kind === "archive")
        await c[C.archivePage]({
          path: { id: pageId },
          body: action,
          ...command,
        });
      if (edit.kind === "restore")
        await c[C.restoreDraft]({
          path: { id: pageId },
          body: action,
          ...command,
        });
      if (edit.kind === "delete-section")
        await c[C.deleteSection]({
          path: { sectionId: edit.sectionId! },
          query: { version: edit.version },
          ...command,
        });
      if (edit.kind === "delete-block")
        await c[C.deleteBlock]({
          path: { blockId: edit.blockId! },
          query: { version: edit.version },
          ...command,
        });
      if (edit.kind === "duplicate-section")
        await c[C.duplicateSection]({
          path: { sectionId: edit.sectionId! },
          body: action,
          ...command,
        });
      if (edit.kind === "duplicate-block")
        await c[C.duplicateBlock]({
          path: { blockId: edit.blockId! },
          body: action,
          ...command,
        });
      if (edit.kind === "reorder-sections")
        await c[C.reorderSections]({
          path: { pageId },
          body: { version: edit.version, ids: edit.ids },
          ...command,
        });
      if (edit.kind === "reorder-blocks")
        await c[C.reorderBlocks]({
          path: { sectionId: edit.sectionId! },
          body: { version: edit.version, ids: edit.ids },
          ...command,
        });
      setEdit(null);
      setNotice(
        t({
          en: "Change accepted. Check the current draft and publication state below.",
          ar: "تم قبول التغيير. تحقق من المسودة وحالة النشر الحالية أدناه.",
        }),
      );
      await refreshContent(client);
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const fields: Field[] =
    edit?.kind === "metadata"
      ? pageFields
      : edit?.kind === "section" || edit?.kind === "new-section"
        ? sectionFields
        : edit?.kind === "block" || edit?.kind === "new-block"
          ? [
              {
                key: "blockType",
                label: { en: "Block type", ar: "نوع الكتلة" },
                options: blockTypes,
                required: true,
              },
              {
                key: "position",
                label: { en: "Position", ar: "الترتيب" },
                type: "number",
                min: 0,
                required: true,
              },
            ]
          : edit?.kind === "document" ||
              edit?.kind.startsWith("delete") ||
              edit?.kind.startsWith("reorder")
            ? []
            : [reasonField];
  const move = (ids: string[], index: number, direction: number) => {
    const copy = [...ids];
    [copy[index], copy[index + direction]] = [
      copy[index + direction],
      copy[index],
    ];
    return copy;
  };
  return (
    <div className="container academic-admin">
      <AppLink href="/admin/builder">
        {t({ en: "Back to content", ar: "العودة إلى المحتوى" })}
      </AppLink>
      <PageIntro
        title={page.titleEn || page.titleAr || page.slug}
        description={t({
          en: "Draft changes remain private until explicitly published.",
          ar: "تبقى تغييرات المسودة خاصة حتى نشرها صراحةً.",
        })}
      />
      <p>
        {page.pageType} · {page.status} · {page.slug}
      </p>
      <details>
        <summary>{t({ en: "Record references", ar: "معرّفات السجل" })}</summary>
        <p className="academic-record-id">
          {page.id} · {page.version}
        </p>
      </details>
      <nav
        className="academic-admin-tabs"
        aria-label={t({ en: "Page tools", ar: "أدوات الصفحة" })}
      >
        {[
          "visual",
          "draft",
          "preview",
          "versions",
          "schedules",
          "visibility",
          "clone",
        ].map((id) => (
          <button
            key={id}
            disabled={visualPending && id !== "visual"}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {t(
              (
                {
                  visual: { en: "Visual editor", ar: "المحرر المرئي" },
                  draft: {
                    en: "Advanced draft tools",
                    ar: "أدوات المسودة المتقدمة",
                  },
                  preview: { en: "Preview", ar: "معاينة" },
                  versions: { en: "History", ar: "السجل" },
                  schedules: { en: "Publishing schedule", ar: "جدولة النشر" },
                  visibility: { en: "Visibility", ar: "الظهور" },
                  clone: { en: "Clone", ar: "النسخ" },
                } as Record<string, { en: string; ar: string }>
              )[id],
            )}
          </button>
        ))}
      </nav>
      {visualPending && (
        <p role="status">
          {t({
            en: "Save the visual draft before opening publishing or other editing tools.",
            ar: "احفظ المسودة المرئية قبل فتح أدوات النشر أو التحرير الأخرى.",
          })}
        </p>
      )}
      <ApiActionError
        error={schemas.error}
        onReload={() => void schemas.refetch()}
      />
      <div hidden={tab !== "visual"}>
        <VisualDraftEditor
          key={pageId}
          pageId={pageId}
          version={page.version}
          initial={document}
          schemas={schemas.data || []}
          onPending={setVisualPending}
          examination={page.pageType === "Examination"}
        />
      </div>
      {notice && <p role="status">{notice}</p>}
      <ApiActionError error={error} onReload={() => void reload()} />
      {tab === "draft" && (
        <section className="access-management-card">
          <div className="account-security-actions">
            {[
              "metadata",
              "new-section",
              "document",
              "checkpoint",
              ...(canPublish ? ["publish", "unpublish"] : []),
              "archive",
              "restore",
            ].map((kind) => (
              <Button
                key={kind}
                variant={kind === "publish" ? "default" : "outline"}
                disabled={busy || data.isFetching}
                onClick={() => begin(kind)}
              >
                {actionLabel(kind)}
              </Button>
            ))}
          </div>
          {document.sections.map((section, index) => (
            <div className="access-management-card" key={section.id}>
              <h2>
                {section.title?.[locale] ||
                  section.title?.en ||
                  section.sectionKey}
              </h2>
              <p>
                {section.sectionType} · {section.status}
              </p>
              <div className="account-security-actions">
                {[
                  "section",
                  "new-block",
                  "duplicate-section",
                  "delete-section",
                ].map((kind) => (
                  <Button
                    variant="outline"
                    key={kind}
                    onClick={() => begin(kind, { sectionId: section.id })}
                  >
                    {actionLabel(kind)}
                  </Button>
                ))}
                {[-1, 1].map((direction) => (
                  <Button
                    variant="outline"
                    key={direction}
                    disabled={
                      index + direction < 0 ||
                      index + direction >= document.sections.length
                    }
                    onClick={() =>
                      begin("reorder-sections", {
                        ids: move(
                          document.sections.map((s) => s.id),
                          index,
                          direction,
                        ),
                      })
                    }
                  >
                    {t(
                      direction < 0
                        ? { en: "Move up", ar: "نقل للأعلى" }
                        : { en: "Move down", ar: "نقل للأسفل" },
                    )}
                  </Button>
                ))}
              </div>
              {section.blocks.map((block, j) => (
                <div className="access-row" key={block.id}>
                  <span>
                    <strong>{block.blockType}</strong>
                    <small className="academic-record-id">{block.id}</small>
                  </span>
                  <div className="access-row-actions">
                    {["block", "duplicate-block", "delete-block"].map(
                      (kind) => (
                        <Button
                          variant="outline"
                          key={kind}
                          onClick={() =>
                            begin(kind, {
                              sectionId: section.id,
                              blockId: block.id,
                            })
                          }
                        >
                          {actionLabel(kind)}
                        </Button>
                      ),
                    )}
                    {[-1, 1].map((direction) => (
                      <Button
                        variant="outline"
                        key={direction}
                        disabled={
                          j + direction < 0 ||
                          j + direction >= section.blocks.length
                        }
                        onClick={() =>
                          begin("reorder-blocks", {
                            sectionId: section.id,
                            ids: move(
                              section.blocks.map((b) => b.id),
                              j,
                              direction,
                            ),
                          })
                        }
                      >
                        {t(
                          direction < 0
                            ? { en: "Move up", ar: "نقل للأعلى" }
                            : { en: "Move down", ar: "نقل للأسفل" },
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}
      {tab === "preview" && (
        <section className="access-management-card account-api-form">
          <label>
            {t({ en: "Preview audience", ar: "فئة المعاينة" })}
            <select
              value={audience}
              onChange={(e) =>
                setAudience(e.target.value as Schemas["ContentAudience"])
              }
            >
              {[
                "Guest",
                "Authenticated",
                "SpecificBatches",
                "SpecificStudyYears",
                "AllStudents",
                "AdministrativeUsers",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <AcademicFields
            fields={[
              {
                key: "batchId",
                label: {
                  en: "Preview batch reference (optional)",
                  ar: "معرّف دفعة المعاينة (اختياري)",
                },
              },
              {
                key: "studyYear",
                label: {
                  en: "Preview study year (optional)",
                  ar: "سنة المعاينة (اختياري)",
                },
                type: "number",
                min: 1,
                max: 6,
              },
            ]}
            value={{ batchId: previewBatch, studyYear: previewYear }}
            onChange={(v) => {
              setPreviewBatch(String(v.batchId || ""));
              setPreviewYear(String(v.studyYear || ""));
            }}
          />
          <ApiActionError error={preview.error} />
          {preview.data && <PublishedContent content={preview.data} />}
        </section>
      )}
      {tab === "versions" && <ContentPageHistory page={page} />}
      {tab === "schedules" && <ContentSchedules page={page} />}
      {tab === "visibility" && (
        <ContentVisibility pageId={pageId} sections={document.sections} />
      )}
      {tab === "clone" && <ContentClone page={page} />}
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) {
            setEdit(null);
            setError(null);
          }
        }}
        title={actionLabel(edit?.kind || "")}
        description={t({
          en: "Review this change before applying it.",
          ar: "راجع التغيير قبل تطبيقه.",
        })}
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
          {["document", "checkpoint", "block", "new-block"].includes(
            edit?.kind || "",
          ) && (
            <label>
              {t({
                en: edit?.kind.includes("block")
                  ? "Block configuration (JSON)"
                  : "Complete draft document (JSON)",
                ar: edit?.kind.includes("block")
                  ? "إعداد الكتلة (JSON)"
                  : "وثيقة المسودة الكاملة (JSON)",
              })}
              <textarea
                rows={14}
                value={json}
                onChange={(e) => setJson(e.target.value)}
                disabled={busy}
                dir="ltr"
              />
              {edit?.kind.includes("block") && (
                <small>
                  {schemas.data
                    ?.find((s) => s.blockType === draft.blockType)
                    ?.allowedFields.join(", ")}
                </small>
              )}
            </label>
          )}
          <label className="academic-checkbox">
            <span>
              {t({ en: "I reviewed this change.", ar: "راجعت هذا التغيير." })}
            </span>
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              disabled={busy}
            />
          </label>
          <ApiActionError error={error} onReload={() => void reload()} />
          <Button disabled={busy || !ack}>
            {t({ en: "Confirm", ar: "تأكيد" })}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
