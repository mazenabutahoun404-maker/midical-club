import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ShieldCheck } from "lucide-react";
import "./study-hub.css";
export default function SharedPortfolioPage() {
  const { shareToken = "" } = useParams(),
    services = useServices(),
    { t } = useLocale();
  const portfolio = useQuery({
    queryKey: ["public-portfolio", shareToken],
    queryFn: ({ signal }) =>
      services.studyHub!.sharedPortfolio(shareToken, { signal }),
    retry: false,
    staleTime: 0,
  });
  return (
    <main className="container study-hub">
      <header className="study-hub-heading">
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "Verified campus portfolio", ar: "ملف الإنجازات المعتمد" })}
        </h1>
        {portfolio.data && <h2>{portfolio.data.displayName}</h2>}
      </header>
      {portfolio.isPending ? (
        <p role="status">
          {t({ en: "Checking shared record…", ar: "جار التحقق من السجل…" })}
        </p>
      ) : portfolio.isError ? (
        <p role="alert">
          {t({
            en: "This shared portfolio is unavailable or has been revoked.",
            ar: "الملف غير متاح أو أُلغيت مشاركته.",
          })}
        </p>
      ) : (
        <>
          {portfolio.data.source === "device-preview" && (
            <p className="study-source-note">
              {t({
                en: "Device-preview verification. This is not an institutional credential.",
                ar: "اعتماد معاينة محلية وليس شهادة مؤسسية.",
              })}
            </p>
          )}
          <div className="portfolio-grid">
            {portfolio.data.claims.map((c) => (
              <article className="portfolio-record" key={c.id}>
                <ShieldCheck size={22} />
                <h2>{c.title}</h2>
                <p>{c.description}</p>
                <small>
                  {c.occurredAt}
                  {c.hours
                    ? " · " + c.hours + " " + t({ en: "hours", ar: "ساعة" })
                    : ""}
                </small>
                <span className="study-status">
                  {t({ en: "Verified", ar: "معتمد" })}
                </span>
              </article>
            ))}
          </div>
          {portfolio.data.claims.length === 0 && (
            <p>
              {t({
                en: "No verified achievements have been shared yet.",
                ar: "لم تُشارك إنجازات معتمدة بعد.",
              })}
            </p>
          )}
        </>
      )}
    </main>
  );
}
