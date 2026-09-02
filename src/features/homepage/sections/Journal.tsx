import { ArrowRight } from "lucide-react";
import { useJournal } from "../../../hooks/useContent";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { useOverlays } from "../../../app/providers/OverlayProvider";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
export function Journal() {
  const query = useJournal();
  const { t, label } = useLocale();
  const { openDetail } = useOverlays();
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
      <button
        className="text-link"
        onClick={() => openDetail({ kind: "article", item: article })}
      >
        {label("story")}
        <ArrowRight className="directional" size={16} />
      </button>
    </article>
  );
}
