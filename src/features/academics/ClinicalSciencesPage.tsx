import { Activity } from "lucide-react";
import { useClinicalYears } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ClinicalYearCard } from "../../components/cards/ClinicalYearCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";

export default function ClinicalSciencesPage() {
  const query = useClinicalYears();
  const { label } = useLocale();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <div className="container clinical-sciences-page">
      <header className="academic-page-hero clinical-page-hero">
        <span className="academic-kicker">
          <Activity size={14} />
          {label("clinicalEyebrow")}
        </span>
        <h1 data-page-heading tabIndex={-1}>
          {label("clinicalTitle")}
        </h1>
        <p>{label("clinicalBody")}</p>
        <span className="clinical-pulse-line" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="hero-ghost-word" aria-hidden="true">
          CLINICAL
        </span>
      </header>
      <div className="clinical-years-path">
        {query.data.map((year) => (
          <ClinicalYearCard year={year} key={year.id} />
        ))}
      </div>
    </div>
  );
}
