import { Clock } from "lucide-react";
import type { Article } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
export function ArticleDetails({ item }: { item: Article }) {
  const { t, label } = useLocale();
  return (
    <>
      <span className="tag">
        <Clock size={14} />
        {item.readMinutes} {label("readMinutes")}
      </span>
      <div className="article-body">
        {item.body.map((p, i) => (
          <p key={i}>{t(p)}</p>
        ))}
      </div>
    </>
  );
}
