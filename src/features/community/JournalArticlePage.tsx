import { PublishedContent } from "../resources/PublishedContent";
import { ArrowLeft, Clock3, ShieldCheck, UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { SaveButton } from "../../components/cards/SaveButton";
import { CommunityNavigation } from "../../components/navigation/CommunityNavigation";
import { AppLink } from "../../components/navigation/AppLink";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { useArticle, useJournal } from "../../hooks/useContent";
import { formatDate } from "../../lib/dates";
import { articlePath, routes } from "../../constants/routes";

export default function JournalArticlePage() {
  const { slug } = useParams();
  const { t, label, locale } = useLocale();
  const article = useArticle(slug);
  const journal = useJournal();
  if (article.isPending) return <LoadingState />;
  if (article.isError)
    return <ErrorState retry={() => void article.refetch()} />;
  if (!article.data)
    return (
      <div className="community-v5 container article-not-found">
        <CommunityNavigation />
        <h1>{label("notFound")}</h1>
        <AppLink className="button button-primary" href={routes.journal}>
          {label("backToJournal")}
        </AppLink>
      </div>
    );
  const item = article.data;
  const related = (journal.data || [])
    .filter((candidate) => candidate.id !== item.id)
    .slice(0, 2);
  return (
    <article className="community-v5 journal-article-page container">
      <CommunityNavigation />
      <AppLink className="journal-back" href={routes.journal}>
        <ArrowLeft className="directional" size={17} />
        {label("backToJournal")}
      </AppLink>
      <header className="journal-article-header">
        <div>
          <span className="eyebrow">{t(item.category)}</span>
          <h1 tabIndex={-1} data-page-heading>
            {t(item.title)}
          </h1>
          <p>{t(item.excerpt)}</p>
        </div>
        <SaveButton id={item.id} title={t(item.title)} />
      </header>
      <div className="journal-byline">
        <span>
          <UserRound size={17} />
          <b>{label("writtenBy")}</b>
          {t(item.author)}
        </span>
        <span>
          <ShieldCheck size={17} />
          <b>{label("scientificallyReviewedBy")}</b>
          {t(item.reviewer)}
        </span>
        <span>
          <Clock3 size={17} />
          <b>{label("published")}</b>
          <time dateTime={item.publishedAt}>
            {formatDate(item.publishedAt, locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </span>
      </div>
      <div className="journal-reading-layout">
        <aside className="reading-signal" aria-hidden="true">
          <span />
          <i />
          <b />
        </aside>
        <div className="journal-article-body">
          {item.publishedContent && (
            <PublishedContent
              hideHeading
              content={item.publishedContent[locale]}
            />
          )}
          {!item.publishedContent &&
            item.body.map((paragraph, index) => (
              <p key={index}>{t(paragraph)}</p>
            ))}
          <div className="editorial-note">
            <ShieldCheck size={20} />
            <div>
              <strong>{label("editorialNote")}</strong>
              <p>{label("editorialNoteBody")}</p>
            </div>
          </div>
        </div>
      </div>
      {!!related.length && (
        <section className="more-journal">
          <span className="eyebrow">{label("moreFromJournal")}</span>
          <div>
            {related.map((candidate) => (
              <AppLink key={candidate.id} href={articlePath(candidate.slug)}>
                <span>{t(candidate.category)}</span>
                <strong>{t(candidate.title)}</strong>
              </AppLink>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
