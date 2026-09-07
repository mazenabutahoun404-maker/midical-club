import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpenCheck,
  Check,
  CheckCircle2,
  FileCheck2,
  FileClock,
  FilePenLine,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { formatDate } from "../../lib/dates";
import type { AdminContentItem, AdminWorkflowStatus } from "../../types/admin";
import { adminKindKey, adminStatusKey } from "../admin-format";
import { useAdminActions, useAdminContent } from "../useAdmin";

type QueueView =
  "all" | "under-review" | "changes-requested" | "approved" | "published";

export default function AdminContentPage() {
  const { label, t, locale } = useLocale();
  const query = useAdminContent();
  const actions = useAdminActions();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<QueueView>("all");
  const [kind, setKind] = useState("all");
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [publishTarget, setPublishTarget] = useState<AdminContentItem | null>(
    null,
  );
  const selectedId = params.get("item");

  const items = query.data || [];
  const selected = items.find((item) => item.id === selectedId) || null;
  useEffect(() => {
    if (!selectedId && items.length) {
      const preferred =
        items.find((item) => item.status === "under-review") || items[0];
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("item", preferred.id);
          return next;
        },
        { replace: true },
      );
    }
  }, [items, selectedId, setParams]);

  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase();
    const staleOnly = params.get("health") === "stale";
    return items.filter((item) => {
      if (view !== "all" && item.status !== view) return false;
      if (kind !== "all" && item.kind !== kind) return false;
      if (
        staleOnly &&
        (!item.staleAfter ||
          new Date(item.staleAfter) >= new Date("2026-09-03T23:59:59+03:00"))
      )
        return false;
      if (!value) return true;
      return [t(item.title), t(item.contributor), t(item.topic)]
        .join(" ")
        .toLocaleLowerCase()
        .includes(value);
    });
  }, [items, kind, params, search, t, view]);

  const tabs = [
    {
      id: "all",
      label: label("allContent"),
      icon: FileCheck2,
      count: items.length,
    },
    {
      id: "under-review",
      label: label("underReview"),
      icon: FileClock,
      count: items.filter((item) => item.status === "under-review").length,
    },
    {
      id: "changes-requested",
      label: label("changesRequested"),
      icon: RotateCcw,
      count: items.filter((item) => item.status === "changes-requested").length,
    },
    {
      id: "approved",
      label: label("approved"),
      icon: CheckCircle2,
      count: items.filter((item) => item.status === "approved").length,
    },
    {
      id: "published",
      label: label("publishedStatus"),
      icon: Send,
      count: items.filter((item) => item.status === "published").length,
    },
  ] as const;

  const choose = (item: AdminContentItem) => {
    setNote("");
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set("item", item.id);
      return next;
    });
  };
  const transition = async (
    item: AdminContentItem,
    action: "request-changes" | "approve" | "publish" | "return-to-review",
  ) => {
    try {
      await actions.review({ itemId: item.id, action, note });
      setNote("");
      setPublishTarget(null);
      toast.success(label("adminActionSaved"));
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === "ADMIN_SAFETY_CHECK_FAILED"
          ? label("adminPublishBlocked")
          : label("adminActionFailed"),
      );
    }
  };

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <div className="container admin-page admin-content-page">
      <PageIntro
        eyebrow={label("adminContentEyebrow")}
        title={label("adminContentTitle")}
        description={label("adminContentBody")}
      />
      <div className="admin-content-toolbar">
        <AliveTabs
          label={label("status")}
          items={[...tabs]}
          value={view}
          onChange={setView}
        />
        <label className="admin-search-field">
          <Search size={18} />
          <span className="sr-only">{label("adminSearchContent")}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={label("adminSearchContent")}
          />
        </label>
        <label className="admin-kind-filter">
          <span className="sr-only">{label("adminAllKinds")}</span>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="all">{label("adminAllKinds")}</option>
            {(
              [
                "contribution",
                "resource",
                "article",
                "homepage",
                "event",
                "opportunity",
              ] as const
            ).map((value) => (
              <option key={value} value={value}>
                {label(adminKindKey(value))}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-content-workbench">
        <section
          className="admin-content-list"
          aria-label={label("adminReviewQueue")}
        >
          <p className="admin-list-count">
            <strong>{filtered.length}</strong> {label("adminQueueCount")}
          </p>
          {filtered.length ? (
            filtered.map((item) => (
              <button
                type="button"
                className="admin-content-row"
                data-active={selected?.id === item.id || undefined}
                data-status={item.status}
                onClick={() => choose(item)}
                key={item.id}
              >
                <span className="admin-content-row-mark">
                  <BookOpenCheck size={19} />
                </span>
                <span className="admin-content-row-copy">
                  <small>
                    {label(adminKindKey(item.kind))} · {t(item.topic)}
                  </small>
                  <strong>{t(item.title)}</strong>
                  <span>
                    {t(item.contributor)} · {formatDate(item.updatedAt, locale)}
                  </span>
                </span>
                <span className="admin-status" data-status={item.status}>
                  {label(adminStatusKey(item.status))}
                </span>
              </button>
            ))
          ) : (
            <EmptyState
              title={label("emptyTitle")}
              description={label("adminSelectItemBody")}
            />
          )}
        </section>

        <section className="admin-review-inspector" aria-live="polite">
          {selected ? (
            <ReviewInspector
              item={selected}
              note={note}
              setNote={setNote}
              pending={actions.isMutating}
              request={(action) => {
                if (action === "publish") setPublishTarget(selected);
                else void transition(selected, action);
              }}
            />
          ) : (
            <div className="admin-inspector-empty">
              <FilePenLine size={30} />
              <h2>{label("adminSelectItem")}</h2>
              <p>{label("adminSelectItemBody")}</p>
            </div>
          )}
        </section>
      </div>

      <Modal
        open={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        title={label("adminPublish")}
        description={label("adminPublishBlocked")}
        className="admin-confirm-dialog"
      >
        <div className="admin-confirm-mark">
          <ShieldCheck size={29} />
        </div>
        <p>{publishTarget ? t(publishTarget.title) : ""}</p>
        <div className="admin-confirm-actions">
          <Button variant="outline" onClick={() => setPublishTarget(null)}>
            {label("close")}
          </Button>
          <Button
            className="button button-primary"
            disabled={actions.isMutating}
            onClick={() =>
              publishTarget && void transition(publishTarget, "publish")
            }
          >
            <Send size={17} /> {label("adminPublish")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ReviewInspector({
  item,
  note,
  setNote,
  pending,
  request,
}: {
  item: AdminContentItem;
  note: string;
  setNote: (value: string) => void;
  pending: boolean;
  request: (
    action: "request-changes" | "approve" | "publish" | "return-to-review",
  ) => void;
}) {
  const { label, t, locale } = useLocale();
  const canRequest = item.status === "under-review";
  const canApprove = item.status === "under-review";
  const canPublish = item.status === "approved";
  const canReturn = item.status === "changes-requested";
  return (
    <article className="admin-review-card" data-status={item.status}>
      <header>
        <span className="admin-status" data-status={item.status}>
          {label(adminStatusKey(item.status))}
        </span>
        <span className="admin-version-chip">
          <FileClock size={15} /> {label("adminVersion")} {item.versionNumber}
        </span>
      </header>
      <span className="eyebrow">{label(adminKindKey(item.kind))}</span>
      <h2>{t(item.title)}</h2>
      <p>{t(item.summary)}</p>
      <div className="admin-fact-grid">
        <div>
          <UserRoundCheck size={17} />
          <span>{label("adminContributor")}</span>
          <strong>{t(item.contributor)}</strong>
        </div>
        <div>
          <ShieldCheck size={17} />
          <span>{label("adminReviewer")}</span>
          <strong>
            {item.reviewer ? t(item.reviewer) : label("adminUnassigned")}
          </strong>
        </div>
        <div data-valid={item.rightsConfirmed || undefined}>
          <Check size={17} />
          <span>
            {label(
              item.rightsConfirmed
                ? "adminRightsConfirmed"
                : "adminRightsMissing",
            )}
          </span>
          <strong>
            {item.rightsConfirmed ? label("adminYes") : label("adminNo")}
          </strong>
        </div>
        <div>
          <BookOpenCheck size={17} />
          <span>{label("adminReferenceCount")}</span>
          <strong>{item.referenceCount}</strong>
        </div>
      </div>
      {item.reviewerNote && (
        <aside className="admin-reviewer-note">
          <strong>{label("reviewerFeedback")}</strong>
          <p>{t(item.reviewerNote)}</p>
        </aside>
      )}
      <details className="admin-review-history" open>
        <summary>{label("adminReviewTrail")}</summary>
        <ol>
          {[...item.history].reverse().map((entry) => (
            <li key={entry.id} data-status={entry.status}>
              <i />
              <div>
                <strong>{label(adminStatusKey(entry.status))}</strong>
                <span>{t(entry.note)}</span>
                <small>
                  {t(entry.actor)} ·{" "}
                  {formatDate(entry.at, locale, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
            </li>
          ))}
        </ol>
      </details>
      {(canRequest || canApprove || canPublish || canReturn) && (
        <div className="admin-decision-box">
          <label htmlFor="admin-decision-note">
            {label("adminDecisionNote")}
          </label>
          <textarea
            id="admin-decision-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={label("adminDecisionPlaceholder")}
            rows={3}
          />
          <div className="admin-decision-actions">
            {canRequest && (
              <Button
                variant="outline"
                disabled={pending || !note.trim()}
                onClick={() => request("request-changes")}
              >
                <RotateCcw size={16} />
                {label("adminRequestChanges")}
              </Button>
            )}
            {canApprove && (
              <Button
                className="button button-primary"
                disabled={pending}
                onClick={() => request("approve")}
              >
                <CheckCircle2 size={16} />
                {label("adminApprove")}
              </Button>
            )}
            {canPublish && (
              <Button
                className="button button-primary"
                disabled={
                  pending || !item.rightsConfirmed || item.referenceCount < 1
                }
                onClick={() => request("publish")}
              >
                <Send size={16} />
                {label("adminPublish")}
              </Button>
            )}
            {canReturn && (
              <Button
                className="button button-primary"
                disabled={pending}
                onClick={() => request("return-to-review")}
              >
                <FileClock size={16} />
                {label("adminReturnReview")}
              </Button>
            )}
          </div>
          <small>{label("adminDeviceState")}</small>
        </div>
      )}
    </article>
  );
}
