import { BookOpen, Search, Sparkles, Stethoscope } from "lucide-react";
import {
  useBatches,
  useClinicalYears,
  useCourses,
  useResources,
} from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { routes } from "../../constants/routes";
import { AcademicPortalCard } from "../../components/cards/AcademicPortalCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";

export default function LearnLandingPage() {
  const batches = useBatches(),
    clinical = useClinicalYears(),
    courses = useCourses(),
    resources = useResources();
  const { label } = useLocale();
  const { openSearch } = useOverlays();
  const queries = [batches, clinical, courses, resources];
  if (queries.some((query) => query.isPending)) return <LoadingState />;
  if (queries.some((query) => query.isError))
    return (
      <ErrorState
        retry={() => queries.forEach((query) => void query.refetch())}
      />
    );
  if (!batches.data || !clinical.data || !courses.data || !resources.data)
    return null;
  return (
    <div className="container academic-gateway">
      <section className="academic-gateway-hero">
        <span className="academic-kicker">
          <Sparkles size={14} />
          {label("choosePath")}
        </span>
        <h1 data-page-heading tabIndex={-1}>
          {label("learnGatewayTitle")}
        </h1>
        <p>{label("learnGatewayBody")}</p>
        <div className="academic-pulse" aria-label={label("academicPulse")}>
          <span>
            <b>{courses.data.length}</b>
            {label("coursesCount")}
          </span>
          <i />
          <span>
            <b>{resources.data.length}</b>
            {label("resourcesCount")}
          </span>
          <i />
          <span>
            <b>{batches.data.length}</b>
            {label("batchesCount")}
          </span>
        </div>
      </section>
      <div className="academic-portals">
        <AcademicPortalCard
          href={routes.basic}
          eyebrow={label("basicEyebrow")}
          title={label("pathwayBasicTitle")}
          description={label("basicPortalBody")}
          action={label("enterBasic")}
          tone="basic"
        >
          <span className="portal-orbit portal-orbit-basic" aria-hidden="true">
            <BookOpen />
            <i />
            <i />
            <i />
          </span>
        </AcademicPortalCard>
        <AcademicPortalCard
          href={routes.clinical}
          eyebrow={label("clinicalEyebrow")}
          title={label("pathwayClinicalTitle")}
          description={label("clinicalPortalBody")}
          action={label("enterClinical")}
          tone="clinical"
        >
          <span
            className="portal-orbit portal-orbit-clinical"
            aria-hidden="true"
          >
            <Stethoscope />
            <i />
            <i />
            <i />
          </span>
        </AcademicPortalCard>
      </div>
      <section className="academic-finder">
        <span className="finder-icon">
          <Search size={21} />
        </span>
        <div>
          <span className="academic-kicker">{label("courseFinder")}</span>
          <h2>{label("courseFinderBody")}</h2>
        </div>
        <button
          className="button button-primary"
          data-search-trigger
          onClick={openSearch}
        >
          {label("findCourse")}
          <Search size={17} />
        </button>
      </section>
    </div>
  );
}
