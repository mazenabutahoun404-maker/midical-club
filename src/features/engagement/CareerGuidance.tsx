import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PublishedContent } from "../resources/PublishedContent";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { ApiError } from "../../services/api/client";
const guides = [
  {
    slug: "medical-specialties",
    en: "Explore medical specialties",
    ar: "استكشاف التخصصات الطبية",
  },
  {
    slug: "cv-interview-guide",
    en: "CV and interview preparation",
    ar: "إعداد السيرة الذاتية والمقابلة",
  },
];
function Guide({ guide }: { guide: (typeof guides)[number] }) {
  const services = useServices(),
    { snapshot } = useAuth(),
    { locale, t } = useLocale();
  const q = useQuery({
    queryKey: [
      "career-guide",
      snapshot.user?.id,
      services.api?.session.get()?.sessionId,
      guide.slug,
      locale,
    ],
    queryFn: () =>
      services.contentApi!.get_api_v1_content_pages_by_slug({
        path: { slug: guide.slug },
        query: { locale },
      }),
    enabled: !!services.contentApi,
    retry: false,
  });
  const absent = q.error instanceof ApiError && q.error.status === 404;
  return (
    <article className="content-editor-item">
      <h3>{t(guide)}</h3>
      {q.isPending ? (
        <LoadingState />
      ) : absent ? (
        <p>
          {t({
            en: "This guide has not been published yet.",
            ar: "لم يُنشر هذا الدليل بعد.",
          })}
        </p>
      ) : q.error ? (
        <ApiActionError error={q.error} onReload={() => void q.refetch()} />
      ) : (
        q.data && <PublishedContent content={q.data.content} hideHeading />
      )}
    </article>
  );
}
export function CareerGuidance() {
  const { t } = useLocale();
  return (
    <section aria-label={t({ en: "Career guidance", ar: "الإرشاد المهني" })}>
      <h2>{t({ en: "Plan your next step", ar: "خطّط لخطوتك القادمة" })}</h2>
      <div className="student-connected-grid">
        {guides.map((guide) => (
          <Guide key={guide.slug} guide={guide} />
        ))}
      </div>
    </section>
  );
}
