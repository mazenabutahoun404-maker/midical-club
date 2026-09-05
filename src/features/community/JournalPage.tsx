import { useMemo, useState } from "react";
import {
  BookOpen,
  HeartHandshake,
  Microscope,
  Search,
  Stethoscope,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ArticleCard } from "../../components/cards/ArticleCard";
import { CommunityNavigation } from "../../components/navigation/CommunityNavigation";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useJournal } from "../../hooks/useContent";

type View = "all" | "student-life" | "research" | "clinical" | "community";

export default function JournalPage() {
  const { t, label } = useLocale();
  const query = useJournal();
  const [view, setView] = useState<View>("all");
  const [search, setSearch] = useState("");
  const articles = query.data || [];
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return articles.filter(
      (article) =>
        (view === "all" || article.categoryId === view) &&
        (!needle ||
          [
            t(article.title),
            t(article.excerpt),
            t(article.author),
            ...article.tags.map(t),
          ].some((value) => value.toLocaleLowerCase().includes(needle))),
    );
  }, [articles, search, t, view]);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const tabs = [
    {
      id: "all",
      label: label("allArticles"),
      icon: BookOpen,
      count: articles.length,
    },
    {
      id: "student-life",
      label: label("studentPerspectives"),
      icon: HeartHandshake,
      count: articles.filter((item) => item.categoryId === "student-life")
        .length,
    },
    {
      id: "research",
      label: label("researchMethods"),
      icon: Microscope,
      count: articles.filter((item) => item.categoryId === "research").length,
    },
    {
      id: "clinical",
      label: label("clinicalLearning"),
      icon: Stethoscope,
      count: articles.filter((item) => item.categoryId === "clinical").length,
    },
  ] as const;
  return (
    <div className="community-v5 journal-page container">
      <CommunityNavigation />
      <header className="journal-hero">
        <div>
          <span className="eyebrow">{label("journalEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("journalTitle")}
          </h1>
          <p>{label("journalBody")}</p>
        </div>
        <div className="journal-diagnostic" aria-hidden="true">
          <span />
          <i />
          <b />
          <small>MCJ · 05</small>
        </div>
      </header>
      <section
        className="community-filter-panel journal-filter-panel"
        aria-label={label("journalFilters")}
      >
        <AliveTabs
          label={label("journalFilters")}
          items={[...tabs]}
          value={view}
          onChange={setView}
        />
        <label className="community-search">
          <Search size={18} />
          <span className="sr-only">{label("journalSearch")}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={label("journalSearch")}
          />
        </label>
      </section>
      <p className="community-results" role="status">
        <strong>{filtered.length}</strong> {label("results")}
      </p>
      {filtered.length ? (
        <div className="journal-story-grid">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState title={label("noJournalResults")} />
      )}
    </div>
  );
}
