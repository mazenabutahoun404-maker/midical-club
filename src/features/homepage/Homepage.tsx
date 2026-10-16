import { useRef } from "react";
import type { SiteContent, HomeSection } from "../../types/content";
import { useSiteContent } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { visibleSections } from "../../lib/home-sections";
import { SectionHeading } from "../../components/data-display/SectionHeading";
import { Hero } from "./sections/Hero";
import { Announcement } from "./sections/Announcement";
import { QuickAccess } from "./sections/QuickAccess";
import { LatestResources } from "./sections/LatestResources";
import { GetInvolved } from "./sections/GetInvolved";
import { Journal } from "./sections/Journal";
import { Community } from "./sections/Community";
import { useHomeReveal } from "./useHomeReveal";
import "./home-studio-v1355.css";

const registry = {
  pathways: QuickAccess,
  resources: LatestResources,
  journal: Journal,
};
type ParticipationSection = HomeSection & { type: "events" | "opportunities" };
const participates = (s: HomeSection): s is ParticipationSection =>
  s.type === "events" || s.type === "opportunities";

function Section({
  section,
  site,
  participation,
}: {
  section: HomeSection;
  site: SiteContent;
  participation: ParticipationSection[];
}) {
  const { label, t } = useLocale();
  if (section.type === "announcement")
    return (
      <section
        id={section.id}
        className="home-signal-section"
        data-home-reveal="rise"
      >
        <Announcement site={site} />
      </section>
    );
  if (section.type === "events" || section.type === "opportunities") {
    if (section.id !== participation[0]?.id) return null;
    return (
      <section
        id={section.id}
        className="home-chapter home-involvement"
        data-home-section="involvement"
      >
        <div className="home-chapter-heading" data-home-reveal="rise">
          <SectionHeading
            heading={site.headings.events}
            href="/get-involved"
            linkLabel={t({ en: "Explore all", ar: "استكشف المزيد" })}
          />
        </div>
        <GetInvolved sections={participation} anchorId={section.id} />
      </section>
    );
  }
  if (section.type === "community")
    return (
      <section
        id={section.id}
        className="home-chapter home-people"
        data-home-section="community"
      >
        <div className="home-chapter-heading" data-home-reveal="rise">
          <SectionHeading heading={site.headings.community} />
        </div>
        <Community site={site} />
      </section>
    );
  const Component = registry[section.type];
  const href =
    section.type === "resources"
      ? "/learn"
      : section.type === "journal"
        ? "/journal"
        : undefined;
  return (
    <section
      id={section.id}
      className={`home-chapter home-${section.type}`}
      data-home-section={section.type}
    >
      <div className="home-chapter-heading" data-home-reveal="rise">
        <SectionHeading
          heading={site.headings[section.type]}
          href={href}
          linkLabel={
            section.type === "resources"
              ? t({ en: "All courses", ar: "جميع المساقات" })
              : label("allArticles")
          }
        />
      </div>
      <div className="home-chapter-content">
        <Component site={site} />
      </div>
    </section>
  );
}
export default function Homepage() {
  const { data: site } = useSiteContent(),
    { dir } = useLocale();
  const root = useRef<HTMLDivElement>(null);
  useHomeReveal(root, !!site);
  if (!site) return null;
  const sections = visibleSections(site.sections, new Date());
  const participation = sections.filter(participates);
  return (
    <div className="home-atlas home-focused home-studio" dir={dir} ref={root}>
      <Hero
        hero={site.hero}
        brand={site.brand}
        nextSectionId={sections.find((s) => s.type !== "announcement")?.id}
      />
      {sections.map((section) => (
        <Section
          key={section.id}
          section={section}
          site={site}
          participation={participation}
        />
      ))}
    </div>
  );
}
