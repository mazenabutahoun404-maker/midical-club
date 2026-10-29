import {RecruitmentOpening as ConnectedPage} from "../membership/Recruitment";
import {MembershipScope} from "../membership/shared";
import {useServices} from "../../app/providers/ServicesProvider";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { RecruitmentPipeline } from "../../components/data-display/RecruitmentPipeline";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Notice } from "../../components/feedback/Notice";
import { RecruitmentNavigation } from "../../components/navigation/RecruitmentNavigation";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { routes, signInPath } from "../../constants/routes";
import {
  useRecruitmentPosition,
  useRecruitmentWorkspace,
} from "../../hooks/useContent";
import { formatDate } from "../../lib/dates";
import {
  activeApplication,
  applicationStatusKey,
  positionStatusKey,
  teamKey,
} from "../../lib/recruitment";
import { RecruitmentApplicationDialog } from "./RecruitmentApplicationDialog";

function PreviewRecruitmentPositionPage() {
  const { slug } = useParams();
  const { label, t, locale } = useLocale();
  const auth = useAuth();
  const position = useRecruitmentPosition(slug);
  const workspace = useRecruitmentWorkspace();
  const [editorOpen, setEditorOpen] = useState(false);
  if (position.isPending || workspace.isPending) return <LoadingState />;
  if (position.isError || workspace.isError)
    return (
      <ErrorState
        retry={() => {
          void position.refetch();
          workspace.retry();
        }}
      />
    );
  if (!position.data)
    return (
      <div className="container not-found">
        <h1>{label("notFound")}</h1>
        <AppLink href={routes.recruitment}>
          {label("backToRecruitment")}
        </AppLink>
      </div>
    );
  const role = position.data;
  const existing = workspace.applications.find(
    (item) =>
      item.positionId === role.id &&
      item.status !== "withdrawn" &&
      item.status !== "rejected",
  );
  const signedIn = auth.snapshot.status === "authenticated";
  const action = () => {
    if (role.status === "closed")
      return (
        <div className="position-closed-message">
          <strong>{label("roleClosed")}</strong>
          <p>{label("roleClosedBody")}</p>
        </div>
      );
    if (!signedIn)
      return (
        <AppLink
          href={signInPath(`/recruitment/${encodeURIComponent(role.slug)}`)}
          className="button button-primary"
        >
          {label("signInToApply")}
        </AppLink>
      );
    if (existing && activeApplication(existing.status)) {
      if (existing.status === "draft")
        return (
          <Button
            className="button button-primary"
            onClick={() => setEditorOpen(true)}
          >
            {label("continueApplication")}
          </Button>
        );
      return (
        <AppLink href={routes.myApplications} className="button button-primary">
          {label("trackApplication")}
        </AppLink>
      );
    }
    return (
      <Button
        className="button button-primary"
        onClick={() => setEditorOpen(true)}
      >
        {label("applyForPosition")}
      </Button>
    );
  };
  return (
    <div className="recruitment-v9 position-detail-page">
      <div className="container">
        <RecruitmentNavigation />
        <AppLink href={routes.recruitment} className="position-back-link">
          <ArrowLeft size={17} className="directional" />
          {label("backToRecruitment")}
        </AppLink>
        <header className="position-detail-hero" data-accent={role.accent}>
          <div>
            <span className="position-team">
              <Layers3 size={15} /> {label(teamKey(role.team))}
            </span>
            <h1 tabIndex={-1} data-page-heading>
              {t(role.title)}
            </h1>
            <p>{t(role.description)}</p>
            <div className="position-detail-skills">
              {role.skills.map((skill) => (
                <span key={skill.en}>{t(skill)}</span>
              ))}
            </div>
          </div>
          <aside className="position-action-panel">
            <span className="position-status">
              {label(positionStatusKey(role.status))}
            </span>
            {existing && activeApplication(existing.status) && (
              <div className="existing-application-state">
                <span>{label("currentStage")}</span>
                <strong>{label(applicationStatusKey(existing.status))}</strong>
              </div>
            )}
            <dl>
              <div>
                <dt>
                  <Clock3 size={16} /> {label("timeCommitment")}
                </dt>
                <dd>
                  {role.commitmentHoursPerWeek} {label("hoursPerWeek")}
                </dd>
              </div>
              <div>
                <dt>
                  <UsersRound size={16} /> {label("openings")}
                </dt>
                <dd>{role.openings}</dd>
              </div>
              <div>
                <dt>
                  <CalendarClock size={16} /> {label("applicationWindow")}
                </dt>
                <dd>{formatDate(role.closesAt, locale)}</dd>
              </div>
              <div>
                <dt>
                  <GraduationCap size={16} /> {label("eligibleYears")}
                </dt>
                <dd>{role.yearEligibility.join(" · ")}</dd>
              </div>
            </dl>
            {action()}
          </aside>
        </header>

        <div className="position-detail-grid">
          <section>
            <span className="eyebrow">
              <CheckCircle2 size={14} /> {label("responsibilities")}
            </span>
            <h2>{label("responsibilities")}</h2>
            <ul>
              {role.responsibilities.map((item) => (
                <li key={item.en}>{t(item)}</li>
              ))}
            </ul>
          </section>
          <section>
            <span className="eyebrow">
              <Sparkles size={14} /> {label("roleRequirements")}
            </span>
            <h2>{label("roleRequirements")}</h2>
            <ul>
              {role.requirements.map((item) => (
                <li key={item.en}>{t(item)}</li>
              ))}
            </ul>
          </section>
        </div>
        <section className="position-pipeline-panel">
          <div>
            <span className="eyebrow">{label("recruitmentPathTitle")}</span>
            <h2>{label("recruitmentPathTitle")}</h2>
            <p>{label("recruitmentPathBody")}</p>
          </div>
          <RecruitmentPipeline status={existing?.status} />
        </section>
        <Notice>{label("recruitmentPrivacy")}</Notice>
        <p className="v9-preview-note">{label("recruitmentPreviewNotice")}</p>
      </div>
      {signedIn && role.status !== "closed" && (
        <RecruitmentApplicationDialog
          open={editorOpen}
          position={role}
          application={existing?.status === "draft" ? existing : undefined}
          busy={workspace.isMutating}
          onClose={() => setEditorOpen(false)}
          onSave={workspace.saveDraft}
          onSubmit={workspace.submit}
        />
      )}
    </div>
  );
}

export default function RecruitmentPositionPage(){const services=useServices();return services.membershipApi?<MembershipScope><ConnectedPage /></MembershipScope>:<PreviewRecruitmentPositionPage/>}
