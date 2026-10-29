import { ContentPlaceholder } from "../../components/feedback/ContentPlaceholder";
import { AcademicRecommendations } from "./AcademicRecommendations";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import { ArrowUpRight, BookOpen, Sparkles, Stethoscope } from "lucide-react";
import { useBatches, useCourses } from "../../hooks/useContent";
import { CourseDirectory } from "./CourseDirectory";
import { useLocale } from "../../app/providers/LocaleProvider";
import { routes } from "../../constants/routes";
import { AppLink } from "../../components/navigation/AppLink";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";

export default function LearnLandingPage() {
  const { snapshot } = useAuth();
  const live = useServices().contentSnapshot?.kind === "live";
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
      <nav className="learning-pathway-frame" aria-label={label("choosePath")}>
        <AppLink
          href={routes.basic}
          className="learning-pathway learning-pathway-basic paper-card"
        >
          <BookOpen size={23} aria-hidden="true" />
          <span>
            <strong>{label("basic")}</strong>
            <small>
              {t({ en: "Batches & semesters", ar: "الدفعات والفصول" })}
            </small>
          </span>
          <ArrowUpRight className="directional" size={19} aria-hidden="true" />
        </AppLink>
        <AppLink
          href={routes.clinical}
          className="learning-pathway learning-pathway-clinical paper-card"
        >
          <Stethoscope size={23} aria-hidden="true" />
          <span>
            <strong>{label("clinical")}</strong>
            <small>
              {t({
                en: "Clinical years & rotations",
                ar: "السنوات والتدريب السريري",
              })}
            </small>
          </span>
          <ArrowUpRight className="directional" size={19} aria-hidden="true" />
        </AppLink>
      </nav>
      <AcademicRecommendations key={snapshot.user?.id || "guest"} />
      {live && snapshot.status !== "authenticated" ? (
        <ContentPlaceholder
          icon="lock"
          title={t({
            en: "Your course library is locked",
            ar: "مكتبة المساقات مقفلة",
          })}
          description={t({
            en: "Sign in to see the courses and files available to your account.",
            ar: "سجّل الدخول لعرض المساقات والملفات المتاحة لحسابك.",
          })}
          href={`${routes.signIn}?returnTo=%2Flearn`}
          actionLabel={label("signIn")}
        />
      ) : (
        <CourseDirectory courses={courses.data} />
      )}
    </div>
  );
}
