import { Clock, ShieldCheck, UserRound } from "lucide-react";
import type { Article } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { formatDate } from "../../lib/dates";
export function ArticleDetails({ item }: { item: Article }) {
  const { t, label, locale } = useLocale();
  return (
    <>
      <div className="article-detail-meta">
        <span className="tag">
          <Clock size={14} />
          {item.readMinutes} {label("readMinutes")}
        </span>
        <span>
          <UserRound size={14} /> {t(item.author)}
        </span>
        <span>
          <ShieldCheck size={14} /> {t(item.reviewer)}
        </span>
        <time dateTime={item.publishedAt}>
          {formatDate(item.publishedAt, locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      </div>
      <div className="article-body">
        {item.body.map((p, i) => (
          <p key={i}>{t(p)}</p>
        ))}
      </div>
    </>
  );
}
