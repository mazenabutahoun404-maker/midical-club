import { useState, type FormEvent } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../governance/useGovernance";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { useCourses } from "../../hooks/useContent";
import { record, string } from "../../services/api/mapping";
import { ApiError } from "../../services/api/client";
import type { Schemas } from "../../services/api/schema.generated";
import { localizedField } from "../../features/engagement/model";
import {
  contributionCourseTarget,
  hasFullContributionType,
  contributionTargetKey,
  contributionReviewInput,
  safeReference,
  type ContributionReviewCommand,
} from "../../features/community-live/contribution-model";
import {
  useCommunityConnection,
  useCommunityQuery,
  useCommunityAction,
  Panel,
  Pager,
  Empty,
  QueryStatus,
  rows,
} from "../../features/community-live/shared";
import "../../styles/community-connect.css";
type Entry = Record<string, unknown>;
export default function AdminContributionsPage() {
  const { owner, session } = useCommunityConnection();
  return <AdminContributions key={String(owner) + session} />;
}
function AdminContributions() {
  const { t, label } = useLocale(),
    access = useAccess(),
    permissions = access.data?.permissions || [],
    [selected, setSelected] = useState<"queue" | "types">("queue");
  const canRead = permissions.includes("contributions.view_all"),
    canTypes = permissions.includes("contributions.types.manage"),
    tab =
      selected === "types" && canTypes
        ? "types"
        : canRead
          ? "queue"
          : canTypes
            ? "types"
            : "";
  return (
    <div className="container community-connected engagement-page">
      <header className="engagement-heading">
        <span className="eyebrow">medClub</span>
        <h1 tabIndex={-1} data-page-heading>
          {label("contributionsAdmin")}
        </h1>
        <p>
          {t({
            en: "Review submitted revisions, record decisions and manage publication.",
            ar: "مراجعة النسخ المرسلة وتسجيل القرارات وإدارة النشر.",
          })}
        </p>
      </header>
      <QueryStatus query={access} />
      <nav className="engagement-tabs" aria-label={label("contributionsAdmin")}>
        {canRead && (
          <Button
            variant={tab === "queue" ? "default" : "outline"}
            onClick={() => setSelected("queue")}
          >
            {t({ en: "Review queue", ar: "قائمة المراجعة" })}
          </Button>
        )}
        {canTypes && (
          <Button
            variant={tab === "types" ? "default" : "outline"}
            onClick={() => setSelected("types")}
          >
            {t({ en: "Contribution types", ar: "أنواع المساهمات" })}
          </Button>
        )}
      </nav>
      {tab === "queue" && <ReviewQueue permissions={permissions} />}
      {tab === "types" && <ContributionTypes />}
      {!access.isPending && !access.isError && !tab && (
        <p role="alert">
          {t({
            en: "You need permission to view the review queue or manage contribution types.",
            ar: "تحتاج إلى صلاحية عرض قائمة المراجعة أو إدارة أنواع المساهمات.",
          })}
        </p>
      )}
    </div>
  );
}
function ReviewQueue({ permissions }: { permissions: string[] }) {
  const { api, session } = useCommunityConnection(),
    { t, label } = useLocale(),
    [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState("");
  const q = useCommunityQuery(
    "admin-contributions",
    (signal) =>
      api.get_api_v1_admin_contributions({
        query: {
          Page: page,
          PageSize: 20,
          Status: status || undefined,
          Q: search || undefined,
        },
        signal,
      }),
    [page, status, search],
    true,
    true,
  );
  return (
    <>
      <div className="engagement-toolbar">
        <label>
          {label("status")}
          <input
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          />
        </label>
        <label>
          {t({ en: "Search", ar: "البحث" })}
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </label>
      </div>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="contribution-records">
            {rows(q.data.items).map((item) => (
              <article key={string(item.id)}>
                <span className="contribution-status">
                  {string(item.status)}
                </span>
                <h2>{string(item.title)}</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelected(string(item.id))}
                >
                  {t({ en: "Review contribution", ar: "مراجعة المساهمة" })}
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
      {selected && (
        <Modal
          open
          description=""
          title={t({ en: "Review contribution", ar: "مراجعة المساهمة" })}
          onClose={() => setSelected("")}
          className="contribution-editor-modal"
        >
          <ReviewDetail
            key={selected + session}
            id={selected}
            permissions={permissions}
          />
        </Modal>
      )}
    </>
  );
}
function ReviewDetail({
  id,
  permissions,
}: {
  id: string;
  permissions: string[];
}) {
  const { api } = useCommunityConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [reviewPage, setReviewPage] = useState(1),
    [revision, setRevision] = useState<Entry | null>(null),
    [command, setCommand] = useState<{
      name: ContributionReviewCommand | "reclassify";
      item: Entry;
      revision: Entry | null;
    } | null>(null);
  const q = useCommunityQuery(
      "admin-contribution",
      (signal) =>
        api.get_api_v1_admin_contributions_by_id({ path: { id }, signal }),
      id,
      true,
      true,
    ),
    versions = useCommunityQuery(
      "admin-contribution-revisions",
      (signal) =>
        api.get_api_v1_admin_contributions_by_id_revisions({
          path: { id },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [id, page],
      true,
      true,
    ),
    reviews = useCommunityQuery(
      "admin-contribution-reviews",
      (signal) =>
        api.get_api_v1_admin_contributions_by_id_reviews({
          path: { id },
          query: { Page: reviewPage, PageSize: 20 },
          signal,
        }),
      [id, reviewPage],
      true,
      true,
    );
  const item = record(q.data),
    draft = record(item.draft),
    revisions = rows(versions.data?.items).filter((row) =>
      Number.isInteger(row.revisionNumber),
    );
  return (
    <>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <span className="contribution-status">{string(item.status)}</span>
          <h2>{localizedField(draft, "title", locale)}</h2>
          <p>
            {t({
              en: "The editable draft is separate from the submitted revisions below. Decisions apply to the revision you review.",
              ar: "المسودة القابلة للتعديل منفصلة عن النسخ المرسلة أدناه. تُطبّق القرارات على النسخة التي تراجعها.",
            })}
          </p>
          <details>
            <summary>
              {t({ en: "Current draft", ar: "المسودة الحالية" })}
            </summary>
            <p className="community-preserve-lines">
              {localizedField(draft, "summary", locale)}
            </p>
            <p className="community-preserve-lines">
              {localizedField(draft, "contentNotes", locale)}
            </p>
          </details>
          <Panel title={t({ en: "Submitted revisions", ar: "النسخ المرسلة" })}>
            <QueryStatus query={versions} />
            {versions.data && (
              <>
                <label>
                  {t({
                    en: "Revision to review",
                    ar: "النسخة المراد مراجعتها",
                  })}
                  <select
                    value={string(revision?.id)}
                    onChange={(e) =>
                      setRevision(
                        revisions.find((row) => row.id === e.target.value) ||
                          null,
                      )
                    }
                  >
                    <option value="">
                      {t({
                        en: "Choose a submitted revision",
                        ar: "اختر نسخة مرسلة",
                      })}
                    </option>
                    {revisions.map((row) => (
                      <option key={string(row.id)} value={string(row.id)}>
                        {Number(row.revisionNumber)} ·{" "}
                        {localizedField(row, "title", locale)}
                      </option>
                    ))}
                  </select>
                </label>
                <Empty items={revisions} />
                <Pager
                  page={page}
                  total={Number(versions.data.totalItems)}
                  onChange={(value) => {
                    setRevision(null);
                    setPage(value);
                  }}
                />
              </>
            )}
            {revision && (
              <article>
                <h3>{localizedField(revision, "title", locale)}</h3>
                <p className="community-preserve-lines">
                  {localizedField(revision, "summary", locale)}
                </p>
                <p className="community-preserve-lines">
                  {localizedField(revision, "contentNotes", locale)}
                </p>
                <ul>
                  {rows(revision.links).map((link, i) => (
                    <li key={i}>
                      {safeReference(link.urlSnapshot) ? (
                        <a
                          href={safeReference(link.urlSnapshot)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {string(link.titleSnapshot) ||
                            string(link.urlSnapshot)}
                        </a>
                      ) : (
                        string(link.titleSnapshot)
                      )}
                    </li>
                  ))}
                </ul>
                <ul>
                  {rows(revision.assets).map((asset, i) => (
                    <li key={i}>
                      <RevisionFile
                        id={string(asset.assetId)}
                        name={string(asset.displayNameSnapshot)}
                      />
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </Panel>
          <div className="workspace-form-actions">
            {(
              Object.keys(reviewActions) as (
                ContributionReviewCommand | "reclassify"
              )[]
            )
              .filter((name) =>
                permissions.includes(reviewActions[name].permission),
              )
              .map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  disabled={
                    !item.version ||
                    (["approve", "reject", "request-changes"].includes(name) &&
                      (!revision ||
                        revision.id !== item.latestSubmittedRevisionId)) ||
                    (name === "publish" &&
                      (!revision || revision.id !== item.approvedRevisionId))
                  }
                  onClick={() => setCommand({ name, item, revision })}
                >
                  {t(reviewActions[name])}
                </Button>
              ))}
          </div>
          <Panel
            title={t({ en: "Recorded reviews", ar: "المراجعات المسجّلة" })}
          >
            <QueryStatus query={reviews} />
            {reviews.data && (
              <>
                <ol>
                  {rows(reviews.data.items).map((review) => (
                    <li key={string(review.id)}>
                      <strong>{string(review.decision)}</strong>
                      <p className="community-preserve-lines">
                        {string(review.studentFeedback)}
                      </p>
                      {review.internalNotes != null && (
                        <details>
                          <summary>
                            {t({ en: "Internal notes", ar: "ملاحظات داخلية" })}
                          </summary>
                          <p>{string(review.internalNotes)}</p>
                        </details>
                      )}
                      <time>
                        {new Date(string(review.reviewedAt)).toLocaleString(
                          locale,
                        )}
                      </time>
                    </li>
                  ))}
                </ol>
                <Empty items={rows(reviews.data.items)} />
                <Pager
                  page={reviewPage}
                  total={Number(reviews.data.totalItems)}
                  onChange={setReviewPage}
                />
              </>
            )}
          </Panel>
          <Panel title={t({ en: "Status history", ar: "سجل الحالات" })}>
            <ol>
              {rows(item.stageHistory).map((stage, i) => (
                <li key={i}>
                  {string(stage.fromStatus)} → {string(stage.toStatus)}
                  <p>{string(stage.reason)}</p>
                  <time>
                    {new Date(string(stage.occurredAt)).toLocaleString(locale)}
                  </time>
                </li>
              ))}
            </ol>
          </Panel>
          {command &&
            (command.name === "reclassify" ? (
              <Reclassify
                id={id}
                initial={command.item}
                onClose={() => setCommand(null)}
              />
            ) : (
              <ReviewCommand
                id={id}
                command={command.name}
                item={command.item}
                revision={command.revision}
                onClose={() => setCommand(null)}
              />
            ))}
        </>
      )}
    </>
  );
}
function RevisionFile({ id, name }: { id: string; name: string }) {
  const { services } = useCommunityConnection(),
    action = useCommunityAction(),
    { t } = useLocale();
  return (
    <>
      <Button
        variant="outline"
        disabled={action.busy}
        onClick={() =>
          void action.run(
            async () => {
              const file = await services.files!.previewUrl(id);
              const a = document.createElement("a");
              a.href = file.url;
              a.target = "_blank";
              a.rel = "noopener noreferrer";
              a.click();
            },
            undefined,
            t({ en: "File opened", ar: "فُتح الملف" }),
            false,
          )
        }
      >
        {name || t({ en: "Open revision file", ar: "فتح ملف النسخة" })}
      </Button>
      {action.feedback}
    </>
  );
}
const reviewActions = {
  claim: {
    en: "Claim review",
    ar: "تولّي المراجعة",
    permission: "contributions.review",
  },
  assign: {
    en: "Assign reviewer",
    ar: "تعيين المراجع",
    permission: "contributions.assign",
  },
  "request-changes": {
    en: "Request changes",
    ar: "طلب تعديلات",
    permission: "contributions.review",
  },
  approve: {
    en: "Approve revision",
    ar: "الموافقة على النسخة",
    permission: "contributions.approve",
  },
  reject: {
    en: "Reject revision",
    ar: "رفض النسخة",
    permission: "contributions.review",
  },
  publish: {
    en: "Publish approved revision",
    ar: "نشر النسخة المعتمدة",
    permission: "contributions.publish",
  },
  unpublish: {
    en: "Unpublish contribution",
    ar: "إلغاء نشر المساهمة",
    permission: "contributions.unpublish",
  },
  restart: {
    en: "Restart review",
    ar: "إعادة بدء المراجعة",
    permission: "contributions.review",
  },
  reclassify: {
    en: "Change academic classification",
    ar: "تغيير التصنيف الأكاديمي",
    permission: "contributions.reclassify",
  },
};
function ReviewCommand({
  id,
  command,
  item,
  revision,
  onClose,
}: {
  id: string;
  command: ContributionReviewCommand;
  item: Entry;
  revision: Entry | null;
  onClose: () => void;
}) {
  const { api } = useCommunityConnection(),
    action = useCommunityAction(),
    { t, locale } = useLocale(),
    [reason, setReason] = useState(""),
    [feedback, setFeedback] = useState(""),
    [reviewerId, setReviewerId] = useState(""),
    [internalNotes, setInternalNotes] = useState(""),
    [ack, setAck] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!ack) return;
    void action.run(() => {
      const body = contributionReviewInput(item, command, {
        revisionId: string(revision?.id) || undefined,
        reason,
        feedback,
        reviewerId,
        internalNotes,
      });
      switch (command) {
        case "claim":
          return api.post_api_v1_admin_contributions_by_id_claim({
            path: { id },
            body,
          });
        case "assign":
          return api.post_api_v1_admin_contributions_by_id_assign({
            path: { id },
            body,
          });
        case "request-changes":
          return api.post_api_v1_admin_contributions_by_id_request_changes({
            path: { id },
            body,
          });
        case "approve":
          return api.post_api_v1_admin_contributions_by_id_approve({
            path: { id },
            body,
          });
        case "reject":
          return api.post_api_v1_admin_contributions_by_id_reject({
            path: { id },
            body,
          });
        case "publish":
          return api.post_api_v1_admin_contributions_by_id_publish({
            path: { id },
            body,
          });
        case "unpublish":
          return api.post_api_v1_admin_contributions_by_id_unpublish({
            path: { id },
            body,
          });
        case "restart":
          return api.post_api_v1_admin_contributions_by_id_restart({
            path: { id },
            body,
          });
      }
    }, onClose);
  }
  return (
    <Modal
      open
      description=""
      title={t(reviewActions[command])}
      onClose={() => {
        if (!action.busy) onClose();
      }}
      className="contribution-editor-modal"
    >
      <form className="contribution-editor" onSubmit={submit}>
        <p>
          {t({
            en: "This action changes the server record. Confirm the selected contribution and revision before continuing.",
            ar: "يغيّر هذا الإجراء السجل على الخادم. راجع المساهمة والنسخة المحددتين قبل المتابعة.",
          })}
        </p>
        {revision && (
          <blockquote>
            <strong>{localizedField(revision, "title", locale)}</strong>
            <p>{localizedField(revision, "summary", locale)}</p>
            <span>
              {t({ en: "Revision", ar: "النسخة" })}{" "}
              {Number(revision.revisionNumber)}
            </span>
          </blockquote>
        )}
        <fieldset disabled={action.busy}>
          {command === "assign" && (
            <label>
              {t({ en: "Reviewer account ID", ar: "معرّف حساب المراجع" })}
              <input
                required
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
              />
            </label>
          )}
          <label>
            {t({ en: "Reason", ar: "السبب" })}
            <textarea
              required={["unpublish", "restart"].includes(command)}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          {["request-changes", "approve", "reject"].includes(command) && (
            <label>
              {t({
                en: "Feedback visible to the student",
                ar: "ملاحظات ظاهرة للطالب",
              })}
              <textarea
                required={command !== "approve"}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </label>
          )}
          <label>
            {t({ en: "Internal notes", ar: "ملاحظات داخلية" })}
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </label>
          <label className="rights-confirmation">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span>
              {t({
                en: "I have reviewed this action and the applicable submitted revision.",
                ar: "راجعت هذا الإجراء والنسخة المرسلة ذات الصلة.",
              })}
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
            {t({ en: "Cancel", ar: "إلغاء" })}
          </Button>
          <Button disabled={action.busy || !ack}>
            {t(reviewActions[command])}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function Reclassify({
  id,
  initial,
  onClose,
}: {
  id: string;
  initial: Entry;
  onClose: () => void;
}) {
  const { api } = useCommunityConnection(),
    action = useCommunityAction(),
    { t, locale } = useLocale(),
    [academic, setAcademic] = useState(
      record(initial.academic) as Schemas["ContributionAcademic"],
    ),
    [reason, setReason] = useState(""),
    [ack, setAck] = useState(false),
    courses = useCourses();
  const types = useCommunityQuery("contribution-types", (signal) =>
    api.get_api_v1_contributions_types({ signal }),
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!ack) return;
    void action.run(() => {
      if (!reason.trim())
        throw new ApiError(
          "Enter a reason for reclassification.",
          422,
          "REASON_REQUIRED",
        );
      return api.post_api_v1_admin_contributions_by_id_reclassify({
        path: { id },
        body: { academic, version: string(initial.version), reason },
      });
    }, onClose);
  }
  return (
    <Modal
      open
      description=""
      title={t(reviewActions.reclassify)}
      onClose={() => {
        if (!action.busy) onClose();
      }}
      className="contribution-editor-modal"
    >
      <form className="contribution-editor" onSubmit={submit}>
        <QueryStatus query={types} />
        <fieldset disabled={action.busy}>
          <label>
            {t({ en: "Contribution type", ar: "نوع المساهمة" })}
            <select
              required
              value={academic.contributionTypeId || ""}
              onChange={(e) =>
                setAcademic({ ...academic, contributionTypeId: e.target.value })
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
            {t({ en: "Subject and offering", ar: "المادة والطرح" })}
            <select
              required
              value={contributionTargetKey(academic)}
              onChange={(e) => {
                const course = courses.data?.find(
                  (c) =>
                    contributionTargetKey(contributionCourseTarget(c)) ===
                    e.target.value,
                );
                if (course)
                  setAcademic({
                    ...academic,
                    ...contributionCourseTarget(course),
                  });
              }}
            >
              <option
                value={contributionTargetKey(
                  initial.academic as Schemas["ContributionAcademic"],
                )}
              >
                {t({ en: "Current classification", ar: "التصنيف الحالي" })}
              </option>
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
          </label>
          {courses.isError && (
            <p role="alert">
              {t({
                en: "Subjects could not be loaded.",
                ar: "تعذّر تحميل المواد.",
              })}
            </p>
          )}
          <label>
            {t({ en: "Reason", ar: "السبب" })}
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <label className="rights-confirmation">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span>
              {t({
                en: "I reviewed the new academic classification.",
                ar: "راجعت التصنيف الأكاديمي الجديد.",
              })}
            </span>
          </label>
        </fieldset>
        {action.feedback}
        <Button disabled={action.busy || !ack}>
          {t(reviewActions.reclassify)}
        </Button>
      </form>
    </Modal>
  );
}
function ContributionTypes() {
  const { api } = useCommunityConnection(),
    { t, locale } = useLocale(),
    [editing, setEditing] = useState<Entry | null | undefined>(undefined),
    q = useCommunityQuery(
      "admin-contribution-types",
      (signal) => api.get_api_v1_admin_contributions_types({ signal }),
      "",
      true,
      true,
    );
  return (
    <Panel title={t({ en: "Contribution types", ar: "أنواع المساهمات" })}>
      <Button onClick={() => setEditing(null)}>
        {t({ en: "New contribution type", ar: "نوع مساهمة جديد" })}
      </Button>
      <QueryStatus query={q} />
      {q.data && (
        <ul>
          {rows(q.data).map((item) => (
            <li key={string(item.id)}>
              {localizedField(item, "name", locale)} · {string(item.status)}{" "}
              <Button
                variant="outline"
                disabled={!hasFullContributionType(item)}
                onClick={() => setEditing(item)}
              >
                {t({ en: "Edit type", ar: "تعديل النوع" })}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {q.data &&
        rows(q.data).some((item) => !hasFullContributionType(item)) && (
          <p>
            {t({
              en: "Some type records omit their descriptions and display order. Editing those records is unavailable until the API returns their complete details.",
              ar: "بعض الأنواع لا تتضمن الوصف وترتيب العرض. يتعذّر تعديلها حتى يعيد الخادم التفاصيل كاملة.",
            })}
          </p>
        )}
      {editing !== undefined && (
        <TypeEditor initial={editing} onClose={() => setEditing(undefined)} />
      )}
    </Panel>
  );
}
function TypeEditor({
  initial,
  onClose,
}: {
  initial: Entry | null;
  onClose: () => void;
}) {
  const { api } = useCommunityConnection(),
    action = useCommunityAction(),
    { t } = useLocale(),
    [form, setForm] = useState<Schemas["EngagementCategoryRequest"]>({
      nameAr: string(initial?.nameAr),
      nameEn: initial ? (initial.nameEn as string | null) : "",
      slug: string(initial?.slug),
      descriptionAr: initial ? (initial.descriptionAr as string | null) : "",
      descriptionEn: initial ? (initial.descriptionEn as string | null) : "",
      displayOrder: Number(initial?.displayOrder || 0),
      status: string(initial?.status) || "Active",
      version: initial ? string(initial.version) : undefined,
    });
  function submit(e: FormEvent) {
    e.preventDefault();
    void action.run(
      () =>
        initial
          ? api.put_api_v1_admin_contributions_types_by_id({
              path: { id: string(initial.id) },
              body: form,
            })
          : api.post_api_v1_admin_contributions_types({ body: form }),
      onClose,
    );
  }
  return (
    <Modal
      open
      description=""
      title={t({ en: "Contribution type", ar: "نوع المساهمة" })}
      onClose={() => {
        if (!action.busy) onClose();
      }}
      className="contribution-editor-modal"
    >
      <form className="contribution-editor" onSubmit={submit}>
        <fieldset disabled={action.busy}>
          {(
            [
              "nameAr",
              "nameEn",
              "slug",
              "descriptionAr",
              "descriptionEn",
              "status",
            ] as const
          ).map((key) => (
            <label key={key}>
              {t(typeLabels[key])}
              <input
                required={["nameAr", "slug", "status"].includes(key)}
                value={form[key] || ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <label>
            {t({ en: "Display order", ar: "ترتيب العرض" })}
            <input
              type="number"
              required
              step={1}
              value={form.displayOrder ?? 0}
              onChange={(e) =>
                setForm({ ...form, displayOrder: e.target.valueAsNumber })
              }
            />
          </label>
        </fieldset>
        {action.feedback}
        <Button disabled={action.busy}>
          {t({ en: "Save type", ar: "حفظ النوع" })}
        </Button>
      </form>
    </Modal>
  );
}
const typeLabels = {
  nameAr: { en: "Name · Arabic", ar: "الاسم · العربية" },
  nameEn: { en: "Name · English", ar: "الاسم · الإنجليزية" },
  slug: { en: "URL name", ar: "الاسم في الرابط" },
  descriptionAr: { en: "Description · Arabic", ar: "الوصف · العربية" },
  descriptionEn: { en: "Description · English", ar: "الوصف · الإنجليزية" },
  status: { en: "Status", ar: "الحالة" },
};
