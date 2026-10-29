import {MyApplications as ConnectedPage} from "../membership/Recruitment";
import {MembershipScope} from "../membership/shared";
import {useServices} from "../../app/providers/ServicesProvider";
import { useMemo, useState, type CSSProperties } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  Clock3,
  FilePenLine,
  History,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { RecruitmentPipeline } from "../../components/data-display/RecruitmentPipeline";
import { PageIntro } from "../../components/data-display/PageIntro";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { routes, positionPath } from "../../constants/routes";
import {
  useRecruitmentPositions,
  useRecruitmentWorkspace,
} from "../../hooks/useContent";
import { formatDate } from "../../lib/dates";
import {
  activeApplication,
  applicationStatusKey,
  teamKey,
} from "../../lib/recruitment";
import type { RecruitmentApplication } from "../../types/recruitment";
import { RecruitmentApplicationDialog } from "./RecruitmentApplicationDialog";

type ApplicationView = "all" | "active" | "onboarding" | "past";

function PreviewMyApplicationsPage() {
  const { label, t, locale } = useLocale();
  const positions = useRecruitmentPositions();
  const workspace = useRecruitmentWorkspace();
  const [view, setView] = useState<ApplicationView>("all");
  const [editing, setEditing] = useState<RecruitmentApplication | null>(null);
  const [withdrawing, setWithdrawing] = useState<RecruitmentApplication | null>(
    null,
  );
  const rows = useMemo(
    () =>
      workspace.applications.filter((application) => {
        if (view === "active") return activeApplication(application.status);
        if (view === "onboarding")
          return ["accepted", "onboarding", "completed"].includes(
            application.status,
          );
        if (view === "past")
          return ["rejected", "withdrawn", "completed"].includes(
            application.status,
          );
        return true;
      }),
    [view, workspace.applications],
  );
  if (positions.isPending || workspace.isPending) return <LoadingState />;
  if (positions.isError || workspace.isError)
    return (
      <ErrorState
        retry={() => {
          void positions.refetch();
          workspace.retry();
        }}
      />
    );
  const count = (target: ApplicationView) =>
    workspace.applications.filter((application) => {
      if (target === "active") return activeApplication(application.status);
      if (target === "onboarding")
        return ["accepted", "onboarding", "completed"].includes(
          application.status,
        );
      if (target === "past")
        return ["rejected", "withdrawn", "completed"].includes(
          application.status,
        );
      return true;
    }).length;
  const tabs = [
    {
      id: "all",
      label: label("allApplications"),
      icon: BriefcaseBusiness,
      count: count("all"),
    },
    {
      id: "active",
      label: label("activeApplications"),
      icon: Clock3,
      count: count("active"),
    },
    {
      id: "onboarding",
      label: label("onboardingApplications"),
      icon: ClipboardCheck,
      count: count("onboarding"),
    },
    {
      id: "past",
      label: label("pastApplications"),
      icon: History,
      count: count("past"),
    },
  ] as const;
  async function withdraw() {
    if (!withdrawing) return;
    try {
      await workspace.withdraw(withdrawing.id);
      setWithdrawing(null);
      toast.success(label("applicationWithdrawnToast"));
    } catch {
      toast.error(label("applicationFailed"));
    }
  }
  async function toggleTask(applicationId: string, taskId: string) {
    try {
      await workspace.toggleOnboardingTask({ applicationId, taskId });
      toast.success(label("onboardingTaskUpdated"));
    } catch {
      toast.error(label("applicationFailed"));
    }
  }
  const editingPosition = editing
    ? positions.data?.find((position) => position.id === editing.positionId)
    : undefined;
  return (
    <div className="container recruitment-v9 my-applications-page">
      <PageIntro
        eyebrow={label("myApplicationsEyebrow")}
        title={label("myApplicationsTitle")}
        description={label("myApplicationsBody")}
      />
      <div className="application-toolbar">
        <AliveTabs
          label={label("currentStage")}
          items={[...tabs]}
          value={view}
          onChange={setView}
        />
        <AppLink href={routes.recruitment} className="button button-secondary">
          {label("browseRecruitment")}
        </AppLink>
      </div>
      {rows.length ? (
        <div className="application-list">
          {rows.map((application) => {
            const position = positions.data?.find(
              (item) => item.id === application.positionId,
            );
            if (!position) return null;
            const completedTasks = application.onboarding.filter(
              (task) => task.completed,
            ).length;
            return (
              <article
                key={application.id}
                className="application-record"
                data-status={application.status}
              >
                <header>
                  <div>
                    <span className="position-team">
                      {label(teamKey(position.team))}
                    </span>
                    <h2>{t(position.title)}</h2>
                  </div>
                  <span className="application-status">
                    <i aria-hidden="true" />
                    {label(applicationStatusKey(application.status))}
                  </span>
                </header>
                <RecruitmentPipeline status={application.status} compact />
                <dl className="application-facts">
                  <div>
                    <dt>{label("currentStage")}</dt>
                    <dd>{label(applicationStatusKey(application.status))}</dd>
                  </div>
                  {application.submittedAt && (
                    <div>
                      <dt>{label("submittedOn")}</dt>
                      <dd>{formatDate(application.submittedAt, locale)}</dd>
                    </div>
                  )}
                  <div>
                    <dt>{label("updatedOn")}</dt>
                    <dd>{formatDate(application.updatedAt, locale)}</dd>
                  </div>
                </dl>
                {application.interviewAt &&
                  ["interview", "accepted", "onboarding", "completed"].includes(
                    application.status,
                  ) && (
                    <aside className="application-interview">
                      <CalendarClock size={18} />
                      <div>
                        <strong>{label("interviewDetails")}</strong>
                        <span>
                          {formatDate(application.interviewAt, locale, {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {application.interviewLocation
                            ? ` · ${t(application.interviewLocation)}`
                            : ""}
                        </span>
                      </div>
                    </aside>
                  )}
                {application.reviewerNote && (
                  <blockquote className="application-reviewer-note">
                    <strong>{label("reviewerUpdate")}</strong>
                    <p>{t(application.reviewerNote)}</p>
                  </blockquote>
                )}
                {application.status === "onboarding" &&
                  application.onboarding.length > 0 && (
                    <section className="application-onboarding">
                      <header>
                        <div>
                          <span>{label("onboardingChecklist")}</span>
                          <strong>
                            {completedTasks} / {application.onboarding.length}{" "}
                            {label("onboardingProgress")}
                          </strong>
                        </div>
                        <span
                          className="onboarding-progress-ring"
                          style={
                            {
                              "--progress": `${Math.round((completedTasks / application.onboarding.length) * 100)}%`,
                            } as CSSProperties
                          }
                          aria-hidden="true"
                        />
                      </header>
                      <div className="onboarding-task-list">
                        {application.onboarding.map((task) => (
                          <label key={task.id}>
                            <input
                              type="checkbox"
                              checked={task.completed}
                              disabled={workspace.isMutating}
                              onChange={() =>
                                void toggleTask(application.id, task.id)
                              }
                            />
                            <span>
                              <strong>{t(task.title)}</strong>
                              <small>{t(task.description)}</small>
                            </span>
                          </label>
                        ))}
                      </div>
                      <p>
                        <ShieldCheck size={16} />
                        {label("onboardingBoundary")}
                      </p>
                    </section>
                  )}
                <details className="application-history">
                  <summary>
                    <History size={16} /> {label("applicationTimeline")}
                  </summary>
                  <ol>
                    {application.history
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <li key={entry.id}>
                          <i />
                          <div>
                            <strong>
                              {label(applicationStatusKey(entry.status))}
                            </strong>
                            <span>
                              {t(entry.note)} · {formatDate(entry.at, locale)}
                            </span>
                          </div>
                        </li>
                      ))}
                  </ol>
                </details>
                <footer>
                  <AppLink href={positionPath(position.slug)}>
                    {label("viewPosition")}
                  </AppLink>
                  {application.status === "draft" && (
                    <Button
                      variant="outline"
                      onClick={() => setEditing(application)}
                    >
                      <FilePenLine size={16} />
                      {label("continueApplication")}
                    </Button>
                  )}
                  {["draft", "submitted"].includes(application.status) && (
                    <Button
                      variant="ghost"
                      onClick={() => setWithdrawing(application)}
                    >
                      <X size={16} /> {label("withdrawApplication")}
                    </Button>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={label("noApplications")}
          description={label("noApplicationsBody")}
          href={routes.recruitment}
          actionLabel={label("browseRecruitment")}
        />
      )}
      <p className="v9-preview-note">{label("recruitmentPreviewNotice")}</p>
      {editingPosition && editing && (
        <RecruitmentApplicationDialog
          open
          position={editingPosition}
          application={editing}
          busy={workspace.isMutating}
          onClose={() => setEditing(null)}
          onSave={workspace.saveDraft}
          onSubmit={workspace.submit}
        />
      )}
      <Modal
        open={!!withdrawing}
        onClose={() => setWithdrawing(null)}
        title={label("withdrawApplicationTitle")}
        description={label("withdrawApplicationBody")}
      >
        <div className="workspace-form-actions">
          <Button variant="outline" onClick={() => setWithdrawing(null)}>
            {label("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={workspace.isMutating}
            onClick={() => void withdraw()}
          >
            <RotateCcw size={16} /> {label("withdrawApplication")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function MyApplicationsPage(){const services=useServices();return services.membershipApi?<MembershipScope><ConnectedPage /></MembershipScope>:<PreviewMyApplicationsPage/>}
