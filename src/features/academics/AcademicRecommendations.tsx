import { ContentPlaceholder } from "../../components/feedback/ContentPlaceholder";
import { ReadFeedback } from "../../components/feedback/ReadFeedback";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { CourseCard } from "../../components/cards/CourseCard";
import { mapOffering } from "../../services/api/academics";
import { AcademicPager } from "../../admin/academics/AcademicUI";
import { useState } from "react";
import { ApiActionError } from "../../components/feedback/ApiActionError";
export function AcademicRecommendations() {
  const services = useServices(),
    { snapshot } = useAuth(),
    { t } = useLocale(),
    [page, setPage] = useState(1);
  const home = useQuery({
    queryKey: ["academic-catalog", "home", page],
    queryFn: () => services.academicCatalog!.home({ Page: page, PageSize: 6 }),
    enabled: !!services.academicCatalog && snapshot.status === "authenticated",
    retry: false,
  });
  if (!services.academicCatalog || snapshot.status !== "authenticated")
    return null;
  if (home.isError)
    return (
      <div className="access-management-card">
        <ReadFeedback query={home} />
      </div>
    );
  if (!home.data) return <ReadFeedback query={home} />;
  if (home.data.recommendedOfferings.total === 0)
    return (
      <section>
        <h2>
          {t({
            en: "Recommended for your current studies",
            ar: "مقترح لدراستك الحالية",
          })}
        </h2>
        <ContentPlaceholder
          compact
          icon="books"
          title={t({ en: "No recommendations yet", ar: "لا توجد مقترحات بعد" })}
          description={t({
            en: "Recommended courses will appear when matching offerings are published.",
            ar: "ستظهر المساقات المقترحة عند نشر مساقات مطابقة لدراستك.",
          })}
        />
      </section>
    );
  return (
    <section className="access-management-card">
      <h2>
        {t({
          en: "Recommended for your current studies",
          ar: "مقترح لدراستك الحالية",
        })}
      </h2>
      <p>
        {home.data.currentAcademicYear?.name || ""} ·{" "}
        {t({ en: "Year", ar: "السنة" })}{" "}
        {home.data.studentAcademicProfile.studyYear}
      </p>
      <div className="course-grid academic-course-grid">
        {home.data.recommendedOfferings.items.map((row) => (
          <CourseCard key={row.id} course={mapOffering(row)} />
        ))}
      </div>
      <AcademicPager
        page={page}
        totalPages={home.data.recommendedOfferings.totalPages}
        onChange={setPage}
      />
    </section>
  );
}
