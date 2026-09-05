import { ArrowUpRight, Clock3, UserRound } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { articlePath } from "../../constants/routes";
import { formatDate } from "../../lib/dates";
import type { Article } from "../../types/content";
import { AppLink } from "../navigation/AppLink";
import { SaveButton } from "./SaveButton";

export function ArticleCard({ article }: { article: Article }) {
  const { t, label, locale } = useLocale();
  return (
    <article
      className="journal-story-card"
      data-featured={article.featured || undefined}
    >
      <div className="journal-card-signal" aria-hidden="true">
        <span />
        <i />
      </div>
      <div className="journal-story-topline">
        <span className="eyebrow">{t(article.category)}</span>
        <SaveButton id={article.id} title={t(article.title)} />
      </div>
      <h2>
        <AppLink href={articlePath(article.slug)}>{t(article.title)}</AppLink>
      </h2>
      <p>{t(article.excerpt)}</p>
      <div className="journal-story-meta">
        <span>
          <UserRound size={15} />
          {t(article.author)}
        </span>
        <span>
          <Clock3 size={15} />
          {article.readMinutes} {label("readMinutes")}
        </span>
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt, locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      </div>
      <div className="journal-story-bottom">
        <div>
          {article.tags.map((tag) => (
            <span key={tag.en}>{t(tag)}</span>
          ))}
        </div>
        <AppLink
          className="text-link"
          href={articlePath(article.slug)}
          aria-label={`${label("readArticle")} ${t(article.title)}`}
        >
          {label("readArticle")}
          <ArrowUpRight className="directional" size={17} />
        </AppLink>
      </div>
    </article>
  );
}
