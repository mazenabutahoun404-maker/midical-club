import {
  BadgeCheck,
  Clock3,
  ContactRound,
  Hourglass,
  Layers3,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { routes } from "../../constants/routes";
import {
  useRecruitmentWorkspace,
  useStudentProfile,
} from "../../hooks/useContent";
import { formatDate } from "../../lib/dates";
import { teamKey } from "../../lib/recruitment";

export default function TeamProfilePage() {
  const { label, t, locale } = useLocale();
  const workspace = useRecruitmentWorkspace();
  const student = useStudentProfile();
  if (workspace.isPending || student.isPending) return <LoadingState />;
  if (workspace.isError || student.isError)
    return (
      <ErrorState
        retry={() => {
          workspace.retry();
          void student.refetch();
        }}
      />
    );
  const member = workspace.membership;
  if (!member)
    return (
      <div className="container recruitment-v9 team-profile-page">
        <PageIntro
          eyebrow={label("memberProfileEyebrow")}
          title={label("memberProfileTitle")}
          description={label("memberProfileBody")}
        />
        <EmptyState
          title={label("noMemberProfile")}
          description={label("noMemberProfileBody")}
          href={routes.recruitment}
          actionLabel={label("browseRecruitment")}
        />
      </div>
    );
  const verifiedRecent = member.recentHours
    .filter((item) => item.status === "verified")
    .reduce((total, item) => total + item.hours, 0);
  const pendingRecent = member.recentHours
    .filter((item) => item.status === "pending")
    .reduce((total, item) => total + item.hours, 0);
  return (
    <div className="container recruitment-v9 team-profile-page">
      <PageIntro
        eyebrow={label("memberProfileEyebrow")}
        title={label("memberProfileTitle")}
        description={label("memberProfileBody")}
      />
      <section className="member-identity-card">
        <div className="member-orbit" aria-hidden="true">
          <i />
          <i />
          <ContactRound size={42} />
        </div>
        <div className="member-identity-copy">
          <span className="active-member-badge">
            <BadgeCheck size={16} /> {label("activeMember")}
          </span>
          <h2>{student.data ? t(student.data.name) : "—"}</h2>
          <p>
            <Layers3 size={17} /> {label(teamKey(member.team))}
          </p>
          <div className="member-position-list">
            {member.positions.map((position) => (
              <span key={position.en}>{t(position)}</span>
            ))}
          </div>
        </div>
        <dl className="member-identity-facts">
          <div>
            <dt>{label("memberSince")}</dt>
            <dd>{formatDate(member.joinedAt, locale)}</dd>
          </div>
          <div>
            <dt>{label("volunteerHours")}</dt>
            <dd>{member.volunteerHours}</dd>
          </div>
        </dl>
      </section>

      <section className="hours-overview">
        <article className="hours-total-card">
          <span>
            <Clock3 size={19} /> {label("volunteerHours")}
          </span>
          <strong>{member.volunteerHours}</strong>
          <p>{label("verifiedHours")}</p>
          <div className="hours-pulse" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </article>
        <article>
          <span>
            <BadgeCheck size={18} /> {label("verifiedHours")}
          </span>
          <strong>{verifiedRecent}</strong>
          <p>{label("recentHourRecords")}</p>
        </article>
        <article>
          <span>
            <Hourglass size={18} /> {label("pendingHours")}
          </span>
          <strong>{pendingRecent}</strong>
          <p>{label("hourRecordStatus")}</p>
        </article>
      </section>

      <section className="hour-record-section">
        <div className="recruitment-section-heading">
          <div>
            <span className="eyebrow">
              <TimerReset size={14} /> {label("volunteerHours")}
            </span>
            <h2>{label("recentHourRecords")}</h2>
          </div>
        </div>
        <div className="hour-record-list">
          {member.recentHours.map((record) => (
            <article key={record.id} data-status={record.status}>
              <span className="hour-value">{record.hours}</span>
              <div>
                <h3>{t(record.activity)}</h3>
                <p>{formatDate(record.date, locale)}</p>
              </div>
              <span className="hour-status">
                {record.status === "verified"
                  ? label("verifiedHours")
                  : label("pendingHours")}
              </span>
              {record.verifiedBy && (
                <small>
                  {label("verifiedBy")} · {t(record.verifiedBy)}
                </small>
              )}
            </article>
          ))}
        </div>
      </section>

      <aside className="membership-permission-boundary">
        <ShieldCheck size={26} />
        <div>
          <strong>{label("membershipNotPermission")}</strong>
          <p>{label("membershipNotPermissionBody")}</p>
        </div>
      </aside>
      <p className="v9-preview-note">{label("recruitmentPreviewNotice")}</p>
    </div>
  );
}
