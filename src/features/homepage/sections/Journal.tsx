import { HomeSectionState } from "./HomeSectionState";
import { ArrowRight, BookOpenText, HeartPulse } from "lucide-react";
import { useJournal } from "../../../hooks/useContent";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { AppLink } from "../../../components/navigation/AppLink";
import { articlePath } from "../../../constants/routes";
import { formatDate } from "../../../lib/dates";
export function Journal() {
  const query = useJournal(),
    { t, label, locale } = useLocale();
  if (query.isPending || query.isError || !query.data.length)
    return <HomeSectionState kind="journal" query={query} />;
  const lead = query.data.find((a) => a.featured) || query.data[0],
    rest = query.data.filter((a) => a.id !== lead.id).slice(0, 2);
  return (
    <div className="home-reading-desk">
      <article className="home-leading-story" data-home-reveal="page">
        <div className="home-story-cover-top">
          <span className="home-journal-seal" aria-hidden="true">
            <HeartPulse size={27} />
          </span>
          <span>{t({ en: "The reading room", ar: "غرفة القراءة" })}</span>
          <BookOpenText size={22} aria-hidden="true" />
        </div>
        <div className="home-story-meta">
          <BookOpenText size={19} aria-hidden="true" />
          <span>{t(lead.category)}</span>
          <span>
            {lead.readMinutesAvailable === false ? "—" : lead.readMinutes}{" "}
            {label("readMinutes")}
          </span>
        </div>
        <h3>
          <AppLink href={articlePath(lead.slug)}>{t(lead.title)}</AppLink>
        </h3>
        <p>{t(lead.excerpt)}</p>
        <div className="home-story-byline">
          <span>{t(lead.author)}</span>
          <time dateTime={lead.publishedAt}>
            {formatDate(lead.publishedAt, locale)}
          </time>
        </div>
        <AppLink className="text-link" href={articlePath(lead.slug)}>
          {label("story")}
          <ArrowRight size={18} className="directional" />
        </AppLink>
      </article>
      {rest.length > 0 && (
        <div className="home-story-list">
          {rest.map((story, index) => (
            <article
              className="home-small-story"
              key={story.id}
              data-home-reveal="page"
              data-home-step={index + 1}
            >
              <span className="home-story-index" aria-hidden="true">
                0{index + 2}
              </span>
              <div>
                <span className="eyebrow">
                  {t(story.category)} ·{" "}
                  {story.readMinutesAvailable === false
                    ? "—"
                    : story.readMinutes}{" "}
                  {label("readMinutes")}
                </span>
                <h3>
                  <AppLink href={articlePath(story.slug)}>
                    {t(story.title)}
                  </AppLink>
                </h3>
                <p>{t(story.excerpt)}</p>
                <AppLink className="text-link" href={articlePath(story.slug)}>
                  {label("story")}
                  <ArrowRight size={16} className="directional" />
                </AppLink>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
