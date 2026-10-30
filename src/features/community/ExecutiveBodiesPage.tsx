import { ChevronDown, ShieldCheck } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { CommunityNavigation } from "../../components/navigation/CommunityNavigation";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { Notice } from "../../components/feedback/Notice";
import { useExecutiveBodies } from "../../hooks/useContent";

export default function ExecutiveBodiesPage() {
  const { t, label } = useLocale();
  const query = useExecutiveBodies();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const current = query.data?.find((body) => body.current);
  const archived = query.data?.filter((body) => !body.current) || [];
  return (
    <div className="community-v5 community-index-page container">
      <CommunityNavigation />
      <header className="community-page-intro leadership-page-intro">
        <span className="eyebrow">{label("leadershipEyebrow")}</span>
        <h1 tabIndex={-1} data-page-heading>
          {label("leadershipTitle")}
        </h1>
        <p>{label("leadershipBody")}</p>
      </header>
      {current && (
        <section className="executive-current">
          <div className="executive-heading">
            <span className="executive-seal" aria-hidden="true">
              <ShieldCheck size={28} />
              <i />
            </span>
            <div>
              <span className="eyebrow">
                {label("currentTerm")} · {current.term}
              </span>
              <h2>{t(current.title)}</h2>
              <p>{t(current.description)}</p>
            </div>
          </div>
          <div className="executive-member-grid">
            {current.members.map((member, index) => (
              <article
                key={member.id}
                className="executive-member"
                data-lead={index < 2 || undefined}
              >
                <span className="executive-avatar">{t(member.initials)}</span>
                <div>
                  <span className="eyebrow">{t(member.role)}</span>
                  <h3>{t(member.name)}</h3>
                  <p>
                    <b>{label("memberFocus")}:</b> {t(member.focus)}
                  </p>
                </div>
                <span className="member-signal" aria-hidden="true">
                  <i />
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
      {!!archived.length && (
        <section className="past-bodies">
          <span className="eyebrow">{label("pastTerms")}</span>
          {archived.map((body) => (
            <details key={body.id}>
              <summary>
                <span>{body.term}</span>
                <strong>{t(body.title)}</strong>
                <ChevronDown size={18} />
              </summary>
              <p>{t(body.description)}</p>
            </details>
          ))}
        </section>
      )}
      <Notice>{label("communityPreviewNotice")}</Notice>
    </div>
  );
}
