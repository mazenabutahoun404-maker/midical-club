import type { SiteContent, HomeSection } from "../../types/content";
import { useSiteContent } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { visibleSections } from "../../lib/home-sections";
import { SectionHeading } from "../../components/data-display/SectionHeading";
import { Hero } from "./sections/Hero";
import { Announcement } from "./sections/Announcement";
import { QuickAccess } from "./sections/QuickAccess";
import { LatestResources } from "./sections/LatestResources";
import { UpcomingEvents } from "./sections/UpcomingEvents";
import { Opportunities } from "./sections/Opportunities";
import { Journal } from "./sections/Journal";
import { Community } from "./sections/Community";
const registry = {
  pathways: QuickAccess,
  resources: LatestResources,
  events: UpcomingEvents,
  opportunities: Opportunities,
  journal: Journal,
};
function Section({
  section,
  site,
  compact = false,
}: {
  section: HomeSection;
  site: SiteContent;
  compact?: boolean;
}) {
  const { label } = useLocale();
  if (section.type === "announcement")
    return (
      <section id={section.id}>
        <Announcement site={site} />
      </section>
    );
  if (section.type === "community")
    return (
      <section id={section.id} className="container section">
        <Community site={site} />
      </section>
    );
  const Component = registry[section.type];
  return (
    <section
      id={section.id}
      className={
        compact
          ? ""
          : "section " +
            (section.type === "resources" ? "resource-section" : "container")
      }
    >
      <div className={section.type === "resources" ? "container" : undefined}>
        <SectionHeading
          heading={site.headings[section.type]}
          href={section.type === "resources" ? "/learn" : undefined}
          linkLabel={label("browse")}
        />
        <Component site={site} />
      </div>
    </section>
  );
}
export default function Homepage() {
  const { data: site } = useSiteContent();
  if (!site) return null;
  const sections = visibleSections(site.sections, new Date());
  return (
    <>
      <Hero hero={site.hero} brand={site.brand} />
      {sections.map((section, index) => {
        if (
          section.type === "opportunities" &&
          sections[index + 1]?.type === "journal"
        )
          return (
            <div className="container growth-wrap section" key={section.id}>
              <Section section={section} site={site} compact />
              <Section section={sections[index + 1]} site={site} compact />
            </div>
          );
        if (
          section.type === "journal" &&
          sections[index - 1]?.type === "opportunities"
        )
          return null;
        return <Section key={section.id} section={section} site={site} />;
      })}
    </>
  );
}
