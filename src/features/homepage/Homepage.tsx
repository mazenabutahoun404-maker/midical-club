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
import { UpcomingEvents } from "./sections/UpcomingEvents";
import { Opportunities } from "./sections/Opportunities";
import { Journal } from "./sections/Journal";
import { Community } from "./sections/Community";
import { useHomeReveal } from "./useHomeReveal";
import "./home-atlas.css";

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
  chapter,
}: {
  section: HomeSection;
  site: SiteContent;
  chapter: number;
}) {
  const { label } = useLocale();
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
  if (section.type === "community")
    return (
      <section
        id={section.id}
        className="home-chapter home-community"
        data-home-section={section.type}
      >
        <Community site={site} />
      </section>
    );
  const Component = registry[section.type];
  const href =
    section.type === "resources"
      ? "/learn"
      : section.type === "events"
        ? "/events"
        : section.type === "opportunities"
          ? "/opportunities"
          : section.type === "journal"
            ? "/journal"
            : undefined;
  return (
    <section
      id={section.id}
      className={`home-chapter home-${section.type}`}
      data-home-section={section.type}
    >
      <div
        className="home-chapter-heading"
        data-home-reveal={section.type === "resources" ? "left" : "rise"}
      >
        <span className="home-chapter-number" aria-hidden="true">
          {String(chapter).padStart(2, "0")}
        </span>
        <SectionHeading
          heading={site.headings[section.type]}
          href={href}
          linkLabel={label(
            section.type === "events"
              ? "exploreAllEvents"
              : section.type === "opportunities"
                ? "exploreAllOpportunities"
                : section.type === "journal"
                  ? "allArticles"
                  : "browse",
          )}
        />
      </div>
      <div className="home-chapter-content">
        <Component site={site} />
      </div>
    </section>
  );
}
export default function Homepage() {
  const { data: site } = useSiteContent();
  const { dir } = useLocale();
  const root = useRef<HTMLDivElement>(null);
  useHomeReveal(root, !!site);
  if (!site) return null;
  const sections = visibleSections(site.sections, new Date());
  let chapter = 0;
  return (
    <div className="home-atlas" dir={dir} ref={root}>
      <Hero
        hero={site.hero}
        brand={site.brand}
        nextSectionId={
          sections.find((section) => section.type !== "announcement")?.id
        }
      />
      {sections.map((section) => (
        <Section
          key={section.id}
          section={section}
          site={site}
          chapter={section.type === "announcement" ? 0 : ++chapter}
        />
      ))}
    </div>
  );
}
