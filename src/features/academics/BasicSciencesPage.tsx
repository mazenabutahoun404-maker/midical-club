import { Sparkles } from "lucide-react";
import { useBatches } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { BatchCard } from "../../components/cards/BatchCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";

export default function BasicSciencesPage() {
  const query = useBatches();
  const { label } = useLocale();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <div className="container basic-sciences-page">
      <header className="academic-page-hero basic-page-hero">
        <span className="academic-kicker">
          <Sparkles size={14} />
          {label("basicEyebrow")}
        </span>
        <h1 data-page-heading tabIndex={-1}>
          {label("basicTitle")}
        </h1>
        <p>{label("basicBody")}</p>
        <span className="hero-ghost-word" aria-hidden="true">
          BASIC
        </span>
      </header>
      <section aria-labelledby="batch-heading">
        <div className="academic-section-heading">
          <span>01</span>
          <h2 id="batch-heading">{label("chooseBatch")}</h2>
          <i />
        </div>
        <div className="batch-passport-grid">
          {query.data.map((batch, index) => (
            <BatchCard batch={batch} index={index} key={batch.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
