import {useServices} from "../../app/providers/ServicesProvider";
import {OpportunityDetail} from "../engagement/Opportunities";
import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { SaveButton } from "../../components/cards/SaveButton";
import { AppLink } from "../../components/navigation/AppLink";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Notice } from "../../components/feedback/Notice";
import { useOpportunity } from "../../hooks/useContent";
import { daysFromDemo, opportunityIsOpen } from "../../lib/discovery";
import { formatDate } from "../../lib/dates";

function PreviewOpportunityPage() {
  const { slug } = useParams();
  const query = useOpportunity(slug);
  const { t, label, locale } = useLocale();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const opportunity = query.data;
  if (!opportunity) return <ErrorState retry={() => void query.refetch()} />;
  const open = opportunityIsOpen(opportunity);
  const days = daysFromDemo(opportunity.deadline);
  return (
    <div className="container opportunity-detail-page">
      <AppLink href="/opportunities" className="detail-back">
        <ArrowLeft className="directional" size={17} />
        {label("opportunities")}
      </AppLink>
      <section className="opportunity-detail-hero" data-open={open}>
        <div>
          <span className="eyebrow">
            {t(opportunity.type)} · {t(opportunity.field)}
          </span>
          <h1 tabIndex={-1} data-page-heading>
            {t(opportunity.title)}
          </h1>
          <p className="opportunity-detail-org">
            {t(opportunity.organization)}
          </p>
          <p>{t(opportunity.description)}</p>
          <div className="opportunity-detail-tags">
            {opportunity.tags.map((tag, index) => (
              <span key={index}>{t(tag)}</span>
            ))}
          </div>
        </div>
        <div className="deadline-orbit">
          <span>
            <CalendarClock size={25} />
          </span>
          <small>{label("deadline")}</small>
          <b>
            {formatDate(opportunity.deadline, locale, {
              day: "2-digit",
              month: "short",
            })}
          </b>
          <strong>
            {open ? `${days} ${label("daysLeft")}` : label("deadlinePassed")}
          </strong>
        </div>
      </section>
      <div className="opportunity-detail-layout">
        <section className="opportunity-story-card">
          <span className="eyebrow">{label("eligibility")}</span>
          <h2>{label("opportunitiesHubTitle")}</h2>
          <div className="opportunity-detail-fact">
            <ShieldCheck size={21} />
            <span>
              <small>{label("eligibility")}</small>
              <strong>{t(opportunity.eligibility)}</strong>
            </span>
          </div>
          <div className="opportunity-detail-fact">
            <MapPin size={21} />
            <span>
              <small>{label("location")}</small>
              <strong>
                {t(opportunity.location)} · {t(opportunity.mode)}
              </strong>
            </span>
          </div>
        </section>
        <aside className="opportunity-action-card">
          <Sparkles size={27} />
          <h2>{label("keepClose")}</h2>
          <p>{label("opportunityAlertNote")}</p>
          <SaveButton id={opportunity.id} title={t(opportunity.title)} />
          <button
            className="button button-primary"
            disabled={!opportunity.externalUrl || !open}
          >
            {label("opportunitySource")}
          </button>
          <Notice>{label("applicationUnavailable")}</Notice>
        </aside>
      </div>
    </div>
  );
}

export default function OpportunityPage(){return useServices().engagementApi?<OpportunityDetail/>:<PreviewOpportunityPage/>;}
