import { useEffect, useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { Batch } from "../../types/content";
import { ContentAsset } from "../resources/PublishedContent";
export { batchJourney } from "./batch-journey";
import { batchJourney } from "./batch-journey";
export function BatchIdentity({ batch }: { batch: Batch }) {
  const { t, locale } = useLocale(),
    [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const journey = batchJourney(batch, now);
  return (
    <div className="batch-live-details">
      {batch.logoAssetId && (
        <div style={{ maxWidth: 100 }}>
          <ContentAsset
            assetId={batch.logoAssetId}
            kind="image"
            label={t(batch.name)}
          />
        </div>
      )}
      <div>
        <strong>
          {t({ en: "Your academic journey", ar: "رحلتك الدراسية" })}
        </strong>
        {journey ? (
          <>
            <p>
              {journey.days.toLocaleString(locale)}{" "}
              {t({
                en: "days until the expected graduation date",
                ar: "يوماً حتى موعد التخرج المتوقع",
              })}
            </p>
            <label>
              {t({
                en: "Time through your study journey",
                ar: "التقدم الزمني في رحلتك",
              })}
              : {journey.progress}%
              <progress max={100} value={journey.progress} />
            </label>
          </>
        ) : (
          <p>
            {t({
              en: "Journey dates have not been published yet.",
              ar: "لم تُنشر تواريخ الرحلة الدراسية بعد.",
            })}
          </p>
        )}
        {batch.expectedGraduationDate && (
          <time dateTime={batch.expectedGraduationDate}>
            {batch.expectedGraduationDate.slice(0, 10)}
          </time>
        )}
      </div>
    </div>
  );
}
