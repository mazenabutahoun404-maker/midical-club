import { useState, type FormEvent } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { PageIntro } from "../../components/data-display/PageIntro";
import { useCourses } from "../../hooks/useContent";
import { record, string } from "../../services/api/mapping";
import { ApiError } from "../../services/api/client";
import { localizedField } from "../engagement/model";
import {
  contributionDraft,
  contributionCourseTarget,
  contributionTargetKey,
  emptyContribution,
  contributionPermissions,
  safeReference,
  type ContributionDraft,
} from "./contribution-model";
import {
  useCommunityConnection,
  useCommunityQuery,
  useCommunityAction,
  Panel,
  Pager,
  Empty,
  QueryStatus,
  Confirm,
  rows,
} from "./shared";
import "../../styles/community-connect.css";

type Entry = Record<string, unknown>;
export function MyContributions() {
  const { api, owner, session } = useCommunityConnection(),
    { label, t } = useLocale();
  const [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [id, setId] = useState(""),
    [creating, setCreating] = useState(false);
  const q = useCommunityQuery(
    "my-contributions",
    (signal) =>
      api.get_api_v1_contributions_my({
        query: { Page: page, PageSize: 20, Status: status || undefined },
        signal,
      }),
    [page, status],
    !!owner,
  );
  return (
    <div className="container contributions-v6 community-connected">
      <PageIntro
        eyebrow={label("myContributionsEyebrow")}
        title={label("myContributionsTitle")}
        description={label("myContributionsBody")}
      />
      {!owner ? (
        <p>
          {t({
            en: "Sign in with a verified student account to manage your contributions.",
            ar: "سجّل الدخول بحساب طالب موثّق لإدارة مساهماتك.",
          })}
        </p>
      ) : (
        <>
          <div className="contribution-toolbar">
            <label>
              {label("status")}
              <input
                value={status}
                placeholder={t({ en: "All statuses", ar: "كل الحالات" })}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
              />
            </label>
            <Button onClick={() => setCreating(true)}>
              {label("newContribution")}
            </Button>
          </div>
          <QueryStatus query={q} />
          {q.data && (
            <>
              <div className="contribution-records">
                {rows(q.data.items).map((item) => (
                  <article key={string(item.id)}>
                    <header>
                      <span className="contribution-status">
                        {string(item.status)}
                      </span>
                    </header>
                    <h2>
                      {string(item.title) ||
                        t({
                          en: "Untitled contribution",
                          ar: "مساهمة بلا عنوان",
                        })}
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => setId(string(item.id))}
                    >
                      {t({ en: "Open contribution", ar: "فتح المساهمة" })}
                    </Button>
                  </article>
                ))}
              </div>
              <Empty items={rows(q.data.items)} />
              <Pager
                page={page}
                total={Number(q.data.totalItems)}
                onChange={setPage}
              />
            </>
          )}
          {creating && (
            <DraftEditor
              key={"new-" + session}
              initial={emptyContribution()}
              onClose={() => setCreating(false)}
              onCreated={(newId) => {
                setCreating(false);
                setId(newId);
              }}
            />
          )}
          {id && (
            <Modal
              open
              description=""
              onClose={() => setId("")}
              title={t({ en: "Contribution details", ar: "تفاصيل المساهمة" })}
              className="contribution-editor-modal"
            >
              <ContributionDetail key={id + session} id={id} />
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
function DraftEditor({
  initial,
  id,
  onClose,
  onCreated,
}: {
  initial: ContributionDraft;
  id?: string;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const { api } = useCommunityConnection(),
    action = useCommunityAction(),
    { t, label, locale } = useLocale();
  const [form, setForm] = useState(initial),
    [topics, setTopics] = useState((initial.topics || []).join("\n"));
  const types = useCommunityQuery("contribution-types", (signal) =>
      api.get_api_v1_contributions_types({ signal }),
    ),
    courses = useCourses();
  const set = (key: keyof ContributionDraft, value: unknown) =>
    setForm((current) => ({ ...current, [key]: value }));
  function save(e: FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      topics: topics
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
    };
    void action.run(
      async () => {
        if (
          !body.titleAr?.trim() ||
          !body.academic?.contributionTypeId ||
          !body.academic.subjectCatalogItemId
        )
          throw new ApiError(
            "Choose a contribution type and subject, and enter the Arabic title.",
            422,
            "CONTRIBUTION_INCOMPLETE",
          );
        return id
          ? api.put_api_v1_contributions_by_id_draft({ path: { id }, body })
          : api.post_api_v1_contributions({ body });
      },
      (result) => {
        onCreated?.(string(result.id));
        onClose();
      },
    );
  }
  return (
    <Modal
      open
      description=""
      onClose={() => {
        if (!action.busy) onClose();
      }}
      title={label(id ? "editContribution" : "newContribution")}
      className="contribution-editor-modal"
    >
      <form className="contribution-editor" onSubmit={save}>
        <QueryStatus query={types} />
        <div className="editor-two-column">
          <label>
            {label("contributionKind")}
            <select
              required
              disabled={action.busy}
              value={form.academic?.contributionTypeId || ""}
              onChange={(e) =>
                set("academic", {
                  ...form.academic,
                  contributionTypeId: e.target.value,
                })
              }
            >
              <option value="">
                {t({ en: "Choose type", ar: "اختر النوع" })}
              </option>
              {rows(types.data).map((type) => (
                <option key={string(type.id)} value={string(type.id)}>
                  {localizedField(type, "name", locale)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {label("relatedCourse")}
            <select
              required
              disabled={action.busy}
              value={contributionTargetKey(form.academic)}
              onChange={(e) => {
                const course = courses.data?.find(
                  (c) =>
                    contributionTargetKey(contributionCourseTarget(c)) ===
                    e.target.value,
                );
                set("academic", {
                  ...form.academic,
                  ...(course
                    ? contributionCourseTarget(course)
                    : { subjectCatalogItemId: "" }),
                });
              }}
            >
              <option value="">
                {t({ en: "Choose subject", ar: "اختر المادة" })}
              </option>
              {form.academic?.subjectCatalogItemId &&
                !courses.data?.some(
                  (c) =>
                    contributionTargetKey(contributionCourseTarget(c)) ===
                    contributionTargetKey(form.academic),
                ) && (
                  <option value={contributionTargetKey(form.academic)}>
                    {t({ en: "Current subject", ar: "المادة الحالية" })}
                  </option>
                )}
              {courses.data
                ?.filter((c) => c.subjectId)
                .map((course) => (
                  <option
                    key={course.id}
                    value={contributionTargetKey(
                      contributionCourseTarget(course),
                    )}
                  >
                    {t(course.title)} · {t(course.batch)} · {course.code}
                  </option>
                ))}
            </select>
            {courses.isError && (
              <span role="alert">
                {t({
                  en: "Subjects could not be loaded.",
                  ar: "تعذّر تحميل المواد.",
                })}
                <button type="button" onClick={() => void courses.refetch()}>
                  {t({ en: "Retry", ar: "إعادة المحاولة" })}
                </button>
              </span>
            )}
          </label>
        </div>
        <fieldset disabled={action.busy} className="community-draft-fields">
          <div className="editor-two-column">
            {(
              [
                "titleAr",
                "titleEn",
                "summaryAr",
                "summaryEn",
                "contentNotesAr",
                "contentNotesEn",
                "topicText",
                "sourceNotes",
              ] as const
            ).map((key) => (
              <label key={key}>
                {t(fieldNames[key])}
                {key.startsWith("title") ? (
                  <input
                    dir={key.endsWith("Ar") ? "rtl" : "ltr"}
                    value={form[key] || ""}
                    required={key === "titleAr"}
                    onChange={(e) => set(key, e.target.value)}
                  />
                ) : (
                  <textarea
                    rows={3}
                    dir={key.endsWith("Ar") ? "rtl" : undefined}
                    value={form[key] || ""}
                    onChange={(e) => set(key, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          <label>
            {t({
              en: "Topics (one per line)",
              ar: "المواضيع (كل موضوع في سطر)",
            })}
            <textarea
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
            />
          </label>
          <label className="rights-confirmation">
            <input
              type="checkbox"
              checked={form.rightsDeclarationAccepted === true}
              onChange={(e) =>
                set("rightsDeclarationAccepted", e.target.checked)
              }
            />
            <span>
              <strong>{label("rightsConfirmed")}</strong>
              <small>{label("rightsBody")}</small>
            </span>
          </label>
        </fieldset>
        {action.feedback}
        <div className="workspace-form-actions">
          <Button
            type="button"
            variant="outline"
            disabled={action.busy}
            onClick={onClose}
          >
            {label("cancel")}
          </Button>
          <Button disabled={action.busy}>{label("saveDraft")}</Button>
        </div>
      </form>
    </Modal>
  );
}
const fieldNames = {
  titleAr: { en: "Title · Arabic", ar: "العنوان · العربية" },
  titleEn: { en: "Title · English", ar: "العنوان · الإنجليزية" },
  summaryAr: { en: "Summary · Arabic", ar: "الملخص · العربية" },
  summaryEn: { en: "Summary · English", ar: "الملخص · الإنجليزية" },
  contentNotesAr: { en: "Content · Arabic", ar: "المحتوى · العربية" },
  contentNotesEn: { en: "Content · English", ar: "المحتوى · الإنجليزية" },
  topicText: { en: "Topic", ar: "الموضوع" },
  sourceNotes: { en: "Sources and references", ar: "المصادر والمراجع" },
};
function ContributionDetail({ id }: { id: string }) {
  const { api } = useCommunityConnection(),
    action = useCommunityAction(),
    { t, label, locale } = useLocale();
  const [editing, setEditing] = useState(false),
    [pending, setPending] = useState<{ name: Command; version: string } | null>(
      null,
    ),
    [deleted, setDeleted] = useState<string | null>(null),
    [reason, setReason] = useState("");
  const q = useCommunityQuery(
    "contribution-detail",
    (signal) => api.get_api_v1_contributions_my_by_id({ path: { id }, signal }),
    id,
    !deleted,
  );
  const item = record(q.data),
    draft = record(item.draft),
    permissions = contributionPermissions(item.status, !!item.draft),
    version = string(item.version);
  function perform() {
    if (!pending) return;
    const body = { version: pending.version, reason: reason || undefined };
    void action.run(
      () => {
        switch (pending.name) {
          case "submit":
            if (draft.rightsDeclarationAccepted !== true)
              throw new ApiError(
                "Edit the draft and confirm the material rights before submitting.",
                422,
                "RIGHTS_REQUIRED",
              );
            return api.post_api_v1_contributions_by_id_submit({
              path: { id },
              body,
            });
          case "withdraw":
            return api.post_api_v1_contributions_by_id_withdraw({
              path: { id },
              body,
            });
          case "delete":
            return api.post_api_v1_contributions_by_id_delete_draft({
              path: { id },
              body,
            });
          case "restore":
            return api.post_api_v1_contributions_by_id_restore_draft({
              path: { id },
              body,
            });
        }
      },
      (result) => {
        if (pending.name === "delete") setDeleted(string(result.version));
        if (pending.name === "restore") setDeleted(null);
        setPending(null);
        setReason("");
      },
    );
  }
  if (deleted)
    return (
      <>
        <p>
          {t({
            en: "Draft deleted. You can restore it here.",
            ar: "حُذفت المسودة. يمكنك استعادتها هنا.",
          })}
        </p>
        <Button
          disabled={action.busy}
          onClick={() => setPending({ name: "restore", version: deleted })}
        >
          {t(commandNames.restore)}
        </Button>
        {pending && (
          <Confirm
            busy={action.busy}
            onCancel={() => setPending(null)}
            onConfirm={perform}
          >
            {t(commandNames[pending.name])}?
          </Confirm>
        )}
        {action.feedback}
      </>
    );
  return (
    <>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <header>
            <span className="contribution-status">{string(item.status)}</span>
            <h2>{localizedField(draft, "title", locale)}</h2>
          </header>
          <p className="community-preserve-lines">
            {localizedField(draft, "summary", locale)}
          </p>
          <p className="community-preserve-lines">
            {localizedField(draft, "contentNotes", locale)}
          </p>
          <p className="community-preserve-lines">
            {string(draft.sourceNotes)}
          </p>
          <div className="workspace-form-actions">
            {permissions.edit && (
              <Button
                disabled={action.busy}
                onClick={() => {
                  action.setError(null);
                  setEditing(true);
                }}
              >
                {label("editContribution")}
              </Button>
            )}
            {(["submit", "withdraw", "delete", "restore"] as const)
              .filter(
                (name) => permissions[name === "delete" ? "remove" : name],
              )
              .map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  disabled={action.busy || !version}
                  onClick={() => {
                    setPending({ name, version });
                    setReason("");
                  }}
                >
                  {t(commandNames[name])}
                </Button>
              ))}
          </div>
          {pending && (
            <div>
              <label>
                {t({ en: "Reason (optional)", ar: "السبب (اختياري)" })}
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={action.busy}
                />
              </label>
              <Confirm
                busy={action.busy}
                onCancel={() => setPending(null)}
                onConfirm={perform}
              >
                {pending.name === "submit"
                  ? t({
                      en: "Submit this draft for review? This seals an immutable revision of its text, links and files.",
                      ar: "إرسال هذه المسودة للمراجعة؟ سيحفظ هذا نسخة ثابتة من النص والروابط والملفات.",
                    })
                  : t(commandNames[pending.name]) + "?"}
              </Confirm>
            </div>
          )}
          {action.feedback}
          {editing && (
            <DraftEditor
              initial={contributionDraft(q.data)}
              id={id}
              onClose={() => setEditing(false)}
            />
          )}
          <ContributionAttachments
            id={id}
            item={item}
            editable={permissions.edit}
            blocked={action.busy || !!pending || editing}
          />
          <ContributionHistory id={id} />
          <Panel title={t({ en: "Status history", ar: "سجل الحالات" })}>
            <ol>
              {rows(item.stageHistory).map((stage, i) => (
                <li key={i}>
                  <strong>{string(stage.toStatus)}</strong> ·{" "}
                  <time>
                    {new Date(string(stage.occurredAt)).toLocaleString(locale)}
                  </time>
                  <p>{string(stage.reason)}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </>
      )}
    </>
  );
}
type Command = "submit" | "withdraw" | "delete" | "restore";
const commandNames = {
  submit: { en: "Submit for review", ar: "إرسال للمراجعة" },
  withdraw: { en: "Withdraw submission", ar: "سحب المساهمة" },
  delete: { en: "Delete draft", ar: "حذف المسودة" },
  restore: { en: "Restore draft", ar: "استعادة المسودة" },
};
function ContributionHistory({ id }: { id: string }) {
  const { api } = useCommunityConnection(),
    { t, locale } = useLocale(),
    [tab, setTab] = useState<"revisions" | "reviews">("reviews"),
    [page, setPage] = useState(1);
  const q = useCommunityQuery(
    "contribution-history",
    (signal) =>
      tab === "reviews"
        ? api.get_api_v1_contributions_by_id_reviews({
            path: { id },
            query: { Page: page, PageSize: 20 },
            signal,
          })
        : api.get_api_v1_contributions_by_id_revisions({
            path: { id },
            query: { Page: page, PageSize: 20 },
            signal,
          }),
    [id, tab, page],
  );
  return (
    <Panel title={t({ en: "Review history", ar: "سجل المراجعة" })}>
      <div className="workspace-form-actions">
        {(["reviews", "revisions"] as const).map((name) => (
          <Button
            variant="outline"
            key={name}
            aria-pressed={tab === name}
            onClick={() => {
              setTab(name);
              setPage(1);
            }}
          >
            {name === "reviews"
              ? t({ en: "Reviews", ar: "المراجعات" })
              : t({ en: "Submitted revisions", ar: "النسخ المرسلة" })}
          </Button>
        ))}
      </div>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <ol>
            {rows(q.data.items).map((row) => (
              <li key={string(row.id)}>
                <strong>
                  {string(row.decision) || localizedField(row, "title", locale)}
                </strong>
                <p className="community-preserve-lines">
                  {string(row.studentFeedback) ||
                    localizedField(row, "summary", locale)}
                </p>
                <time>
                  {new Date(
                    string(row.reviewedAt || row.submittedAt),
                  ).toLocaleString(locale)}
                </time>
                {row.revisionNumber != null && (
                  <span>
                    {" "}
                    · {t({ en: "Revision", ar: "النسخة" })}{" "}
                    {Number(row.revisionNumber)}
                  </span>
                )}
              </li>
            ))}
          </ol>
          <Empty items={rows(q.data.items)} />
          <Pager
            page={page}
            total={Number(q.data.totalItems)}
            onChange={setPage}
          />
        </>
      )}
    </Panel>
  );
}
function ContributionAttachments({
  id,
  item,
  editable,
  blocked,
}: {
  id: string;
  item: Entry;
  editable: boolean;
  blocked: boolean;
}) {
  const { api, services } = useCommunityConnection(),
    action = useCommunityAction(),
    { t } = useLocale();
  const [url, setUrl] = useState(""),
    [title, setTitle] = useState(""),
    [linkType, setLinkType] = useState(""),
    [assetId, setAssetId] = useState(""),
    [role, setRole] = useState(""),
    [pending, setPending] = useState<{
      kind: "assets" | "links";
      linkId: string;
      version: string;
    } | null>(null);
  const version = string(item.version),
    busy = blocked || action.busy;
  function addLink(e: FormEvent) {
    e.preventDefault();
    void action.run(
      () => {
        const safe = safeReference(url);
        if (!safe)
          throw new ApiError(
            "Enter an http or https reference URL.",
            422,
            "INVALID_REFERENCE_URL",
          );
        return api.post_api_v1_contributions_by_id_draft_links({
          path: { id },
          body: {
            url: safe,
            title: title || null,
            linkType,
            displayOrder: rows(item.links).length,
            version,
          },
        });
      },
      () => {
        setUrl("");
        setTitle("");
      },
    );
  }
  function addAsset(e: FormEvent) {
    e.preventDefault();
    void action.run(
      async () => {
        // Student metadata proves visibility but intentionally omits processing state.
        // The contribution command enforces Ready state and ownership atomically.
        await services.assets!.metadata(assetId);
        return api.post_api_v1_contributions_by_id_draft_assets({
          path: { id },
          body: {
            assetId,
            role,
            displayOrder: rows(item.assets).length,
            version,
          },
        });
      },
      () => setAssetId(""),
    );
  }
  function remove() {
    if (!pending) return;
    void action.run(
      () =>
        pending.kind === "assets"
          ? api.delete_api_v1_contributions_by_id_draft_assets_by_linkId({
              path: { id, linkId: pending.linkId },
              query: { version: pending.version },
            })
          : api.delete_api_v1_contributions_by_id_draft_links_by_linkId({
              path: { id, linkId: pending.linkId },
              query: { version: pending.version },
            }),
      () => setPending(null),
    );
  }
  return (
    <Panel title={t({ en: "Files and references", ar: "الملفات والمراجع" })}>
      {(["assets", "links"] as const).map((kind) => (
        <ul key={kind}>
          {rows(item[kind]).map((row) => (
            <li key={string(row.id)}>
              {kind === "links" && safeReference(row.url) ? (
                <a
                  href={safeReference(row.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {string(row.title) || string(row.url)}
                </a>
              ) : (
                <span>{string(row.displayName) || string(row.assetId)}</span>
              )}
              {editable && (
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() =>
                    setPending({ kind, linkId: string(row.id), version })
                  }
                >
                  {t({ en: "Remove", ar: "إزالة" })}
                </Button>
              )}
            </li>
          ))}
        </ul>
      ))}
      {pending && (
        <Confirm
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={remove}
        >
          {t({
            en: "Remove this item from the draft?",
            ar: "إزالة هذا العنصر من المسودة؟",
          })}
        </Confirm>
      )}
      {editable && (
        <div className="editor-two-column">
          <form className="contribution-editor" onSubmit={addLink}>
            <h3>{t({ en: "Add reference", ar: "إضافة مرجع" })}</h3>
            <fieldset disabled={busy || !!pending}>
              <label>
                {t({ en: "Reference URL", ar: "رابط المرجع" })}
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </label>
              <label>
                {t({ en: "Title", ar: "العنوان" })}
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label>
                {t({ en: "Reference type", ar: "نوع المرجع" })}
                <input
                  required
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                />
              </label>
              <Button>{t({ en: "Add reference", ar: "إضافة مرجع" })}</Button>
            </fieldset>
          </form>
          <form className="contribution-editor" onSubmit={addAsset}>
            <h3>{t({ en: "Link an existing file", ar: "ربط ملف موجود" })}</h3>
            <p>
              {t({
                en: "Use the ID of a file you own. It must have finished processing.",
                ar: "استخدم معرّف ملف تملكه واكتملت معالجته.",
              })}
            </p>
            <fieldset disabled={busy || !!pending}>
              <label>
                {t({ en: "File ID", ar: "معرّف الملف" })}
                <input
                  required
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                />
              </label>
              <label>
                {t({ en: "File role", ar: "دور الملف" })}
                <input
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </label>
              <Button>{t({ en: "Link file", ar: "ربط الملف" })}</Button>
            </fieldset>
          </form>
        </div>
      )}
      {action.feedback}
    </Panel>
  );
}
export function PublishedContributions() {
  const { api } = useCommunityConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [id, setId] = useState("");
  const q = useCommunityQuery(
    "published-contributions",
    (signal) =>
      api.get_api_v1_academic_contributions({
        query: { Page: page, PageSize: 20, Q: search || undefined },
        signal,
      }),
    [page, search],
  );
  return (
    <Panel
      title={t({ en: "Published contributions", ar: "المساهمات المنشورة" })}
    >
      <label>
        {t({ en: "Search contributions", ar: "البحث في المساهمات" })}
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </label>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="contribution-records">
            {rows(q.data.items).map((item) => (
              <article key={string(item.id)}>
                <h3>{localizedField(item, "title", locale)}</h3>
                <p>{localizedField(item, "summary", locale)}</p>
                <p>{string(record(item.attribution).name)}</p>
                <Button
                  variant="outline"
                  onClick={() => setId(string(item.id))}
                >
                  {t({ en: "Read contribution", ar: "قراءة المساهمة" })}
                </Button>
              </article>
            ))}
          </div>
          <Empty items={rows(q.data.items)} />
          <Pager
            page={page}
            total={Number(q.data.totalItems)}
            onChange={setPage}
          />
        </>
      )}
      {id && (
        <Modal
          open
          description=""
          onClose={() => setId("")}
          title={t({ en: "Published contribution", ar: "مساهمة منشورة" })}
        >
          <PublishedDetail id={id} />
        </Modal>
      )}
    </Panel>
  );
}
function PublishedDetail({ id }: { id: string }) {
  const { api, services } = useCommunityConnection(),
    action = useCommunityAction(),
    { t, locale } = useLocale();
  const q = useCommunityQuery(
    "published-contribution",
    (signal) =>
      api.get_api_v1_academic_contributions_by_id({ path: { id }, signal }),
    id,
  );
  const item = record(q.data);
  function download(assetId: string) {
    void action.run(
      async () => {
        const file = await services.files!.downloadUrl(assetId);
        const anchor = document.createElement("a");
        anchor.href = file.url;
        anchor.rel = "noopener noreferrer";
        anchor.download = "";
        anchor.click();
      },
      undefined,
      t({ en: "Download opened", ar: "فُتح التنزيل" }),
      false,
    );
  }
  return (
    <>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <h2>{localizedField(item, "title", locale)}</h2>
          <p>{string(record(item.attribution).name)}</p>
          <p className="community-preserve-lines">
            {localizedField(item, "summary", locale)}
          </p>
          <p className="community-preserve-lines">
            {localizedField(item, "contentNotes", locale)}
          </p>
          <ul>
            {rows(item.links).map((link, i) => (
              <li key={i}>
                {safeReference(link.url) ? (
                  <a
                    href={safeReference(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {string(link.title) || string(link.url)}
                  </a>
                ) : (
                  string(link.title)
                )}
              </li>
            ))}
          </ul>
          <ul>
            {rows(item.assets).map((asset) => (
              <li key={string(asset.assetId)}>
                <Button
                  disabled={action.busy}
                  variant="outline"
                  onClick={() => download(string(asset.assetId))}
                >
                  {string(asset.displayNameSnapshot) ||
                    t({ en: "Download file", ar: "تنزيل الملف" })}
                </Button>
              </li>
            ))}
          </ul>
          {action.feedback}
        </>
      )}
    </>
  );
}
