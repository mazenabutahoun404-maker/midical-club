import { useServices } from "../../app/providers/ServicesProvider";
import { PublishedContributions } from "../community-live/Contributions";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import {
  ArrowUpRight,
  BookOpenCheck,
  FileCheck2,
  LockKeyhole,
  ScanSearch,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { routes } from "../../constants/routes";

export default function ContributionsPage() {
  const { label } = useLocale();
  const services = useServices();
  const steps = [
    ["draft", "workflowDraftBody"],
    ["underReview", "workflowReviewBody"],
    ["changesRequested", "workflowChangesBody"],
    ["approved", "workflowApprovedBody"],
  ] as const;
  return (
    <div className="contributions-v6 contribution-public-page container">
      <header className="contribution-hero artwork-scene">
        <div>
          <span className="eyebrow">{label("contributionsEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("contributionsTitle")}
          </h1>
          <p>{label("contributionsBody")}</p>
          <AppLink
            href={routes.myContributions}
            className="button button-primary"
          >
            {label("startContribution")}
            <ArrowUpRight size={17} className="directional" />
          </AppLink>
        </div>
        <HeroArtwork section="involved" />
      </header>
      {services.contributionApi && <PublishedContributions />}
      <section className="workflow-section">
        <span className="eyebrow">{label("contributionWorkflow")}</span>
        <div className="review-workflow">
          {steps.map(([title, body], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{label(title)}</h2>
                <p>{label(body)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="share-types">
        <article>
          <BookOpenCheck size={28} />
          <h2>{label("academicResources")}</h2>
          <p>{label("academicResourcesBody")}</p>
        </article>
        <article>
          <FileCheck2 size={28} />
          <h2>{label("journalArticles")}</h2>
          <p>{label("journalArticlesBody")}</p>
        </article>
        <aside>
          <LockKeyhole size={24} />
          <span>{label("reviewRules")}</span>
          <p>{label("nothingPublishes")}</p>
        </aside>
      </section>
    </div>
  );
}
