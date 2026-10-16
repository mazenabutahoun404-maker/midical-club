import { ArrowRight, CalendarDays, BriefcaseBusiness } from "lucide-react";
import type { HomeSection } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { AppLink } from "../../../components/navigation/AppLink";
import { UpcomingEvents } from "./UpcomingEvents";
import { Opportunities } from "./Opportunities";

export function GetInvolved({
  sections,
  anchorId,
}: {
  sections: HomeSection[];
  anchorId: string;
}) {
  const { t } = useLocale();
  return (
    <div
      className="home-involvement-board"
      data-columns={sections.length > 1 ? "two" : "one"}
    >
      {sections.map((section) => {
        const events = section.type === "events";
        const title = events
          ? t({ en: "Events", ar: "الفعاليات" })
          : t({ en: "Opportunities", ar: "الفرص" });
        return (
          <section
            key={section.id}
            className={
              events ? "home-events-column" : "home-opportunities-column"
            }
            id={section.id === anchorId ? undefined : section.id}
            aria-label={title}
          >
            <div className="home-subsection-heading">
              <span className="home-subsection-symbol" aria-hidden="true">
                {events ? (
                  <CalendarDays size={22} />
                ) : (
                  <BriefcaseBusiness size={22} />
                )}
              </span>
              <h3>{title}</h3>
              <AppLink
                className="text-link"
                href={events ? "/events" : "/opportunities"}
              >
                {t(
                  events
                    ? { en: "All events", ar: "كل الفعاليات" }
                    : { en: "All opportunities", ar: "كل الفرص" },
                )}
                <ArrowRight className="directional" size={16} />
              </AppLink>
            </div>
            {events ? <UpcomingEvents /> : <Opportunities />}
          </section>
        );
      })}
    </div>
  );
}
