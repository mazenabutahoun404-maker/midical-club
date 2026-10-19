import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import { BookOpen, Sparkles, Stethoscope } from "lucide-react";
import { useBatches, useCourses } from "../../hooks/useContent";
import { CourseDirectory } from "./CourseDirectory";
import { useLocale } from "../../app/providers/LocaleProvider";
import { routes } from "../../constants/routes";
import { AcademicPortalCard } from "../../components/cards/AcademicPortalCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";

export default function LearnLandingPage() {
  const batches = useBatches(),
    courses = useCourses();
  const { label, t } = useLocale();
  const queries = [courses];
  if (queries.some((query) => query.isPending)) return <LoadingState />;
  if (queries.some((query) => query.isError))
    return (
      <ErrorState
        retry={() => queries.forEach((query) => void query.refetch())}
      />
    );
  if (!courses.data) return null;
  return (
    <div className="container academic-gateway">
      <section className="academic-gateway-hero artwork-academic-hero artwork-scene">
        <div className="artwork-hero-copy">
          <span className="academic-kicker">
            <Sparkles size={14} />
            {label("learnEyebrow")}
          </span>
          <h1 data-page-heading tabIndex={-1}>
            {t({
              en: "Your courses, one step away.",
              ar: "مساقاتك على بُعد خطوة.",
            })}
          </h1>
          <p>
            {t({
              en: "Search for a course and open it directly. Explore years and batches whenever you need them.",
              ar: "ابحث عن المساق وافتحه مباشرة. تصفّح السنوات والدفعات متى احتجت إليها.",
            })}
          </p>
          <div className="academic-pulse" aria-label={label("academicPulse")}>
            <span>
              <b>{courses.data.length}</b>
              {label("coursesCount")}
            </span>
            <i />
            <span>
              <b>{batches.data?.length ?? "—"}</b>
              {label("batchesCount")}
            </span>
          </div>
        </div>
        <HeroArtwork section="learn" />
      </section>
      <CourseDirectory courses={courses.data} />
      <details className="learning-pathway-browse">
        <summary>
          {t({
            en: "Browse pathways and batches",
            ar: "تصفّح المسارات والدفعات",
          })}
        </summary>
        <div className="academic-portals">
          <AcademicPortalCard
            href={routes.basic}
            eyebrow={label("basicEyebrow")}
            title={label("pathwayBasicTitle")}
            description={label("basicPortalBody")}
            action={label("enterBasic")}
            tone="basic"
          >
            <span
              className="portal-orbit portal-orbit-basic"
              aria-hidden="true"
            >
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
      </details>
    </div>
  );
}
