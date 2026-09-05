import { ArrowRight } from "lucide-react";
import { useJournal } from "../../../hooks/useContent";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { AppLink } from "../../../components/navigation/AppLink";
import { articlePath } from "../../../constants/routes";
export function Journal() {
  const query = useJournal();
  const { t, label } = useLocale();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const article = query.data[0];
  if (!article) return <EmptyState />;
  return (
    <article className="journal-card">
      <span className="eyebrow">
        {t(article.category)} · {article.readMinutes} {label("readMinutes")}
      </span>
      <h3>{t(article.title)}</h3>
      <p>{t(article.excerpt)}</p>
      <AppLink className="text-link" href={articlePath(article.slug)}>
        {label("story")}
        <ArrowRight className="directional" size={16} />
      </AppLink>
    </article>
  );
}
