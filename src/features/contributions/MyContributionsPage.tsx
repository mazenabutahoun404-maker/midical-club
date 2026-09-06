import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  FilePenLine,
  Plus,
  RotateCcw,
  Send,
  Trash2,
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
import { useContributions } from "../../hooks/useContent";
import { formatDate } from "../../lib/dates";
import type {
  ContributionStatus,
  StudentContribution,
} from "../../types/content";
import { ContributionEditor } from "./ContributionEditor";

type View = "all" | ContributionStatus;
const statusKey = (status: ContributionStatus) =>
  status === "under-review"
    ? ("underReview" as const)
    : status === "changes-requested"
      ? ("changesRequested" as const)
      : status === "published"
        ? ("publishedStatus" as const)
        : status;
export default function MyContributionsPage() {
  const { label, t, locale } = useLocale();
  const contributions = useContributions();
  const [view, setView] = useState<View>("all");
  const [editing, setEditing] = useState<StudentContribution | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleting, setDeleting] = useState<StudentContribution | null>(null);
  if (contributions.isPending) return <LoadingState />;
  if (contributions.isError) return <ErrorState retry={contributions.retry} />;
  const filtered = contributions.items.filter(
    (item) => view === "all" || item.status === view,
  );
  const tabs = [
    {
      id: "all",
      label: label("allContent"),
      icon: FileCheck2,
      count: contributions.items.length,
    },
    {
      id: "draft",
      label: label("draft"),
      icon: FilePenLine,
      count: contributions.items.filter((item) => item.status === "draft")
        .length,
    },
    {
      id: "under-review",
      label: label("underReview"),
      icon: Clock3,
      count: contributions.items.filter(
        (item) => item.status === "under-review",
      ).length,
    },
    {
      id: "changes-requested",
      label: label("changesRequested"),
      icon: RotateCcw,
      count: contributions.items.filter(
        (item) => item.status === "changes-requested",
      ).length,
    },
    {
      id: "approved",
      label: label("approved"),
      icon: CheckCircle2,
      count: contributions.items.filter((item) => item.status === "approved")
        .length,
    },
  ] as const;
  async function submit(id: string) {
    try {
      await contributions.submit(id);
      toast.success(label("submissionSent"));
    } catch {
      toast.error(label("contributionFailed"));
    }
  }
  async function remove() {
    if (!deleting) return;
    try {
      await contributions.deleteDraft(deleting.id);
      setDeleting(null);
      toast.success(label("deleteDraft"));
    } catch {
      toast.error(label("contributionFailed"));
    }
  }
  const openEditor = (item: StudentContribution | null) => {
    setEditing(item);
    setEditorOpen(true);
  };
  return (
    <div className="container contributions-v6 my-contributions-page">
      <PageIntro
        eyebrow={label("myContributionsEyebrow")}
        title={label("myContributionsTitle")}
        description={label("myContributionsBody")}
      />
      <div className="contribution-toolbar">
        <AliveTabs
          label={label("status")}
          items={[...tabs]}
          value={view}
          onChange={setView}
        />
        <Button
          className="button button-primary"
          onClick={() => openEditor(null)}
        >
          <Plus size={17} />
          {label("newContribution")}
        </Button>
      </div>
      {filtered.length ? (
        <div className="contribution-records">
          {filtered.map((item) => (
            <article key={item.id} data-status={item.status}>
              <header>
                <span className="contribution-kind">
                  <FileCheck2 size={17} />
                  {label(
                    item.kind === "resource"
                      ? "resourceContribution"
                      : "articleContribution",
                  )}
                </span>
                <span className="contribution-status">
                  {label(statusKey(item.status))}
                </span>
              </header>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              <dl>
                <div>
                  <dt>{label("contributionTopic")}</dt>
                  <dd>{item.topic}</dd>
                </div>
                <div>
                  <dt>{label("updatedOn")}</dt>
                  <dd>{formatDate(item.updatedAt, locale)}</dd>
                </div>
                <div>
                  <dt>{label("references")}</dt>
                  <dd>{item.references.length}</dd>
                </div>
              </dl>
              {item.reviewerFeedback && (
                <aside className="reviewer-feedback">
                  <strong>{label("reviewerFeedback")}</strong>
                  <p>{t(item.reviewerFeedback)}</p>
                  {item.reviewer && <span>{t(item.reviewer)}</span>}
                </aside>
              )}
              <details className="contribution-history">
                <summary>{label("reviewHistory")}</summary>
                <ol>
                  {item.history.map((entry) => (
                    <li key={entry.id} data-status={entry.status}>
                      <i />
                      <div>
                        <strong>{label(statusKey(entry.status))}</strong>
                        <span>
                          {t(entry.note)} · {formatDate(entry.at, locale)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </details>
              <footer>
                {(item.status === "draft" ||
                  item.status === "changes-requested") && (
                  <Button variant="outline" onClick={() => openEditor(item)}>
                    <FilePenLine size={16} />
                    {label(
                      item.status === "changes-requested"
                        ? "editAndResubmit"
                        : "editContribution",
                    )}
                  </Button>
                )}
                {item.status === "draft" && (
                  <>
                    <Button
                      className="button button-primary"
                      disabled={contributions.isMutating}
                      onClick={() => void submit(item.id)}
                    >
                      <Send size={16} />
                      {label("submitForReview")}
                    </Button>
                    <Button variant="ghost" onClick={() => setDeleting(item)}>
                      <Trash2 size={16} />
                      {label("deleteDraft")}
                    </Button>
                  </>
                )}
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={label("noContributions")}
          description={label("noContributionsBody")}
        />
      )}
      <p className="v6-boundary-note">{label("contributionPreviewNotice")}</p>
      <ContributionEditor
        open={editorOpen}
        contribution={editing}
        busy={contributions.isMutating}
        onClose={() => setEditorOpen(false)}
        onSave={contributions.saveDraft}
      />
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={label("deleteDraftTitle")}
        description={label("deleteDraftBody")}
      >
        <div className="workspace-form-actions">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            {label("cancel")}
          </Button>
          <Button variant="destructive" onClick={() => void remove()}>
            {label("deleteDraft")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
