import { GraduationCap, UserRound, BookOpen, ArrowUpRight } from "lucide-react";
import { useStudentProfile } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { AppLink } from "../../components/navigation/AppLink";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
export default function ProfilePage() {
  const profile = useStudentProfile();
  const { label, t } = useLocale();
  if (profile.isPending) return <LoadingState />;
  if (profile.isError)
    return <ErrorState retry={() => void profile.refetch()} />;
  const student = profile.data;
  return (
    <div className="container">
      <PageIntro
        title={label("myProfile")}
        description={label("profileIntro")}
        eyebrow={label("ownCorner")}
      />
      <div className="profile-grid">
        <section className="profile-identity">
          <span className="personal-avatar">{t(student.initials)}</span>
          <h2>{t(student.name)}</h2>
          <span className="profile-sample">{label("sampleProfile")}</span>
          <p>{t(student.bio)}</p>
          <AppLink href="/my/settings" className="button button-primary">
            {label("customizeSpace")}
            <ArrowUpRight size={17} className="directional" />
          </AppLink>
        </section>
        <section className="profile-details">
          <h2>{label("academicProfile")}</h2>
          <dl>
            <div>
              <dt>
                <GraduationCap size={20} />
                {label("program")}
              </dt>
              <dd>{t(student.program)}</dd>
            </div>
            <div>
              <dt>
                <BookOpen size={20} />
                {label("studyYear")}
              </dt>
              <dd>
                {label("year")} {student.year}
              </dd>
            </div>
            <div>
              <dt>
                <UserRound size={20} />
                {label("batch")}
              </dt>
              <dd>{t(student.batch)}</dd>
            </div>
          </dl>
          <p>{label("profileSampleNote")}</p>
          <AppLink className="text-link" href="/my/learning">
            {label("openMyLearning")}
            <ArrowUpRight size={17} className="directional" />
          </AppLink>
        </section>
      </div>
    </div>
  );
}
