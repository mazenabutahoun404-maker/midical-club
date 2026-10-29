import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { PublishedContent } from "../resources/PublishedContent";
import { contentLink, contentValue } from "../resources/content-model";
import { record } from "../../services/api/mapping";
export default function ExaminationLanding() {
  const services = useServices(),
    { snapshot } = useAuth(),
    { locale, t } = useLocale();
  const q = useQuery({
    queryKey: [
      "examination-landing",
      snapshot.user?.id,
      services.api?.session.get()?.sessionId,
      locale,
    ],
    queryFn: () =>
      services.contentApi!.get_api_v1_content_electronic_examination({
        query: { locale },
      }),
    enabled: !!services.contentApi,
    retry: false,
  });
  const doc = record(q.data?.content),
    settings = record(doc.examination),
    url = contentLink(settings.mainUrl),
    active =
      doc.visible === true &&
      settings.linkStatus === "Active" &&
      url?.startsWith("https://");
  return (
    <div className="container section published-content">
      <header>
        <span className="eyebrow">MedClub</span>
        <h1 data-page-heading tabIndex={-1}>
          {contentValue(doc.title, locale) ||
            t({ en: "Electronic examinations", ar: "الامتحانات الإلكترونية" })}
        </h1>
      </header>
      {q.isPending && <LoadingState />}
      <ApiActionError error={q.error} onReload={() => void q.refetch()} />
      {q.data && (
        <>
          <PublishedContent content={doc} hideHeading />
          {active ? (
            <a
              className="button button-primary"
              href={url!}
              target={settings.openInNewTab ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              {t({ en: "Open exam website", ar: "فتح موقع الامتحانات" })}
            </a>
          ) : (
            <p role="status">
              {contentValue(settings.unavailableMessage, locale) ||
                t({
                  en: "The exam website is temporarily unavailable.",
                  ar: "موقع الامتحانات غير متاح مؤقتاً.",
                })}
            </p>
          )}
          <p>
            {t({
              en: "The examination service uses its own website and account system.",
              ar: "خدمة الامتحانات لها موقعها ونظام حساباتها المستقل.",
            })}
          </p>
        </>
      )}
    </div>
  );
}
